import { useEffect, useState } from "react";
import { Loader } from "@/components";
import FeedCard from "@/components/FeedCard";
import useGetFeed from "@/hooks/useGetFeed";
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
          <span className="feed__filter-label">Rating</span>
          <div className="feed__filter-options">
            {RATING_OPTIONS.map((opt) => (
              <button
                key={opt.label}
                type="button"
                className={`feed__filter-option${isRatingActive(opt) ? " feed__filter-option--active" : ""}`}
                onClick={() => { setRating(opt.value); applyFilter(opt.value, period, sortBy); }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="feed__filter-group">
          <span className="feed__filter-label">Fecha</span>
          <div className="feed__filter-options">
            {PERIOD_OPTIONS.map((opt) => (
              <button
                key={opt.label}
                type="button"
                className={`feed__filter-option${period === opt.value ? " feed__filter-option--active" : ""}`}
                onClick={() => { setPeriod(opt.value); applyFilter(rating, opt.value, sortBy); }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="feed__filter-group">
          <span className="feed__filter-label">Ordenar</span>
          <div className="feed__filter-options">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.label}
                type="button"
                className={`feed__filter-option${sortBy === opt.value ? " feed__filter-option--active" : ""}`}
                onClick={() => { setSortBy(opt.value); applyFilter(rating, period, opt.value); }}
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
          <h2 className="feed__subtitle">Las últimas reseñas de la comunidad</h2>
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
