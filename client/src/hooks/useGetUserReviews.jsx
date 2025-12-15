import { useState } from "react";
import axios from "axios";

const useGetUserReviews = ({ value }) => {
  const [getUserReviewsData, setGetUserReviewsData] = useState({
    state: "idle",
    data: null,
    error: null,
  });

  const getUserReviews = async () => {
    setGetUserReviewsData({ state: "loading", data: null, error: null });

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/posts/user/${value}`
      );

      const data = response.data;

      setGetUserReviewsData({ state: "success", data, error: null });
    } catch (error) {
      setGetUserReviewsData({ state: "error", data: null, error });
    }
  };

  return {
    state: getUserReviewsData.state,
    data: getUserReviewsData.data,
    error: getUserReviewsData.error,
    getUserReviews,
  };
};

export default useGetUserReviews;
