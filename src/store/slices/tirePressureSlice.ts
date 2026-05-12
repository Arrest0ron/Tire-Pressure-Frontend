// src/store/slices/tirePressureSlice.ts
import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { api } from "../../api";
import { apiErrMessage } from "../utils/apiError";
import { logoutUser } from "./userSlice";

// ─── Типы данных ─────────────────────────────────────────────────────────
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
  title?: string;
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

export interface SerializerTirePressureUpdateJSON {
  air_temperature?: number;
  car_weight?: number;
}

export interface SerializerTirePressureEntryUpdateJSON {
  pressure?: number;
  coating_coefficient?: number;
}


// Стало:
export interface SerializerFinishJSON {
  status: "завершён" | "отклонён";  // ✅ Русские значения, как в бэкенде
}
// Найди функцию defaultListFilters() и замени на:
function defaultListFilters() {
  return { fromDate: "", toDate: "", status: "" }; // ✅ Пустые значения = показать всё
}

function buildInitialState() {
  return {
    cart: null as TirePressureCart | null,
    cartLoading: false,
    detail: null as TirePressureDetailPayload | null,
    detailLoading: false,
    detailError: null as string | null,
    list: [] as SerializerTirePressureJSON[],
    listLoading: false,
    listError: null as string | null,
    filters: defaultListFilters(),
    itemMutationLoading: {} as Record<string, boolean>,
    applicationMutationLoading: false,
  };
}

function asDetail(data: unknown): TirePressureDetailPayload | null {
  if (!data || typeof data !== "object") return null;
  const o = data as Record<string, unknown>;

  // 🔹 Бэкенд возвращает плоскую структуру
  if (Array.isArray(o.entries)) {
    const { entries, ...appData } = o;
    return {
      application: appData as SerializerTirePressureJSON,
      entries: entries as SerializerTirePressureEntryJSON[],
    };
  }

  // 🔹 Запасной вариант
  const app = o.application;
  if (app && typeof app === "object" && Array.isArray(o.entries)) {
    return {
      application: app as SerializerTirePressureJSON,
      entries: o.entries as SerializerTirePressureEntryJSON[],
    };
  }
  return null;
}

function axiosStatus(e: unknown): number | undefined {
  if (e && typeof e === "object" && "response" in e) {
    const r = (e as { response?: { status?: number } }).response;
    return r?.status;
  }
  return undefined;
}

// ─── Thunk: загрузка корзины ───────────────────────────────────────────
export const fetchTirePressureCart = createAsyncThunk(
  "tirePressure/fetchCart",
  async (_, { rejectWithValue }) => {
    try {
      const r = await api.tirePressure.tirePressureCartList();
      const d = r.data as Record<string, unknown>;
      return {
        id: typeof d.tire_pressure_id === "number" ? d.tire_pressure_id : (typeof d.id === "number" ? d.id : 0),
        tires_count: Number(d.tires_count ?? 0),
        has_draft: Boolean(d.tire_pressure_id ?? d.id),
        incomplete_items_count: undefined,
      } as TirePressureCart;
    } catch (e) {
      const status = axiosStatus(e);
      if (status === 401) {
        return { id: 0, tires_count: 0, has_draft: false, incomplete_items_count: undefined };
      }
      return rejectWithValue(apiErrMessage(e));
    }
  },
);

// ─── Thunk: детали заявки ──────────────────────────────────────────────
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

// ─── Thunk: добавить шину в заявку ─────────────────────────────────────
export const addTireToCart = createAsyncThunk(
  "tirePressure/addTire",
  async (tireId: number, { rejectWithValue, dispatch }) => {
    try {
      await api.tirePressureEntries.add(tireId);
      await dispatch(fetchTirePressureCart());
      return tireId;
    } catch (e) {
      const status = axiosStatus(e);
      if (status === 409) {
        await dispatch(fetchTirePressureCart());
        return tireId;
      }
      return rejectWithValue(apiErrMessage(e));
    }
  },
);

