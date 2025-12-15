import { useNavigate } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "@/contexts/AuthContext";
import axios from "axios";

const Favorite = ({ id, name, rating, image }) => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [isFavorite, setIsFavorite] = useState(false);

  // Al montar el componente, comprobar si está en favoritos
  useEffect(() => {
    if (user?.favorites?.includes(id)) {
      setIsFavorite(true);
    }
  }, [user, id]);

  const handleNavigate = () => {
    navigate(`/game-details?id=${id}`);
  };

const toggleFavorite = async (e) => {
  e.stopPropagation(); // Evita que se dispare handleOnClick

  try {
    const res = await axios.post(
      `${import.meta.env.VITE_API_URL}/users/favorite`,
      {
        userId: user.id,
        postId: id,
      },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    setIsFavorite(!isFavorite);
  } catch (error) {
    console.error("Error al cambiar favorito:", error);
  }
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
      onClick={handleNavigate}
    >
      <p>{name}</p>
      <span>{rating}</span>
    </div>
  );
};

export default Favorite;
