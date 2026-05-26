// src/App.tsx
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import TiresPage from "./pages/TiresPage/TiresPage";
import TireDetailPage from "./pages/TireDetailPage/TireDetailPage";
import SignInPage from "./pages/SignInPage/SignInPage";
import SignUpPage from "./pages/SignUpPage/SignUpPage";

import TirePressurePage from "./pages/TirePressurePage/TirePressurePage";
import TirePressuresPage from "./pages/TirePressuresPage/TirePressuresPage";

import { ROUTES } from "./Routes";
import MainLayout from "./layouts/MainLayout";

import "bootstrap/dist/css/bootstrap.min.css";
import "./index_style.css";
import "./theme-1c.css";
import "./index.css";

// ✅ Добавлено из примера: basename для GitHub Pages
function routerBasename(): string | undefined {
  const b = import.meta.env.BASE_URL ?? "/";
  if (b === "/") return undefined;
  const trimmed = b.endsWith("/") ? b.slice(0, -1) : b;
  return trimmed === "" ? undefined : trimmed;
}

function App() {
  return (
    // ✅ Добавлено: basename={routerBasename()}
    <BrowserRouter basename={routerBasename()}>
      <Routes>
        <Route element={<MainLayout />}>
          
          {/* === ПУБЛИЧНЫЕ страницы === */}
          <Route path={ROUTES.TIRES} element={<TiresPage />} />
          <Route path={ROUTES.TIRE} element={<TireDetailPage />} />
          <Route path={ROUTES.SIGN_IN} element={<SignInPage />} />
          <Route path={ROUTES.SIGN_UP} element={<SignUpPage />} />
          
          {/* === Страницы заявок === */}
          <Route path={ROUTES.TIRE_PRESSURES} element={<TirePressuresPage />} />
          <Route path={ROUTES.TIRE_PRESSURE} element={<TirePressurePage />} />
          
          {/* === Редиректы === */}
          <Route path="/tires" element={<Navigate to={ROUTES.TIRES} replace />} />
          <Route index element={<Navigate to={ROUTES.TIRES} replace />} />
          
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;