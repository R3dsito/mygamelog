import { useContext, useState } from "react";
import { NavLink } from "react-router-dom";
import { AuthContext } from "@/contexts/AuthContext";
import useSearchUsers from "@/hooks/useSearchUsers";
import LOGO from "@/assets/my-game-log-logo.png";

const PROFILE_PICTURE =
  "https://pbs.twimg.com/media/Fvpd8chWcAEPllN.jpg";

const Navbar = () => {
  const { user, logoutUser } = useContext(AuthContext);
  const { results = [], searchUsers } = useSearchUsers();
  const [query, setQuery] = useState("");

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.trim().length > 0) {
      searchUsers(value);
    }
  };

  const showResults = query.length > 0 && results.length > 0;

  return (
    <nav className="navbar">
      <NavLink to="/">
        <div>
          <img src={LOGO} alt="Logo" />
          <h1>myGameLog</h1>
        </div>
      </NavLink>

      {/* <div className="home__searcher">
        <input
          type="text"
          placeholder="Buscar usuarios..."
          value={query}
          onChange={handleChange}
        />

        {showResults && (
          <div className="home__results">
            {results.map((u) => (
              <NavLink
                key={u._id}
                to={`/profile/username/${u.username}`}
                className="home__results__result"
                onClick={() => setQuery("")}
              >
                <div>
                  <img
                    src={u.imagen || PROFILE_PICTURE}
                    alt={u.username}
                  />
                </div>
                <p>{u.username}</p>
              </NavLink>
            ))}
          </div>
        )}
      </div> */}

      <ul>
        <li>
          <NavLink to="/">
            <i className="fa-solid fa-gamepad"></i>Home
          </NavLink>
        </li>

        {user && (
          <li>
            <NavLink to={`/profile/username/${user.username}`}>
              <i className="fa-solid fa-user"></i>
              {user.username}
            </NavLink>
          </li>
        )}

        {user ? (
          <li>
            <button onClick={logoutUser}>
              <NavLink to="/login">
                <i className="fa-solid fa-right-from-bracket"></i>
                Cerrar Sesión
              </NavLink>
            </button>
          </li>
        ) : (
          <li>
            <NavLink to="/login">
              <i className="fa-solid fa-right-to-bracket"></i>
              Iniciar Sesión
            </NavLink>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
