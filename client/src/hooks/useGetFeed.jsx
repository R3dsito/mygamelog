import { useState } from "react";
import api from "@/api/axiosInstance";

const useGetFeed = () => {
  const [state, setState] = useState("idle");
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  const getFeed = async () => {
    setState("loading");
    try {
      const res = await api.get("/posts/latest");
      setData(res.data);
      setState("success");
    } catch (err) {
      setError(err);
      setState("error");
    }
  };

  return { state, data, error, getFeed };
};

export default useGetFeed;
