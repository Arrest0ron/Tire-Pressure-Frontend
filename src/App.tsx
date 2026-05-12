// src/App.tsx
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import TiresPage from "./pages/TiresPage/TiresPage";
import TireDetailPage from "./pages/TireDetailPage/TireDetailPage";
import SignInPage from "./pages/SignInPage/SignInPage";
import SignUpPage from "./pages/SignUpPage/SignUpPage";

// ✅ Импортируем РЕАЛЬНУЮ страницу деталей заявки
import ApplicationPage from "./pages/ApplicationPage/ApplicationPage";
import ApplicationsPage from "./pages/ApplicationsPage/ApplicationsPage";

import { ROUTES } from "./Routes";
import MainLayout from "./layouts/MainLayout";

import "bootstrap/dist/css/bootstrap.min.css";
import "./index_style.css";
import "./theme-1c.css";
import "./index.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          
          {/* === ПУБЛИЧНЫЕ страницы === */}
          <Route path={ROUTES.TIRES} element={<TiresPage />} />
          <Route path={ROUTES.TIRE} element={<TireDetailPage />} />
          <Route path={ROUTES.SIGN_IN} element={<SignInPage />} />
          <Route path={ROUTES.SIGN_UP} element={<SignUpPage />} />
          
          {/* === Страницы заявок (защита внутри компонентов) === */}
          
          {/* 🔹 Список заявок — заглушка */}
          <Route path={ROUTES.APPLICATIONS} element={<ApplicationsPage />} />
          
          {/* 🔹 Детали заявки — РЕАЛЬНЫЙ компонент (защита внутри ApplicationPage) */}
          <Route path={ROUTES.APPLICATION} element={<ApplicationPage />} />
          
          {/* === Редиректы === */}
          <Route path="/tires" element={<Navigate to={ROUTES.TIRES} replace />} />
          <Route index element={<Navigate to={ROUTES.TIRES} replace />} />
          
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;