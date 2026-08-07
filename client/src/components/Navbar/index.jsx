import { useContext, useState, useEffect, useId, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "@/contexts/AuthContext";
import useSearchUsers from "@/hooks/useSearchUsers";
import useDebounce from "@/hooks/useDebounce";
import useListboxNavigation from "@/hooks/useListboxNavigation";
import LOGO from "@/assets/my-game-log-logo.png";
import { DEFAULT_AVATAR } from "@/constants/media";

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

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  const listboxId = useId();
  const listOpen = showResults && data.length > 0;

  const { activeIndex, setActiveIndex, handleKeyDown } = useListboxNavigation({
    itemCount: data.length,
    isOpen: listOpen,
    onSelect: (i) => handleSelectUser(data[i].username),
    onDismiss: () => setShowResults(false),
  });

  return (
    <nav className="navbar" aria-label="Principal">
      <NavLink to="/" aria-label="Inicio — myGameLog">
        <div className="navbar__logo">
          <img src={LOGO} alt="myGameLog" />
        </div>
      </NavLink>

      <div className="navbar__search" ref={searchRef}>
        <input
          type="text"
          placeholder="Buscar usuarios..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim().length > 0 && setShowResults(true)}
          onKeyDown={handleKeyDown}
          aria-label="Buscar usuarios"
          role="combobox"
          aria-expanded={listOpen}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={
            activeIndex >= 0 ? `${listboxId}-opt-${activeIndex}` : undefined
          }
        />

        {listOpen && (
          <ul className="navbar__search__results" id={listboxId} role="listbox">
            {data.map((u, i) => (
              <li
                key={u._id}
                id={`${listboxId}-opt-${i}`}
                role="option"
                aria-selected={i === activeIndex}
                className={`navbar__search__result${
                  i === activeIndex ? " navbar__search__result--active" : ""
                }`}
                onClick={() => handleSelectUser(u.username)}
                onMouseEnter={() => setActiveIndex(i)}
              >
                <img src={u.imagen || DEFAULT_AVATAR} alt="" />
                <p>{u.username}</p>
              </li>
            ))}
          </ul>
        )}

        <span className="visually-hidden" role="status" aria-live="polite">
          {listOpen
            ? `${data.length} ${data.length === 1 ? "usuario encontrado" : "usuarios encontrados"}`
            : ""}
        </span>
      </div>

      <ul>
        <li>
          <NavLink to="/">
            <i className="fa-solid fa-gamepad" aria-hidden="true"></i><span>Home</span>
          </NavLink>
        </li>

        <li>
          <NavLink to="/feed">
            <i className="fa-solid fa-newspaper" aria-hidden="true"></i><span>Feed</span>
          </NavLink>
        </li>

        {user && (
          <li>
            <NavLink to={`/profile/username/${user.username}`}>
              <i className="fa-solid fa-user" aria-hidden="true"></i>
              <span>{user.username}</span>
            </NavLink>
          </li>
        )}

        {user ? (
          <li>
            {/* Un solo control: antes era un NavLink dentro de un button,
                anidamiento interactivo inválido para lectores de pantalla. */}
            <button type="button" onClick={handleLogout}>
              <i className="fa-solid fa-right-from-bracket" aria-hidden="true"></i>
              <span>Cerrar Sesión</span>
            </button>
          </li>
        ) : (
          <li>
            <NavLink to="/login">
              <i className="fa-solid fa-right-to-bracket" aria-hidden="true"></i>
              <span>Iniciar Sesión</span>
            </NavLink>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
