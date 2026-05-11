// src/store/slices/tirePressureSlice.ts
import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { api } from "../../api";
import { apiErrMessage } from "../utils/apiError";
import { logoutUser } from "./userSlice";

// ─── Типы данных (адаптируй под свой Api) ─────────────────────────────
export interface TirePressureCart {
  has_draft: boolean;
  tires_count: number;
  id?: number;
  incomplete_items_count?: number;
}

export interface TirePressureDetailPayload {
  application: SerializerTirePressureJSON;
  entries: SerializerTirePressureEntryJSON[];
}

export interface SerializerTirePressureJSON {
  tire_pressure_id?: number;
  creator_login?: string;
  air_temperature?: number;
  car_weight?: number;
  status?: string;
  date_create?: string;
  date_formed?: string;
  date_completed?: string;
  moderator_login?: string;
  tire_entries_count?: number;
}

export interface SerializerTirePressureEntryJSON {
  id?: number;
  tire_id?: number;
  tire_title?: string;
  pressure?: number;
  coating_coefficient?: number;
  photo?: string;
  tire_material_coefficient?: number;
  tire_thickness_coefficient?: number;
}

// ─── Вспомогательные функции ─────────────────────────────────────────
function defaultListFilters() {
  const t = new Date();
  const y = t.getFullYear();
  const m = String(t.getMonth() + 1).padStart(2, "0");
  const d = String(t.getDate()).padStart(2, "0");
  const day = `${y}-${m}-${d}`;
  return { fromDate: day, toDate: day, status: "", creatorLogin: "" };
}

function buildInitialState() {
  return {
    // Корзина
    cart: null as TirePressureCart | null,
    cartLoading: false,
    
    // Детали заявки
    detail: null as TirePressureDetailPayload | null,
    detailLoading: false,
    detailError: null as string | null,
    
    // Список заявок
    list: [] as SerializerTirePressureJSON[],
    listLoading: false,
    listError: null as string | null,
    
    // Фильтры списка
    filters: defaultListFilters(),
    
    // Флаги загрузки мутаций
    itemMutationLoading: {} as Record<string, boolean>,
    applicationMutationLoading: false,
  };
}

function asDetail(data: unknown): TirePressureDetailPayload | null {
  if (!data || typeof data !== "object") return null;
  const o = data as Record<string, unknown>;
  const app = o.application;
  const entries = o.entries;
  if (!app || typeof app !== "object" || !Array.isArray(entries)) return null;
  return {
    application: app as SerializerTirePressureJSON,
    entries: entries as SerializerTirePressureEntryJSON[],
  };
}

type CartSliceUser = { user: { isAuthenticated: boolean } };

function emptyGuestCartPayload(): TirePressureCart {
  return {
    has_draft: false,
    tires_count: 0,
    incomplete_items_count: 0,
    id: undefined,
  };
}

function axiosStatus(e: unknown): number | undefined {
  if (e && typeof e === "object" && "response" in e) {
    const r = (e as { response?: { status?: number } }).response;
    return r?.status;
  }
  return undefined;
}

// ─── Thunk: загрузка корзины ─────────────────────────────────────────
export const fetchTirePressureCart = createAsyncThunk(
  "tirePressure/fetchCart",
  async (_, { rejectWithValue, getState }) => {
    const before = getState() as { user: { isAuthenticated: boolean } };
    if (!before.user.isAuthenticated) {
      return emptyGuestCartPayload();
    }
    try {
      // ✅ Для ручного Api:
      const r = await api.tirePressure.tirePressureCartList();
      
      const after = getState() as { user: { isAuthenticated: boolean } };
      if (!after.user.isAuthenticated) {
        return emptyGuestCartPayload();
      }
      
      const d = r.data as Record<string, unknown>;
      return {
        has_draft: Boolean(d.has_draft ?? (d.tire_pressure_id != null)),
        tires_count: Number(d.tires_count ?? 0),
        id: typeof d.tire_pressure_id === "number" ? d.tire_pressure_id : undefined,
        incomplete_items_count:
          typeof d.incomplete_items_count === "number" ? d.incomplete_items_count : undefined,
      } as TirePressureCart;
    } catch (e) {
      return rejectWithValue(apiErrMessage(e));
    }
  },
);

