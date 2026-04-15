import { BrowserRouter, Route, Routes } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import MainPage from "./pages/MainPage/MainPage";
import TiresPage from "./pages/TiresPage/TiresPage";
import TireDetailPage from "./pages/TireDetailPage/TireDetailPage";
import { ROUTES } from "./Routes";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index_style.css";
import "./theme-1c.css";
import "./index.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path={ROUTES.MAIN} element={<MainPage />} />
          <Route path={ROUTES.TIRES} element={<TiresPage />} />
          <Route path={ROUTES.TIRE_DETAIL} element={<TireDetailPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;