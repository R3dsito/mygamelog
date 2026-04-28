import { useState } from "react";
import api from "@/api/axiosInstance";

const useToggleFavorite = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const toggleFavorite = async ({ userId, postId }) => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.post("/users/favorites", { userId, postId });
      setLoading(false);
      return res.data;
    } catch (err) {
      setError(err);
      setLoading(false);
      throw err;
    }
  };

  return { toggleFavorite, loading, error };
};

export default useToggleFavorite;