// ─── Thunk: детали заявки ────────────────────────────────────────────
export const fetchTirePressureDetail = createAsyncThunk(
  "tirePressure/fetchDetail",
  async (applicationId: number, { rejectWithValue }) => {
    try {
      const r = await api.tirePressure.tirePressuresDetail(applicationId);
      const detail = asDetail(r.data);
      if (!detail) return rejectWithValue("Неверный ответ сервера");
      return detail;
    } catch (e) {
      return rejectWithValue(apiErrMessage(e));
    }
  },
);

// ─── Thunk: добавить шину в заявку ───────────────────────────────────
export const addTireToCart = createAsyncThunk(
  "tirePressure/addTire",
  async (tireId: number, { rejectWithValue, dispatch }) => {
    try {
      // ✅ Для ручного Api:
      await api.tirePressureEntries.add(tireId);
      
      // ✅ После успеха — обновляем корзину (как в примере)
      await dispatch(fetchTirePressureCart());
      return tireId;
    } catch (e) {
      // ✅ Обработка 409 Conflict (шина уже в заявке) — как в примере
      if (axiosStatus(e) === 409) {
        await dispatch(fetchTirePressureCart());
        return tireId;
      }
      return rejectWithValue(apiErrMessage(e));
    }
  },
);

// ─── Thunk: обновить запись в заявке ─────────────────────────────────
export const updateTireEntryInApplication = createAsyncThunk(
  "tirePressure/updateEntry",
  async (
    {
      tireId,
      applicationId,
      body,
    }: {
      tireId: number;
      applicationId: number;
      body: Partial<SerializerTirePressureEntryJSON>;
    },
    { rejectWithValue, dispatch },
  ) => {
    const key = `${tireId}-${applicationId}`;
    try {
      await api.tirePressureEntries.update(tireId, applicationId, body as any);
      await dispatch(fetchTirePressureDetail(applicationId));
      return key;
    } catch (e) {
      return rejectWithValue(apiErrMessage(e));
    }
  },
);

// ─── Thunk: удалить шину из заявки ───────────────────────────────────
export const removeTireEntryFromApplication = createAsyncThunk(
  "tirePressure/removeEntry",
  async (
    { tireId, applicationId }: { tireId: number; applicationId: number },
    { rejectWithValue, dispatch },
  ) => {
    try {
      await api.tirePressureEntries.delete(tireId, applicationId);
      await dispatch(fetchTirePressureDetail(applicationId));
      await dispatch(fetchTirePressureCart());
      return tireId;
    } catch (e) {
      return rejectWithValue(apiErrMessage(e));
    }
  },
);

// ─── Thunk: сформировать заявку ──────────────────────────────────────
export const formTirePressureApplication = createAsyncThunk(
  "tirePressure/form",
  async (applicationId: number, { rejectWithValue, dispatch }) => {
    try {
      await api.tirePressure.tirePressuresFormUpdate(applicationId);
      await dispatch(fetchTirePressureDetail(applicationId));
      await dispatch(fetchTirePressureCart());
      await dispatch(fetchTirePressuresList());
      return true;
    } catch (e) {
      return rejectWithValue(apiErrMessage(e));
    }
  },
);

// ─── Thunk: завершить заявку ─────────────────────────────────────────
export const finishTirePressureApplication = createAsyncThunk(
  "tirePressure/finish",
  async (
    { applicationId, status }: { applicationId: number; status: "completed" | "rejected" },
    { rejectWithValue, dispatch },
  ) => {
    try {
      await api.tirePressure.tirePressuresFinishUpdate(applicationId, { status });
      await dispatch(fetchTirePressuresList());
      return true;
    } catch (e) {
      return rejectWithValue(apiErrMessage(e));
    }
  },
);

// ─── Thunk: список заявок ────────────────────────────────────────────
export const fetchTirePressuresList = createAsyncThunk(
  "tirePressure/fetchList",
  async (_, { getState, rejectWithValue }) => {
    try {
      const st = getState() as {
        tirePressure: { filters: ReturnType<typeof defaultListFilters> };
      };
      const f = st.tirePressure.filters;
      
      const query: { from_date?: string; to_date?: string; status?: string } = {};
      if (f.fromDate) query.from_date = f.fromDate;
      if (f.toDate) query.to_date = f.toDate;
      if (f.status) query.status = f.status;
      
      const r = await api.tirePressure.tirePressuresList(query);
      return r.data as SerializerTirePressureJSON[];
    } catch (e) {
      return rejectWithValue(apiErrMessage(e));
    }
  },
);

