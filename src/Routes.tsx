// src/Routes.tsx
export const ROUTES = {
  TIRES: "/tires",
  TIRE: "/tire/:id",
  TIRE_PRESSURE: "/tire-pressure/:id",       
  SIGN_IN: "/signin",
  SIGN_UP: "/signup",
  TIRE_PRESSURES: "/tire-pressures",       
} as const;

export type RouteKeyType = keyof typeof ROUTES;

export const ROUTE_LABELS: { [key in RouteKeyType]: string } = {
  TIRES: "Каталог шин",
  TIRE: "Шина",
  TIRE_PRESSURE: "Заявка на расчёт",         
  SIGN_IN: "Вход",
  SIGN_UP: "Регистрация",
  TIRE_PRESSURES: "Мои заявки",               
};