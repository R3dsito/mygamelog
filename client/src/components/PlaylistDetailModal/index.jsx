import "./styles.scss";

const PlaylistDetailModal = ({ playlist, onClose }) => {
  return (
    <div className="pdm-overlay" onClick={onClose}>
      <div className="pdm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="pdm-modal__header">
          <div>
            <h3 className="pdm-modal__title">{playlist.name}</h3>
            {playlist.description && (
              <p className="pdm-modal__desc">{playlist.description}</p>
            )}
          </div>
          <button className="pdm-modal__close" onClick={onClose}>
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        {playlist.games.length === 0 ? (
          <p className="pdm-modal__empty">Esta playlist no tiene juegos aún.</p>
        ) : (
          <ul className="pdm-modal__list">
            {playlist.games.map((game) => (
              <li key={game.gameId} className="pdm-modal__item">
                <img src={game.imageUrl} alt={game.gameName} className="pdm-modal__cover" />
                <span className="pdm-modal__name">{game.gameName}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default PlaylistDetailModal;
