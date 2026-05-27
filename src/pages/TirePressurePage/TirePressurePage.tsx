// src/pages/TirePressurePage/TirePressurePage.tsx
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Form, Spinner, Alert } from "react-bootstrap";
import {
  fallbackImageUrl,
  resolveMediaUrl,
  type Tire,
} from "../../modules/tireApi";
import { TIRES_MOCK } from "../../modules/mock";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchTirePressureDetail,
  updateTirePressureParams,
  updateTireEntryInApplication,
  removeTireEntryFromApplication,
  formTirePressureApplication,
  deleteTirePressureApplication,
} from "../../store/slices/tirePressureSlice";
import { ROUTES } from "../../Routes";
import "./TirePressurePage.css";

export default function TirePressurePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { isAuthenticated } = useAppSelector((s) => s.user);
  const {
    detail,
    detailLoading,
    detailError,
    applicationMutationLoading,
    itemMutationLoading,
  } = useAppSelector((s) => s.tirePressure);

  const [tires] = useState<Tire[]>(TIRES_MOCK);
  const tireById = useMemo(() => {
    const m = new Map<number, Tire>();
    tires.forEach((t) => m.set(t.tire_id, t));
    return m;
  }, [tires]);

  // 🔹 Черновики для полей ввода
  const [airTempDraft, setAirTempDraft] = useState<string>("");
  const [carWeightDraft, setCarWeightDraft] = useState<string>("");
  
  // 🔹 Черновики для коэффициентов: ключ = tire_id (уникален в рамках заявки)
  const [coatingDrafts, setCoatingDrafts] = useState<Record<number, number>>({});

  useEffect(() => {
    if (!id || !isAuthenticated) return;
    const appId = Number(id);
    if (Number.isNaN(appId)) return;
    void dispatch(fetchTirePressureDetail(appId));
  }, [id, isAuthenticated, dispatch]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(ROUTES.SIGN_IN, { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const app = detail?.application;
  useEffect(() => {
    if (app) {
      setAirTempDraft(app.air_temperature?.toString() ?? "");
      setCarWeightDraft(app.car_weight?.toString() ?? "");
      // Инициализируем черновики коэффициентов: ключ = tire_id
      const initial: Record<number, number> = {};
      detail?.entries?.forEach((e) => {
        const key = e.tire_id;
        if (key != null) initial[key] = e.coating_coefficient ?? 0;
      });
      setCoatingDrafts(initial);
    }
  }, [app?.tire_pressure_id, app?.air_temperature, app?.car_weight, detail?.entries]);

  const sortedEntries = useMemo(() => {
    if (!detail?.entries) return [];
    return [...detail.entries].sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
  }, [detail?.entries]);

  const isDraft = app?.status === "черновик";
  const tirePressureId = app?.tire_pressure_id;

  // ─── Обработчики ─────────────────────────────────────────────

  // 🔹 Кнопка 1: Сохранить параметры заявки
  const handleSaveAppParams = async () => {
    if (!tirePressureId || !isDraft || !app) return;
    const airTemp = airTempDraft.trim() === "" ? null : Number(airTempDraft);
    const carWeight = carWeightDraft.trim() === "" ? null : Number(carWeightDraft);
    if ((airTemp && Number.isNaN(airTemp)) || (carWeight && Number.isNaN(carWeight))) return;

    try {
      await dispatch(
        updateTirePressureParams({
          tirePressureId,
          body: {
            air_temperature: airTemp ?? undefined,
            car_weight: carWeight ?? undefined,
          },
        }),
      ).unwrap();
    } catch (err) {
      console.error("Ошибка сохранения параметров:", err);
      setAirTempDraft(app.air_temperature?.toString() ?? "");
      setCarWeightDraft(app.car_weight?.toString() ?? "");
    }
  };

  // 🔹 Кнопка 4: Сохранить запись (коэффициент)
  const handleSaveEntry = async (tireId: number, coating: number) => {
    if (!tirePressureId || !isDraft) return;
    if (coating == null) return;

    try {
      const result = await dispatch(
        updateTireEntryInApplication({
          tireId,
          tirePressureId,
          body: { coating_coefficient: coating },
        }),
      ).unwrap();
      
      setCoatingDrafts(prev => ({
        ...prev,
        [tireId]: coating,
      }));
      
    } catch (err) {
      console.error("Ошибка сохранения записи:", err);
      const entry = detail?.entries?.find(e => e.tire_id === tireId);
      if (entry) {
        setCoatingDrafts(prev => ({
          ...prev,
          [tireId]: entry.coating_coefficient ?? 0,
        }));
      }
    }
  };

  // 🔹 Кнопка 5: Убрать шину из заявки
  const handleRemoveEntry = async (tireId: number) => {
    if (!tirePressureId || !isDraft) return;
    if (!window.confirm("Убрать эту шину из заявки?")) return;
    const mutationKey = `rm-${tireId}`;
    if (itemMutationLoading?.[mutationKey]) return;

    try {
      await dispatch(
        removeTireEntryFromApplication({ tireId, tirePressureId }),
      ).unwrap();
    } catch (err) {
      console.error("Ошибка удаления шины:", err);
    }
  };

  // 🔹 Кнопка 2: Подтвердить заявку
  const handleForm = async () => {
    if (!tirePressureId || !isDraft) return;
    try {
      await dispatch(formTirePressureApplication(tirePressureId)).unwrap();
    } catch (err) {
      console.error("Ошибка подтверждения заявки:", err);
    }
  };

  // 🔹 Кнопка 3: Удалить заявку
  const handleDeleteApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tirePressureId || !isDraft) return;
    if (!window.confirm("Удалить заявку? Это действие нельзя отменить.")) return;
    try {
      await dispatch(deleteTirePressureApplication(tirePressureId)).unwrap();
      navigate(ROUTES.TIRES, { replace: true });
    } catch (err) {
      console.error("Ошибка удаления заявки:", err);
    }
  };

  // ─── Рендер ───────────────────────────────────────────────────────────

  if (!isAuthenticated) return null;
  if (detailLoading && !detail) {
    return (
      <div className="tire-pressure-page">
        <div className="device-page-loader">
          <Spinner animation="border" role="status"><span className="visually-hidden">Загрузка...</span></Spinner>
        </div>
      </div>
    );
  }
  if (detailError && !detail) {
    return (
      <div className="tire-pressure-page">
        <Alert variant="danger">
          <Alert.Heading>Ошибка загрузки</Alert.Heading>
          <p>{detailError}</p>
          <Button variant="outline-danger" onClick={() => window.location.reload()}>Попробовать снова</Button>
        </Alert>
      </div>
    );
  }
  if (!detail || !app || !tirePressureId) {
    return (
      <div className="tire-pressure-page">
        <p className="tire-pressure-not-found">Заявка не найдена.</p>
        <Button variant="secondary" onClick={() => navigate(ROUTES.TIRES)}>← На главную</Button>
      </div>
    );
  }

  // ✅ Убраны эмодзи из статусов
  const statusLabel =
    app.status === "черновик" ? "Черновик" :
    app.status === "сформирован" ? "Сформирована" :
    app.status === "завершён" ? "Завершена" : "Отклонена";

  return (
    <div className="tire-pressure-page">
      <div className="tire-pressure-detail">

        {/* === Заголовок заявки === */}
        <div className="tire-pressure-detail__header-card">
          <h1 className="tire-pressure-detail__title">Заявка на расчет давления в шинах</h1>
          <div className="tire-pressure-detail__info">
            <div className="tire-pressure-detail__info-item"><strong>ID заявки:</strong> {tirePressureId}</div>
            <div className="tire-pressure-detail__info-item"><strong>Статус:</strong> <span className="status-badge">{statusLabel}</span></div>
            <div className="tire-pressure-detail__info-item"><strong>Шин в расчёте:</strong> {sortedEntries.length}</div>
            {app.creator_login && <div className="tire-pressure-detail__info-item"><strong>Создатель:</strong> {app.creator_login}</div>}
          </div>
        </div>

        {/* === Кнопки 1, 2, 3: управление заявкой === */}
        {isDraft && (
          <>
            {/* Кнопка 1: Сохранить параметры */}
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
                      value={airTempDraft}
                      onChange={(e) => setAirTempDraft(e.target.value)}
                      disabled={applicationMutationLoading}
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
                      value={carWeightDraft}
                      onChange={(e) => setCarWeightDraft(e.target.value)}
                      disabled={applicationMutationLoading}
                      className="form-control"
                    />
                    <span className="unit">кг</span>
                  </div>
                </div>
              </div>
              <div className="text-end mt-3">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleSaveAppParams}
                  disabled={applicationMutationLoading}
                  title="Сохранить параметры заявки"
                  className="px-3"
                >
                  {applicationMutationLoading ? (
                    <><Spinner animation="border" size="sm" className="me-1" /> Сохранение...</>
                  ) : "Сохранить параметры"}
                </Button>
              </div>
            </div>

            {/* Кнопки 2 и 3: Подтвердить / Удалить заявку */}
            <div className="tire-pressure-page__actions tire-pressure-page__actions--top">
              <Button
                type="button"
                variant="success"
                className="me-2"
                onClick={handleForm}
                disabled={applicationMutationLoading || sortedEntries.length === 0}
              >
                {applicationMutationLoading ? "Отправка..." : "Подтвердить заявку"}
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={handleDeleteApplication}
                disabled={applicationMutationLoading}
              >
                Удалить заявку
              </Button>
            </div>
          </>
        )}

        {/* === Таблица записей === */}
        <div className="tire-pressure-table-wrapper">
          <table className="tire-pressure-table">
            <thead>
              <tr>
                <th className="tire-pressure-table__col-photo">Фото</th>
                <th className="tire-pressure-table__col-name">Название шины</th>
                <th className="tire-pressure-table__col-coeff">М / Т</th>
                <th className="tire-pressure-table__col-coating">Коэф. покрытия</th>
                <th className="tire-pressure-table__col-pressure">Давление (кПа)</th>
                {isDraft && <th className="tire-pressure-table__col-actions">Действия</th>}
              </tr>
            </thead>
            <tbody>
              {sortedEntries.map((entry) => {
                if (entry.tire_id == null) return null;
                const tire = tireById.get(entry.tire_id);
                const rawPhoto = entry.photo || tire?.photo || "";
                const photoUrl = rawPhoto ? resolveMediaUrl(rawPhoto) : fallbackImageUrl();
                
                const draftKey = entry.tire_id ?? 0;
                const tireId = entry.tire_id ?? 0;
                
                const isSaving = itemMutationLoading?.[`entry-${tireId}`];
                const isRemoving = itemMutationLoading?.[`rm-${tireId}`];
                
                const coatingValue = coatingDrafts[draftKey] ?? entry.coating_coefficient ?? 0;

                return (
                  <tr key={entry.id ?? tireId}>
                    <td className="tire-pressure-table__col-photo">
                      <img
                        src={photoUrl}
                        alt={tire?.tire_title || entry.tire_title || `Шина #${tireId}`}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = fallbackImageUrl();
                        }}
                      />
                    </td>
                    <td className="tire-pressure-table__col-name" title={tire?.tire_title || entry.tire_title || `Шина #${tireId}`}>
                      {tire?.tire_title || entry.tire_title || `Шина #${tireId}`}
                    </td>
                    <td className="tire-pressure-table__col-coeff">
                      <div className="coeff-cell">
                        <div><small>М:</small> {tire?.tire_material_coefficient ?? "—"}</div>
                        <div><small>Т:</small> {tire?.tire_thickness_coefficient ?? "—"}</div>
                      </div>
                    </td>
                    <td className="tire-pressure-table__col-coating">
                      <Form.Control
                        type="number"
                        step="0.01"
                        min="0"
                        max="1"
                        value={coatingValue}
                        onChange={(e) => {
                          const val = e.target.value === "" ? 0 : Number(e.target.value);
                          setCoatingDrafts(prev => ({ ...prev, [draftKey]: val }));
                        }}
                        disabled={!isDraft || applicationMutationLoading}
                        className="form-control coating-input"
                      />
                    </td>
                    <td className="tire-pressure-table__col-pressure">
                      {entry.pressure != null && entry.pressure > 0 ? `${entry.pressure.toFixed(2)}` : "—"}
                    </td>
                    {isDraft && (
                      <td className="tire-pressure-table__col-actions">
                        <div className="d-flex justify-content-center gap-1 flex-wrap">
                          {/* Кнопка 4: Сохранить запись — текст вместо эмодзи */}
                          <Button
                            type="button"
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleSaveEntry(tireId, coatingDrafts[draftKey] ?? coatingValue)}
                            disabled={isSaving || applicationMutationLoading}
                            title="Сохранить изменения для этой шины"
                            className="flex-shrink-0 px-2 py-1"
                          >
                            {isSaving ? <Spinner animation="border" size="sm" /> : "Сохранить"}
                          </Button>
                          {/* Кнопка 5: Убрать из заявки — текст вместо эмодзи */}
                          <Button
                            type="button"
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleRemoveEntry(tireId)}
                            disabled={isRemoving || applicationMutationLoading}
                            title="Убрать шину из заявки"
                            className="flex-shrink-0 px-2 py-1"
                          >
                            {isRemoving ? <Spinner animation="border" size="sm" /> : "Убрать"}
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* === Кнопка навигации (всегда) === */}
        <div className="tire-pressure-page__actions">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(ROUTES.TIRES)}
          >
            ← На главную
          </Button>
        </div>

      </div>
    </div>
  );
}