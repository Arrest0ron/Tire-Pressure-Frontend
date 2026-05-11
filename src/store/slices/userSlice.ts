// src/store/slices/userSlice.ts
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../api";
import { apiErrMessage } from "../utils/apiError";
import { parseIsModeratorFromToken } from "../utils/jwt";

export interface UserState {
  login: string;
  isAuthenticated: boolean;
  isModerator: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  login: "",
  isAuthenticated: false,
  isModerator: false,
  loading: false,
  error: null,
};

// 🔹 LOGIN
export const loginUser = createAsyncThunk(
  "user/login",
  async (credentials: { login: string; password: string }, { rejectWithValue }) => {
    try {
      // ✅ Правильный вызов для ручного Api: api.users.signinCreate
      const r = await api.users.signinCreate(credentials);
      
      const token = r.data?.access_token ?? r.data?.token;
      if (token) {
        localStorage.setItem("token", String(token));
      }
      return { login: credentials.login };
    } catch (e) {
      return rejectWithValue(apiErrMessage(e));
    }
  },
);

// 🔹 REGISTER
export const registerUser = createAsyncThunk(
  "user/register",
  async (
    userData: { login: string; password: string; is_moderator?: boolean },
    { rejectWithValue },
  ) => {
    try {
      // ✅ Регистрация: api.users.signupCreate
      await api.users.signupCreate({
        login: userData.login,
        password: userData.password,
        is_moderator: userData.is_moderator ?? false,
      });
      
      // ✅ Сразу логиним после регистрации
      const r = await api.users.signinCreate({ 
        login: userData.login, 
        password: userData.password 
      });
      
      const token = r.data?.access_token ?? r.data?.token;
      if (token) {
        localStorage.setItem("token", String(token));
      }
      return { login: userData.login };
    } catch (e) {
      return rejectWithValue(apiErrMessage(e));
    }
  },
);

// 🔹 LOGOUT
export const logoutUser = createAsyncThunk(
  "user/logout",
  async (_, { rejectWithValue }) => {
    try {
      // ✅ Выход: api.users.signoutCreate
      await api.users.signoutCreate();
    } catch (e) {
      localStorage.removeItem("token");
      return rejectWithValue(apiErrMessage(e));
    }
    localStorage.removeItem("token");
    return true;
  },
);

// 🔹 SLICE
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearUserError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.login = action.payload.login;
        const token = localStorage.getItem("token") ?? "";
        state.isModerator = parseIsModeratorFromToken(token);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.login = action.payload.login;
        const token = localStorage.getItem("token") ?? "";
        state.isModerator = parseIsModeratorFromToken(token);
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(logoutUser.fulfilled, () => ({ ...initialState }))
      .addCase(logoutUser.rejected, (_state, action) => ({
        ...initialState,
        error: action.payload as string,
      }));
  },
});

export const { clearUserError } = userSlice.actions;
export default userSlice.reducer;