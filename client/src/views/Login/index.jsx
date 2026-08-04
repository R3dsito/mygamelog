import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import useLogin from "@/hooks/useLogin";

const Login = () => {
  const navigate = useNavigate();
  const [localError, setLocalError] = useState("");

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
    setLocalError("");
    if (!userData.email.trim()) return setLocalError("Ingresá tu email.");
    if (!userData.password) return setLocalError("Ingresá tu contraseña.");
    login();
  };

  useEffect(() => {
    if (state === "success") {
      navigate("/");
    }
  }, [state]);

  const displayError = localError || (error ? (error.response?.data?.error ?? "Error al iniciar sesión. Intentá de nuevo.") : null);

  return (
    <div className="login">
      <div className="card">
        <h1>Iniciar Sesión</h1>

        <form onSubmit={handleLogin}>
          <div className="card__field">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              placeholder="tu@email.com"
              type="email"
              value={userData.email}
              onChange={(e) =>
                setUserData({ ...userData, email: e.target.value })
              }
              aria-label="Email"
            />
          </div>

          <div className="card__field">
            <label htmlFor="login-password">Contraseña</label>
            <input
              id="login-password"
              placeholder="••••••••"
              type="password"
              value={userData.password}
              onChange={(e) =>
                setUserData({ ...userData, password: e.target.value })
              }
              aria-label="Contraseña"
            />
          </div>

          <button type="submit">Ingresar</button>

          {displayError && (
            <p className="error-message">
              <i className="fa-solid fa-circle-exclamation"></i>
              {displayError}
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
