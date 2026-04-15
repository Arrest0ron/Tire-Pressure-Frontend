// src/pages/TiresPage/TiresPage.tsx
import { FC, useState, useEffect, useMemo } from "react";
import { Spinner } from "react-bootstrap"; // ← Оставили только Spinner, Form/Button больше не нужны
import CartRow from "../../components/CartRow/CartRow";
import { ROUTES } from "../../Routes";
import type { Tire } from "../../modules/tireApi";
import { TIRES_MOCK } from "../../modules/mock";
import TireCard from "../../components/TireCard/TireCard";
import Search from "../../components/InputField/InputField"; // ✅ Импорт компонента поиска
import "./TiresPage.css";

export const TiresPage: FC = () => {
  const [loading, setLoading] = useState(true);
  const [tires, setTires] = useState<Tire[]>([]);
  
  // 🔹 ДВА стейта: что в поле ввода и что применяется для поиска
  const [searchQuery, setSearchQuery] = useState("");      // то, что пользователь печатает
  const [appliedQuery, setAppliedQuery] = useState("");    // то, по чему реально фильтруем

  // Загрузка моковых данных
  useEffect(() => {
    const timer = setTimeout(() => {
      setTires(TIRES_MOCK);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // 🔹 ФИЛЬТРАЦИЯ: зависит только от appliedQuery (срабатывает по кнопке)
  const filteredTires = useMemo(() => {
    const query = appliedQuery.trim().toLowerCase();
    if (!query) return tires;
    return tires.filter((tire) => 
      tire.tire_title.toLowerCase().includes(query)
    );
  }, [appliedQuery, tires]);

  // 🔹 Обработчик кнопки "Найти" (применяет запрос)
  const handleSearch = () => {
    setAppliedQuery(searchQuery);
  };

  if (loading) {
    return (
      <div className="main-content">
        <div style={{ display: "flex", justifyContent: "center", minHeight: "300px" }}>
          <Spinner animation="border" role="status" />
          <span className="visually-hidden">Загрузка...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <CartRow />

      {/* === Поиск: вынесен в отдельный компонент === */}
      <Search 
        query={searchQuery}           // ✅ Передаём текущее значение поля
        onQueryChange={setSearchQuery} // ✅ Передаём функцию обновления ввода
        onSearch={handleSearch}        // ✅ Передаём функцию применения поиска
      />

      {/* === Список карточек === */}
      {filteredTires.length === 0 ? (
        <div className="alert alert-error">
          <p>Шины не найдены.</p>
        </div>
      ) : (
        <div className="tires-grid">
          {filteredTires.map((tire) => (
            <TireCard key={tire.tire_id} tire={tire} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TiresPage;