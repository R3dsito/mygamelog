import { useState } from "react";
import axios from "axios";

const useSearchUsers = () => {
  const [state, setState] = useState("idle");
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  const searchUsers = async (query) => {
    if (!query) {
      setData([]);
      return;
    }

    setState("loading");

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/users/search?q=${query}`
      );
      setData(res.data);
      setState("success");
    } catch (err) {
      setError(err);
      setState("error");
    }
  };

  return { state, data, error, searchUsers };
};

export default useSearchUsers;
