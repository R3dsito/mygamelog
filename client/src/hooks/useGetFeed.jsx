import { useState, useRef } from "react";
import api from "@/api/axiosInstance";

const LIMIT = 10;

const useGetFeed = () => {
  const [state, setState] = useState("idle");
  const [data, setData] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const skipRef = useRef(0);
  const filtersRef = useRef({});

  const buildQS = (params, skip) =>
    new URLSearchParams({ skip, limit: LIMIT, ...params }).toString();

  const getFeed = async (params = {}) => {
    skipRef.current = 0;
    filtersRef.current = params;
    setState("loading");
    try {
      const res = await api.get(`/posts/latest?${buildQS(params, 0)}`);
      setData(res.data.posts);
      setHasMore(res.data.hasMore);
      skipRef.current = LIMIT;
      setState("success");
    } catch (err) {
      setError(err);
      setState("error");
    }
  };

  const loadMore = async () => {
    try {
      const res = await api.get(`/posts/latest?${buildQS(filtersRef.current, skipRef.current)}`);
      setData((prev) => [...prev, ...res.data.posts]);
      setHasMore(res.data.hasMore);
      skipRef.current += LIMIT;
    } catch (err) {
      setError(err);
    }
  };

  return { state, data, hasMore, error, getFeed, loadMore };
};

export default useGetFeed;
