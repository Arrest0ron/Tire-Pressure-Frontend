// src/Routes.tsx
export const ROUTES = {
  TIRES: "/tires",
  TIRE_DETAIL: "/tire/:id",
} as const;

export type RouteKeyType = keyof typeof ROUTES;

export const ROUTE_LABELS: { [key in RouteKeyType]: string } = {
  TIRES: "Шины",
  TIRE_DETAIL: "Шина",
};