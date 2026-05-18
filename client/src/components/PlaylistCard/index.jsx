import { useState } from "react";
import useManagePlaylists from "@/hooks/useManagePlaylists";
import Modal from "@/components/Modal";
import "./styles.scss";

const PlaylistCard = ({ playlist, isOwner, onDeleted, onUpdated, onClick }) => {
  const { updatePlaylist, deletePlaylist } = useManagePlaylists();
  const [editing, setEditing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [name, setName] = useState(playlist.name);
  const [description, setDescription] = useState(playlist.description || "");

  const covers = playlist.games.slice(0, 3).map((g) => g.imageUrl);

  const handleSave = async () => {
    const res = await updatePlaylist(playlist._id, { name, description });
    onUpdated(res.data);
    setEditing(false);
  };

  const handleDelete = async () => {
    await deletePlaylist(playlist._id);
    setConfirmOpen(false);
    onDeleted(playlist._id);
  };

  return (
    <div className="playlist-card" onClick={!editing ? onClick : undefined} style={{ cursor: onClick && !editing ? "pointer" : "default" }}>
      <div className="playlist-card__covers">
        {covers.length > 0 ? (
          covers.map((url, i) => (
            <img key={i} src={url} alt="" className="playlist-card__cover" />
          ))
        ) : (
          <div className="playlist-card__empty">
            <i className="fa-solid fa-gamepad" />
          </div>
        )}
      </div>

      {editing ? (
        <div className="playlist-card__edit">
          <input
            value={name}
            maxLength={50}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre"
          />
          <input
            value={description}
            maxLength={200}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descripción (opcional)"
          />
          <div className="playlist-card__edit-actions">
            <button onClick={() => setEditing(false)}>Cancelar</button>
            <button onClick={handleSave} disabled={!name.trim()}>Guardar</button>
          </div>
        </div>
      ) : (
        <div className="playlist-card__info">
          <p className="playlist-card__name">{playlist.name}</p>
          {playlist.description && (
            <p className="playlist-card__desc">{playlist.description}</p>
          )}
          <p className="playlist-card__count">{playlist.games.length} juegos</p>
        </div>
      )}

      {isOwner && !editing && (
        <div className="playlist-card__actions" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => setEditing(true)} title="Editar">
            <i className="fa-solid fa-pen" />
          </button>
          <button onClick={() => setConfirmOpen(true)} title="Eliminar">
            <i className="fa-solid fa-trash" />
          </button>
        </div>
      )}

      <Modal isOpen={confirmOpen} setIsOpen={setConfirmOpen} title="Eliminar playlist">
        <div className="playlist-card__confirm">
          <p>¿Querés eliminar <strong>{playlist.name}</strong>? Esta acción no se puede deshacer.</p>
          <div className="playlist-card__confirm-actions">
            <button onClick={() => setConfirmOpen(false)}>Cancelar</button>
            <button className="playlist-card__confirm-delete" onClick={handleDelete}>Eliminar</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PlaylistCard;
