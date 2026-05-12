// src/components/CartRow/CartRow.tsx
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchTirePressureCart } from "../../store/slices/tirePressureSlice";
import cartIcon from "../../assets/cart.png";
import "./CartRow.css";

export default function CartRow() {
  console.log("🟢 [CartRow] Компонент смонтирован");
  
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector(s => s.user);
  const { cart, cartLoading } = useAppSelector(s => s.tirePressure);

  // 🔹 Загружаем корзину при монтировании И при смене статуса авторизации
  useEffect(() => {
    console.log("📡 [CartRow] useEffect: isAuthenticated =", isAuthenticated);
    
    void dispatch(fetchTirePressureCart())
      .then((result) => {
        console.log("✅ [CartRow] Запрос завершён. Результат:", result);
      })
      .catch(e => console.error("❌ [CartRow] Ошибка в thunk:", e));
      
  }, [dispatch, isAuthenticated]);

  // 🔹 Слушаем кастомное событие обновления корзины (от TireCard после добавления)
  useEffect(() => {
    const handleCartUpdate = () => {
      console.log("🔄 [CartRow] Получено событие tire-pressure-cart-updated");
      void dispatch(fetchTirePressureCart());
    };
    
    window.addEventListener("tire-pressure-cart-updated", handleCartUpdate);
    return () => {
      console.log("🧹 [CartRow] Удаляем слушатель события");
      window.removeEventListener("tire-pressure-cart-updated", handleCartUpdate);
    };
  }, [dispatch]);

  // 🔹 Извлекаем данные с защитой от невалидных значений
  const count = isAuthenticated ? (cart?.tires_count ?? 0) : 0;
  
  // ✅ Ключевое исправление: id=0 считаем "нет черновика", только id>0 — валидный
  const validId = (cart?.id != null && cart?.id > 0) ? cart?.id : undefined;
  const hasDraft = isAuthenticated && Boolean(validId);
  
  // ✅ ИЗМЕНЕНО: applicationId → tirePressureId
  const tirePressureId = validId;
  
  // 🔹 Финальное условие: все 4 фактора должны быть истинными
  // ✅ ИЗМЕНЕНО: applicationId → tirePressureId
  const isActive = isAuthenticated && hasDraft && count > 0 && tirePressureId != null;

  // 🔥 Отладочный вывод ВСЕХ условий в консоль
  useEffect(() => {
    console.group("🔍 CartRow: проверка условий");
    console.log("  isAuthenticated:", isAuthenticated);
    console.log("  cart:", cart);
    console.log("  count (tires_count):", count);
    console.log("  validId (id>0?):", validId);
    console.log("  hasDraft:", hasDraft);
    // ✅ ИЗМЕНЕНО: applicationId → tirePressureId
    console.log("  tirePressureId:", tirePressureId);
    console.log("  ✅ isActive:", isActive);
    console.groupEnd();
  }, [isAuthenticated, cart, count, validId, hasDraft, tirePressureId, isActive]);

  const inner = (
    <>
      <img src={cartIcon} alt="Корзина" className="cart-icon" />
      <span className="cart-count" aria-label={`Шин в заявке: ${count}`}>
        {count}{cartLoading ? "…" : ""}
      </span>
    </>
  );

  // 🔹 Рендер активной ссылки
  if (isActive) {
    // ✅ ИЗМЕНЕНО: applicationId → tirePressureId в логе и пути
    console.log("🟢 Рендер: АКТИВНАЯ ссылка → /tire-pressure/", tirePressureId);
    return (
      <div className="cart-badge" role="navigation" aria-label="Перейти к заявке">
        <Link to={`/tire-pressure/${tirePressureId}`} className="cart-link">
          {inner}
        </Link>
      </div>
    );
  }

  // 🔹 Рендер неактивной иконки
  console.log("🔴 Рендер: НЕАКТИВНАЯ иконка (условия не выполнены)");
  return (
    <div className="cart-badge cart-inactive" role="navigation" aria-label="Корзина пуста">
      <Link to="#!" onClick={(e) => e.preventDefault()} tabIndex={-1} aria-disabled="true">
        {inner}
      </Link>
    </div>
  );
}