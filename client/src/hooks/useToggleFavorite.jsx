import { useState } from "react";
import axios from "axios";

const useToggleFavorite = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

const toggleFavorite = async ({ userId, postId }) => {
  setLoading(true);
  setError(null);

  try {
    const res = await axios.post(`${import.meta.env.VITE_API_URL}/users/favorites`, { userId, postId });
    console.log(res.data.message);
    setLoading(false);
    return res.data;
  } catch (err) {
    setError(err);
    setLoading(false);
    console.error("Error al togglear favorito:", err);
    throw err;
  }
};
 
  return { toggleFavorite, loading, error };
};

export default useToggleFavorite;