import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Favorite, Loader, Review } from "@/components";
import PlaylistCard from "@/components/PlaylistCard";
import PlaylistDetailModal from "@/components/PlaylistDetailModal";

import landscape from "@/assets/landscape2.jpg"

import useDebounce from "@/hooks/useDebounce";
import useGetGames from "@/hooks/useGetGames";
import useGetSuggestions from "@/hooks/useGetSuggestions";
import useGetFeed from "@/hooks/useGetFeed";
import useGetTrendingPlaylists from "@/hooks/useGetTrendingPlaylists";

const Home = () => {
  const navigate = useNavigate();

  const [searchValue, setSearchValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedGame, setSelectedGame] = useState("");
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);

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

  const {
    state: feedState,
    data: feedData,
    getFeed,
  } = useGetFeed();

  const {
    state: trendingState,
    data: trendingData,
    getTrendingPlaylists,
  } = useGetTrendingPlaylists();

  const handleOnChange = (e) => {
    setSearchValue(e.target.value);
  };

  const handleSelectResult = (id) => {
    setSelectedGame(id);
    setShowSuggestions(false);
  };

  useEffect(() => {
    getSuggestions();
    getFeed();
    getTrendingPlaylists();
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
  return (
    <div className="home">
      <div className="home__banner">
      </div>
      <h1>¡Encontrá tu juego!</h1>

      <div className="home__searcher">
        <input
          type="text"
          placeholder="Buscar juegos..."
          value={searchValue}
          onChange={handleOnChange}
          aria-label="Buscar juegos"
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
                <p>{error?.response?.data?.error ?? "No se pudo conectar con el servidor."}</p>
              </div>
            )}

            {state === "success" &&
              data.map((result) => (
                <button
                  key={result.id}
                  type="button"
                  className="home__results__result"
                  onClick={() => handleSelectResult(result.id)}
                >
                  <div>
                    <img src={result.background_image} alt={result.name} />
                  </div>

                  <p>{result.name}</p>
                </button>
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

        {suggestionsState === "error" && (
          <p className="home__suggestions__error">
            No se pudieron cargar las sugerencias en este momento.
          </p>
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

      <div className="home__community">
        <div className="home__feed">
          <div className="home__feed__header">
            <h2>Actividad de la comunidad</h2>
            <Link to="/feed" className="home__feed__link">
              Ver todo el feed <i className="fa-solid fa-arrow-right"></i>
            </Link>
          </div>

          {feedState === "loading" && (
            <div className="home__feed__loading">
              <Loader />
            </div>
          )}

          {feedState === "success" && feedData.length === 0 && (
            <p className="home__feed__empty">Aún no hay reseñas publicadas.</p>
          )}

          <div className="home__feed__list">
            {feedState === "success" &&
              feedData.slice(0, 5).map((post) => (
                <Review
                  key={post._id}
                  username={post.userId?.username}
                  imagen={post.userId?.imagen}
                  gameId={post.gameId}
                  gameName={post.gameName}
                  imageUrl={post.imageUrl}
                  content={post.content}
                  rating={post.rating}
                  postId={post._id}
                  likes={post.likes || []}
                />
              ))}
          </div>
        </div>

        <aside className="home__trending">
          <div className="home__trending__header">
            <h2>Playlists en tendencia</h2>
          </div>

          {trendingState === "loading" && (
            <div className="home__trending__loading">
              <Loader />
            </div>
          )}

          {trendingState === "success" && trendingData.length === 0 && (
            <p className="home__trending__empty">
              Aún no hay playlists con juegos.
            </p>
          )}

          <div className="home__trending__list">
            {trendingState === "success" &&
              trendingData.map((playlist) => (
                <div key={playlist._id} className="home__trending__item">
                  <PlaylistCard
                    playlist={playlist}
                    isOwner={false}
                    onClick={() => setSelectedPlaylist(playlist)}
                  />
                  {playlist.userId?.username && (
                    <p className="home__trending__owner">
                      por {playlist.userId.username}
                    </p>
                  )}
                </div>
              ))}
          </div>
        </aside>
      </div>

      {selectedPlaylist && (
        <PlaylistDetailModal
          playlist={selectedPlaylist}
          onClose={() => setSelectedPlaylist(null)}
        />
      )}
    </div>
  );
};

export default Home;
