// src/layouts/MainLayout.tsx
import { Outlet, useLocation, matchPath } from "react-router-dom";
import AppHeader from "../components/AppHeader/AppHeader";
import { Breadcrumbs, type ICrumb } from "../components/Breadcrumbs/Breadcrumbs";
import { ROUTES } from "../Routes";
import { getMockTire } from "../modules/mock";

// ✅ Выносим вычисление крошек в чистую функцию
function computeCrumbs(pathname: string): ICrumb[] {
  if (pathname === ROUTES.MAIN || pathname === "/") {
    return [{ label: "Шины", to: ROUTES.TIRES }];
  }
  
  if (pathname === ROUTES.TIRES) {
    return [{ label: "Шины" }];
  }
  
  const tireMatch = matchPath(ROUTES.TIRE, pathname); // ← Проверь, что путь совпадает с Routes.ts
  if (tireMatch?.params.id) {
    const tire = getMockTire(Number(tireMatch.params.id));
    const title = tire?.tire_title ?? `Шина #${tireMatch.params.id}`;
    return [
      { label: "Шины", to: ROUTES.TIRES },
      { label: title },
    ];
  }
  
  // Для страниц авторизации и заявок можно добавить отдельные ветки
  if (pathname === ROUTES.SIGN_IN || pathname === ROUTES.SIGN_UP) {
    return [
      { label: "Шины", to: ROUTES.TIRES },
      { label: pathname === ROUTES.SIGN_IN ? "Вход" : "Регистрация" },
    ];
  }
  
  return [{ label: "Шины", to: ROUTES.TIRES }, { label: "Страница" }];
}

export default function MainLayout() {
  const { pathname } = useLocation();
  const crumbs = computeCrumbs(pathname); // ✅ Чисто и тестируемо

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