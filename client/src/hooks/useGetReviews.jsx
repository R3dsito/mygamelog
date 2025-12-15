import { useState } from "react";
import axios from "axios";

const useGetReviews = ({ value }) => {
  const [getReviewsData, setGetReviewsData] = useState({
    state: "idle",
    data: null,
    error: null,
  });

  const getReviews = async () => {
    setGetReviewsData({ state: "loading", data: null, error: null });

    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/posts/${value}`);

      const data = response.data;

      setGetReviewsData({ state: "success", data, error: null });
    } catch (error) {
      setGetReviewsData({ state: "error", data: null, error });
    }
  };

  return {
    state: getReviewsData.state,
    data: getReviewsData.data,
    error: getReviewsData.error,
    getReviews,
  };
};

export default useGetReviews;
