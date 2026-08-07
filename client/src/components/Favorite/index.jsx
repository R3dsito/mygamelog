import { Link } from "react-router-dom";

const Favorite = ({ id, name, rating, image }) => {
  return (
    <Link
      to={`/game-details?id=${id}`}
      className="favorite"
      style={{
        backgroundImage: `
  linear-gradient(to top, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0)),
  url(${image})
`,
      }}
    >
      <p>{name}</p>
      {rating != null && (
        <span>
          <span className="visually-hidden">Puntuación: </span>
          {rating}
        </span>
      )}
    </Link>
  );
};

export default Favorite;
