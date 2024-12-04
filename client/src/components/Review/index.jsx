const Review = ({ username, content, rating, onDelete, gameName }) => {
  return (
    <div className="review">
      

      <div className="review__content">
      {gameName && (<h4>{gameName}</h4>)}
        {username && (<h4>{username}</h4>)}
        <p>{content}</p>

        <div className="review__actions">
          <span>
            <i className="fa-solid fa-star"></i>{rating}/10
          </span>

          <button onClick={onDelete}>
            <i className="fa-solid fa-trash"></i>Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Review;
