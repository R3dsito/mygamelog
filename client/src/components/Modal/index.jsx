import { useRef } from "react";

const Modal = ({ children, isOpen, setIsOpen, title }) => {
  const modalRef = useRef(null);

  const handleCloseModal = (e) => {
    if (e.target === e.currentTarget) {
      if (modalRef.current) {
        modalRef.current.classList.add("modal--is-closed");

        setTimeout(() => {
          setIsOpen(false);
          modalRef.current.classList.remove("modal--is-closed");
        }, 300);
      }
    }
  };

  return (
    <div
      ref={modalRef}
      className={`modal-overlay${isOpen ? " modal-overlay--is-open" : ""}`}
      onClick={handleCloseModal}
    >
      <div id="modal" className="modal">
        <div className="modal__title">
          <p>{title}</p>

          <div className="modal__close-button" onClick={() => setIsOpen(false)}>
            <i className="fa-solid fa-xmark"></i>
          </div>
        </div>
        <div className="modal__content">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
