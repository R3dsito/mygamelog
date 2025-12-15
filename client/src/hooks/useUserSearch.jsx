import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const UserSearch = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/search?query=${query}`);
      setResults(response.data); // Asegurate de que sea un array de usuarios
    } catch (error) {
      console.error("Error al buscar usuarios:", error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectUser = (userId) => {
    navigate(`/profile/${userId}`);
  };

  return (
    <div className="user-search">
      <input
        type="text"
        placeholder="Buscar usuario..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
      />
      <button onClick={handleSearch} disabled={isSearching}>
        {isSearching ? "Buscando..." : "Buscar"}
      </button>

      <ul className="user-search__results">
        {results.map((user) => (
          <li key={user._id} onClick={() => handleSelectUser(user._id)}>
            {user.username}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserSearch;
