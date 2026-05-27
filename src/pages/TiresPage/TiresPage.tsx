// src/pages/TiresPage/TiresPage.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Alert, Button, ProgressBar } from "react-bootstrap";
import Search from "../../components/InputField/InputField";
import CartRow from "../../components/CartRow/CartRow";
import TireCard from "../../components/TireCard/TireCard";
import {
  tireClipDescription,
  fallbackImageUrl,
  listTires,
  objectUrlFromKey,
  type Tire,
} from "../../modules/tireApi";
import { TIRES_MOCK } from "../../modules/mock";
import { useTireImageSearch } from "../../hooks/useTireImageSearch";

// ✅ Redux imports для фильтра
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { setSearchQuery, clearSearchQuery } from "../../store/slices/tiresFilterSlice";

import "./TiresPage.css";

// ✅ Хелпер для резолва путей к изображениям (синхронизирован с resolveMediaUrl)
function resolveThumb(key: string): string {
  if (!key) return fallbackImageUrl();
  
  // ✅ Разрешаем все схемы, как в resolveMediaUrl (для поддержки моков)
  if (
    key.startsWith("http://") ||
    key.startsWith("https://") ||
    key.startsWith("/") ||
    key.startsWith("blob:") ||
    key.startsWith("data:")  // ✅ Ключевое: data: URLs для моков
  ) {
    return key;
  }
  
  // Для остальных случаев — строим URL через MinIO
  return objectUrlFromKey(key);
}

