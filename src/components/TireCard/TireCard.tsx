// src/components/TireCard/TireCard.tsx
import { Link } from "react-router-dom"; // ✅ Добавляем Link для навигации
import type { Tire } from "../../modules/tireApi";
import { resolveMediaUrl, fallbackImageUrl } from "../../modules/tireApi";
import "./TireCard.css";

interface TireCardProps {
  tire: Tire;
}

export default function TireCard({ tire }: TireCardProps) {
  // Безопасное получение фото
  const photoUrl = tire.photo ? resolveMediaUrl(tire.photo) : fallbackImageUrl();

  // Заглушка для кнопки (ничего не делает)
  const handleAddToCartStub = (e: React.MouseEvent) => {
    e.preventDefault(); // ✅ Предотвращаем любые действия по умолчанию
    // Можно добавить: console.log(`Шина ${tire.tire_id} добавлена (mock)`);
  };

  return (
    <div className="tire-card">
      {/* === ЛЕВАЯ ЧАСТЬ: Картинка === */}
      <div className="tire-left">
        <img 
          src={photoUrl} 
          alt={tire.tire_title || "Шина"} 
          onError={(e) => {
            (e.target as HTMLImageElement).src = fallbackImageUrl();
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

        {/* ✅ Кнопка-заглушка: "+ В расчёт", никуда не ведёт */}
        <button 
          type="button" 
          className="tire-btn"
          onClick={handleAddToCartStub}
        >
          + В расчёт
        </button>
      </div>
    </div>
  );
}