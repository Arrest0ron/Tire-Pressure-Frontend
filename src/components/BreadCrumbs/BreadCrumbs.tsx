// src/components/Breadcrumbs/Breadcrumbs.tsx
import { useEffect, useState } from "react";
import { Link, matchPath, useLocation } from "react-router-dom";
import { getMockTire } from "../../modules/mock";
import { ROUTES } from "../../Routes";
import "./Breadcrumbs.css";

type Crumb = { label: string; to?: string };

export default function Breadcrumbs() {
  const { pathname } = useLocation();
  const [tireTitle, setTireTitle] = useState<string | null>(null);

  // Подтягиваем название шины, если мы на странице деталей
  useEffect(() => {
    const m = matchPath(ROUTES.TIRE_DETAIL, pathname);
    const rawId = m?.params.id;
    if (rawId) {
      const tire = getMockTire(Number(rawId));
      setTireTitle(tire?.tire_title ?? `Шина ${rawId}`);
    } else {
      setTireTitle(null);
    }
  }, [pathname]);

  // ✅ Автоматическая генерация цепочки с правильной иерархией
  const crumbs: Crumb[] = (() => {
    // 1. Главная страница — только "Главная"
    if (pathname === ROUTES.MAIN || pathname === "/") {
      return [{ label: "Главная" }];
    }

    // 2. Страница списка шин — "Главная / Список шин"
    if (pathname === ROUTES.TIRES) {
      return [
        { label: "Главная", to: ROUTES.MAIN },
        { label: "Список шин" },
      ];
    }

    // 3. Детальная страница шины — "Главная / Список шин / Название"
    const tireMatch = matchPath(ROUTES.TIRE_DETAIL, pathname);
    if (tireMatch?.params.id) {
      const title = tireTitle ?? (tireMatch.params.id ? `Шина ${tireMatch.params.id}` : "Шина");
      return [
        { label: "Главная", to: ROUTES.MAIN },
        { label: "Список шин", to: ROUTES.TIRES },
        { label: title },
      ];
    }

    // Fallback для неизвестных путей
    return [{ label: "Главная", to: ROUTES.MAIN }, { label: "Страница" }];
  })();

  return (
    <nav className="breadcrumbs" aria-label="Навигационная цепочка">
      <ol className="breadcrumbs__list">
        {crumbs.map((crumb, i) => {
          const last = i === crumbs.length - 1;
          return (
            <li key={`${crumb.label}-${i}`} className="breadcrumbs__item">
              {crumb.to && !last ? (
                <Link to={crumb.to} className="breadcrumbs__link">
                  {crumb.label}
                </Link>
              ) : (
                <span
                  className={last ? "breadcrumbs__current" : undefined}
                  aria-current={last ? "page" : undefined}
                >
                  {crumb.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}