// ─── Slice ───────────────────────────────────────────────────────────
const tirePressureSlice = createSlice({
  name: "tirePressure",
  initialState: buildInitialState(),
  reducers: {
    clearTirePressureDetailError: (state) => {
      state.detailError = null;
    },
    setListFilters: (
      state,
      action: PayloadAction<Partial<ReturnType<typeof defaultListFilters>>>,
    ) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetListFiltersToToday: (state) => {
      state.filters = defaultListFilters();
    },
  },
  extraReducers: (builder) => {
    builder
      // 🔹 Сброс при выходе
      .addCase(logoutUser.fulfilled, () => buildInitialState())
      .addCase(logoutUser.rejected, () => buildInitialState())
      
      // 🔹 fetchTirePressureCart
      .addCase(fetchTirePressureCart.pending, (state) => {
        state.cartLoading = true;
      })
      .addCase(fetchTirePressureCart.fulfilled, (state, action) => {
        state.cartLoading = false;
        state.cart = action.payload;
      })
      .addCase(fetchTirePressureCart.rejected, (state) => {
        state.cartLoading = false;
        state.cart = emptyGuestCartPayload();
      })
      
      // 🔹 fetchTirePressureDetail
      .addCase(fetchTirePressureDetail.pending, (state) => {
        state.detailLoading = true;
        state.detailError = null;
        state.detail = null;
      })
      .addCase(fetchTirePressureDetail.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.detail = action.payload;
      })
      .addCase(fetchTirePressureDetail.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError = action.payload as string;
      })
      
      // 🔹 fetchTirePressuresList
      .addCase(fetchTirePressuresList.pending, (state) => {
        state.listLoading = true;
        state.listError = null;
      })
      .addCase(fetchTirePressuresList.fulfilled, (state, action) => {
        state.listLoading = false;
        state.list = action.payload;
      })
      .addCase(fetchTirePressuresList.rejected, (state, action) => {
        state.listLoading = false;
        state.listError = action.payload as string;
      })
      
      // 🔹 addTireToCart
      .addCase(addTireToCart.pending, (state) => {
        state.applicationMutationLoading = true;
      })
      .addCase(addTireToCart.fulfilled, (state) => {
        state.applicationMutationLoading = false;
      })
      .addCase(addTireToCart.rejected, (state) => {
        state.applicationMutationLoading = false;
      })
      
      // 🔹 formTirePressureApplication
      .addCase(formTirePressureApplication.pending, (state) => {
        state.applicationMutationLoading = true;
      })
      .addCase(formTirePressureApplication.fulfilled, (state) => {
        state.applicationMutationLoading = false;
      })
      .addCase(formTirePressureApplication.rejected, (state) => {
        state.applicationMutationLoading = false;
      })
      
      // 🔹 removeTireEntryFromApplication
      .addCase(removeTireEntryFromApplication.pending, (state, action) => {
        const id = action.meta.arg.tireId;
        state.itemMutationLoading[`rm-${id}`] = true;
      })
      .addCase(removeTireEntryFromApplication.fulfilled, (state, action) => {
        const id = action.payload;
        delete state.itemMutationLoading[`rm-${id}`];
      })
      .addCase(removeTireEntryFromApplication.rejected, (state, action) => {
        const id = action.meta?.arg?.tireId;
        if (id != null) delete state.itemMutationLoading[`rm-${id}`];
      })
      
      // 🔹 finishTirePressureApplication
      .addCase(finishTirePressureApplication.pending, (state, action) => {
        const id = action.meta.arg.applicationId;
        state.itemMutationLoading[`finish-${id}`] = true;
      })
      .addCase(finishTirePressureApplication.fulfilled, (state, action) => {
        const id = action.meta.arg.applicationId;
        delete state.itemMutationLoading[`finish-${id}`];
      })
      .addCase(finishTirePressureApplication.rejected, (state, action) => {
        const id = action.meta?.arg?.applicationId;
        if (id != null) delete state.itemMutationLoading[`finish-${id}`];
      });
  },
});

export const {
  clearTirePressureDetailError,
  setListFilters,
  resetListFiltersToToday,
} = tirePressureSlice.actions;
export default tirePressureSlice.reducer;