// src/pages/TireDetailPage/TireDetailPage.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { resolveMediaUrl, type Tire } from "../../modules/tireApi";
import { getMockTire, TIRES_MOCK } from "../../modules/mock";
import defaultTire from "../../assets/default_tire.png";
import "./TireDetailPage.css";

export default function TireDetailPage() {
  const { id } = useParams();
  
  // ✅ Только 2 необходимых стейта
  const [tire, setTire] = useState<Tire | null>(null);
  const [mediaError, setMediaError] = useState(false);

  useEffect(() => {
    if (!id) {
      setTire(null);
      return;
    } 
    setMediaError(false);
    const tireId = Number(id);
    const resolved = getMockTire(tireId) ?? TIRES_MOCK.find((t) => t.tire_id === tireId) ?? null;
    setTire(resolved);
  }, [id]);

  const videoUrl = tire?.video ? resolveMediaUrl(tire.video) : "";
  const fallbackUrl = tire?.photo ? resolveMediaUrl(tire.photo) : defaultTire;
  const showVideo = Boolean(videoUrl) && !mediaError;

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
              <img src={fallbackUrl} alt={tire.tire_title} />
            </video>
          ) : (
            <div
              className="vibes-fallback"
              style={{ backgroundImage: `url(${fallbackUrl})` }}
              aria-label={tire.tire_title}
            />
          )}
          <div className="vibes-overlay" aria-hidden />
        </div>

        <div className="vibes-content">
          <h1 className="vibes-title">{tire.tire_title}</h1>

          {/* ✅ Описание показывается полностью, без кнопки "Читать далее" */}
          <p className="vibes-description">
            {tire.description ?? ''}
          </p>

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