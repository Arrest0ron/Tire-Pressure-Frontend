// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    // ✅ Прокси для обхода CORS: все /api/* запросы → бэкенд на 8080 порту
    proxy: {
      "/api": {
        target: "http://localhost:8080", // порт твоего бэкенда из ЛР 3-4
        changeOrigin: true,              // подменяет Host заголовок
        secure: false,                   // если бэкенд на HTTP (не HTTPS)
      },
    },
    // ✅ Настройки для Docker/WSL (чтобы контейнер видел изменения)
    watch: {
      usePolling: true,
    },
    host: true,      // слушать все интерфейсы, не только localhost
    strictPort: true, // ошибка, если порт 3000 занят
    port: 3000,      // порт фронтенда
  },
});