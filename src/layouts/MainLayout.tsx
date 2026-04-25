// src/layouts/MainLayout.tsx
import { Outlet, useLocation, matchPath } from "react-router-dom";
import AppHeader from "../components/AppHeader/AppHeader";
import { Breadcrumbs, type ICrumb } from "../components/Breadcrumbs/Breadcrumbs";
import { ROUTES } from "../Routes";
import { getMockTire } from "../modules/mock";

export default function MainLayout() {
  const { pathname } = useLocation();

  // ✅ Вычисляем крошки: начинаем с «Шины», без «Главной»
  const crumbs: ICrumb[] = (() => {
    // Главная страница — показываем только «Шины» как стартовую точку
    if (pathname === ROUTES.MAIN || pathname === "/") {
      return [{ label: "Шины", to: ROUTES.TIRES }];
    }
    
    // Список шин
    if (pathname === ROUTES.TIRES) {
      return [{ label: "Шины" }];
    }
    
    // Детальная страница шины
    const tireMatch = matchPath(ROUTES.TIRE_DETAIL, pathname);
    if (tireMatch?.params.id) {
      const tire = getMockTire(Number(tireMatch.params.id));
      const title = tire?.tire_title ?? `Шина ${tireMatch.params.id}`;
      return [
        { label: "Шины", to: ROUTES.TIRES },
        { label: title },
      ];
    }
    
    // Fallback для других страниц
    return [{ label: "Шины", to: ROUTES.TIRES }, { label: "Страница" }];
  })();

  return (
    <div className="main-layout">
      <AppHeader />
      <Breadcrumbs crumbs={crumbs} />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}