// src/components/TireCard/TireCard.tsx
import { Link } from "react-router-dom";
import { useEffect, useState, type MouseEvent } from "react";
import type { Tire } from "../../modules/tireApi";
import { resolveMediaUrl, fallbackImageUrl } from "../../modules/tireApi";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { addTireToCart } from "../../store/slices/tirePressureSlice";
import defaultTire from "../../assets/default_tire.png"; // ✅ Финальный фоллбэк
import "./TireCard.css";

interface TireCardProps {
  tire: Tire;
}

const CART_UPDATED = "tire-pressure-cart-updated";

export default function TireCard({ tire }: TireCardProps) {
  const dispatch = useAppDispatch();
  
  const { isAuthenticated } = useAppSelector((s) => s.user);
  const applicationMutationLoading = useAppSelector(
    (s) => s.tirePressure.applicationMutationLoading,
  );
  
  const [imageError, setImageError] = useState(false);
  const [imageUrl, setImageUrl] = useState(resolveMediaUrl(tire.photo || ""));
  const [adding, setAdding] = useState(false);

  // ✅ Сброс ошибки при смене шины
  useEffect(() => {
    setImageError(false);
    setImageUrl(resolveMediaUrl(tire.photo || ""));
  }, [tire.photo]);

  // ✅ Цепочка фоллбэков: resolveMediaUrl → fallbackImageUrl → defaultTire
  const handleImageError = () => {
    if (!imageError) {
      // Первая ошибка: пробуем fallbackImageUrl
      setImageError(true);
      setImageUrl(fallbackImageUrl());
    } else {
      // Вторая ошибка: ставим дефолтную картинку из assets
      setImageUrl(defaultTire);
    }
  };

  const handleAdd = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) return;
    
    setAdding(true);
    try {
      await dispatch(addTireToCart(tire.tire_id!)).unwrap();
      window.dispatchEvent(new Event(CART_UPDATED));
    } catch {
      void 0;
    } finally {
      setAdding(false);
    }
  };

  const busy = adding || applicationMutationLoading;
  const displayUrl = imageUrl; // imageUrl уже содержит фоллбэк-цепочку

  // ✅ Отладка: раскомментируй, чтобы видеть, какой URL подставляется
  // useEffect(() => {
  //   console.log(`[TireCard #${tire.tire_id}] photo:`, tire.photo);
  //   console.log(`[TireCard #${tire.tire_id}] displayUrl:`, displayUrl);
  // }, [tire.tire_id, tire.photo, displayUrl]);

  return (
    <div className="tire-card">
      <div className="tire-left">
        <Link to={`/tire/${tire.tire_id}`} className="tire-link">
          <img 
            src={displayUrl} 
            alt={tire.tire_title || "Шина"} 
            onError={handleImageError}  // ✅ Двухуровневый фоллбэк
            loading="lazy"
          />
        </Link>
      </div>

      <div className="device-info">
        <h3 className="tire-title">
          <Link to={`/tire/${tire.tire_id}`}>
            {tire.tire_title || `Шина #${tire.tire_id}`}
          </Link>
        </h3>

        <span className="device-pressure">
          Коэффициент: {tire.tire_material_coefficient ?? "—"}
        </span>

        {tire.description && (
          <p className="tire-description">{tire.description}</p>
        )}

        <button 
          type="button" 
          className="tire-btn"
          onClick={handleAdd}
          disabled={!isAuthenticated || busy}
          title={!isAuthenticated ? "Войдите, чтобы добавить в заявку" : ""}
        >
          {busy 
            ? "Добавление…" 
            : isAuthenticated 
              ? "Добавить в заявку" 
              : "Войдите в аккаунт для расчета"}
        </button>
      </div>
    </div>
  );
}