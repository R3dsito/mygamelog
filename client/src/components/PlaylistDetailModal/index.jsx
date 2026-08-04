import { Link } from "react-router-dom";
import "./styles.scss";

const PlaylistDetailModal = ({ playlist, onClose }) => {
  return (
    <div className="pdm-overlay" onClick={onClose}>
      <div className="pdm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="pdm-modal__header">
          <div>
            <p className="pdm-modal__count">
              {playlist.games.length}{" "}
              {playlist.games.length === 1 ? "juego" : "juegos"}
            </p>
            <h3 className="pdm-modal__title">{playlist.name}</h3>
            {playlist.description && (
              <p className="pdm-modal__desc">{playlist.description}</p>
            )}
            {playlist.userId?.username && (
              <Link
                to={`/profile/username/${playlist.userId.username}`}
                className="pdm-modal__owner"
                onClick={onClose}
              >
                por @{playlist.userId.username}
              </Link>
            )}
          </div>
          <button className="pdm-modal__close" onClick={onClose}>
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        {playlist.games.length === 0 ? (
          <p className="pdm-modal__empty">Esta playlist no tiene juegos aún.</p>
        ) : (
          <ul className="pdm-modal__grid">
            {playlist.games.map((game) => (
              <li key={game.gameId}>
                <Link
                  to={`/game-details?id=${game.gameId}`}
                  className="pdm-modal__poster"
                  title={game.gameName}
                  onClick={onClose}
                >
                  <img src={game.imageUrl} alt={game.gameName} />
                  <span className="pdm-modal__poster-name">{game.gameName}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default PlaylistDetailModal;
