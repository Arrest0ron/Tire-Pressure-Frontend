// src/components/CartRow/CartRow.tsx
import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { MOCK_CART } from "../../modules/mock";
import cartIcon from "../../assets/cart.png";
import "./CartRow.css";

export default function CartRow() {
  const [cart, setCart] = useState(MOCK_CART);
  const prevCountRef = useRef<number>(cart.tires_count);

  // Загрузка данных и подписка на события обновления корзины
  useEffect(() => {
    const load = () => setCart({ ...MOCK_CART });
    load();
    
    window.addEventListener("tire-cart-updated", load);
    return () => window.removeEventListener("tire-cart-updated", load);
  }, []);

  // Анимация пульсации при изменении количества
  useEffect(() => {
    if (prevCountRef.current !== cart.tires_count && cart.tires_count > 0) {
      const el = document.querySelector<HTMLSpanElement>('.cart-count');
      if (el) {
        el.classList.add('pulse');
        setTimeout(() => el.classList.remove('pulse'), 300);
      }
    }
    prevCountRef.current = cart.tires_count;
  }, [cart.tires_count]);

  const inner = (
    <>
      <img src={cartIcon} alt="Корзина" className="cart-icon" />
      <span className="cart-count" aria-label={`Товаров в заявке: ${cart.tires_count}`}>
        {cart.tires_count}
      </span>
    </>
  );

  // Если есть активная заявка и товары — ссылка ведёт на неё
  if (cart.tire_pressure_id != null && cart.tires_count > 0) {
    return (
      <div className="cart-badge" role="navigation" aria-label="Перейти к заявке">
        <Link to={`/application/${cart.tire_pressure_id}`}>
          {inner}
        </Link>
      </div>
    );
  }

  // Если корзина пуста — иконка неактивна
  return (
    <div className="cart-badge cart-inactive" role="navigation" aria-label="Корзина пуста">
      <Link to="#!" onClick={(e) => e.preventDefault()}>
        {inner}
      </Link>
    </div>
  );
}