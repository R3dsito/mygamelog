import { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import dayjs from "dayjs";
import { Loader } from "@/components";
import { AuthContext } from "@/contexts/AuthContext";
import api from "@/api/axiosInstance";
import "./styles.scss";

const ReviewDetail = () => {
  const { postId } = useParams();
  const { user } = useContext(AuthContext);
  const [post, setPost]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);
  const [likes, setLikes]     = useState([]);
  const [liking, setLiking]   = useState(false);

  useEffect(() => {
    api.get(`/posts/detail/${postId}`)
      .then((res) => { setPost(res.data); setLikes(res.data.likes || []); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [postId]);

  const isLiked = user ? likes.some((id) => id.toString() === user.id) : false;

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

  if (loading) return <div className="review-detail"><Loader /></div>;

  if (error || !post) return (
    <div className="review-detail review-detail--error">
      <i className="fa-solid fa-bug fa-xl" aria-hidden="true" />
      <p>No se pudo cargar la reseña.</p>
      <Link to="/feed">← Volver al feed</Link>
    </div>
  );

  const { userId, gameName, gameId, imageUrl, content, rating, createdAt } = post;

  return (
    <div className="review-detail">
      {imageUrl && (
        <div
          className="review-detail__hero"
          style={{ backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.4) 55%, transparent), url(${imageUrl})` }}
        >
          <div className="review-detail__hero-inner">
            <h1 className="review-detail__game-title">
              <Link to={`/game-details?id=${gameId}`}>{gameName}</Link>
            </h1>
          </div>
        </div>
      )}

      <article className="review-detail__body">
        <Link to="/feed" className="review-detail__back">
          <span aria-hidden="true">←</span> Volver al feed
        </Link>

        <div className="review-detail__user">
          {/* El avatar duplica el link al perfil que ya está al lado:
              se oculta para no anunciar el mismo destino dos veces. */}
          <Link
            to={`/profile/username/${userId?.username}`}
            className="review-detail__avatar"
            aria-hidden="true"
            tabIndex={-1}
          >
            {userId?.imagen
              ? <img src={userId.imagen} alt="" />
              : <i className="fa-solid fa-user" aria-hidden="true" />
            }
          </Link>
          <div>
            <Link to={`/profile/username/${userId?.username}`} className="review-detail__username">
              @{userId?.username}
            </Link>
            <p className="review-detail__date">
              <time dateTime={createdAt}>{dayjs(createdAt).format("D [de] MMMM [de] YYYY")}</time>
            </p>
          </div>
        </div>

        {rating > 0 && (
          <p className="review-detail__rating">
            {/* Los dos spans visuales se leerían como "6" "/10" por separado. */}
            <span className="visually-hidden">Puntuación: {rating} de 10</span>
            <span className="review-detail__rating-score" aria-hidden="true">{rating}</span>
            <span className="review-detail__rating-max" aria-hidden="true">/10</span>
          </p>
        )}

        {content?.trim() ? (
          <p className="review-detail__content">{content}</p>
        ) : (
          <p className="review-detail__no-content">
            Sin reseña escrita — solo puntuación.
          </p>
        )}

        <div className="review-detail__footer">
          <button
            type="button"
            className={`review-detail__like${isLiked ? " review-detail__like--active" : ""}`}
            onClick={handleLike}
            disabled={liking || !user}
            aria-label={isLiked ? "Quitar me gusta" : "Me gusta"}
          >
            <i className={`fa-${isLiked ? "solid" : "regular"} fa-heart`} aria-hidden="true" />
            <span>{likes.length} {likes.length === 1 ? "like" : "likes"}</span>
          </button>

          <Link to={`/game-details?id=${gameId}`} className="review-detail__game-link">
            Ver juego <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true" />
          </Link>
        </div>
      </article>
    </div>
  );
};

export default ReviewDetail;
