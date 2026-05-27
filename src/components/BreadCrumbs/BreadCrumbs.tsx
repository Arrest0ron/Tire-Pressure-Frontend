// src/components/Breadcrumbs/Breadcrumbs.tsx
import "./Breadcrumbs.css";
import React from "react";
import { Link } from "react-router-dom";
import type { FC } from "react";

export interface ICrumb {
  label: string;
  to?: string;  // ✅ Используем 'to' как в оригинале
}

export interface BreadcrumbsProps {
  crumbs: ICrumb[];
}

export const Breadcrumbs: FC<BreadcrumbsProps> = ({ crumbs }) => {
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
};