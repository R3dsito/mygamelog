import { useContext, useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "@/contexts/AuthContext";
import useSearchUsers from "@/hooks/useSearchUsers";
import useDebounce from "@/hooks/useDebounce";
import LOGO from "@/assets/my-game-log-logo.png";

const PROFILE_PICTURE = "https://pbs.twimg.com/media/Fvpd8chWcAEPllN.jpg";

const Navbar = () => {
  const { user, logoutUser } = useContext(AuthContext);
  const { data = [], searchUsers } = useSearchUsers();
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (debouncedQuery.trim().length > 0) {
      searchUsers(debouncedQuery);
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  }, [debouncedQuery]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectUser = (username) => {
    setQuery("");
    setShowResults(false);
    navigate(`/profile/username/${username}`);
  };

  return (
    <nav className="navbar">
      <NavLink to="/">
        <div>
          <img src={LOGO} alt="Logo" />
          <h1>myGameLog</h1>
        </div>
      </NavLink>

      <div className="navbar__search" ref={searchRef}>
        <input
          type="text"
          placeholder="Buscar usuarios..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim().length > 0 && setShowResults(true)}
        />

        {showResults && data.length > 0 && (
          <div className="navbar__search__results">
            {data.map((u) => (
              <div
                key={u._id}
                className="navbar__search__result"
                onClick={() => handleSelectUser(u.username)}
              >
                <img src={u.imagen || PROFILE_PICTURE} alt={u.username} />
                <p>{u.username}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <ul>
        <li>
          <NavLink to="/">
            <i className="fa-solid fa-gamepad"></i>Home
          </NavLink>
        </li>

        <li>
          <NavLink to="/feed">
            <i className="fa-solid fa-newspaper"></i>Feed
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
