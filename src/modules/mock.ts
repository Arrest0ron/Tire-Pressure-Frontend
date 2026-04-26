// src/modules/mock.ts
import {
  type Tire,
  type TirePressureCart,
  type TirePressureDetailResponse,
} from "./tireApi";

// Импорты изображений из assets (замени на актуальные пути, если нужно)
import tungaPhoto from "../assets/Tunga_Nordway.jpg";
import mrlPhoto from "../assets/mrl-mr3.jpg";
import mitasPhoto from "../assets/MITAS_TR-08.jpg";
import michelinPhoto from "../assets/Michelin_Latitude_Tour.jpg";

export const TIRES_MOCK: Tire[] = [
  {
    tire_id: 1,
    is_delete: false,
    tire_title: "Tunga Nordway",
    description:
      "Зимняя шипованная шина с агрессивным V-образным протектором. Усиленный каркас, отличное сцепление на льду и укатанном снегу. Подходит для легковых автомобилей и кроссоверов.",
    // ✅ Только короткое на английском (67 символов) → для CLIP
    short_description_en: "Studded winter tire with aggressive V-tread for ice roads",
    photo: tungaPhoto,
    video: "",
    tire_material_coefficient: 1.3,
    tire_thickness_coefficient: 0.9,
    embedding: [],
  },
  {
    tire_id: 2,
    is_delete: false,
    tire_title: "mrl-mr3",
    description:
      "Всесезонная широкопрофильная шина для спецтехники. Усиленный каркас, стойкость к порезам и ударам. Оптимизирована для работы на твёрдых и смешанных покрытиях.",
    short_description_en: "Wide-profile all-season tire for heavy trucks and machinery", // 65 chars
    photo: mrlPhoto,
    video: "",
    tire_material_coefficient: 2.1,
    tire_thickness_coefficient: 1.8,
    embedding: [],
  },
  {
    tire_id: 3,
    is_delete: false,
    tire_title: "MITAS_TR-08",
    description:
      "Всесезонная арочная шина для сельскохозяйственной техники. Гибкая боковина, увеличенное пятно контакта, минимальное давление на почву. Для полевых работ.",
    short_description_en: "Arched agricultural tire with flexible sidewall for soft soil", // 68 chars
    photo: mitasPhoto,
    video: "",
    tire_material_coefficient: 1.9,
    tire_thickness_coefficient: 1.6,
    embedding: [],
  },
  {
    tire_id: 4,
    is_delete: false,
    tire_title: "Michelin_Latitude_Tour",
    description:
      "Летняя шина для кроссоверов и внедорожников. Асимметричный протектор, низкий уровень шума, топливная экономичность. Комфорт на трассе и в городе.",
    short_description_en: "Summer highway tire with low noise and fuel efficient design", // 66 chars
    photo: michelinPhoto,
    video: "",
    tire_material_coefficient: 1.1,
    tire_thickness_coefficient: 0.7,
    embedding: [],
  },
];

export const MOCK_CART: TirePressureCart = {
  tire_pressure_id: 1,
  tires_count: 0,
};

export function getMockTire(id: number): Tire | undefined {
  return TIRES_MOCK.find((t) => t.tire_id === id);
}

// ✅ Фильтрация по названию (сохранена как в оригинале)
export function filterMockTiresByTitle(title: string): Tire[] {
  const t = title.trim().toLowerCase();
  if (!t) return [...TIRES_MOCK];
  return TIRES_MOCK.filter((tire) =>
    tire.tire_title.toLowerCase().includes(t)
  );
}