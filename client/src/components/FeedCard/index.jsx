import { useState, useContext } from "react";
import { Link } from "react-router-dom";

import { AuthContext } from "@/contexts/AuthContext";
import api from "@/api/axiosInstance";
import "./styles.scss";

const MAX_PREVIEW = 110;

const FeedCard = ({ username, imagen, gameId, gameName, imageUrl, content, rating, postId, likes: initialLikes }) => {
  const { user } = useContext(AuthContext);
  const [likes, setLikes] = useState(initialLikes || []);
  const [liking, setLiking] = useState(false);

  const isLiked = user ? likes.some((id) => id.toString() === user.id) : false;
  const hasText = Boolean(content?.trim());
  const preview = content?.length > MAX_PREVIEW
    ? content.slice(0, MAX_PREVIEW).trimEnd() + "…"
    : content;

  const handleLike = async () => {
    if (!user || liking) return;
    setLiking(true);
    try {
      const res = await api.post(`/posts/${postId}/like`);
      setLikes((prev) =>
        res.data.isLiked
          ? [...prev, user.id]
          : prev.filter((id) => id.toString() !== user.id)
      );
    } catch {
      // silent
    } finally {
      setLiking(false);
    }
  };

  return (
    <article className="feed-card">
      <Link to={`/game-details?id=${gameId}`} className="feed-card__cover">
        {imageUrl ? (
          <img src={imageUrl} alt={gameName} />
        ) : (
          <div className="feed-card__cover-empty">
            <i className="fa-solid fa-gamepad" aria-hidden="true" />
          </div>
        )}
      </Link>

      <div className="feed-card__body">
        <div className="feed-card__user">
          <Link to={`/profile/username/${username}`} className="feed-card__avatar">
            {imagen ? (
              <img src={imagen} alt={username} />
            ) : (
              <i className="fa-solid fa-user" aria-hidden="true" />
            )}
          </Link>
          <Link to={`/profile/username/${username}`} className="feed-card__username">
            @{username}
          </Link>
        </div>

        <h3 className="feed-card__game">
          <Link to={`/game-details?id=${gameId}`}>{gameName}</Link>
        </h3>

        {rating > 0 && <p className="feed-card__rating">{rating} / 10</p>}

        {hasText && <p className="feed-card__text">{preview}</p>}

        <div className="feed-card__footer">
          <button
            type="button"
            className={`feed-card__like${isLiked ? " feed-card__like--active" : ""}`}
            onClick={handleLike}
            disabled={liking || !user}
            aria-label="Me gusta"
          >
            <i className={`fa-${isLiked ? "solid" : "regular"} fa-heart`} aria-hidden="true" />
            {likes.length > 0 && <span>{likes.length}</span>}
          </button>

          {/* Siempre presente: antes el único acceso al detalle era el texto,
              así que los registros sin reseña no tenían forma de abrirse. */}
          <Link to={`/review/${postId}`} className="feed-card__detail-link">
            {hasText ? "Ver reseña" : "Ver detalle"}
          </Link>
        </div>
      </div>
    </article>
  );
};

export default FeedCard;
