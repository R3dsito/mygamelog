const FollowersModal = ({ followers, onClose }) => {
  return (
    <div className="modal">
      <div className="modal__content">
        <h3>Seguidores</h3>
        <button onClick={onClose}>Cerrar</button>
        <ul>
          {followers.map((follower) => (
            <li key={follower._id}>{follower.imagen}{follower.username}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FollowersModal;