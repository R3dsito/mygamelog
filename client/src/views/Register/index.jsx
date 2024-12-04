import { useState, useEffect } from "react";

import { NavLink, useNavigate } from "react-router-dom";

import useRegister from "@/hooks/useRegister";

const Register = () => {
  const navigate = useNavigate();

  const [userData, setUserData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });

  const { state, error, register } = useRegister();

  const handleRegister = (e) => {
    e.preventDefault();
    register(userData);
  };

  useEffect(() => {
    if (state === "success") {
      navigate(`/`);
    }
  }, [state]);

  return (
    <div className="register">
      <div className="card">
        <h2>Creá tu cuenta</h2>

        <form>
          <input
            placeholder="Nombre"
            type="text"
            value={userData.name}
            onChange={(e) => setUserData({ ...userData, name: e.target.value })}
          />

          <input
            placeholder="Username"
            type="text"
            value={userData.username}
            onChange={(e) =>
              setUserData({ ...userData, username: e.target.value })
            }
          />

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

          <button onClick={handleRegister}>Registrarse</button>

          {error && (
            <p className="error-message">
              <i className="fa-solid fa-circle-exclamation"></i>
              {error.response.data.error}
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
