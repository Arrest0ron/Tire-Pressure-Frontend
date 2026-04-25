// src/components/CartRow/CartRow.tsx
import { Link } from "react-router-dom";
import { MOCK_CART } from "../../modules/mock";
import cartIcon from "../../assets/cart.png";
import "./CartRow.css";

export default function CartRow() {
  // ✅ Читаем моковые данные напрямую — без useState/useEffect
  const cart = MOCK_CART;

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

  // ✅ Если корзина пуста — иконка неактивна (как у нас сейчас)
  return (
    <div className="cart-badge cart-inactive" role="navigation" aria-label="Корзина пуста">
      <Link to="#!" onClick={(e) => e.preventDefault()}>
        {inner}
      </Link>
    </div>
  );
}