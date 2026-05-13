// src/store/slices/userSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { parseIsModeratorFromToken } from "../utils/jwt";

// ─── Тип состояния ─────────────────────────────────────────────
export interface UserState {
  login: string;
  isAuthenticated: boolean;
  isModerator: boolean;
  loading: boolean;    // Локальный флаг для форм (управляется в компонентах)
  error: string | null;
}

// ─── Начальное состояние ───────────────────────────────────────
const initialState: UserState = {
  login: "",
  isAuthenticated: false,
  isModerator: false,
  loading: false,
  error: null,
};

// ─── Slice: ТОЛЬКО синхронные экшены для управления состоянием ─
// ❌ НЕТ createAsyncThunk для HTTP-запросов (по ТЗ: auth — только чистый axios)
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // ✅ Установить пользователя после успешного входа (вызывается из компонента)
    setUser: (state, action: PayloadAction<{ login: string; token: string }>) => {
      state.login = action.payload.login;
      state.isAuthenticated = true;
      state.isModerator = parseIsModeratorFromToken(action.payload.token);
      state.error = null;
    },
    
    // ✅ Очистить пользователя при выходе
    logoutUser: (state) => {
      state.login = "";
      state.isAuthenticated = false;
      state.isModerator = false;
      state.error = null;
      localStorage.removeItem("token");
    },
    
    // ✅ Установить флаг загрузки (управляется из компонента)
    setUserLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    // ✅ Установить ошибку (управляется из компонента)
    setUserError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    // ✅ Очистить ошибку
    clearUserError: (state) => {
      state.error = null;
    },
  },
});

export const { setUser, logoutUser, setUserLoading, setUserError, clearUserError } = userSlice.actions;
export default userSlice.reducer;