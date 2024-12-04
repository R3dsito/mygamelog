import { useState } from "react";
import axios from "axios";

const useGetSuggestions = () => {
  const [getSuggestionsData, setGetSuggestionsData] = useState({
    state: "idle",
    data: null,
    error: null,
  });

  const getSuggestions = async () => {
    setGetSuggestionsData({ state: "loading", data: null, error: null });

    try {
      const response = await axios.get(`http://localhost:3000/games/random`);

      const data = response.data;

      setGetSuggestionsData({ state: "success", data, error: null });
    } catch (error) {
      setGetSuggestionsData({ state: "error", data: null, error });
    }
  };

  return {
    state: getSuggestionsData.state,
    data: getSuggestionsData.data,
    error: getSuggestionsData.error,
    getSuggestions,
  };
};

export default useGetSuggestions;
