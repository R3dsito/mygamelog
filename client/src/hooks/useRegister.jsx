import { useState } from "react";
import axios from "axios";

const useRegister = () => {
  const [registerData, setRegisterData] = useState({
    state: "idle",
    data: null,
    error: null,
  });

  const register = async (userData) => {
    setRegisterData({ state: "loading", data: null, error: null });

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/users/register`, userData
      );

      const data = response.data;

      setRegisterData({ state: "success", data, error: null });
    } catch (error) {
      setRegisterData({ state: "error", data: null, error });
    }
  };

  return {
    state: registerData.state,
    data: registerData.data,
    error: registerData.error,
    register,
  };
};

export default useRegister;
