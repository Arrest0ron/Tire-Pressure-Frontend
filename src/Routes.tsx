// src/Routes.tsx
export const ROUTES = {
  TIRES: "/tires",
  TIRE: "/tire/:id",
  APPLICATION: "/application/:id",
  SIGN_IN: "/signin",
  SIGN_UP: "/signup",
  APPLICATIONS: "/applications",
} as const;

export type RouteKeyType = keyof typeof ROUTES;

export const ROUTE_LABELS: { [key in RouteKeyType]: string } = {
  TIRES: "Каталог шин",
  TIRE: "Шина",
  APPLICATION: "Заявка на расчёт",
  SIGN_IN: "Вход",
  SIGN_UP: "Регистрация",
  APPLICATIONS: "Мои заявки",
};