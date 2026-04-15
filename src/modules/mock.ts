// src/modules/mock.ts
import {
  type Tire,
  type TirePressureCart,
  type TirePressureDetailResponse,
} from "./tireApi";

// Импорты изображений/видео из src/assets
// Положите файлы с такими именами в папку assets или измените пути ниже
import tire1Photo from "../assets/tire1.jpg";
import tire1Video from "../assets/yellow_black.mp4";
import tire2Photo from "../assets/tire2.jpg";
import tire2Video from "../assets/yellow_black.mp4";

export const TIRES_MOCK: Tire[] = [
{
    tire_id: 1,
    tire_title: "Michelin Energy Saver 205/55 R16 91V",
    description:
      "Летняя шина с низким сопротивлением качению. Усиленная боковина, отличный дренаж воды, комфортный ход. Подходит для седанов и хэтчбеков.",
    photo: "",
    video: tire1Video,
    tire_material_coefficient: 1.2,
    tire_thickness_coefficient: 0.8,
    is_delete: false,
  },
  {
    tire_id: 2,
    tire_title: "Continental CrossContact LX2 235/65 R17 108H",
    description:
      "Всесезонная шина для кроссоверов. Асимметричный протектор для уверенного сцепления на мокрой дороге и грунте. Повышенная износостойкость.",
    photo: tire1Photo,
    video: tire1Video,
    tire_material_coefficient: 1.5,
    tire_thickness_coefficient: 1.1,
    is_delete: false,
  },
  {
    tire_id: 3,
    tire_title: "Bridgestone M840 315/80 R22.5 156/150L",
    description:
      "Грузовая шина для дальних перевозок. Усиленный каркас, стойкость к порезам, оптимизированное пятно контакта для равномерного износа.",
    photo: tire2Photo,
    video: tire2Video,
    tire_material_coefficient: 2.1,
    tire_thickness_coefficient: 1.8,
    is_delete: false,
  },
];

export const MOCK_CART: TirePressureCart = {
  tire_pressure_id: 1,
  tires_count: 2,
};

export function getMockTire(id: number): Tire | undefined {
  return TIRES_MOCK.find((t) => t.tire_id === id);
}

// ✅ Фильтрация строго по названию (как вы просили)
export function filterMockTiresByTitle(title: string): Tire[] {
  const t = title.trim().toLowerCase();
  if (!t) return [...TIRES_MOCK];
  return TIRES_MOCK.filter((tire) => tire.tire_title.toLowerCase().includes(t));
}

export async function addTireToMockApplication(
  tireId: number,
): Promise<{ ok: true } | { ok: false; message?: string }> {
  void tireId;
  await new Promise((r) => setTimeout(r, 200));
  return { ok: true };
}

export const MOCK_APPLICATION_DETAIL: TirePressureDetailResponse = {
  application: {
    tire_pressure_id: 1,
    status: "черновик",
    date_create: new Date().toISOString(),
    date_formed: null,
    date_completed: null,
    creator_id: 1,
    moderator_id: null,
    air_temperature: 20,
    car_weight: 1500,
  },
  entries: [
    {
      id: 1,
      tire_pressure_id: 1,
      tire_id: 2,
      tire: TIRES_MOCK[1],
      coating_coefficient: 1.0,
      pressure: 220.5,
    },
    {
      id: 2,
      tire_pressure_id: 1,
      tire_id: 3,
      tire: TIRES_MOCK[2],
      coating_coefficient: 0.95,
      pressure: 245.0,
    },
  ],
};