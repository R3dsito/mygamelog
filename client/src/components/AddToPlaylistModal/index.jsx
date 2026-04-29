import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/contexts/AuthContext";
import useGetUserPlaylists from "@/hooks/useGetUserPlaylists";
import useManagePlaylists from "@/hooks/useManagePlaylists";
import "./styles.scss";

const AddToPlaylistModal = ({ game, onClose }) => {
  const { user } = useContext(AuthContext);
  const { data: playlists, fetchPlaylists, setData } = useGetUserPlaylists();
  const { createPlaylist, addGame, removeGame } = useManagePlaylists();

  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.id) fetchPlaylists(user.id);
  }, [user?.id]);

  const isGameInPlaylist = (playlist) =>
    playlist.games.some((g) => g.gameId === String(game.gameId));

  const handleToggle = async (playlist) => {
    setLoading(true);
    try {
      if (isGameInPlaylist(playlist)) {
        const res = await removeGame(playlist._id, String(game.gameId));
        setData((prev) => prev.map((p) => (p._id === playlist._id ? res.data : p)));
      } else {
        const res = await addGame(playlist._id, {
          gameId: String(game.gameId),
          gameName: game.gameName,
          imageUrl: game.imageUrl,
        });
        setData((prev) => prev.map((p) => (p._id === playlist._id ? res.data : p)));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setLoading(true);
    try {
      const res = await createPlaylist(newName.trim());
      setData((prev) => [...prev, res.data]);
      setNewName("");
      setCreating(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="atp-overlay" onClick={onClose}>
      <div className="atp-modal" onClick={(e) => e.stopPropagation()}>
        <div className="atp-modal__header">
          <div>
            <h3 className="atp-modal__title">Agregar a playlist</h3>
            <p className="atp-modal__game">{game.gameName}</p>
          </div>
          <button className="atp-modal__close" onClick={onClose}>
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <ul className="atp-modal__list">
          {playlists.map((playlist) => {
            const inList = isGameInPlaylist(playlist);
            return (
              <li key={playlist._id} className="atp-modal__item">
                <button
                  className={`atp-modal__toggle${inList ? " atp-modal__toggle--active" : ""}`}
                  onClick={() => handleToggle(playlist)}
                  disabled={loading}
                >
                  <i className={`fa-${inList ? "solid" : "regular"} fa-bookmark`} />
                  <span>{playlist.name}</span>
                  <span className="atp-modal__count">{playlist.games.length} juegos</span>
                </button>
              </li>
            );
          })}
        </ul>

        {creating ? (
          <div className="atp-modal__create">
            <input
              type="text"
              placeholder="Nombre de la playlist"
              maxLength={50}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              autoFocus
            />
            <div className="atp-modal__create-actions">
              <button onClick={() => setCreating(false)}>Cancelar</button>
              <button onClick={handleCreate} disabled={!newName.trim() || loading}>
                Crear
              </button>
            </div>
          </div>
        ) : (
          <button className="atp-modal__new" onClick={() => setCreating(true)}>
            <i className="fa-solid fa-plus" /> Nueva playlist
          </button>
        )}
      </div>
    </div>
  );
};

export default AddToPlaylistModal;
