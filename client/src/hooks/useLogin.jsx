import { useState } from "react";
import axios from "axios";
import cookies from "js-cookie";

const useLogin = ({ email, password }) => {
  const [loginData, setLoginData] = useState({
    state: "idle",
    data: null,
    error: null,
  });

  const login = async () => {
    setLoginData({ state: "loading", data: null, error: null });

    try {
      const response = await axios.post(`http://localhost:3000/users/login`, {
        email,
        password,
      });

      const data = response.data;

      cookies.set("jwToken", response.data.jwToken, { expires: 3 });

      setLoginData({ state: "success", data, error: null });
    } catch (error) {
      setLoginData({ state: "error", data: null, error });
    }
  };

  return {
    state: loginData.state,
    data: loginData.data,
    error: loginData.error,
    login,
  };
};

export default useLogin;