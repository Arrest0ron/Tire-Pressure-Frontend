// src/pages/TiresPage/TiresPage.tsx
import { FC, useState, useEffect, useMemo } from "react";
import { Form, Button, Spinner } from "react-bootstrap"; // ← убрали Row, Col
import CartRow from "../../components/CartRow/CartRow";
import { ROUTES, ROUTE_LABELS } from "../../Routes";
import type { Tire } from "../../modules/tireApi";
import { TIRES_MOCK } from "../../modules/mock";
import TireCard from "../../components/TireCard/TireCard";
import "./TiresPage.css";

export const TiresPage: FC = () => {
  const [loading, setLoading] = useState(true);
  const [tires, setTires] = useState<Tire[]>([]);
  
  // 🔹 ДВА стейта: что в поле ввода и что применяется для поиска
  const [searchQuery, setSearchQuery] = useState("");      // то, что пользователь печатает
  const [appliedQuery, setAppliedQuery] = useState("");    // то, по чему реально фильтруем

  useEffect(() => {
    const timer = setTimeout(() => {
      setTires(TIRES_MOCK);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // 🔹 Фильтрация ТОЛЬКО по appliedQuery
  const filteredTires = useMemo(() => {
    const query = appliedQuery.trim().toLowerCase();
    if (!query) return tires;
    return tires.filter((tire) => 
      tire.tire_title.toLowerCase().includes(query)
    );
  }, [appliedQuery, tires]);

  // 🔹 Обработчик кнопки "Найти"
  const handleSearch = () => {
    setAppliedQuery(searchQuery);
  };

  // 🔹 Обработчик Enter в поле ввода
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  if (loading) {
    return (
      <div className="main-content">
        <div className="search-box">
          <Spinner animation="border" role="status" />
          <span className="visually-hidden">Загрузка...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <CartRow />

      {/* === Поиск === */}
      <div className="header-controls">
        <Form.Control
          type="text"
          placeholder="Поиск по названию шины"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="form-control"
        />
        <Button 
          variant="primary" 
          className="btn-submit"
          onClick={handleSearch}
        >
          Найти
        </Button>
      </div>

      {/* === Список карточек === */}
      {filteredTires.length === 0 ? (
        <div className="alert alert-error">
          <p>Шины не найдены.</p>
        </div>
      ) : (
        /* 🔹 ВАЖНО: НЕ используем Row/Col — только plain div с классом tires-grid */
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