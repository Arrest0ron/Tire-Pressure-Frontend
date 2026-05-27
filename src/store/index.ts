// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import tirePressureReducer from './slices/tirePressureSlice';
import tiresFilterReducer from './slices/tiresFilterSlice'; // ✅ Добавлен импорт

// ✅ 1. Создаём store
export const store = configureStore({
  reducer: {
    user: userReducer,
    tirePressure: tirePressureReducer,
    tiresFilter: tiresFilterReducer,  // ✅ Добавлен редюсер фильтра
  },
  devTools: import.meta.env.DEV, // Включаем DevTools только в разработке
});

// ✅ 2. Экспортируем типы для хуков
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;