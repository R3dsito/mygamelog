import { useState } from "react";
import api from "@/api/axiosInstance";

export const FEED_LIMIT = 10;

const useGetFeed = () => {
  const [state, setState] = useState("idle");
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState(null);

  // Página 1-based. El backend ya devuelve `total`, que antes se descartaba.
  const getFeed = async (params = {}, page = 1) => {
    setState("loading");
    try {
      const qs = new URLSearchParams({
        skip: (page - 1) * FEED_LIMIT,
        limit: FEED_LIMIT,
        ...params,
      }).toString();

      const res = await api.get(`/posts/latest?${qs}`);
      setData(res.data.posts);
      setTotal(res.data.total ?? res.data.posts.length);
      setState("success");
    } catch (err) {
      setError(err);
      setState("error");
    }
  };

  return { state, data, total, error, getFeed };
};

export default useGetFeed;
