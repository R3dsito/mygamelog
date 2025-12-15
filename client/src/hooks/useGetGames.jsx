import { useState } from "react";
import axios from "axios";

const useGetGames = ({ value }) => {
  const [getGamesData, setGetGamesData] = useState({
    state: "idle",
    data: null,
    error: null,
  });

  const getGames = async () => {
    setGetGamesData({ state: "loading", data: null, error: null });

    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/games/search`, {
        params: { search: value },
      });

      const data = response.data.results;

      setGetGamesData({ state: "success", data, error: null });
    } catch (error) {
      setGetGamesData({ state: "error", data: null, error });
    }
  };

  return {
    state: getGamesData.state,
    data: getGamesData.data,
    error: getGamesData.error,
    getGames,
  };
};

export default useGetGames;
