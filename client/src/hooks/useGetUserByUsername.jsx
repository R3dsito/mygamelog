import { useState } from "react";
import axios from "axios";

const useGetUserByUsername = (username) => {
  const [getUserData, setGetUserData] = useState({
    state: "idle",
    data: null,
    error: null,
  });

  const getUserByUsername = async () => {
    setGetUserData({ state: "loading", data: null, error: null });

    try {
      const response = await axios.get(`http://localhost:3000/users/find/username/${username}`);
      const data = response.data;

      setGetUserData({ state: "success", data: data, error: null });
    } catch (error) {
      console.error("Error al obtener los datos del usuario por username:", error);
      setGetUserData({ state: "error", data: null, error });
    }
  };

  return {
    state: getUserData.state,
    data: getUserData.data,
    error: getUserData.error,
    getUserByUsername,
  };
};

export default useGetUserByUsername;