// import { useState } from "react";
// import axios from "axios";

// const useGetSuggestions = () => {
//   const [getSuggestionsData, setGetSuggestionsData] = useState({
//     state: "idle",
//     data: null,
//     error: null,
//   });

//   const getSuggestions = async () => {
//     setGetSuggestionsData({ state: "loading", data: null, error: null });

//     try {
//       const response = await axios.get(`${import.meta.env.VITE_API_URL}/games/random`);

//       const data = response.data;

//       setGetSuggestionsData({ state: "success", data, error: null });
//     } catch (error) {
//       setGetSuggestionsData({ state: "error", data: null, error });
//     }
//   };

//   return {
//     state: getSuggestionsData.state,
//     data: getSuggestionsData.data,
//     error: getSuggestionsData.error,
//     getSuggestions,
//   };
// };

// export default useGetSuggestions;

import { useState } from "react";
import axios from "axios";

const useGetSuggestions = () => {
  const [getSuggestionsData, setGetSuggestionsData] = useState({
    state: "idle",
    data: [],
    error: null,
  });

  const getSuggestions = async () => {
    setGetSuggestionsData({ state: "loading", data: [], error: null });

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/games/random`
      );

      // 👇 AJUSTÁ ESTA LÍNEA SEGÚN TU BACKEND
      const suggestions = Array.isArray(response.data)
        ? response.data
        : response.data.games || response.data.data || [];

      setGetSuggestionsData({
        state: "success",
        data: suggestions,
        error: null,
      });
    } catch (error) {
      setGetSuggestionsData({ state: "error", data: [], error });
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
