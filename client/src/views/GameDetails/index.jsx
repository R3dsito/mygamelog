import { Fragment, useState, useEffect, useContext } from "react";
import { useSearchParams } from "react-router-dom";
import dayjs from "dayjs";

import { Loader, Modal, Review } from "@/components";

import useGetGame from "@/hooks/useGetGame";
import useGetReviews from "@/hooks/useGetReviews";
import usePostReview from "@/hooks/usePostReview";
import useDeleteReview from "@/hooks/useDeleteReview";
import useToggleFavorite from "@/hooks/useToggleFavorite";

import { AuthContext } from "@/contexts/AuthContext";

const GameDetails = () => {
  const [searchParams] = useSearchParams();
  const { user } = useContext(AuthContext);
  const { deleteReview } = useDeleteReview();
  const id = searchParams.get("id");
  const { toggleFavorite, loading } = useToggleFavorite();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
const [reviewData, setReviewData] = useState({
  score: 0,
  review: "",
  addToFavorites: false,
});

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

  const handleDelete = async (reviewId) => {
  await deleteReview(reviewId);
  getReviews();
};

console.log(reviewData);

const handleToggleFavorite = async () => {
  try {
    const res = await toggleFavorite({ userId: user.id, gameId: gameData.id });
    if (res?.isFavorite) {
      setIsFavorite(true);
      console.log("Juego agregado a favoritos");
    } else {
      setIsFavorite(false);
      console.log("Juego eliminado de favoritos");
    }
  } catch (err) {
    console.error(err);
  }
};

  const handleScoreChange = (score) => {
    setReviewData({ ...reviewData, score });
    console.log(score);
  };

  const handleReviewChange = (e) => {
    setReviewData({ ...reviewData, review: e.target.value });
  };

  useEffect(() => {
    if (id) {
      getGame();
      getReviews();
    }
  }, []);

  useEffect(() => {
    if (postReviewState === "success") {
      getReviews();
    }
  }, [postReviewState]);

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
            >
              <h3>
                {gameData.name}
                <span>
                  {" "}
                  ({dayjs(gameData.released).format("YYYY")}) -{" "}
                  <i className="fa-solid fa-star"></i> {gameData.rating}
                </span>
              </h3>
              <div>
                {gameData.publishers.map((publisher, index) => (
                  <Fragment key={publisher.id}>
                    <span>{publisher.name}</span>
                    {index < gameData.publishers.length - 1 && " - "}
                  </Fragment>
                ))}
              </div>
            </div>
          </div>

          <div className="game-details__content">
            <div className="game-details__content__actions">
              <button onClick={() => setIsOpen(true)}>Nueva reseña</button>
            </div>

            <h4>Descripción:</h4>

            <p>{gameData.description_raw}</p>

            <h4>Géneros:</h4>

            <div className="game-details__content__tags">
              {gameData.tags.map((tag) => (
                <span key={tag.id}>{tag.name}</span>
              ))}
            </div>

            <h4>Plataformas:</h4>

            <div className="game-details__content__platforms">
              {gameData.platforms.map((platform) => (
                <span key={platform.platform.id}>{platform.platform.name}</span>
              ))}
            </div>

            <h4>Sitio web:</h4>

            <div className="game-details__content__website">
              <a href={gameData.website}>{gameData.website}</a>
            </div>

            <h4>Reseñas populares:</h4>

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
        onDelete={() => handleDelete(review._id)}

      />
    ))}
</div>
          </div>
        </>
      ) : (
        <div className="game-details__loading">
          <Loader />
          <p>Cargando detalles del juego</p>
        </div>
      )}

      <Modal
        closable
        title="Nueva reseña"
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      >
        <div className="new-review-modal">
          <div className="new-review-modal__rating">
            {Array.from({ length: 10 }).map((_, index) => {
              const starIndex = index + 1;

              return (
                <button
                  key={index}
                  onClick={() => handleScoreChange(starIndex)}
                  className={`star-button ${
                    starIndex <= reviewData.score ? "active" : ""
                  }`}
                >
                  <i
                    className={`fa-${
                      starIndex <= reviewData.score ? "solid" : "regular"
                    } fa-star`}
                  ></i>
                </button>
              );
            })}
          </div>

          <textarea
            placeholder="Escribe una reseña"
            onChange={handleReviewChange}
          ></textarea>

          <button
            className={`favorite-toggle ${reviewData.addToFavorites ? "active" : ""}`}
            onClick={() =>
              setReviewData({
                ...reviewData,
                addToFavorites: !reviewData.addToFavorites,
              })
            }
          >
            {reviewData.addToFavorites ? "Quitar de favoritos" : "Agregar a favoritos"}
            <i
            className={`fa-${isFavorite ? "solid" : "regular"} fa-heart`}
          ></i>
          </button>


<button
  onClick={async () => {
    try {
      const newPost = await postReview(); // ← ahora tenés el post creado
      getReviews();

      if (reviewData.addToFavorites && newPost?._id) {
        const res = await toggleFavorite({
          userId: user.id,
          postId: newPost._id, // ← asegurado y directo
        });
        setIsFavorite(res.isFavorite);
      }

      setIsOpen(false);
    } catch (err) {
      console.error("Error al postear o marcar favorito:", err);
    }
  }}
>
  ¡Publicar!
</button>
        </div>
      </Modal>
    </div>
  );
};

export default GameDetails;
