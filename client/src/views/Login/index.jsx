import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import useLogin from "@/hooks/useLogin";

const Login = () => {
  const navigate = useNavigate();

  const [userData, setUserData] = useState({
    email: "",
    password: "",
  });

  const { state, error, login } = useLogin({
    email: userData.email,
    password: userData.password,
  });

  const handleLogin = (e) => {
    e.preventDefault();
    login();
  };

  useEffect(() => {
    if (state === "success") {
      navigate("/");
    }
  }, [state]);

  return (
    <div className="login">
      <div className="card">
        <h2>Iniciar Sesión</h2>

        <form>
          <input
            placeholder="Email"
            type="email"
            value={userData.email}
            onChange={(e) =>
              setUserData({ ...userData, email: e.target.value })
            }
          />

          <input
            placeholder="Contraseña"
            type="password"
            value={userData.password}
            onChange={(e) =>
              setUserData({ ...userData, password: e.target.value })
            }
          />

          <button onClick={handleLogin}>Ingresar</button>

          {error && (
            <p className="error-message">
              <i className="fa-solid fa-circle-exclamation"></i>
              {error.response.data.error}
            </p>
          )}
        </form>

        <p>
          ¡Si no tenés una cuenta, podés{" "}
          <NavLink to="/register">registrarte</NavLink> acá!
        </p>
      </div>
    </div>
  );
};

export default Login;
