// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { registerSW } from "virtual:pwa-register"; // ✅ Добавлено для PWA
import { store } from "./store";
import App from "./App";

// ✅ Регистрация Service Worker (PWA)
registerSW({ immediate: true });

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);