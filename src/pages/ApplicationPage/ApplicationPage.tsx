// src/pages/ApplicationPage/ApplicationPage.tsx
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Form from "react-bootstrap/Form";
import {
  fallbackImageUrl,
  resolveMediaUrl,
  type Tire,
  type TirePressureDetailResponse,
} from "../../modules/tireApi";
import { TIRES_MOCK, MOCK_APPLICATION_DETAIL } from "../../modules/mock";
import "./ApplicationPage.css";

export default function ApplicationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<TirePressureDetailResponse | null>(null);

  const loadMock = useCallback(() => {
    if (!id) return null;
    const n = Number(id);
    if (n === MOCK_APPLICATION_DETAIL.application.tire_pressure_id) {
      return JSON.parse(JSON.stringify(MOCK_APPLICATION_DETAIL)) as TirePressureDetailResponse;
    }
    return null;
  }, [id]);

  useEffect(() => {
    setData(loadMock());
  }, [loadMock]);

  const tires = TIRES_MOCK;
  const tireById = useMemo(() => {
    const m = new Map<number, Tire>();
    tires.forEach((t) => m.set(t.tire_id, t));
    return m;
  }, [tires]);

  const entries = useMemo(() => data?.entries ?? [], [data?.entries]);

  // ✅ Редактирование параметров заявки
  const handleAppParamChange = (field: "air_temperature" | "car_weight", value: string) => {
    setData((prev) => {
      if (!prev) return prev;
      const num = value.trim() === "" ? null : Number(value);
      return {
        ...prev,
        application: { ...prev.application, [field]: num },
      };
    });
  };

  // ✅ Редактирование коэффициента покрытия
  const handleCoatingChange = (entryId: number, value: string) => {
    const num = value.trim() === "" ? 0 : Number(value);
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        entries: prev.entries.map((e) =>
          e.id === entryId ? { ...e, coating_coefficient: num } : e
        ),
      };
    });
  };

  const handleDelete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!window.confirm("Удалить заявку?")) return;
    navigate("/tires");
  };

  if (!data) {
    return (
      <div className="application-page">
        <p className="application-not-found">Заявка не найдена.</p>
      </div>
    );
  }

  const app = data.application;
  const statusLabel = 
    app.status === "черновик" ? "📝 Черновик" :
    app.status === "сформирован" ? "✅ Сформирована" :
    app.status === "завершён" ? "✅ Завершена" : "❌ Отклонена";

  return (
    <div className="application-page">
      <div className="application-detail">
        
        {/* === Заголовок заявки === */}
        <div className="application-detail__header-card">
          <h1 className="application-detail__title">Заявка на расчет давления в шинах</h1>
          <div className="application-detail__info">
            <div className="application-detail__info-item">
              <strong>ID заявки:</strong> {app.tire_pressure_id}
            </div>
            <div className="application-detail__info-item">
              <strong>Статус:</strong> <span className="status-badge">{statusLabel}</span>
            </div>
            <div className="application-detail__info-item">
              <strong>Шин в расчёте:</strong> {entries.length}
            </div>
          </div>
        </div>

        {/* === Редактируемые параметры === */}
        <div className="calculation-params">
          <h3>Параметры расчёта</h3>
          <div className="params-row">
            <div className="param-group">
              <label htmlFor="air-temp">Температура воздуха</label>
              <div className="input-with-unit">
                <Form.Control
                  id="air-temp"
                  type="number"
                  step="0.1"
                  value={app.air_temperature ?? ""}
                  onChange={(e) => handleAppParamChange("air_temperature", e.target.value)}
                  disabled={app.status !== "черновик"}
                  className="form-control"
                />
                <span className="unit">°C</span>
              </div>
            </div>
            <div className="param-group">
              <label htmlFor="car-weight">Вес автомобиля</label>
              <div className="input-with-unit">
                <Form.Control
                  id="car-weight"
                  type="number"
                  step="1"
                  value={app.car_weight ?? ""}
                  onChange={(e) => handleAppParamChange("car_weight", e.target.value)}
                  disabled={app.status !== "черновик"}
                  className="form-control"
                />
                <span className="unit">кг</span>
              </div>
            </div>
          </div>
        </div>

        {/* === Таблица записей === */}
        <div className="app-table-wrapper">
          <table className="app-table">
            <thead>
              <tr>
                <th className="app-table__col-photo">Фото</th>
                <th className="app-table__col-name">Название шины</th>
                <th className="app-table__col-coeff">М / Т</th>
                <th className="app-table__col-coating">Коэф. покрытия</th>
                <th className="app-table__col-pressure">Давление (кПа)</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => {
                const tire = tireById.get(entry.tire_id);
                const photoUrl = tire ? resolveMediaUrl(tire.photo ?? "") : fallbackImageUrl();
                return (
                  <tr key={entry.id}>
                    <td className="app-table__col-photo">
                      <img src={photoUrl} alt={tire?.tire_title ?? ""} />
                    </td>
                    <td className="app-table__col-name">
                      {tire?.tire_title ?? `ID ${entry.tire_id}`}
                    </td>
                    <td className="app-table__col-coeff">
                      М: {tire?.tire_material_coefficient ?? "—"} | Т: {tire?.tire_thickness_coefficient ?? "—"}
                    </td>
                    <td className="app-table__col-coating">
                      <Form.Control
                        type="number"
                        step="0.01"
                        min="0"
                        value={entry.coating_coefficient}
                        onChange={(e) => handleCoatingChange(entry.id, e.target.value)}
                        disabled={app.status !== "черновик"}
                        className="form-control coating-input"
                      />
                    </td>
                    <td className="app-table__col-pressure">
                      {entry.pressure > 0 ? `${entry.pressure.toFixed(2)}` : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* === Кнопки действий === */}
        <div className="application-page__actions">
          {app.status === "черновик" && (
            <button 
              type="button" 
              className="search-btn application-page__delete-btn"
              onClick={handleDelete}
            >
              Удалить заявку
            </button>
          )}
          <button 
            type="button" 
            className="search-btn" 
            onClick={() => navigate("/tires")}
          >
            ← На главную
          </button>
        </div>

      </div>
    </div>
  );
}