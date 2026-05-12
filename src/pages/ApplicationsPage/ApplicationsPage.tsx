// src/pages/ApplicationsPage/ApplicationsPage.tsx
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
import "./ApplicationsPage.css";

function statusLabel(s: string | undefined): string {
  const m: Record<string, string> = {
    "черновик": "Черновик",
    "сформирован": "Сформирована",
    "завершён": "Завершена",
    "отклонен": "Отклонена",
  };
  return s ? (m[s] ?? s) : "—";
}

export default function ApplicationsPage() {
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

  // ✅ Short polling: обновляем список каждые 4 секунды
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

  const goApp = (id: number | undefined) => {
    if (id != null) navigate(`/application/${id}`);
  };

  if (!isAuthenticated) return null;

  return (
    <div className="applications-page">
      <div className="applications-page__inner">
        <h1 className="applications-page__heading">
          {isModerator ? "Заявки (модератор)" : "Мои заявки"}
        </h1>

        <section className="applications-page__filters">
          <div className="applications-page__filter-row">
            <Form.Group className="applications-page__fg">
              <Form.Label>С даты</Form.Label>
              <Form.Control
                type="date"
                value={draftFrom}
                onChange={(e) => setDraftFrom(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="applications-page__fg">
              <Form.Label>По дату</Form.Label>
              <Form.Control
                type="date"
                value={draftTo}
                onChange={(e) => setDraftTo(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="applications-page__fg">
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
              <Form.Group className="applications-page__fg applications-page__fg--grow">
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
          <Button className="applications-page__apply" onClick={handleApplyFilters}>
            Применить фильтры
          </Button>
        </section>

        {listError ? <div className="applications-page__error">{listError}</div> : null}

        {listLoading && visible.length === 0 ? (
          <div className="applications-page__loader">
            <Spinner animation="border" />
          </div>
        ) : null}

        <div className="applications-page__table-wrap">
          <Table striped bordered hover responsive className="applications-page__table">
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
                        className="applications-page__linkish"
                        onClick={() => goApp(id)}
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
                          <div className="applications-page__actions">
                            {/* ✅ Кнопка "Завершить" — отправляет русское значение "завершён" */}
                            <Button
                              size="sm"
                              variant="success"
                              className="me-1"
                              disabled={finBusy}
                              onClick={() =>
                                void dispatch(
                                  finishTirePressureApplication({
                                    applicationId: id,
                                    status: "завершён",  // ✅ Исправлено: было "completed"
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
                                    applicationId: id,
                                    status: "отклонён",  // ✅ Исправлено: было "rejected"
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
          <p className="applications-page__empty">Нет заявок по текущим условиям.</p>
        ) : null}
      </div>
    </div>
  );
}