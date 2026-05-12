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

export interface SerializerFinishJSON {
  status: "завершён" | "отклонён";  // ✅ Русские значения, как в бэкенде
}

// ─── Вспомогательные функции ───────────────────────────────────────────
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
    applicationMutationLoading: false,  // ✅ Оставляем: это имя состояния, не параметр
  };
}

function asDetail(data: unknown): TirePressureDetailPayload | null {
  if (!data || typeof data !== "object") return null;
  const o = data as Record<string, unknown>;

  if (Array.isArray(o.entries)) {
    const { entries, ...appData } = o;
    return {
      application: appData as SerializerTirePressureJSON,
      entries: entries as SerializerTirePressureEntryJSON[],
    };
  }

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
// ✅ ИЗМЕНЕНО: applicationId → tirePressureId
export const fetchTirePressureDetail = createAsyncThunk(
  "tirePressure/fetchDetail",
  async (tirePressureId: number, { rejectWithValue }) => {  // ✅
    try {
      const r = await api.tirePressure.tirePressuresDetail(tirePressureId);  // ✅
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
// ✅ ИЗМЕНЕНО: applicationId → tirePressureId
export const updateTirePressureParams = createAsyncThunk(
  "tirePressure/updateParams",
  async (
    { tirePressureId, body }: { tirePressureId: number; body: SerializerTirePressureUpdateJSON },  // ✅
    { rejectWithValue },
  ) => {
    try {
      await api.tirePressure.tirePressuresUpdate(tirePressureId, body);  // ✅
      return { tirePressureId, ...body };  // ✅
    } catch (e) {
      return rejectWithValue(apiErrMessage(e));
    }
  },
);

// ─── Thunk: обновить запись в заявке ─────────────────
// ✅ ИЗМЕНЕНО: applicationId → tirePressureId
export const updateTireEntryInApplication = createAsyncThunk(
  "tirePressure/updateEntry",
  async (
    { tireId, tirePressureId, body }: { tireId: number; tirePressureId: number; body: SerializerTirePressureEntryUpdateJSON },  // ✅
    { rejectWithValue },
  ) => {
    try {
      await api.tirePressureEntries.update(tireId, tirePressureId, body);  // ✅
      return { tireId, tirePressureId, ...body };  // ✅
    } catch (e) {
      return rejectWithValue(apiErrMessage(e));
    }
  },
);

// ─── Thunk: удалить шину из заявки ───────────────────
// ✅ ИЗМЕНЕНО: applicationId → tirePressureId
export const removeTireEntryFromApplication = createAsyncThunk(
  "tirePressure/removeEntry",
  async (
    { tireId, tirePressureId }: { tireId: number; tirePressureId: number },  // ✅
    { rejectWithValue, dispatch },
  ) => {
    try {
      await api.tirePressureEntries.delete(tireId, tirePressureId);  // ✅
      await dispatch(fetchTirePressureDetail(tirePressureId));  // ✅
      await dispatch(fetchTirePressureCart());
      return tireId;
    } catch (e) {
      return rejectWithValue(apiErrMessage(e));
    }
  },
);

// ─── Thunk: сформировать заявку ──────────────────────
// ✅ ИЗМЕНЕНО: applicationId → tirePressureId
export const formTirePressureApplication = createAsyncThunk(
  "tirePressure/form",
  async (tirePressureId: number, { rejectWithValue, dispatch }) => {  // ✅
    try {
      await api.tirePressure.tirePressuresFormUpdate(tirePressureId);  // ✅
      await dispatch(fetchTirePressureDetail(tirePressureId));  // ✅
      await dispatch(fetchTirePressureCart());
      await dispatch(fetchTirePressuresList());
      return true;
    } catch (e) {
      return rejectWithValue(apiErrMessage(e));
    }
  },
);

// ─── Thunk: завершить/отклонить заявку ───────────────
// ✅ ИЗМЕНЕНО: applicationId → tirePressureId
export const finishTirePressureApplication = createAsyncThunk(
  "tirePressure/finish",
  async (
    { tirePressureId, status }: { tirePressureId: number; status: "завершён" | "отклонён" },  // ✅
    { rejectWithValue, dispatch },
  ) => {
    try {
      await api.tirePressure.tirePressuresFinishUpdate(tirePressureId, { status });  // ✅
      await dispatch(fetchTirePressuresList());
      return true;
    } catch (e) {
      return rejectWithValue(apiErrMessage(e));
    }
  },
);

// ─── Thunk: удалить заявку ───────────────────────────
// ✅ ИЗМЕНЕНО: applicationId → tirePressureId
export const deleteTirePressureApplication = createAsyncThunk(
  "tirePressure/deleteApplication",
  async (tirePressureId: number, { rejectWithValue, dispatch }) => {  // ✅
    try {
      await api.tirePressure.tirePressuresDelete(tirePressureId);  // ✅
      await dispatch(fetchTirePressuresList());
      return tirePressureId;  // ✅
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
        // ✅ ИЗМЕНЕНО: applicationId → tirePressureId
        if (state.detail?.application.tire_pressure_id === action.payload.tirePressureId) {  // ✅
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
        // ✅ ИЗМЕНЕНО: applicationId → tirePressureId
        if (state.detail?.application.tire_pressure_id === action.payload.tirePressureId) {  // ✅
          state.detail.entries = state.detail.entries.map((e) =>
            e.tire_id === action.payload.tireId ? { ...e, coating_coefficient: action.payload.coating_coefficient } : e
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
        // ✅ ИЗМЕНЕНО: applicationId → tirePressureId
        const key = `finish-${action.meta.arg.tirePressureId}`;  // ✅
        state.itemMutationLoading[key] = true;
      })
      .addCase(finishTirePressureApplication.fulfilled, (state, action) => {
        // ✅ ИЗМЕНЕНО: applicationId → tirePressureId
        const key = `finish-${action.meta.arg.tirePressureId}`;  // ✅
        delete state.itemMutationLoading[key];
      })
      .addCase(finishTirePressureApplication.rejected, (state, action) => {
        // ✅ ИЗМЕНЕНО: applicationId → tirePressureId
        const key = `finish-${action.meta.arg.tirePressureId}`;  // ✅
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