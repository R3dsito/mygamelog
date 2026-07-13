import { useState } from "react";
import api from "@/api/axiosInstance";

const useGetTrendingPlaylists = () => {
  const [state, setState] = useState("idle");
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  const getTrendingPlaylists = async () => {
    setState("loading");
    try {
      const res = await api.get("/playlists/trending");
      setData(res.data);
      setState("success");
    } catch (err) {
      setError(err);
      setState("error");
    }
  };

  return { state, data, error, getTrendingPlaylists };
};

export default useGetTrendingPlaylists;
