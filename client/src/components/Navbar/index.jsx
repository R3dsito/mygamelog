import { useContext } from "react";
import { NavLink } from "react-router-dom";

import { AuthContext } from "@/contexts/AuthContext";

import LOGO from "@/assets/my-game-log-logo.png";

const Navbar = () => {
  const { user, logoutUser } = useContext(AuthContext);

  return (
    <nav className="navbar">
      <NavLink to="/">
        <div>
          <img src={LOGO} alt="Logo" />

          <h1>myGameLog</h1>
        </div>
      </NavLink>

      <ul>
        <li>
          <NavLink to="/">
            <i className="fa-solid fa-gamepad"></i>Home
          </NavLink>
        </li>
        
        {user ? (
          <li>
          <NavLink to="/profile">
            <i className="fa-solid fa-user"></i>{user.username}
          </NavLink>
        </li>
        ) : (
          <li>
          <NavLink to="/profile">
            <i className="fa-solid fa-user"></i>Perfil 
          </NavLink>
        </li>
        )}

        {user ? (
          <li>
            <button onClick={logoutUser}>
              <NavLink to="/login">
              <i className="fa-solid fa-right-from-bracket"></i>Cerrar Sesión
              </NavLink>
            </button>
          </li>
        ) : (
          <li>
            <NavLink to="/login">
              <i className="fa-solid fa-right-to-bracket"></i>Iniciar Sesión
            </NavLink>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
