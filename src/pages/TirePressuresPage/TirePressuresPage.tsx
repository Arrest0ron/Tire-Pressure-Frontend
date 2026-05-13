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

// ✅ Форматирование даты в РФ-стиле: ДД.ММ.ГГГГ
function formatRuDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

export default function TirePressuresPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, isModerator } = useAppSelector((s) => s.user);
  const { list, listLoading, listError, filters, itemMutationLoading } = useAppSelector(
    (s) => s.tirePressure,
  );

  const [creatorFilter, setCreatorFilter] = useState("");
  const [themeFilter, setThemeFilter] = useState(""); // ✅ Поиск по теме
  
  // ✅ Дефолтные фильтры: сегодня
  const today = new Date().toISOString().split("T")[0];
  const [draftFrom, setDraftFrom] = useState(filters.fromDate || today);
  const [draftTo, setDraftTo] = useState(filters.toDate || today);
  const [draftStatus, setDraftStatus] = useState(filters.status || "");

  useEffect(() => {
    setDraftFrom(filters.fromDate || today);
    setDraftTo(filters.toDate || today);
    setDraftStatus(filters.status || "");
  }, [filters.fromDate, filters.toDate, filters.status, today]);

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

  // ✅ Фильтрация: бэкенд (дата/статус) + фронтенд (создатель + тема)
  const visible = useMemo(() => {
    let result = list;

    if (isModerator && creatorFilter.trim()) {
      const q = creatorFilter.trim().toLowerCase();
      result = result.filter((a) => (a.creator_login ?? "").toLowerCase().includes(q));
    }

    if (themeFilter.trim()) {
      const q = themeFilter.trim().toLowerCase();
      result = result.filter((a) => {
        return (
          (a.creator_login ?? "").toLowerCase().includes(q) ||
          (a.status ?? "").toLowerCase().includes(q)
        );
      });
    }

    return result;
  }, [list, creatorFilter, themeFilter, isModerator]);

  const handleApplyFilters = () => {
    dispatch(
      setListFilters({
        fromDate: draftFrom || undefined,
        toDate: draftTo || undefined,
        status: draftStatus || undefined,
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
            
            <Form.Group className="tire-pressures-page__fg">
              <Form.Label>Тема</Form.Label>
              <Form.Control
                type="text"
                value={themeFilter}
                onChange={(e) => setThemeFilter(e.target.value)}
                placeholder="Название шины или описание"
              />
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
                <th className="text-center">Рассчитано</th>
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
                    <td>{formatRuDate(row.date_create)}</td>
                    <td>{formatRuDate(row.date_formed)}</td>
                    <td>{formatRuDate(row.date_completed)}</td>
                    
                    {/* ✅ Серый текст, без бейджа */}
                    <td className="text-center text-muted">
                      {row.tire_entries_count ?? 0}
                    </td>
                    
                    {isModerator && <td>{row.moderator_login ?? "—"}</td>}
                    {isModerator && (
                      <td>
                        {row.status === "сформирован" && id != null ? (
                          <div className="tire-pressures-page__actions">
                            <Button
                              size="sm"
                              variant="success"
                              className="me-1"
                              disabled={finBusy}
                              onClick={() =>
                                void dispatch(
                                  finishTirePressureApplication({
                                    tirePressureId: id,
                                    status: "завершён",
                                  }),
                                )
                              }
                            >
                              Завершить
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              disabled={finBusy}
                              onClick={() =>
                                void dispatch(
                                  finishTirePressureApplication({
                                    tirePressureId: id,
                                    status: "отклонён",
                                  }),
                                )
                              }
                            >
                              Отклонить
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