export default function TiresPage() {
  const dispatch = useAppDispatch();

  // ✅ Фильтр из Redux (вместо локального useState)
  const searchTitle = useAppSelector((s) => s.tiresFilter.searchQuery);

  // === Состояния данных ===
  const [clipSourceTires, setClipSourceTires] = useState<Tire[]>([]);
  const [displayTires, setDisplayTires] = useState<Tire[]>([]);
  const [loading, setLoading] = useState(false);
  const [useMock, setUseMock] = useState(false);

  // === Состояния CLIP-поиска ===
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [clipSessionActive, setClipSessionActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // === Загрузка данных (бэкенд → fallback на mock) ===
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (useMock) {
        if (!cancelled) {
          setClipSourceTires(TIRES_MOCK);
          setDisplayTires(TIRES_MOCK);
        }
        return;
      }
      try {
        const data = await listTires();
        if (cancelled) return;
        if (data.length > 0) {
          setClipSourceTires(data);
          setDisplayTires(data);
        } else {
          setClipSourceTires(TIRES_MOCK);
          setDisplayTires(TIRES_MOCK);
          setUseMock(true);
        }
      } catch {
        if (cancelled) return;
        setClipSourceTires(TIRES_MOCK);
        setDisplayTires(TIRES_MOCK);
        setUseMock(true);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [useMock]);

  // === Подготовка данных для CLIP: { id: tire_id, description: short_description_en } ===
  const clipItems = useMemo(
    () =>
      clipSourceTires.map((t) => ({
        id: t.tire_id,
        description: tireClipDescription(t), // берёт short_description_en или фоллбэк
      })),
    [clipSourceTires],
  );

  // === Подключение хука поиска ===
  const {
    items: clipProcessed,
    ready: clipReady,
    progress: clipProgress,
    imageEmbedding,
    workerError,
    searchByImage,
    resetSearch,
  } = useTireImageSearch(clipItems, clipSessionActive);

  // === Мапа для быстрого доступа к полной сущности шины по id ===
  const tireById = useMemo(() => {
    const m = new Map<number, Tire>();
    clipSourceTires.forEach((t) => m.set(t.tire_id, t));
    return m;
  }, [clipSourceTires]);

  // === Обработчик текстового поиска ===
  const handleSearch = async () => {
    setLoading(true);
    try {
      const filtered = await listTires({ title: searchTitle });
      if (filtered.length > 0) {
        setDisplayTires(filtered);
        setUseMock(false);
      } else {
        if (useMock) {
          const filteredMock = TIRES_MOCK.filter((t) =>
            t.tire_title.toLowerCase().includes(searchTitle.toLowerCase()),
          );
          setDisplayTires(filteredMock);
        } else {
          setDisplayTires([]);
        }
      }
    } catch {
      const filteredMock = TIRES_MOCK.filter((t) =>
        t.tire_title.toLowerCase().includes(searchTitle.toLowerCase()),
      );
      setDisplayTires(filteredMock);
      setUseMock(true);
    } finally {
      setLoading(false);
    }
  };

  // === Обработчики загрузки изображения ===
  const handleUploadButtonClick = () => {
    if (!clipSessionActive) setClipSessionActive(true);
    fileInputRef.current?.click();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (selectedImage?.startsWith("blob:")) URL.revokeObjectURL(selectedImage);
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      searchByImage(file); // отправляем файл в воркер
    }
  };

  const handleClearImage = () => {
    if (selectedImage?.startsWith("blob:")) URL.revokeObjectURL(selectedImage);
    setSelectedImage(null);
    resetSearch();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // === Флаги для UI ===
  const imageSearchActive = Boolean(imageEmbedding);
  const showClipProgress =
    clipSessionActive && clipItems.length > 0 && !clipReady && !workerError;
  const uploadLabel =
    clipSessionActive && !clipReady ? "Загрузка нейросети…" : "Загрузить фото";
  const isUploadDisabled =
    clipItems.length === 0 || (clipSessionActive && !clipReady);
  const canResetImage = Boolean(selectedImage);

  // === Результаты поиска по изображению (только видимые после порога) ===
  const visibleClipRows = imageSearchActive
    ? clipProcessed.filter((item) => item.isVisible)
    : [];

  return (
    <div className="tires-page">
      {/* === Текстовый поиск === */}
      <Search
        query={searchTitle}
        onQueryChange={(v) => dispatch(setSearchQuery(v))}
        onSearch={handleSearch}
      />

      <div className="space">
        <main className="tires-page__main">
          <CartRow />

          {/* === Секция CLIP-поиска === */}
          <section
            className="tires-page__clip-search clip-search-section"
            aria-labelledby="clip-search-title"
          >
            <h2 id="clip-search-title" className="clip-search-section__heading">
              Поиск шины по изображению
            </h2>

            {workerError ? (
              <Alert variant="warning" className="clip-search-section__alert">
                Не удалось загрузить модель или обработать запрос: {workerError}
              </Alert>
            ) : null}

            {clipItems.length === 0 ? (
              <p className="text-muted clip-search-section__empty-catalog">
                Загрузите каталог шин…
              </p>
            ) : (
              <div className="clip-search-section__panel">
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  className="clip-search-section__file-input"
                  onChange={handleImageUpload}
                />

                <div className="clip-search-section__preview-wrap">
                  {selectedImage ? (
                    <img src={selectedImage} alt="" className="clip-search-section__preview-image" />
                  ) : (
                    <div className="clip-search-section__placeholder-image">Нет фото</div>
                  )}
                </div>

                <div className="clip-search-section__action-panel action-panel">
                  <Button
                    className="action-btn clip-search-section__btn-upload"
                    variant="warning"
                    onClick={handleUploadButtonClick}
                    disabled={isUploadDisabled}
                  >
                    {uploadLabel}
                  </Button>

                  {showClipProgress ? (
                    <ProgressBar
                      className="action-progress clip-search-section__progress"
                      now={clipProgress}
                      label={`${Math.round(clipProgress)}%`}
                      animated
                    />
                  ) : null}

                  <Button
                    className="action-btn"
                    variant="outline-danger"
                    onClick={handleClearImage}
                    disabled={!canResetImage}
                  >
                    Сбросить
                  </Button>
                </div>
              </div>
            )}
          </section>

          {/* === Рендер результатов === */}
          {loading ? (
            <div>Загрузка...</div>
          ) : imageSearchActive ? (
            // 🔹 Режим CLIP-поиска: показываем только похожие шины
            <div className="tires-page__grid tires-page__clip-results">
              {visibleClipRows.length === 0 ? (
                <div className="tires-page__empty">
                  Нет шин выше порога сходства. Попробуйте другое изображение.
                </div>
              ) : (
                <ul className="clip-results-list">
                  {visibleClipRows.map((item) => {
                    const t = tireById.get(item.id);
                    if (!t) return null;
                    const thumb = resolveThumb(t.photo || "");
                    return (
                      <li key={item.id}>
                        <Link to={`/tire/${item.id}`} className="tire-row clip-result-row">
                          <img src={thumb} alt="" className="row-image" />
                          <div className="row-content">
                            <h5>{t.tire_title}</h5>
                            <p className="text-muted mb-1 clip-result-row__en">{item.description}</p>
                            <p className="text-muted mb-0 small">{t.description}</p>
                          </div>
                          <div className="row-stats">
                            <div>
                              Сходство:{" "}
                              <span className="similarity-value">
                                {(item.score * 100).toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          ) : (
            // 🔹 Обычный режим: сетка карточек с фильтрацией
            <div className="tires-grid">
              {displayTires.length > 0 ? (
                displayTires.map((tire) => <TireCard key={tire.tire_id} tire={tire} />)
              ) : (
                <div className="tires-page__empty">
                  {searchTitle
                    ? `По запросу «${searchTitle}» ничего не найдено`
                    : "Шины не найдены"}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}