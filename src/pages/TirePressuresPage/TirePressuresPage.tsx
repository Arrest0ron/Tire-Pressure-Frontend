// src/pages/TirePressuresPage/TirePressuresPage.tsx
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Spinner, Table, Button, Form } from "react-bootstrap";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchTirePressuresList,
  finishTirePressureApplication,
  setListFilters,
} from "../../store/slices/tirePressureSlice";
import { ROUTES } from "../../Routes";
import "./TirePressuresPage.css";

function statusLabel(s: string | undefined): string {
  const m: Record<string, string> = {
    "черновик": "Черновик",
    "сформирован": "Сформирована",
    "завершён": "Завершена",
    "отклонен": "Отклонена",
  };
  return s ? (m[s] ?? s) : "—";
}

export default function TirePressuresPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, isModerator } = useAppSelector((s) => s.user);
  const { list, listLoading, listError, filters, itemMutationLoading } = useAppSelector(
    (s) => s.tirePressure,
  );

  const [creatorFilter, setCreatorFilter] = useState("");
  const [draftFrom, setDraftFrom] = useState(filters.fromDate);
  const [draftTo, setDraftTo] = useState(filters.toDate);
  const [draftStatus, setDraftStatus] = useState(filters.status);

  useEffect(() => {
    setDraftFrom(filters.fromDate);
    setDraftTo(filters.toDate);
    setDraftStatus(filters.status);
  }, [filters.fromDate, filters.toDate, filters.status]);

  const load = useCallback(() => {
    void dispatch(fetchTirePressuresList());
  }, [dispatch]);

  // ✅ Short polling: обновляем список каждые 1 секунду
  useEffect(() => {
    if (!isAuthenticated) {
      navigate(ROUTES.SIGN_IN, { replace: true });
      return;
    }
    load();
    const id = window.setInterval(load, 1000);
    return () => window.clearInterval(id);
  }, [isAuthenticated, navigate, load]);

  // ✅ Фронтенд-фильтр по создателю (только для модератора)
  const visible = useMemo(() => {
    const q = creatorFilter.trim().toLowerCase();
    if (!q) return list;
    return list.filter((a) => (a.creator_login ?? "").toLowerCase().includes(q));
  }, [list, creatorFilter]);

  const handleApplyFilters = () => {
    dispatch(
      setListFilters({
        fromDate: draftFrom,
        toDate: draftTo,
        status: draftStatus,
      }),
    );
    void dispatch(fetchTirePressuresList());
  };

  const goToTirePressure = (id: number | undefined) => {
    if (id != null) navigate(`/tire-pressure/${id}`);
  };

  if (!isAuthenticated) return null;

  return (
    <div className="tire-pressures-page">
      <div className="tire-pressures-page__inner">
        <h1 className="tire-pressures-page__heading">
          {isModerator ? "Заявки (модератор)" : "Мои заявки"}
        </h1>

        <section className="tire-pressures-page__filters">
          <div className="tire-pressures-page__filter-row">
            <Form.Group className="tire-pressures-page__fg">
              <Form.Label>С даты</Form.Label>
              <Form.Control
                type="date"
                value={draftFrom}
                onChange={(e) => setDraftFrom(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="tire-pressures-page__fg">
              <Form.Label>По дату</Form.Label>
              <Form.Control
                type="date"
                value={draftTo}
                onChange={(e) => setDraftTo(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="tire-pressures-page__fg">
              <Form.Label>Статус</Form.Label>
              <Form.Select
                value={draftStatus}
                onChange={(e) => setDraftStatus(e.target.value)}
              >
                <option value="">Все</option>
                <option value="черновик">Черновик</option>
                <option value="сформирован">Сформирована</option>
                <option value="завершён">Завершена</option>
                <option value="отклонен">Отклонена</option>
              </Form.Select>
            </Form.Group>
            {isModerator ? (
              <Form.Group className="tire-pressures-page__fg tire-pressures-page__fg--grow">
                <Form.Label>Создатель</Form.Label>
                <Form.Control
                  type="text"
                  value={creatorFilter}
                  onChange={(e) => setCreatorFilter(e.target.value)}
                  placeholder="Часть логина"
                />
              </Form.Group>
            ) : null}
          </div>
          <Button className="tire-pressures-page__apply" onClick={handleApplyFilters}>
            Применить фильтры
          </Button>
        </section>

        {listError ? <div className="tire-pressures-page__error">{listError}</div> : null}

        {listLoading && visible.length === 0 ? (
          <div className="tire-pressures-page__loader">
            <Spinner animation="border" />
          </div>
        ) : null}

        <div className="tire-pressures-page__table-wrap">
          <Table striped bordered hover responsive className="tire-pressures-page__table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Статус</th>
                <th>Создатель</th>
                <th>Создана</th>
                <th>Формирование</th>
                <th>Завершение</th>
                {isModerator && <th>Модератор</th>}
                {isModerator && <th>Действия</th>}
              </tr>
            </thead>
            <tbody>
              {visible.map((row) => {
                const id = row.tire_pressure_id;
                const finKey = id != null ? `finish-${id}` : "";
                const finBusy = finKey ? Boolean(itemMutationLoading[finKey]) : false;
                return (
                  <tr key={id ?? Math.random()}>
                    <td>
                      <button
                        type="button"
                        className="tire-pressures-page__linkish"
                        onClick={() => goToTirePressure(id)}
                      >
                        {id}
                      </button>
                    </td>
                    <td>{statusLabel(row.status)}</td>
                    <td>{row.creator_login ?? "—"}</td>
                    <td>
                      {row.date_create
                        ? new Date(row.date_create).toLocaleString("ru-RU")
                        : "—"}
                    </td>
                    <td>
                      {row.date_formed
                        ? new Date(row.date_formed).toLocaleDateString("ru-RU")
                        : "—"}
                    </td>
                    <td>
                      {row.date_completed
                        ? new Date(row.date_completed).toLocaleString("ru-RU")
                        : "—"}
                    </td>
                    {isModerator && <td>{row.moderator_login ?? "—"}</td>}
                    {isModerator && (
                      <td>
                        {row.status === "сформирован" && id != null ? (
                          <div className="tire-pressures-page__actions">
                            {/* ✅ Кнопка "Завершить" — отправляет русское значение "завершён" */}
                            <Button
                              size="sm"
                              variant="success"
                              className="me-1"
                              disabled={finBusy}
                              onClick={() =>
                                void dispatch(
                                  finishTirePressureApplication({
                                    tirePressureId: id,  // ✅ Исправлено: было applicationId
                                    status: "завершён",
                                  }),
                                )
                              }
                            >
                              ✅ Завершить
                            </Button>
                            {/* ✅ Кнопка "Отклонить" — отправляет русское значение "отклонён" */}
                            <Button
                              size="sm"
                              variant="danger"
                              disabled={finBusy}
                              onClick={() =>
                                void dispatch(
                                  finishTirePressureApplication({
                                    tirePressureId: id,  // ✅ Исправлено: было applicationId
                                    status: "отклонён",
                                  }),
                                )
                              }
                            >
                              ❌ Отклонить
                            </Button>
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>

        {!listLoading && visible.length === 0 ? (
          <p className="tire-pressures-page__empty">Нет заявок по текущим условиям.</p>
        ) : null}
      </div>
    </div>
  );
}