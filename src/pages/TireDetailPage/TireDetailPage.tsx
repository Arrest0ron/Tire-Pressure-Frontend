// src/pages/TireDetailPage/TireDetailPage.tsx
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { addTireToMockApplication, TIRES_MOCK, getMockTire } from "../../modules/mock";
import { fallbackImageUrl, resolveMediaUrl, type Tire } from "../../modules/tireApi";
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
    setDescExpanded(false); // Сбрасываем состояние описания при смене шины
    const tireId = Number(id);
    const resolved = getMockTire(tireId) ?? TIRES_MOCK.find((t) => t.tire_id === tireId) ?? null;
    setTire(resolved);
  }, [id]);

  const videoUrl = useMemo(() => (tire ? resolveMediaUrl(tire.video ?? "") : ""), [tire]);
  const posterUrl = useMemo(() => (tire ? resolveMediaUrl(tire.photo ?? "") : fallbackImageUrl()), [tire]);
  const showVideo = Boolean(tire?.video?.trim()) && !mediaError;

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
        {/* === Медиа-фон (видео или картинка) === */}
        <div className="vibes-media">
          {showVideo ? (
            <video
              className="vibes-video"
              controls
              autoPlay
              muted
              loop
              playsInline
              poster={posterUrl}
              onError={() => setMediaError(true)}
            >
              <source src={videoUrl} type="video/mp4" />
            </video>
          ) : (
            <div className="vibes-fallback" style={{ backgroundImage: `url(${posterUrl})` }} />
          )}
          <div className="vibes-overlay" aria-hidden />
        </div>

        {/* === Контент поверх видео === */}
        <div className="vibes-content">
          <h1 className="vibes-title">{tire.tire_title}</h1>


          {/* Описание + градиент-фейд (CSS sibling selector `~` работает только если они соседи) */}
          <p className={`vibes-description ${descExpanded ? 'expanded' : ''}`}>
            {tire.description ?? ''}
          </p>
          <div className="fade-overlay" />


          {/* Блок с коэффициентами */}
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