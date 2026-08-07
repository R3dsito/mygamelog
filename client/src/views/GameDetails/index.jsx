import { Fragment, useState, useEffect, useContext } from "react";
import { useSearchParams } from "react-router-dom";
import dayjs from "dayjs";

import { Loader, Modal, Review } from "@/components";
import AddToPlaylistModal from "@/components/AddToPlaylistModal";
import api from "@/api/axiosInstance";

import useGetGame from "@/hooks/useGetGame";
import useGetReviews from "@/hooks/useGetReviews";
import usePostReview from "@/hooks/usePostReview";
import useToggleFavorite from "@/hooks/useToggleFavorite";
import useGetGameScore from "@/hooks/useGetGameScore";
import useRadioGroup from "@/hooks/useRadioGroup";

import { AuthContext } from "@/contexts/AuthContext";

const DRAFT_KEY = (gameId) => `review_draft_${gameId}`;

const saveDraft = (gameId, score, review) => {
  if (!gameId) return;
  localStorage.setItem(DRAFT_KEY(gameId), JSON.stringify({ score, review }));
};

const clearDraft = (gameId) => localStorage.removeItem(DRAFT_KEY(gameId));

const loadDraft = (gameId) => {
  try { return JSON.parse(localStorage.getItem(DRAFT_KEY(gameId))); }
  catch { return null; }
};

