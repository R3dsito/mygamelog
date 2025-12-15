import { useState } from "react";
import axios from "axios";

const useSearchUser = () => {
  const [searchState, setSearchState] = useState({
    state: "idle",
    data: null,
    error: null,
  });

  const searchUser = async (username) => {
    setSearchState({ state: "loading", data: null, error: null });

    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/username/${username}`);
      setSearchState({ state: "success", data: response.data, error: null });
    } catch (error) {
      setSearchState({ state: "error", data: null, error });
    }
  };

  return {
    state: searchState.state,
    data: searchState.data,
    error: searchState.error,
    searchUser,
  };
};

export default useSearchUser;
