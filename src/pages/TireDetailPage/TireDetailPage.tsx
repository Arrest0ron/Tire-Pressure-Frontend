// src/pages/TireDetailPage/TireDetailPage.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { resolveMediaUrl, type Tire, getTire } from "../../modules/tireApi"; // ✅ Import getTire
import { getMockTire, TIRES_MOCK } from "../../modules/mock";
import defaultTire from "../../assets/default_tire.png";
import "./TireDetailPage.css";

export default function TireDetailPage() {
  const { id } = useParams();
  
  const [tire, setTire] = useState<Tire | null>(null);
  const [mediaError, setMediaError] = useState(false);
  const [loading, setLoading] = useState(true); // ✅ Loading state

  useEffect(() => {
    if (!id) {
      setTire(null);
      setLoading(false);
      return;
    } 
    
    setMediaError(false);
    setLoading(true);
    const tireId = Number(id);

    // ✅ Try backend first, fallback to mock
    getTire(tireId)
      .then(data => {
        if (data) {
          setTire(data);
        } else {
          // Fallback to mock if backend returns null
          const resolved = getMockTire(tireId) ?? TIRES_MOCK.find((t) => t.tire_id === tireId) ?? null;
          setTire(resolved);
        }
      })
      .catch(() => {
        // Fallback to mock on network error
        const resolved = getMockTire(tireId) ?? TIRES_MOCK.find((t) => t.tire_id === tireId) ?? null;
        setTire(resolved);
      })
      .finally(() => {
        setLoading(false);
      });
      
  }, [id]);

  // ✅ Now video will come from backend!
  const videoUrl = tire?.video ? resolveMediaUrl(tire.video) : "";
  const fallbackUrl = tire?.photo ? resolveMediaUrl(tire.photo) : defaultTire;
  const showVideo = Boolean(videoUrl) && !mediaError;

  if (loading) {
    return (
      <div className="vibes-page vibes-page--scroll">
        <div className="tire-not-found">
          <h1>Загрузка...</h1>
        </div>
      </div>
    );
  }

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