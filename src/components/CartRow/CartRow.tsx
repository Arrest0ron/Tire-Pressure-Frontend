// src/components/CartRow/CartRow.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTirePressureCart, type TirePressureCart } from "../../modules/tireApi";
import { MOCK_CART } from "../../modules/mock";
import cartIcon from "../../assets/cart.png";
import "./CartRow.css";

export default function CartRow() {
  const [cart, setCart] = useState<TirePressureCart>(MOCK_CART);
  const [loading, setLoading] = useState(true);

  // ✅ Запрос к бэкенду при монтировании (без токена!)
  useEffect(() => {
    let cancelled = false;

    getTirePressureCart()
      .then(data => {
        if (!cancelled) {
          setCart(data);
          setLoading(false);
        }
      })
      .catch(() => {
        // Fallback на моки при ошибке сети
        if (!cancelled) {
          setCart(MOCK_CART);
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, []);

  // Пока грузим — показываем заглушку
  if (loading) {
    return (
      <div className="cart-badge cart-loading" role="status" aria-label="Загрузка корзины">
        <img src={cartIcon} alt="Корзина" className="cart-icon" />
        <span className="cart-count">…</span>
      </div>
    );
  }

  const inner = (
    <>
      <img src={cartIcon} alt="Корзина" className="cart-icon" />
      <span className="cart-count" aria-label={`Товаров в заявке: ${cart.tires_count}`}>
        {cart.tires_count}
      </span>
    </>
  );

  // ✅ Если есть активная заявка и товары — ссылка ведёт на неё
  if (cart.tire_pressure_id != null && cart.tires_count > 0) {
    return (
      <div className="cart-badge" role="navigation" aria-label="Перейти к заявке">
        <Link to={`/application/${cart.tire_pressure_id}`}>
          {inner}
        </Link>
      </div>
    );
  }

  // ✅ Если корзина пуста — иконка неактивна
  return (
    <div className="cart-badge cart-inactive" role="navigation" aria-label="Корзина пуста">
      <Link to="#!" onClick={(e) => e.preventDefault()}>
        {inner}
      </Link>
    </div>
  );
}