import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import useRegister from "@/hooks/useRegister";

const Register = () => {
  const navigate = useNavigate();
  const [localError, setLocalError] = useState("");

  const [userData, setUserData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });

  const { state, error, register } = useRegister();

  const handleRegister = (e) => {
    e.preventDefault();
    setLocalError("");
    if (!userData.name.trim()) return setLocalError("Ingresá tu nombre.");
    if (!userData.username.trim()) return setLocalError("Elegí un nombre de usuario.");
    if (!userData.email.trim()) return setLocalError("Ingresá tu email.");
    if (!userData.password) return setLocalError("Ingresá una contraseña.");
    if (userData.password.length < 6) return setLocalError("La contraseña debe tener al menos 6 caracteres.");
    register(userData);
  };

  useEffect(() => {
    if (state === "success") {
      navigate(`/`);
    }
  }, [state]);

  const displayError = localError || (error ? (error.response?.data?.error ?? "Error al registrarse. Intentá de nuevo.") : null);

  return (
    <div className="register">
      <div className="card">
        <h1>Creá tu cuenta</h1>

        <form onSubmit={handleRegister}>
          <div className="card__field">
            <label htmlFor="register-name">Nombre</label>
            <input
              id="register-name"
              placeholder="Tu nombre"
              type="text"
              value={userData.name}
              onChange={(e) => setUserData({ ...userData, name: e.target.value })}
              aria-label="Nombre"
            />
          </div>

          <div className="card__field">
            <label htmlFor="register-username">Usuario</label>
            <input
              id="register-username"
              placeholder="@username"
              type="text"
              value={userData.username}
              onChange={(e) =>
                setUserData({ ...userData, username: e.target.value })
              }
              aria-label="Nombre de usuario"
            />
          </div>

          <div className="card__field">
            <label htmlFor="register-email">Email</label>
            <input
              id="register-email"
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
            <label htmlFor="register-password">Contraseña</label>
            <input
              id="register-password"
              placeholder="Mínimo 6 caracteres"
              type="password"
              value={userData.password}
              onChange={(e) =>
                setUserData({ ...userData, password: e.target.value })
              }
              aria-label="Contraseña"
            />
          </div>

          <button type="submit">Registrarse</button>

          {displayError && (
            <p className="error-message">
              <i className="fa-solid fa-circle-exclamation"></i>
              {displayError}
            </p>
          )}
        </form>

        <p>
          ¡Si ya tenés una cuenta, iniciá sesión{" "}
          <NavLink to="/login">acá</NavLink>!
        </p>
      </div>
    </div>
  );
};

export default Register;
