import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "@/contexts/AuthContext";
import useToggleLike from "@/hooks/useToggleLike";

const RatingStars = ({ rating }) => {
  const full = Math.floor(rating / 2);
  const hasHalf = rating % 2 === 1;

  return (
    <span className="review__stars" aria-label={`${rating}/10`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const pos = i + 1;
        let icon = "fa-regular fa-star";
        if (pos <= full) icon = "fa-solid fa-star";
        else if (pos === full + 1 && hasHalf) icon = "fa-solid fa-star-half-stroke";
        return <i key={i} className={icon} aria-hidden="true"></i>;
      })}
    </span>
  );
};

const MAX_PREVIEW_CHARS = 280;

const Review = ({ username, imagen, content, rating, onDelete, gameName, imageUrl, gameId, postId, likes = [] }) => {
  const { user: loggedInUser } = useContext(AuthContext);
  const { toggleLike, loading: likeLoading } = useToggleLike();

  const initialLiked = loggedInUser ? likes.some((id) => id.toString() === loggedInUser.id) : false;
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(likes.length);
  const [expanded, setExpanded] = useState(false);

  // Un post sin texto es un registro de puntuación, no una reseña.
  const hasText = Boolean(content?.trim());
  // La portada es la entrada a la reseña. Sin portada (GameDetails no la pasa)
  // hace falta el link del footer, o la card se queda sin salida.
  const hasCover = Boolean(imageUrl && gameId && postId);
  const isTruncatable = content?.length > MAX_PREVIEW_CHARS;
  const displayContent = isTruncatable && !expanded
    ? content.slice(0, MAX_PREVIEW_CHARS).trimEnd() + "…"
    : content;

  const handleLike = async () => {
    if (!loggedInUser || !postId || likeLoading) return;
    const res = await toggleLike(postId);
    setIsLiked(res.isLiked);
    setLikesCount(res.likesCount);
  };

  return (
    <div className="review">
      {hasCover && (
        <div className="review__image-container">
          <Link
            to={`/review/${postId}`}
            className="review__image"
            aria-label={`Ver ${hasText ? "reseña" : "registro"} de ${gameName} por ${username}`}
          >
            <img src={imageUrl} alt="" />
            <span className="review__image-overlay" aria-hidden="true">
              {hasText ? "Ver reseña" : "Ver detalle"}
            </span>
          </Link>
        </div>
      )}

      <div className="review__content">
        <div className="review__header">
          <Link to={`/profile/username/${username}`} className="review__avatar">
            {imagen
              ? <img src={imagen} alt={username} />
              : <i className="fa-solid fa-user" aria-hidden="true"></i>
            }
          </Link>

          <div className="review__meta">
            {gameName && gameId && (
              <h3 className="review__game">
                <Link to={`/game-details?id=${gameId}`}>{gameName}</Link>
              </h3>
            )}
            <div className="review__byline">
              <span>{hasText ? "Reseña de " : "Puntuado por "}</span>
              <Link to={`/profile/username/${username}`} className="review__user">
                {username}
              </Link>
              {rating != null && <RatingStars rating={rating} />}
            </div>
          </div>
        </div>

        {hasText && <p className="review__text">{displayContent}</p>}
        {isTruncatable && (
          <button
            type="button"
            className="review__expand"
            onClick={() => setExpanded((e) => !e)}
          >
            {expanded ? "Leer menos" : "Leer más"}
          </button>
        )}

        <div className="review__footer">
          {postId && (
            <button
              className={`review__like ${isLiked ? "review__like--active" : ""}`}
              onClick={handleLike}
              disabled={!loggedInUser || likeLoading}
              aria-label={isLiked ? "Quitar me gusta" : "Me gusta"}
            >
              <i className={`fa-${isLiked ? "solid" : "regular"} fa-heart`} aria-hidden="true"></i>
              <span>Me gusta</span>
              {likesCount > 0 && <span className="review__like-count">{likesCount}</span>}
            </button>
          )}

          {postId && !hasCover && (
            <Link to={`/review/${postId}`} className="review__detail-link">
              {hasText ? "Ver reseña" : "Ver detalle"}
            </Link>
          )}

          {/* Exige onDelete además de ser el autor: en Home no se pasa handler
              y el botón aparecía igual, sin hacer nada al clickearlo. */}
          {loggedInUser?.username === username && onDelete && (
            <button className="review__delete" onClick={onDelete} aria-label="Eliminar reseña">
              <i className="fa-solid fa-trash" aria-hidden="true"></i>Eliminar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Review;
