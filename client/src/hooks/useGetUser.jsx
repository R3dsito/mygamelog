import { useState } from "react";
import axios from "axios";

const useGetUser = (userId) => {
  const [getUserData, setGetUserData] = useState({
    state: "idle",
    data: null,
    error: null,
  });

  const getUser = async () => {
    setGetUserData({ state: "loading", data: null, error: null });

    try {
      console.log(`Buscando usuario con ID: ${userId}`);
      const response = await axios.get(`http://localhost:3000/users/find/${userId}`);
      console.log("Respuesta del servidor:", response.data);

      const data = response.data;
      setGetUserData({ state: "success", data: data, error: null });
    } catch (error) {
      console.error("Error al obtener los datos del usuario:", error);
      setGetUserData({ state: "error", data: null, error });
    }
  };

  return {
    state: getUserData.state,
    data: getUserData.data,
    error: getUserData.error,
    getUser,
  };
};

export default useGetUser;
