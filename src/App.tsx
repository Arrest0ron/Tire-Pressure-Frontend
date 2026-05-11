// src/App.tsx
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import TiresPage from "./pages/TiresPage/TiresPage";
import TireDetailPage from "./pages/TireDetailPage/TireDetailPage";
import SignInPage from "./pages/SignInPage/SignInPage";
import SignUpPage from "./pages/SignUpPage/SignUpPage";
import { ROUTES } from "./Routes";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index_style.css";
import "./theme-1c.css";
import "./index.css";

// Заглушки для страниц заявок (создадим на следующих шагах)
const ApplicationsPage = () => <div className="p-4">Страница заявок (в разработке)</div>;
const ApplicationPage = () => <div className="p-4">Детали заявки (в разработке)</div>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          {/* Публичные страницы */}
          <Route path={ROUTES.TIRES} element={<TiresPage />} />
          <Route path={ROUTES.TIRE} element={<TireDetailPage />} />
          <Route path={ROUTES.SIGN_IN} element={<SignInPage />} />
          <Route path={ROUTES.SIGN_UP} element={<SignUpPage />} />
          
          {/* Защищённые страницы (пока заглушки) */}
          <Route path={ROUTES.APPLICATIONS} element={<ApplicationsPage />} />
          <Route path={ROUTES.APPLICATION} element={<ApplicationPage />} />
          
          {/* Редиректы для совместимости */}
          <Route path="/tires" element={<Navigate to={ROUTES.TIRES} replace />} />
          <Route path="/tire/:id" element={<Navigate to={ROUTES.TIRE} replace />} />
          
          {/* Редирект с корня, если нужно */}
          <Route index element={<Navigate to={ROUTES.TIRES} replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;