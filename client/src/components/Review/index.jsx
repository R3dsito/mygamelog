import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "@/contexts/AuthContext";

const Review = ({ username, imagen, content, rating, onDelete, gameName, imageUrl, gameId }) => {
  const { user: loggedInUser } = useContext(AuthContext);

  const navigate = useNavigate();
  const handleOnClick = () => {
    navigate(`/game-details?id=${gameId}`);
  };
  const handleOnClickUser = () => {
    navigate(`/profile/username/${username}`);
  };
  return (
    <div className="review">
{/* <div className="review__image-container">
        {imagen && (
          <img className="review__image" src={imagen} alt={`${gameName} cover`} onClick={handleOnClick} />
        )}
     </div>  */}
      <div className="review__content">
      {gameName && (<h4 onClick={handleOnClick}>{gameName}</h4>)}
        {username && (<h4 onClick={handleOnClickUser}>{username}</h4>)}
        <p>{content}</p>

        <div className="review__actions">
          <span>
            <i className="fa-solid fa-star"></i>{rating}/10
          </span>

          {loggedInUser?.username === username && (
  <button onClick={onDelete}>
    <i className="fa-solid fa-trash"></i>Eliminar
  </button>
)}
        </div>
      </div>
    </div>
  );
};

export default Review;
