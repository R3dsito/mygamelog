import { useRef, useCallback, useId } from "react";
import useFocusTrap from "@/hooks/useFocusTrap";

const Modal = ({ children, isOpen, setIsOpen, title, className = "" }) => {
  const overlayRef = useRef(null);
  const titleId = useId();

  const close = useCallback(() => {
    if (overlayRef.current) {
      overlayRef.current.classList.add("modal--is-closed");

      setTimeout(() => {
        setIsOpen(false);
        overlayRef.current?.classList.remove("modal--is-closed");
      }, 300);
    } else {
      setIsOpen(false);
    }
  }, [setIsOpen]);

  const dialogRef = useFocusTrap(isOpen, close);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) close();
  };

  return (
    <div
      ref={overlayRef}
      className={`modal-overlay${isOpen ? " modal-overlay--is-open" : ""}`}
      onClick={handleOverlayClick}
    >
      <div
        id="modal"
        ref={dialogRef}
        className={`modal${className ? ` ${className}` : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <div className="modal__title">
          <p id={titleId}>{title}</p>

          <button
            type="button"
            className="modal__close-button"
            onClick={close}
            aria-label="Cerrar"
          >
            <i className="fa-solid fa-xmark" aria-hidden="true"></i>
          </button>
        </div>
        <div className="modal__content">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
