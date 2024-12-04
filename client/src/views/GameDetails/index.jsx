import { Fragment, useState, useEffect, useContext } from "react";
import { useSearchParams } from "react-router-dom";
import dayjs from "dayjs";

import { Loader, Modal, Review } from "@/components";

import useGetGame from "@/hooks/useGetGame";
import useGetReviews from "@/hooks/useGetReviews";
import usePostReview from "@/hooks/usePostReview";

import { AuthContext } from "@/contexts/AuthContext";

const GameDetails = () => {
  const [searchParams] = useSearchParams();
  const { user } = useContext(AuthContext);

  const id = searchParams.get("id");

  const [isOpen, setIsOpen] = useState(false);
  const [reviewData, setReviewData] = useState({
    score: 0,
    review: "",
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
        key={review.id}
        username={review.userId.username}
        content={review.content}
        rating={review.rating}
        onDelete={() => console.log(`Eliminar reseña con id: ${review.id}`)}
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

          <button onClick={postReview}>¡Publicar!</button>
        </div>
      </Modal>
    </div>
  );
};

export default GameDetails;
