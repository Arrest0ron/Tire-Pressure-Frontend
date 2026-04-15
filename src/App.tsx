// src/App.tsx — ТЕСТОВАЯ ВЕРСИЯ с хардкод-путями
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";

// ✅ Импортируем компоненты (проверьте, что пути верные!)
import TiresPage from "./pages/TiresPage/TiresPage";
import TireDetailPage from "./pages/TireDetailPage/TireDetailPage";
import ApplicationPage from "./pages/ApplicationPage/ApplicationPage";

import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  console.log('🔍 App.tsx loaded');
  
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          
          {/* ✅ ТЕСТ: Хардкод путей вместо констант */}
          <Route path="/tires" element={<TiresPage />} />
          <Route path="/" element={<Navigate to="/tires" replace />} />
          <Route path="/tire/:id" element={<TireDetailPage />} />
          <Route path="/application/:id" element={<ApplicationPage />} />
          
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;