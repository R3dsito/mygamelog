import { useNavigate } from "react-router-dom";

const Favorite = ({ id, name, rating, image }) => {
  const navigate = useNavigate();

  const handleOnClick = () => {
    navigate(`/game-details?id=${id}`);
  };

  return (
    <div
      className="favorite"
      style={{
        backgroundImage: `
  linear-gradient(to top, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0)),
  url(${image})
`,
      }}
      onClick={handleOnClick}
    >
      <p>{name}</p>
      <span>{rating}</span>
    </div>
  );
};

export default Favorite;
