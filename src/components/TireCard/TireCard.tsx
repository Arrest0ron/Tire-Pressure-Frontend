// src/components/TireCard/TireCard.tsx
import { Link } from "react-router-dom";
import { useEffect, useState, type MouseEvent } from "react";
import type { Tire } from "../../modules/tireApi";
import { resolveMediaUrl, fallbackImageUrl } from "../../modules/tireApi";
import { useAppDispatch, useAppSelector } from "../../store/hooks"; // ✅ Импорт хуков Redux
import { addTireToCart } from "../../store/slices/tirePressureSlice"; // ✅ Импорт thunk-а
import defaultTire from "../../assets/default_tire.png";
import "./TireCard.css";

interface TireCardProps {
  tire: Tire;
}

// 🔹 Событие для обновления корзины (как в примере)
const CART_UPDATED = "tire-pressure-cart-updated";

export default function TireCard({ tire }: TireCardProps) {
  const dispatch = useAppDispatch();
  
  // ✅ Получаем состояние авторизации и загрузки из Redux
  const { isAuthenticated } = useAppSelector((s) => s.user);
  const applicationMutationLoading = useAppSelector(
    (s) => s.tirePressure.applicationMutationLoading,
  );
  
  // ✅ Локальные состояния для изображения
  const [imageError, setImageError] = useState(false);
  const [imageUrl, setImageUrl] = useState(resolveMediaUrl(tire.photo || ""));
  const [adding, setAdding] = useState(false);

  // ✅ Сброс ошибки изображения при смене шины
  useEffect(() => {
    setImageError(false);
    setImageUrl(resolveMediaUrl(tire.photo || ""));
  }, [tire.photo]);

  const handleImageError = () => {
    setImageError(true);
  };

  // ✅ Обработчик добавления в заявку (как в примере)
  const handleAdd = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    // 🔹 Если не авторизован — ничего не делаем
    if (!isAuthenticated) return;
    
    setAdding(true);
    try {
      // 🔹 Диспатчим thunk для добавления шины
      await dispatch(addTireToCart(tire.tire_id!)).unwrap();
      
      // 🔹 Триггерим событие для обновления CartRow
      window.dispatchEvent(new Event(CART_UPDATED));
    } catch {
      // Ошибка уже обработана в thunk и показана через apiErrMessage
      void 0;
    } finally {
      setAdding(false);
    }
  };

  // ✅ Флаг занятости: добавление идёт ИЛИ глобальная загрузка мутаций
  const busy = adding || applicationMutationLoading;

  // ✅ Резолвим итоговый URL изображения
  const displayUrl = imageError ? fallbackImageUrl() : imageUrl;

  return (
    <div className="tire-card">
      <div className="tire-left">
        <Link to={`/tire/${tire.tire_id}`} className="tire-link">
          <img 
            src={displayUrl} 
            alt={tire.tire_title || "Шина"} 
            onError={handleImageError}
          />
        </Link>
      </div>

      {/* === ПРАВАЯ ЧАСТЬ: Информация === */}
      <div className="device-info">
        {/* ✅ Название шины — кликабельная ссылка */}
        <h3 className="tire-title">
          <Link to={`/tire/${tire.tire_id}`}>
            {tire.tire_title || `Шина #${tire.tire_id}`}
          </Link>
        </h3>

        {/* Коэффициент */}
        <span className="device-pressure">
          Коэффициент: {tire.tire_material_coefficient ?? "—"}
        </span>

        {/* Описание */}
        {tire.description && (
          <p className="tire-description">{tire.description}</p>
        )}

        {/* ✅ Кнопка: активна только для авторизованных */}
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