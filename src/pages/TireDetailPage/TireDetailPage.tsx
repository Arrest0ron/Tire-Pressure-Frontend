// src/pages/TireDetailPage/TireDetailPage.tsx
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { fallbackImageUrl, resolveMediaUrl, type Tire } from "../../modules/tireApi";
import { getMockTire, TIRES_MOCK} from "../../modules/mock";
// ✅ Исправленный путь: файл лежит в src/assets/, расширение .png
import defaultTire from "../../assets/default_tire.png";
import "./TireDetailPage.css";

export default function TireDetailPage() {
  const { id } = useParams();
  const [tire, setTire] = useState<Tire | null>(null);
  const [mediaError, setMediaError] = useState(false);
  const [adding, setAdding] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);

  useEffect(() => {
    if (!id) {
      setTire(null);
      return;
    }
    setMediaError(false);
    setDescExpanded(false);
    const tireId = Number(id);
    const resolved = getMockTire(tireId) ?? TIRES_MOCK.find((t) => t.tire_id === tireId) ?? null;
    setTire(resolved);
  }, [id]);

  // URL для видео (если указано в mock)
  const videoUrl = useMemo(() => (tire?.video ? resolveMediaUrl(tire.video) : ""), [tire]);
  
  // ✅ Фоллбек-изображение: приоритет photo шины → если нет, берём default_tire.png
  const fallbackUrl = useMemo(() => {
    if (tire?.photo) return resolveMediaUrl(tire.photo);
    return defaultTire;
  }, [tire]);

  // Видео показываем только если есть ссылка и нет ошибки загрузки
  const showVideo = Boolean(videoUrl) && !mediaError;

  const handleAdd = async () => {
    if (!tire) return;
    setAdding(true);
    try {
      const result = await addTireToMockApplication(tire.tire_id);
      if (result.ok) {
        window.dispatchEvent(new Event("tire-cart-updated"));
      } else {
        window.alert("message" in result ? result.message : "Не удалось добавить шину в расчёт.");
      }
    } finally {
      setAdding(false);
    }
  };

  const toggleDesc = () => setDescExpanded((prev) => !prev);

  // Если id нет или шина не найдена
  if (!id || !tire) {
    return (
      <div className="vibes-page vibes-page--scroll">
        <div className="tire-not-found">
          <h1>Шина не найдена</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="vibes-page vibes-page--scroll">
      <div className="vibes-viewport">
        <div className="vibes-media">
          {showVideo ? (
            <video
              className="vibes-video"
              controls
              autoPlay
              muted
              loop
              playsInline
              poster={fallbackUrl}
              onError={() => setMediaError(true)}
            >
              <source src={videoUrl} type="video/mp4" />
              {/* Резервное изображение для браузеров без поддержки video */}
              <img src={fallbackUrl} alt={tire.tire_title} />
            </video>
          ) : (
            // Если видео нет или произошла ошибка → показываем фоновое изображение
            <div
              className="vibes-fallback"
              style={{ backgroundImage: `url(${fallbackUrl})` }}
              aria-label={tire.tire_title}
            />
          )}
          <div className="vibes-overlay" aria-hidden />
        </div>

        {/* Контент поверх медиа */}
        <div className="vibes-content">
          <h1 className="vibes-title">{tire.tire_title}</h1>

          <p className={`vibes-description ${descExpanded ? 'expanded' : ''}`}>
            {tire.description ?? ''}
          </p>
          <div className="fade-overlay" />

          <div className="vibes-manager">
            <span className="vibes-manager__label">Материал</span>
            <span className="vibes-manager__name">{tire.tire_material_coefficient}</span>
            <span style={{ color: 'rgba(255,255,255,0.5)' }}>|</span>
            <span className="vibes-manager__label">Толщина</span>
            <span className="vibes-manager__name">{tire.tire_thickness_coefficient}</span>
          </div>
        </div>
      </div>
    </div>
  );
}