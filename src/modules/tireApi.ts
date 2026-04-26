// src/modules/tireApi.ts

const MINIO_PUBLIC_BASE =
  (import.meta.env.VITE_MINIO_PUBLIC_BASE?.replace(/\/$/, "") as string | undefined) ??
  "http://localhost:9000/test";

export type TirePressureStatus = 'черновик' | 'удалён' | 'сформирован' | 'завершён' | 'отклонён';

export interface Tire {
  tire_id: number;
  tire_title: string;
  description: string;
  photo?: string;
  video?: string;
  tire_material_coefficient: number;
  tire_thickness_coefficient: number;
  is_delete?: boolean;
  short_description_en?: string;
}

export function tireClipDescription(t: Tire): string {
  const en = t.short_description_en?.trim();
  if (en) return en;
  return "Tire product unit.";
}

export interface TirePressure {
  tire_pressure_id: number;
  status: TirePressureStatus;
  date_create: string;
  date_formed?: string | null;
  date_completed?: string | null;
  creator_id: number;
  moderator_id?: number | null;
  air_temperature?: number | null;
  car_weight?: number | null;
}

export interface TirePressureEntry {
  id: number;
  tire_pressure_id: number;
  tire_id: number;
  tire: Tire;
  coating_coefficient: number;
  pressure: number;
}

export interface TirePressureCart {
  tire_pressure_id?: number;
  tires_count: number;
}

export interface TirePressureDetailResponse {
  application: TirePressure;
  entries: TirePressureEntry[];
}

// ✅ Утилиты
export function objectUrlFromKey(key: string): string {
  if (!key) return "";
  return `${MINIO_PUBLIC_BASE}/${key.replace(/^\//, "")}`;
}

export function fallbackImageUrl(): string {
  return (
    "data:image/svg+xml," +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="120" viewBox="0 0 200 120"><rect width="100%" height="100%" fill="#e8e8ec"/></svg>',
    )
  );
}

// ✅ resolveMediaUrl — добавлен обратно, чтобы не ломать импорты
export function resolveMediaUrl(key: string): string {
  if (!key) return fallbackImageUrl();
  if (
    key.startsWith("http://") ||
    key.startsWith("https://") ||
    key.startsWith("/") ||
    key.startsWith("blob:") ||
    key.startsWith("data:")
  ) {
    return key;
  }
  return objectUrlFromKey(key);
}

// ✅ API-функции
export async function getTirePressureCart(): Promise<TirePressureCart> {
  try {
    const res = await fetch("/api/tire_pressure/tire_pressure-cart", {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return { tire_pressure_id: undefined, tires_count: 0 };
  }
}

export async function getTirePressure(
  id: number,
): Promise<TirePressureDetailResponse | null> {
  const headers: Record<string, string> = { Accept: "application/json" };
  const token = localStorage.getItem("token");
  if (token) headers["Authorization"] = `Bearer ${token}`;
  try {
    const res = await fetch(`/api/tire_pressure/${id}`, { headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return null;
  }
}

export async function listTires(params?: { title?: string }): Promise<Tire[]> {
  try {
    let path = "/api/tires";
    if (params?.title) {
      const q = new URLSearchParams();
      q.append("Title", params.title);
      path += `?${q.toString()}`;
    }
    const res = await fetch(path, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return [];
  }
}

export async function getTire(id: number): Promise<Tire | null> {
  try {
    const res = await fetch(`/api/tire/${id}`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return null;
  }
}

export async function addTireToApplication(
  tireId: number,
): Promise<{ ok: true } | { ok: false; status: number; message?: string }> {
  const token = localStorage.getItem("token");
  if (!token) {
    return { ok: false, status: 401, message: "Войдите в систему, чтобы добавить шину в заявку." };
  }
  try {
    const res = await fetch(`/api/tire_app_tire/add/${tireId}`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (res.ok || res.status === 201) return { ok: true };
    let message: string | undefined;
    try {
      const j = (await res.json()) as { error?: string; message?: string };
      message = j.error ?? j.message;
    } catch {
      message = await res.text();
    }
    return { ok: false, status: res.status, message: message || `HTTP ${res.status}` };
  } catch {
    return { ok: false, status: 0, message: "Не удалось выполнить запрос." };
  }
}