const GameDetails = () => {
  const [searchParams] = useSearchParams();
  const { user } = useContext(AuthContext);
  const id = searchParams.get("id");
  const { toggleFavorite, loading } = useToggleFavorite();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const { data: gameScore, fetchScore } = useGetGameScore();
const [reviewData, setReviewData] = useState({
  score: 0,
  review: "",
  addToFavorites: false,
});
const [reviewError, setReviewError] = useState("");
const [editingPostId, setEditingPostId] = useState(null);
const [submitting, setSubmitting] = useState(false);
const [confirmDelete, setConfirmDelete] = useState(false);

  const {
    state: gameState,
    data: gameData,
    error: gameError,
    getGame,
  } = useGetGame({
    value: id,
  });

  const {
    state: reviewsState,
    data: reviewsData,
    error: reviewsError,
    getReviews,
  } = useGetReviews({
    value: id,
  });

  const {
    state: postReviewState,
    data: postReviewData,
    error: postReviewError,
    postReview,
  } = usePostReview({
    userId: user?.id || "",
    gameId: gameData?.id,
    imageUrl: gameData?.background_image,
    gameName: gameData?.name,
    content: reviewData?.review,
    rating: reviewData?.score,
  });

  const refreshGameData = () => {
    getReviews();
    fetchScore(id);
  };

  const resetForm = () => {
    setEditingPostId(null);
    setReviewData({ score: 0, review: "", addToFavorites: false });
    setIsFavorite(false);
    setConfirmDelete(false);
    setReviewError("");
  };

  const handleDelete = async (reviewId) => {
    try {
      await api.delete(`/posts/${reviewId}`);
      if (reviewId === editingPostId) {
        resetForm();
        clearDraft(id);
      }
      refreshGameData();
      return true;
    } catch {
      return false;
    }
  };

  // Los favoritos apuntan a un post, así que solo se pueden aplicar si ya existe.
  // En modo creación se difiere hasta después de publicar.
  const handleFavoriteClick = async () => {
    if (!editingPostId) {
      setReviewData((prev) => ({ ...prev, addToFavorites: !prev.addToFavorites }));
      return;
    }
    try {
      const res = await toggleFavorite({ userId: user.id, postId: editingPostId });
      setIsFavorite(res?.isFavorite ?? !isFavorite);
    } catch {
      setReviewError("No se pudo actualizar favoritos.");
    }
  };

  const handleSubmit = async () => {
    setReviewError("");
    if (!reviewData.score) {
      return setReviewError("Elegí una puntuación del 1 al 10.");
    }

    setSubmitting(true);
    try {
      if (editingPostId) {
        await api.put(`/posts/${editingPostId}`, {
          content: reviewData.review.trim(),
          rating: reviewData.score,
        });
      } else {
        const newPost = await postReview();
        if (newPost?._id) {
          setEditingPostId(newPost._id);
          if (reviewData.addToFavorites) {
            const res = await toggleFavorite({ userId: user.id, postId: newPost._id });
            setIsFavorite(res?.isFavorite ?? true);
          }
        }
        clearDraft(id);
      }
      refreshGameData();
      setIsOpen(false);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 409) {
        try {
          const res = await api.get(`/posts/user/${user.id}/game/${gameData.id}`);
          const existing = res.data;
          setEditingPostId(existing._id);
          setReviewData({
            score: existing.rating,
            review: existing.content || "",
            addToFavorites: false,
          });
          setReviewError("Ya tenías un registro para este juego. Podés editarlo acá.");
        } catch {
          setReviewError("Ya registraste este juego.");
        }
      } else if (status === 400) {
        setReviewError(err.response?.data?.error || "Datos inválidos.");
      } else if (status === 401) {
        setReviewError("Tu sesión expiró. Iniciá sesión nuevamente.");
      } else if (!err?.response) {
        setReviewError("Sin conexión al servidor. Verificá tu internet e intentá de nuevo.");
      } else {
        setReviewError("No se pudo guardar. Intentá de nuevo.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteFromModal = async () => {
    setSubmitting(true);
    const ok = await handleDelete(editingPostId);
    setSubmitting(false);
    if (ok) setIsOpen(false);
    else setReviewError("No se pudo eliminar el registro.");
  };

  const { getRadioProps: getStarProps } = useRadioGroup({
    count: 10,
    selectedIndex: reviewData.score - 1,
    onSelect: (index) => handleScoreChange(index + 1),
  });

  const favoriteActive = editingPostId ? isFavorite : reviewData.addToFavorites;

  const submitLabel = editingPostId
    ? "Guardar cambios"
    : reviewData.review.trim()
      ? "Publicar reseña"
      : "Guardar puntuación";

  const handleScoreChange = (score) => {
    setReviewData((prev) => {
      const next = { ...prev, score };
      if (!editingPostId) saveDraft(id, score, prev.review);
      return next;
    });
  };

  const handleReviewChange = (e) => {
    const review = e.target.value;
    setReviewData((prev) => {
      if (!editingPostId) saveDraft(id, prev.score, review);
      return { ...prev, review };
    });
  };

  useEffect(() => {
    if (id) {
      getGame();
      getReviews();
      fetchScore(id);
      if (user) {
        api.get(`/posts/user/${user.id}/game/${id}`).then((res) => {
          const existing = res.data;
          setEditingPostId(existing._id);
          setReviewData({
            score: existing.rating,
            review: existing.content || "",
            addToFavorites: false,
          });
          setIsFavorite(user?.favorites?.includes(existing._id) ?? false);
        }).catch(() => {
          const draft = loadDraft(id);
          if (draft) setReviewData((prev) => ({ ...prev, ...draft }));
        });
      }
    }
  }, []);

  useEffect(() => {
    if (postReviewState === "success") {
      getReviews();
      fetchScore(id);
    }
  }, [postReviewState]);

  useEffect(() => {
    if (!isOpen) {
      setReviewError("");
      setConfirmDelete(false);
    }
  }, [isOpen]);

  return (
    <div className="game-details">
      {gameData ? (
        <>
          <div className="game-details__header">
            <div
              className="game-details__header__images"
              style={{
                backgroundImage: `
              linear-gradient(to top, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0)),
              url(${gameData.background_image})
            `,
              }}
            />
          </div>

          <div className="game-details__content">
            <div className="game-details__hero">
              <div className="game-details__poster">
                {gameData.cover ? (
                  <img src={gameData.cover} alt={`Portada de ${gameData.name}`} />
                ) : (
                  <div className="game-details__poster__empty">
                    <i className="fa-solid fa-gamepad" />
                  </div>
                )}
              </div>

              <div className="game-details__intro">
                <h1>
                  {gameData.website ? (
                    <a
                      className="game-details__title-link"
                      href={gameData.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {gameData.name}
                      <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true" />
                    </a>
                  ) : (
                    gameData.name
                  )}
                  <span> ({dayjs(gameData.released).format("YYYY")})</span>
                </h1>

                <div className="game-details__score">
                  <i className="fa-solid fa-star" />
                  {gameScore.totalReviews > 0
                    ? <><strong>{gameScore.averageScore.toFixed(1)}</strong><span>/10 · {gameScore.totalReviews} {gameScore.totalReviews === 1 ? "reseña" : "reseñas"} en mygamelog</span></>
                    : <span>Sin reseñas en mygamelog aún</span>
                  }
                </div>

                <p className="game-details__publishers">
                  {gameData.publishers.map((publisher, index) => (
                    <Fragment key={publisher.id}>
                      <span>{publisher.name}</span>
                      {index < gameData.publishers.length - 1 && " · "}
                    </Fragment>
                  ))}
                </p>

                <div className="game-details__content__actions">
                  <button onClick={() => setIsOpen(true)}>
                    {editingPostId ? "Editar registro" : "Registrar juego"}
                  </button>
                  {user && (
                    <button onClick={() => setShowPlaylistModal(true)}>
                      <i className="fa-solid fa-bookmark" /> Playlist
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="game-details__content__grid">
              <div className="game-details__content__main">
                <h2>Descripción:</h2>
                <p>{gameData.description_raw}</p>
              </div>

              <aside className="game-details__content__side">
                <h2>Géneros:</h2>
                <div className="game-details__content__tags">
                  {gameData.tags.map((tag) => (
                    <span key={tag.id}>{tag.name}</span>
                  ))}
                </div>

                <h2>Plataformas:</h2>
                <div className="game-details__content__platforms">
                  {gameData.platforms.map((platform) => (
                    <span key={platform.platform.id}>{platform.platform.name}</span>
                  ))}
                </div>

                <h2>Sitio web:</h2>
                <div className="game-details__content__website">
                  <a href={gameData.website} target="_blank" rel="noopener noreferrer">
                    {gameData.website}
                    <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true" />
                  </a>
                </div>
              </aside>
            </div>

            <div className="game-details__content__reviews-section">
              <h2>Reseñas populares:</h2>

              <div className="game-details__content__reviews">
                {reviewsState === "loading" && (
                  <div className="game-details__content__loading">
                    <Loader />
                  </div>
                )}

                {reviewsError && (
                  <div className="game-details__content__error">
                    <span>
                      <i className="fa-solid fa-bug fa-xl"></i>
                    </span>
                    <p>Ups! Ha ocurrido un error!</p>
                    <p>{reviewsError.response?.data?.error || "Error desconocido"}</p>
                  </div>
                )}

                {reviewsState === "success" &&
                  reviewsData.map((review) => (
                    <Review
                      key={review._id}
                      username={review.userId.username}
                      imagen={review.userId.imagen}
                      content={review.content}
                      rating={review.rating}
                      postId={review._id}
                      likes={review.likes || []}
                      onDelete={() => handleDelete(review._id)}
                    />
                  ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="game-details__loading">
          <Loader />
          <p>Cargando detalles del juego</p>
        </div>
      )}

      {showPlaylistModal && gameData && (
        <AddToPlaylistModal
          game={{
            gameId: gameData.id,
            gameName: gameData.name,
            imageUrl: gameData.background_image,
          }}
          onClose={() => setShowPlaylistModal(false)}
        />
      )}

      <Modal
        closable
        title={editingPostId ? "Editar registro" : "Registrar juego"}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        className="modal--dark"
      >
        <div className="log-modal">
          <section className="log-modal__section">
            <div className="log-modal__label-row">
              <span className="log-modal__label">Tu puntuación</span>
              <span className="log-modal__score">
                {reviewData.score ? `${reviewData.score}/10` : "—"}
              </span>
            </div>

            <div
              className="log-modal__stars"
              role="radiogroup"
              aria-label="Puntuación del 1 al 10"
            >
              {Array.from({ length: 10 }).map((_, index) => {
                const starIndex = index + 1;
                const filled = starIndex <= reviewData.score;

                return (
                  <button
                    key={index}
                    type="button"
                    {...getStarProps(index)}
                    onClick={() => handleScoreChange(starIndex)}
                    className={`star-button ${filled ? "active" : ""}`}
                    aria-label={`${starIndex} de 10`}
                  >
                    <i
                      className={`fa-${filled ? "solid" : "regular"} fa-star`}
                      aria-hidden="true"
                    />
                  </button>
                );
              })}
            </div>
          </section>

          <section className="log-modal__section">
            <div className="log-modal__label-row">
              <label className="log-modal__label" htmlFor="log-modal-text">
                Reseña
              </label>
              <span className="log-modal__optional">Opcional</span>
            </div>

            <textarea
              id="log-modal-text"
              placeholder="¿Qué te pareció? Podés dejarlo vacío y guardar solo la puntuación."
              value={reviewData.review}
              onChange={handleReviewChange}
              maxLength={5000}
              rows={5}
            />

            {reviewData.review.length > 0 && (
              <span className="log-modal__counter">
                {reviewData.review.length}/5000
              </span>
            )}
          </section>

          <button
            type="button"
            className={`favorite-toggle ${favoriteActive ? "active" : ""}`}
            onClick={handleFavoriteClick}
            disabled={loading}
          >
            <i className={`fa-${favoriteActive ? "solid" : "regular"} fa-heart`} />
            {favoriteActive ? "En favoritos" : "Marcar como favorito"}
          </button>

          {reviewError && <p className="log-modal__error">{reviewError}</p>}

          <button
            type="button"
            className="log-modal__submit"
            onClick={handleSubmit}
            disabled={submitting || !reviewData.score}
          >
            {submitting ? "Guardando..." : submitLabel}
          </button>

          {editingPostId && (
            <div className="log-modal__danger">
              {confirmDelete ? (
                <>
                  <span className="log-modal__danger-text">
                    ¿Eliminar tu registro de este juego?
                  </span>
                  <div className="log-modal__danger-actions">
                    <button type="button" onClick={() => setConfirmDelete(false)}>
                      Cancelar
                    </button>
                    <button
                      type="button"
                      className="log-modal__danger-confirm"
                      onClick={handleDeleteFromModal}
                      disabled={submitting}
                    >
                      Sí, eliminar
                    </button>
                  </div>
                </>
              ) : (
                <button
                  type="button"
                  className="log-modal__danger-trigger"
                  onClick={() => setConfirmDelete(true)}
                >
                  <i className="fa-solid fa-trash" aria-hidden="true" /> Eliminar registro
                </button>
              )}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default GameDetails;
