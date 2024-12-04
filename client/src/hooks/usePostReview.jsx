import { useState } from "react";
import axios from "axios";

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
      const response = await axios.post(`http://localhost:3000/posts`, {
        userId,
        gameId,
        imageUrl,
        gameName,
        content,
        rating,
      });

      const data = response.data;

      setPostReviewData({ state: "success", data, error: null });
    } catch (error) {
      setPostReviewData({ state: "error", data: null, error });
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
