import { useState } from "react";
import axios from "axios";

const useDeleteReview = () => {
  const [deleteReviewData, setDeleteReviewData] = useState({
    state: "idle",
    data: null,
    error: null,
  });

  const deleteReview = async (reviewId) => {
    setDeleteReviewData({ state: "loading", data: null, error: null });

    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/posts/${reviewId}`
      );
      const data = response.data;

      setDeleteReviewData({ state: "success", data, error: null });
    } catch (error) {
      setDeleteReviewData({ state: "error", data: null, error });
    }
  };

  return {
    state: deleteReviewData.state,
    data: deleteReviewData.data,
    error: deleteReviewData.error,
    deleteReview, // Retorna la función
  };
};

export default useDeleteReview;