// ─── Thunk: обновить параметры заявки ───────────────
export const updateTirePressureParams = createAsyncThunk(
  "tirePressure/updateParams",
  async (
    { applicationId, body }: { applicationId: number; body: SerializerTirePressureUpdateJSON },
    { rejectWithValue },
  ) => {
    try {
      await api.tirePressure.tirePressuresUpdate(applicationId, body);
      return { applicationId, ...body };
    } catch (e) {
      return rejectWithValue(apiErrMessage(e));
    }
  },
);

// ─── Thunk: обновить запись в заявке ─────────────────
export const updateTireEntryInApplication = createAsyncThunk(
  "tirePressure/updateEntry",
  async (
    { tireId, applicationId, body }: { tireId: number; applicationId: number; body: SerializerTirePressureEntryUpdateJSON },
    { rejectWithValue },
  ) => {
    try {
      // 🔹 Бэкенд ждёт: /tire-pressure-entries/{tire_id}/{tire_pressure_id}
      await api.tirePressureEntries.update(tireId, applicationId, body);
      return { tireId, applicationId, ...body };
    } catch (e) {
      return rejectWithValue(apiErrMessage(e));
    }
  },
);

// ─── Thunk: удалить шину из заявки ───────────────────
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

// ─── Thunk: сформировать заявку ──────────────────────
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

