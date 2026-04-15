// src/layouts/MainLayout.tsx
import { Outlet, useLocation, matchPath } from "react-router-dom";
import AppHeader from "../components/AppHeader/AppHeader";
import { Breadcrumbs, type ICrumb } from "../components/Breadcrumbs/Breadcrumbs";
import { ROUTES } from "../Routes";
import { getMockTire } from "../modules/mock";

export default function MainLayout() {
  const { pathname } = useLocation();

  // ✅ Вычисляем крошки здесь (в «умном» контейнере)
  const crumbs: ICrumb[] = (() => {
    if (pathname === ROUTES.MAIN || pathname === "/") {
      return [{ label: "Главная" }];
    }
    if (pathname === ROUTES.TIRES) {
      return [
        { label: "Главная", to: ROUTES.MAIN },
        { label: "Список шин" },
      ];
    }
    const tireMatch = matchPath(ROUTES.TIRE_DETAIL, pathname);
    if (tireMatch?.params.id) {
      const tire = getMockTire(Number(tireMatch.params.id));
      const title = tire?.tire_title ?? `Шина ${tireMatch.params.id}`;
      return [
        { label: "Главная", to: ROUTES.MAIN },
        { label: "Список шин", to: ROUTES.TIRES },
        { label: title },
      ];
    }
    return [{ label: "Главная", to: ROUTES.MAIN }, { label: "Страница" }];
  })();

  return (
    <div className="main-layout">
      <AppHeader />
      {/* ✅ Передаём крошки в «глупый» компонент */}
      <Breadcrumbs crumbs={crumbs} />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}