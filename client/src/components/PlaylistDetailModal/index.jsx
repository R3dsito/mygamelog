import { useId } from "react";
import { Link } from "react-router-dom";
import useFocusTrap from "@/hooks/useFocusTrap";
import "./styles.scss";

const PlaylistDetailModal = ({ playlist, onClose }) => {
  const titleId = useId();
  const dialogRef = useFocusTrap(true, onClose);

  return (
    <div className="pdm-overlay" onClick={onClose}>
      <div
        className="pdm-modal"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pdm-modal__header">
          <div>
            <p className="pdm-modal__count">
              {playlist.games.length}{" "}
              {playlist.games.length === 1 ? "juego" : "juegos"}
            </p>
            <h3 className="pdm-modal__title" id={titleId}>{playlist.name}</h3>
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
          <button
            type="button"
            className="pdm-modal__close"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <i className="fa-solid fa-xmark" aria-hidden="true" />
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
