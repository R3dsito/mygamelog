import { useState } from "react";
import axios from "axios";

const useGetFavorites = () => {
  const [state, setState] = useState("idle");
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  const getFavorites = async (userId) => {
    setState("loading");
    try {
      const response = await axios.get(`http://localhost:3000/users/favorites/${userId}`);
      console.log("Response from getFavorites:", response.data);
      setData(response.data);
      setState("success");
    } catch (err) {
      setError(err);
      setState("error");
    }
  };

  return { state, data, error, getFavorites };
};

export default useGetFavorites;
