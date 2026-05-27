// src/api/index.ts
import { Api } from "./Api";
let baseURL = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8080/api";

// 🛑 Принудительно приводим к http:// (на случай, если Vite подставил https)
if (!baseURL.startsWith("http://") && !baseURL.startsWith("/")) {
  baseURL = "http://" + baseURL.replace(/^https:\/\//, "");
}

console.log('[TAURI-API] 🔍 baseURL:', baseURL);
console.log('[TAURI-API] 🔍 isProd:', import.meta.env.PROD);

export const api = new Api({ baseURL });
api.instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.instance.interceptors.response.use(
  (response) => {
    const data = response.data;
    if (data && typeof data === "object" && "token" in data && data.token) {
      localStorage.setItem("token", String(data.token));
    }
    return response;
  },
  (error) => Promise.reject(error),
);