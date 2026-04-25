// src/components/TireCard/TireCard.tsx
import { Link } from "react-router-dom";
import type { Tire } from "../../modules/tireApi";
import { resolveMediaUrl } from "../../modules/tireApi";
import defaultTire from "../../assets/default_tire.png";
import "./TireCard.css";

interface TireCardProps {
  tire: Tire;
}

export default function TireCard({ tire }: TireCardProps) {
  // ✅ Безопасное получение фото: если есть — резолвим, если нет — берём default_tire.png
  const photoUrl = tire.photo ? resolveMediaUrl(tire.photo) : defaultTire;

  // Заглушка для кнопки (ничего не делает)
  const handleAddToCartStub = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  return (
    <div className="tire-card">
      <div className="tire-left">
        <img 
          src={photoUrl} 
          alt={tire.tire_title || "Шина"} 
          onError={(e) => {
            (e.target as HTMLImageElement).src = defaultTire;
          }}
        />
      </div>

      {/* === ПРАВАЯ ЧАСТЬ: Информация === */}
      <div className="device-info">
        {/* ✅ Название шины — кликабельная ссылка на детальную страницу */}
        <h3 className="tire-title">
          <Link to={`/tire/${tire.tire_id}`}>
            {tire.tire_title || `Шина #${tire.tire_id}`}
          </Link>
        </h3>

        {/* Коэффициент */}
        <span className="device-pressure">
          Коэффициент шины: {tire.tire_material_coefficient ?? "—"}
        </span>

        {/* Описание */}
        {tire.description && (
          <p>{tire.description}</p>
        )}

        <button 
          type="button" 
          className="tire-btn"
          onClick={handleAddToCartStub}
        >
          Войдите в аккаунт для расчета
        </button>
      </div>
    </div>
  );
}