export const finishTirePressureApplication = createAsyncThunk(
  "tirePressure/finish",
  async (
    { applicationId, status }: { applicationId: number; status: "завершён" | "отклонён" },  // ✅
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

// ─── Thunk: удалить заявку ───────────────────────────
export const deleteTirePressureApplication = createAsyncThunk(
  "tirePressure/deleteApplication",
  async (applicationId: number, { rejectWithValue, dispatch }) => {
    try {
      await api.tirePressure.tirePressuresDelete(applicationId);
      await dispatch(fetchTirePressuresList());
      return applicationId;
    } catch (e) {
      return rejectWithValue(apiErrMessage(e));
    }
  },
);

// ─── Thunk: список заявок ────────────────────────────
export const fetchTirePressuresList = createAsyncThunk(
  "tirePressure/fetchList",
  async (_, { getState, rejectWithValue }) => {
    try {
      const st = getState() as { tirePressure: { filters: ReturnType<typeof defaultListFilters> } };
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

// ─── Slice ───────────────────────────────────────────
const tirePressureSlice = createSlice({
  name: "tirePressure",
  initialState: buildInitialState(),
  reducers: {
    clearTirePressureDetailError: (state) => { state.detailError = null; },
    setListFilters: (state, action: PayloadAction<Partial<ReturnType<typeof defaultListFilters>>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetListFiltersToToday: (state) => { state.filters = defaultListFilters(); },
  },
  extraReducers: (builder) => {
    builder
      .addCase(logoutUser.fulfilled, () => buildInitialState())
      .addCase(logoutUser.rejected, () => buildInitialState())

      // fetchTirePressureCart
      .addCase(fetchTirePressureCart.pending, (state) => { state.cartLoading = true; })
      .addCase(fetchTirePressureCart.fulfilled, (state, action) => {
        state.cartLoading = false;
        state.cart = action.payload;
      })
      .addCase(fetchTirePressureCart.rejected, (state) => {
        state.cartLoading = false;
        state.cart = { id: 0, tires_count: 0, has_draft: false, incomplete_items_count: undefined };
      })

      // fetchTirePressureDetail
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

      // fetchTirePressuresList
      .addCase(fetchTirePressuresList.pending, (state) => { state.listLoading = true; state.listError = null; })
      .addCase(fetchTirePressuresList.fulfilled, (state, action) => {
        state.listLoading = false;
        state.list = action.payload;
      })
      .addCase(fetchTirePressuresList.rejected, (state, action) => {
        state.listLoading = false;
        state.listError = action.payload as string;
      })

      // addTireToCart
      .addCase(addTireToCart.pending, (state) => { state.applicationMutationLoading = true; })
      .addCase(addTireToCart.fulfilled, (state) => { state.applicationMutationLoading = false; })
      .addCase(addTireToCart.rejected, (state) => { state.applicationMutationLoading = false; })

      // updateTirePressureParams
      .addCase(updateTirePressureParams.pending, (state) => { state.applicationMutationLoading = true; })
      .addCase(updateTirePressureParams.fulfilled, (state, action) => {
        state.applicationMutationLoading = false;
        if (state.detail?.application.tire_pressure_id === action.payload.applicationId) {
          state.detail.application = { ...state.detail.application, ...action.payload };
        }
      })
      .addCase(updateTirePressureParams.rejected, (state) => { state.applicationMutationLoading = false; })

      // updateTireEntryInApplication
      .addCase(updateTireEntryInApplication.pending, (state, action) => {
        const key = `entry-${action.meta.arg.tireId}`;
        state.itemMutationLoading[key] = true;
      })
      .addCase(updateTireEntryInApplication.fulfilled, (state, action) => {
        const key = `entry-${action.payload.tireId}`;
        delete state.itemMutationLoading[key];
        if (state.detail?.application.tire_pressure_id === action.payload.applicationId) {
          state.detail.entries = state.detail.entries.map((e) =>
            e.tire_id === action.payload.tireId ? { ...e, coating_coefficient: action.payload.coating_coefficient } : e  // ✅
          );
        }
      })
      .addCase(updateTireEntryInApplication.rejected, (state, action) => {
        const key = `entry-${action.meta.arg.tireId}`;
        delete state.itemMutationLoading[key];
      })

      // removeTireEntryFromApplication
      .addCase(removeTireEntryFromApplication.pending, (state, action) => {
        const key = `rm-${action.meta.arg.tireId}`;
        state.itemMutationLoading[key] = true;
      })
      .addCase(removeTireEntryFromApplication.fulfilled, (state, action) => {
        const key = `rm-${action.payload}`;
        delete state.itemMutationLoading[key];
        if (state.detail) {
          state.detail.entries = state.detail.entries.filter((e) => e.id !== action.payload);
        }
      })
      .addCase(removeTireEntryFromApplication.rejected, (state, action) => {
        const key = `rm-${action.meta.arg.tireId}`;
        delete state.itemMutationLoading[key];
      })

      // formTirePressureApplication
      .addCase(formTirePressureApplication.pending, (state) => { state.applicationMutationLoading = true; })
      .addCase(formTirePressureApplication.fulfilled, (state) => { state.applicationMutationLoading = false; })
      .addCase(formTirePressureApplication.rejected, (state) => { state.applicationMutationLoading = false; })

      // finishTirePressureApplication
      .addCase(finishTirePressureApplication.pending, (state, action) => {
        const key = `finish-${action.meta.arg.applicationId}`;
        state.itemMutationLoading[key] = true;
      })
      .addCase(finishTirePressureApplication.fulfilled, (state, action) => {
        const key = `finish-${action.meta.arg.applicationId}`;
        delete state.itemMutationLoading[key];
      })
      .addCase(finishTirePressureApplication.rejected, (state, action) => {
        const key = `finish-${action.meta.arg.applicationId}`;
        if (key) delete state.itemMutationLoading[key];
      })

      // deleteTirePressureApplication
      .addCase(deleteTirePressureApplication.pending, (state) => { state.applicationMutationLoading = true; })
      .addCase(deleteTirePressureApplication.fulfilled, (state) => {
        state.applicationMutationLoading = false;
        state.detail = null;
      })
      .addCase(deleteTirePressureApplication.rejected, (state) => { state.applicationMutationLoading = false; });
  },
});

export const { clearTirePressureDetailError, setListFilters, resetListFiltersToToday } = tirePressureSlice.actions;
export default tirePressureSlice.reducer;