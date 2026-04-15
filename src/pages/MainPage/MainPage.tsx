import { Link } from "react-router-dom";
import { ROUTES } from "../../Routes";
import "./MainPage.css";

export default function MainPage() {
  return (
    <div className="main-page">
      <div className="main-page__content">
        <h1 className="main-page__title">Каталог шин</h1>
        <p className="main-page__description">
          Подберите шины по характеристикам, рассчитайте оптимальное давление и сохраните подборку в черновик.
        </p>
        <Link to={ROUTES.TIRES} className="main-page__btn">
          Перейти к каталогу
        </Link>
      </div>
    </div>
  );
}