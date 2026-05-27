// src/modules/tireApi.ts
// ✅ Импортируем НАШ настроенный экземпляр api (с правильным baseURL)
import { api } from "../api";

const MINIO_PUBLIC_BASE =
  (import.meta.env.VITE_MINIO_PUBLIC_BASE?.replace(/\/$/, "") as string | undefined) ??
  "http://localhost:9090/tire-bucket";

// ... (все интерфейсы и типы оставляем без изменений) ...
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

// ✅ ИСПРАВЛЕНО: используем api.instance вместо прямого axios
export async function listTires(params?: { title?: string }): Promise<Tire[]> {
  try {
    // ✅ baseURL подставится автоматически из src/api/index.ts
    const response = await api.instance.get<Tire[]>("/tires", {  // ← убрали /api из пути!
      params: params?.title ? { Title: params.title } : undefined,
      headers: { Accept: "application/json" },
    });
    return response.data;
  } catch (error) {
    console.error("Ошибка загрузки списка шин:", error);
    return [];
  }
}

export async function getTire(id: number): Promise<Tire | null> {
  try {
    // ✅ baseURL подставится автоматически
    const response = await api.instance.get<Tire>(`/tires/${id}`, {  // ← убрали /api из пути!
      headers: { Accept: "application/json" },
    });
    return response.data;
  } catch (error) {
    console.error(`Ошибка загрузки шины #${id}:`, error);
    return null;
  }
}