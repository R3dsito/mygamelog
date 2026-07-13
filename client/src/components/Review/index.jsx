import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
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
        return <i key={i} className={icon}></i>;
      })}
    </span>
  );
};

const Review = ({ username, imagen, content, rating, onDelete, gameName, imageUrl, gameId, postId, likes = [] }) => {
  const { user: loggedInUser } = useContext(AuthContext);
  const { toggleLike, loading: likeLoading } = useToggleLike();

  const initialLiked = loggedInUser ? likes.some((id) => id.toString() === loggedInUser.id) : false;
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(likes.length);

  const navigate = useNavigate();

  const handleOnClick = () => navigate(`/game-details?id=${gameId}`);
  const handleOnClickUser = () => navigate(`/profile/username/${username}`);

  const handleLike = async () => {
    if (!loggedInUser || !postId || likeLoading) return;
    const res = await toggleLike(postId);
    setIsLiked(res.isLiked);
    setLikesCount(res.likesCount);
  };

  return (
    <div className="review">
      {imageUrl && (
        <div className="review__image-container">
          <div className="review__image" onClick={handleOnClick}>
            <img src={imageUrl} alt={gameName} />
          </div>
        </div>
      )}

      <div className="review__content">
        <div className="review__header">
          <div className="review__avatar" onClick={handleOnClickUser}>
            {imagen ? <img src={imagen} alt={username} /> : <i className="fa-solid fa-user"></i>}
          </div>

          <div className="review__meta">
            {gameName && (
              <h4 className="review__game" onClick={handleOnClick}>
                {gameName}
              </h4>
            )}
            <div className="review__byline">
              <span>Reseña de </span>
              <span className="review__user" onClick={handleOnClickUser}>
                {username}
              </span>
              {rating != null && <RatingStars rating={rating} />}
            </div>
          </div>
        </div>

        <p className="review__text">{content}</p>

        <div className="review__footer">
          {postId && (
            <button
              className={`review__like ${isLiked ? "review__like--active" : ""}`}
              onClick={handleLike}
              disabled={!loggedInUser || likeLoading}
            >
              <i className={`fa-${isLiked ? "solid" : "regular"} fa-heart`}></i>
              <span>Me gusta</span>
              {likesCount > 0 && <span className="review__like-count">{likesCount}</span>}
            </button>
          )}

          {loggedInUser?.username === username && (
            <button className="review__delete" onClick={onDelete}>
              <i className="fa-solid fa-trash"></i>Eliminar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Review;
