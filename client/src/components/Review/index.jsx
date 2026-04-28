import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "@/contexts/AuthContext";
import useToggleLike from "@/hooks/useToggleLike";

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
      <div className="review__content">
        {gameName && <h4 onClick={handleOnClick}>{gameName}</h4>}
        {username && <h4 onClick={handleOnClickUser}>{username}</h4>}
        <p>{content}</p>

        <div className="review__actions">
          <span>
            <i className="fa-solid fa-star"></i>{rating}/10
          </span>

          <div className="review__actions__right">
            {postId && (
              <button
                className={`review__like ${isLiked ? "review__like--active" : ""}`}
                onClick={handleLike}
                disabled={!loggedInUser || likeLoading}
              >
                <i className={`fa-${isLiked ? "solid" : "regular"} fa-heart`}></i>
                {likesCount > 0 && <span>{likesCount}</span>}
              </button>
            )}

            {loggedInUser?.username === username && (
              <button onClick={onDelete}>
                <i className="fa-solid fa-trash"></i>Eliminar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Review;
