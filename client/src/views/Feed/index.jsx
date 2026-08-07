import { useEffect, useId, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Loader } from "@/components";
import FeedCard from "@/components/FeedCard";
import Pagination from "@/components/Pagination";
import useGetFeed, { FEED_LIMIT } from "@/hooks/useGetFeed";
import useRadioGroup from "@/hooks/useRadioGroup";
import "./styles.scss";

// `key` es lo que viaja en la URL; `value` es lo que entiende la API.
const RATING_OPTIONS = [
  { label: "Todos",  key: null,    value: null },
  { label: "8 – 10", key: "8-10",  value: [8, 10] },
  { label: "5 – 7",  key: "5-7",   value: [5, 7] },
  { label: "1 – 4",  key: "1-4",   value: [1, 4] },
];

const PERIOD_OPTIONS = [
  { label: "Siempre",     key: null,      value: null },
  { label: "Este mes",    key: "month",   value: "month" },
  { label: "Esta semana", key: "week",    value: "week" },
];

const SORT_OPTIONS = [
  { label: "Recientes",    key: null,     value: null },
  { label: "Más likeados", key: "likes",  value: "likes" },
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
  const { state, data, total, getFeed } = useGetFeed();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const resultsHeadingRef = useRef(null);
  const isFirstLoad = useRef(true);

  // La URL es la única fuente de verdad: filtros y página en el mismo lugar,
  // así una vista filtrada se puede compartir y "atrás" la restaura.
  const page = Math.max(1, parseInt(searchParams.get("page"), 10) || 1);
  const ratingIndex = Math.max(0, RATING_OPTIONS.findIndex((o) => o.key === searchParams.get("rating")));
  const periodIndex = Math.max(0, PERIOD_OPTIONS.findIndex((o) => o.key === searchParams.get("period")));
  const sortIndex   = Math.max(0, SORT_OPTIONS.findIndex((o) => o.key === searchParams.get("sort")));

  const rating = RATING_OPTIONS[ratingIndex].value;
  const period = PERIOD_OPTIONS[periodIndex].value;
  const sortBy = SORT_OPTIONS[sortIndex].value;

  const totalPages = Math.max(1, Math.ceil(total / FEED_LIMIT));

  const ratingLabelId = useId();
  const periodLabelId = useId();
  const sortLabelId   = useId();

  const updateParams = (patch, { resetPage = true } = {}) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([k, v]) => {
      if (v === null || v === undefined) next.delete(k);
      else next.set(k, v);
    });
    // Cambiar un filtro invalida la página actual: siempre vuelve a la 1.
    if (resetPage) next.delete("page");
    setSearchParams(next);
  };

  const { getRadioProps: getRatingProps } = useRadioGroup({
    count: RATING_OPTIONS.length,
    selectedIndex: ratingIndex,
    onSelect: (i) => updateParams({ rating: RATING_OPTIONS[i].key }),
  });
  const { getRadioProps: getPeriodProps } = useRadioGroup({
    count: PERIOD_OPTIONS.length,
    selectedIndex: periodIndex,
    onSelect: (i) => updateParams({ period: PERIOD_OPTIONS[i].key }),
  });
  const { getRadioProps: getSortProps } = useRadioGroup({
    count: SORT_OPTIONS.length,
    selectedIndex: sortIndex,
    onSelect: (i) => updateParams({ sort: SORT_OPTIONS[i].key }),
  });

  useEffect(() => {
    getFeed(buildParams(rating, period, sortBy), page);

    // Al paginar, la lista se reemplaza sin recargar: hay que llevar el foco
    // al encabezado de resultados o el teclado queda perdido abajo.
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
    } else {
      resultsHeadingRef.current?.focus();
      window.scrollTo({ top: 0 });
    }
  }, [searchParams]);

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
                className={`feed__filter-option${ratingIndex === i ? " feed__filter-option--active" : ""}`}
                onClick={() => updateParams({ rating: opt.key })}
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
                className={`feed__filter-option${periodIndex === i ? " feed__filter-option--active" : ""}`}
                onClick={() => updateParams({ period: opt.key })}
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
                className={`feed__filter-option${sortIndex === i ? " feed__filter-option--active" : ""}`}
                onClick={() => updateParams({ sort: opt.key })}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        </div>
      </aside>

      {/* div, no <main>: el landmark main lo aporta App y solo puede haber uno. */}
      <div className="feed__main">
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
            para quien navega por encabezados. Recibe el foco al paginar. */}
        <h2
          className="visually-hidden"
          ref={resultsHeadingRef}
          tabIndex={-1}
        >
          Resultados{state === "success" && total > 0 ? ` — página ${page} de ${totalPages}` : ""}
        </h2>

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

        {state === "success" && (
          <Pagination
            page={page}
            totalPages={totalPages}
            onChange={(p) => updateParams({ page: p > 1 ? p : null }, { resetPage: false })}
            label="Paginación del feed"
          />
        )}
      </div>
    </div>
  );
};

export default Feed;
