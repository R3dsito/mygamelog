import { Link } from "react-router-dom";
import Modal from "@/components/Modal";
import { DEFAULT_AVATAR } from "@/constants/media";

/**
 * Modal con una lista de usuarios (seguidores o seguidos).
 * Seguidores y seguidos usaban el mismo bloque duplicado en Profile.
 */
const UserListModal = ({ isOpen, setIsOpen, title, users = [], emptyMessage }) => {
  return (
    <Modal
      closable
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      title={title}
      className="modal--dark"
    >
      {users.length > 0 ? (
        <ul className="modal__user-list">
          {users.map((user) => (
            <li key={user._id}>
              <Link
                to={`/profile/username/${user.username}`}
                className="modal__user-row"
                onClick={() => setIsOpen(false)}
              >
                <img src={user.imagen || DEFAULT_AVATAR} alt="" />
                <span>{user.username}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="modal__empty">{emptyMessage}</p>
      )}
    </Modal>
  );
};

export default UserListModal;
