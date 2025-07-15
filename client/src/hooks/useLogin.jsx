// useLogin.jsx
import { useState, useContext } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { AuthContext } from "@/contexts/AuthContext"; // Asegurate de que la ruta esté bien

const useLogin = ({ email, password }) => {
  const [loginData, setLoginData] = useState({
    state: "idle",
    data: null,
    error: null,
  });

  const { setUser } = useContext(AuthContext);

  const login = async () => {
    setLoginData({ state: "loading", data: null, error: null });

    try {
      const response = await axios.post(`http://localhost:3000/users/login`, {
        email,
        password,
      });

      const data = response.data;

      // Guardar token en cookies
      Cookies.set("jwToken", data.jwToken, { expires: 3 });

      // Decodificar el token y actualizar el contexto
      const decoded = jwtDecode(data.jwToken);

      // ⚠️ Verificá la estructura del token decodificado
      if (decoded?.usuario) {
        setUser({
          name: decoded.usuario.name,
          id: decoded.usuario._id,
          username: decoded.usuario.username,
        });
      }

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
