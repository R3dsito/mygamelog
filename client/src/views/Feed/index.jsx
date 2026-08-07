import { useEffect, useId, useState } from "react";
import { Loader } from "@/components";
import FeedCard from "@/components/FeedCard";
import useGetFeed from "@/hooks/useGetFeed";
import useRadioGroup from "@/hooks/useRadioGroup";
import "./styles.scss";

const RATING_OPTIONS = [
  { label: "Todos",   value: null },
  { label: "8 – 10", value: [8, 10] },
  { label: "5 – 7",  value: [5, 7] },
  { label: "1 – 4",  value: [1, 4] },
];

const PERIOD_OPTIONS = [
  { label: "Siempre",     value: null },
  { label: "Este mes",    value: "month" },
  { label: "Esta semana", value: "week" },
];

const SORT_OPTIONS = [
  { label: "Recientes",    value: null },
  { label: "Más likeados", value: "likes" },
];

const buildParams = (rating, period, sortBy) => {
  const p = {};
  if (sortBy) p.sortBy = sortBy;
  if (rating) { p.ratingMin = rating[0]; p.ratingMax = rating[1]; }
  if (period === "week")  p.dateFrom = new Date(Date.now() - 7  * 24 * 60 * 60 * 1000).toISOString();
  if (period === "month") p.dateFrom = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  return p;
};

const Feed = () => {
  const { state, data, hasMore, getFeed, loadMore } = useGetFeed();
  const [loadingMore, setLoadingMore] = useState(false);
  const [rating, setRating] = useState(null);
  const [period, setPeriod]       = useState(null);
  const [sortBy, setSortBy]       = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const applyFilter = (r, p, s) => getFeed(buildParams(r, p, s));
  const isRatingActive = (opt) => JSON.stringify(rating) === JSON.stringify(opt.value);

  const ratingLabelId = useId();
  const periodLabelId = useId();
  const sortLabelId   = useId();

  const selectRating = (i) => { setRating(RATING_OPTIONS[i].value); applyFilter(RATING_OPTIONS[i].value, period, sortBy); };
  const selectPeriod = (i) => { setPeriod(PERIOD_OPTIONS[i].value); applyFilter(rating, PERIOD_OPTIONS[i].value, sortBy); };
  const selectSort   = (i) => { setSortBy(SORT_OPTIONS[i].value);   applyFilter(rating, period, SORT_OPTIONS[i].value); };

  const { getRadioProps: getRatingProps } = useRadioGroup({
    count: RATING_OPTIONS.length,
    selectedIndex: RATING_OPTIONS.findIndex(isRatingActive),
    onSelect: selectRating,
  });
  const { getRadioProps: getPeriodProps } = useRadioGroup({
    count: PERIOD_OPTIONS.length,
    selectedIndex: PERIOD_OPTIONS.findIndex((o) => o.value === period),
    onSelect: selectPeriod,
  });
  const { getRadioProps: getSortProps } = useRadioGroup({
    count: SORT_OPTIONS.length,
    selectedIndex: SORT_OPTIONS.findIndex((o) => o.value === sortBy),
    onSelect: selectSort,
  });

  useEffect(() => { getFeed(); }, []);

  return (
    <div className="feed">
      <aside className="feed__sidebar">
        <button
          type="button"
          className="feed__sidebar-toggle"
          onClick={() => setFiltersOpen((o) => !o)}
          aria-expanded={filtersOpen}
        >
          Filtros
          <i className={`fa-solid fa-chevron-${filtersOpen ? "up" : "down"}`} aria-hidden="true" />
        </button>

        <div className={`feed__sidebar-body${filtersOpen ? " feed__sidebar-body--open" : ""}`}>
        <div className="feed__filter-group">
          <span className="feed__filter-label" id={ratingLabelId}>Rating</span>
          <div className="feed__filter-options" role="radiogroup" aria-labelledby={ratingLabelId}>
            {RATING_OPTIONS.map((opt, i) => (
              <button
                key={opt.label}
                type="button"
                {...getRatingProps(i)}
                className={`feed__filter-option${isRatingActive(opt) ? " feed__filter-option--active" : ""}`}
                onClick={() => selectRating(i)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="feed__filter-group">
          <span className="feed__filter-label" id={periodLabelId}>Fecha</span>
          <div className="feed__filter-options" role="radiogroup" aria-labelledby={periodLabelId}>
            {PERIOD_OPTIONS.map((opt, i) => (
              <button
                key={opt.label}
                type="button"
                {...getPeriodProps(i)}
                className={`feed__filter-option${period === opt.value ? " feed__filter-option--active" : ""}`}
                onClick={() => selectPeriod(i)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="feed__filter-group">
          <span className="feed__filter-label" id={sortLabelId}>Ordenar</span>
          <div className="feed__filter-options" role="radiogroup" aria-labelledby={sortLabelId}>
            {SORT_OPTIONS.map((opt, i) => (
              <button
                key={opt.label}
                type="button"
                {...getSortProps(i)}
                className={`feed__filter-option${sortBy === opt.value ? " feed__filter-option--active" : ""}`}
                onClick={() => selectSort(i)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        </div>
      </aside>

      <main className="feed__main">
        <div className="feed__header">
          <h1>Feed</h1>
          {/* Bajada, no una sección: como encabezado ensucia el índice
              que recorren los lectores de pantalla. */}
          <p className="feed__subtitle">Las últimas reseñas de la comunidad</p>
        </div>

        {state === "loading" && <Loader />}

        {state === "error" && (
          <div className="feed__error">
            <i className="fa-solid fa-bug fa-xl" />
            <p>Error al cargar el feed.</p>
          </div>
        )}

        {state === "success" && data.length === 0 && (
          <p className="feed__empty">No hay reseñas que coincidan con los filtros.</p>
        )}

        {/* Agrupa las cards (h3) bajo el h1 y da un punto de salto
            para quien navega por encabezados. */}
        <h2 className="visually-hidden">Resultados</h2>

        <div className="feed__grid">
          {data.map((post) => (
            <FeedCard
              key={post._id}
              username={post.userId?.username}
              imagen={post.userId?.imagen}
              gameId={post.gameId}
              gameName={post.gameName}
              imageUrl={post.imageUrl}
              content={post.content}
              rating={post.rating}
              postId={post._id}
              likes={post.likes || []}
            />
          ))}
        </div>

        {hasMore && state === "success" && (
          <button
            type="button"
            className="feed__load-more"
            onClick={async () => {
              setLoadingMore(true);
              await loadMore();
              setLoadingMore(false);
            }}
            disabled={loadingMore}
          >
            {loadingMore ? "Cargando..." : "Cargar más reseñas"}
          </button>
        )}
      </main>
    </div>
  );
};

export default Feed;
