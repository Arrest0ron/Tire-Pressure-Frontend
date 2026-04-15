// src/layouts/MainLayout.tsx
import { Outlet } from "react-router-dom";
import AppHeader from "../components/AppHeader/AppHeader";
import Breadcrumbs from "../components/Breadcrumbs/Breadcrumbs";

export default function MainLayout() {
  return (
    <div className="main-layout">
      <AppHeader />
      <Breadcrumbs />
<main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}