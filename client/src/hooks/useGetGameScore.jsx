import { useState } from "react";
import api from "@/api/axiosInstance";

const useGetGameScore = () => {
  const [data, setData] = useState({ averageScore: 0, totalReviews: 0 });

  const fetchScore = async (gameId) => {
    try {
      const res = await api.get(`/posts/score/${gameId}`);
      setData(res.data);
    } catch {
      // sin reviews aún — mantener defaults
    }
  };

  return { data, fetchScore };
};

export default useGetGameScore;
