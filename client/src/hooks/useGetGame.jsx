import { useState } from "react";
import axios from "axios";

const useGetGame = ({ value }) => {
  const [getGameData, setGetGameData] = useState({
    state: "idle",
    data: null,
    error: null,
  });

  const getGame = async () => {
    setGetGameData({ state: "loading", data: null, error: null });

    try {
      const response = await axios.get(`http://localhost:3000/games/${value}`);

      const data = response.data;

      setGetGameData({ state: "success", data, error: null });
    } catch (error) {
      setGetGameData({ state: "error", data: null, error });
    }
  };

  return {
    state: getGameData.state,
    data: getGameData.data,
    error: getGameData.error,
    getGame,
  };
};

export default useGetGame;
