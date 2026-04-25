// src/pages/TiresPage/TiresPage.tsx
import { FC, useState } from "react"; // ← useEffect и Spinner больше не нужны
import CartRow from "../../components/CartRow/CartRow";
import { ROUTES } from "../../Routes";
import type { Tire } from "../../modules/tireApi";
import { TIRES_MOCK } from "../../modules/mock";
import TireCard from "../../components/TireCard/TireCard";
import Search from "../../components/InputField/InputField";
import "./TiresPage.css";

export const TiresPage: FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedQuery, setAppliedQuery] = useState("");

  const tires: Tire[] = TIRES_MOCK;

  // 🔹 ФИЛЬТРАЦИЯ: прямо в теле компонента
  const query = appliedQuery.trim().toLowerCase();
  const filteredTires = !query 
    ? tires 
    : tires.filter((tire) => tire.tire_title.toLowerCase().includes(query));

  // 🔹 Обработчик кнопки "Найти"
  const handleSearch = () => {
    setAppliedQuery(searchQuery);
  };

  return (
    <div className="main-content">
      <CartRow />

      {/* === Поиск === */}
      <Search 
        query={searchQuery}
        onQueryChange={setSearchQuery}
        onSearch={handleSearch}
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