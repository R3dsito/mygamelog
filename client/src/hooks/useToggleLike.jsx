import { useState } from "react";
import api from "@/api/axiosInstance";

const useToggleLike = () => {
  const [loading, setLoading] = useState(false);

  const toggleLike = async (postId) => {
    setLoading(true);
    try {
      const res = await api.post(`/posts/${postId}/like`);
      return res.data; // { likesCount, isLiked }
    } finally {
      setLoading(false);
    }
  };

  return { toggleLike, loading };
};

export default useToggleLike;
