import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Favorite, Loader } from "@/components";

import landscape from "@/assets/landscape2.jpg"

import useDebounce from "@/hooks/useDebounce";
import useGetGames from "@/hooks/useGetGames";
import useGetSuggestions from "@/hooks/useGetSuggestions";

const Home = () => {
  const navigate = useNavigate();

  const [searchValue, setSearchValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedGame, setSelectedGame] = useState("");

  const debouncedSearchValue = useDebounce(searchValue, 500);

  const { state, data, error, getGames } = useGetGames({
    value: debouncedSearchValue,
  });

  const {
    state: suggestionsState,
    data: suggestionsData,
    error: suggestionsError,
    getSuggestions,
  } = useGetSuggestions();

  const handleOnChange = (e) => {
    setSearchValue(e.target.value);
  };

  const handleSelectResult = (id) => {
    setSelectedGame(id);
    setShowSuggestions(false);
  };

  useEffect(() => {
    getSuggestions();
  }, []);

  useEffect(() => {
    if (debouncedSearchValue) {
      getGames();
    }
  }, [debouncedSearchValue]);

  useEffect(() => {
    if (state === "success" || state === "loading") setShowSuggestions(true);
  }, [state]);

  useEffect(() => {
    if (selectedGame) {
      navigate(`/game-details?id=${selectedGame}`);
    }
  }, [selectedGame]);
console.log("suggestionsData:", suggestionsData);
console.log("isArray:", Array.isArray(suggestionsData));
  return (
    <div className="home">
      <div className="home__banner">
      </div>
      <h2>¡Encontrá tu juego!</h2>

      <div className="home__searcher">
        <input
          type="text"
          placeholder="Buscar juegos..."
          value={searchValue}
          onChange={handleOnChange}
        />

        {showSuggestions && (
          <div className="home__results">
            {state === "loading" && (
              <div className="home__results__loading">
                <Loader />
              </div>
            )}

            {state === "error" && (
              <div className="home__results__error">
                <span>
                  <i className="fa-solid fa-bug fa-xl"></i>
                </span>
                <p>Ups! Ha ocurrido un error!</p>
                <p>{error.response.data.error}.</p>
              </div>
            )}

            {state === "success" &&
              data.map((result) => (
                <div
                  key={result.id}
                  className="home__results__result"
                  onClick={() => handleSelectResult(result.id)}
                >
                  <div>
                    <img src={result.background_image} />
                  </div>

                  <p>{result.name}</p>
                </div>
              ))}
          </div>
        )}
      </div>

      <div className="home__suggestions">
        <h2>¡Sugerencias!</h2>

        {suggestionsState === "loading" && (
          <div className="home__suggestions__loading">
            <Loader />
          </div>
        )}

        <div className="home__suggestions__list">
          {suggestionsState === "success" &&
            suggestionsData.slice(2).map((suggestion) => (
              <Favorite
                key={suggestion.id}
                id={suggestion.id}
                name={suggestion.name}
                rating={suggestion.rating}
                image={suggestion.background_image}
              />
            ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
