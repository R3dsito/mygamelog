import { useState } from "react";
import api from "@/api/axiosInstance";

const useGetUserPlaylists = () => {
  const [state, setState] = useState("idle");
  const [data, setData] = useState([]);

  const fetchPlaylists = async (userId) => {
    setState("loading");
    try {
      const res = await api.get(`/playlists/user/${userId}`);
      setData(res.data);
      setState("success");
    } catch {
      setState("error");
    }
  };

  return { state, data, setData, fetchPlaylists };
};

export default useGetUserPlaylists;
