import { useState } from "react";
import api from "@/api/axiosInstance";

const usePostReview = ({
  userId,
  gameId,
  imageUrl,
  gameName,
  content,
  rating,
}) => {
  const [postReviewData, setPostReviewData] = useState({
    state: "idle",
    data: null,
    error: null,
  });

  const postReview = async () => {
    setPostReviewData({ state: "loading", data: null, error: null });

    try {
      const response = await api.post("/posts", {
        userId,
        gameId,
        imageUrl,
        gameName,
        content,
        rating,
      });

      const data = response.data;

      setPostReviewData({ state: "success", data, error: null });

      return data; // ✅ Devuelve el post creado, incluyendo el _id
    } catch (error) {
      setPostReviewData({ state: "error", data: null, error });
      throw error; // 🔴 Opcional: permite manejar el error fuera
    }
  };

  return {
    state: postReviewData.state,
    data: postReviewData.data,
    error: postReviewData.error,
    postReview,
  };
};

export default usePostReview;