// src/modules/tireApi.ts

// === Статусы заявки (из ds) ===
export type TirePressureStatus = 'черновик' | 'удалён' | 'сформирован' | 'завершён' | 'отклонён';

// === ds.Tire ===
export interface Tire {
  tire_id: number;
  tire_title: string;
  description: string;
  photo?: string;           // путь к файлу в MinIO (опционально)
  video?: string;           // путь к файлу в MinIO (опционально)
  tire_material_coefficient: number;   // М
  tire_thickness_coefficient: number;  // Т
  is_delete?: boolean;
}

// === ds.TirePressure ===
export interface TirePressure {
  tire_pressure_id: number;
  status: TirePressureStatus;
  date_create: string;              // ISO 8601
  date_formed?: string | null;
  date_completed?: string | null;
  creator_id: number;
  moderator_id?: number | null;
  air_temperature?: number | null;  // ✅ редактируется в черновике
  car_weight?: number | null;       // ✅ редактируется в черновике
}

// === ds.TirePressureEntry ===
export interface TirePressureEntry {
  id: number;
  tire_pressure_id: number;
  tire_id: number;
  tire: Tire;                       // вложенная сущность шины
  coating_coefficient: number;      // ✅ редактируется в черновике
  pressure: number;                 // рассчитанное значение, только просмотр
}

// === Вспомогательные интерфейсы для фронтенда ===

// Корзина / черновик заявки
export interface TirePressureCart {
  tire_pressure_id?: number;
  tires_count: number;
}

// Полный ответ для страницы заявки
export interface TirePressureDetailResponse {
  application: TirePressure;
  entries: TirePressureEntry[];
}

// === Вспомогательные функции (без изменений — универсальные) ===


/**
 * Возвращает путь к изображению-заглушке для шин
 * Файл должен лежать в папке public/ (корень статики)
 */
export function fallbackImageUrl(): string {
  return "src/assets/default_tire.png";
}

/**
 * Резолвит путь к медиа: если ключ уже содержит протокол или абсолютный путь — возвращает как есть,
 * иначе — fallback. Подходит для MinIO-ссылок.
 */
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
  return fallbackImageUrl();
}