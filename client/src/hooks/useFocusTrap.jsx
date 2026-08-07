import { useEffect, useRef } from "react";

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

/**
 * Hace que un diálogo sea operable con teclado:
 * mueve el foco adentro al abrir, lo mantiene circulando con Tab,
 * cierra con Escape y devuelve el foco al elemento que lo abrió.
 *
 * Devuelve la ref que hay que poner en el contenedor del diálogo.
 */
const useFocusTrap = (isOpen, onClose) => {
  const containerRef = useRef(null);
  const previouslyFocused = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    previouslyFocused.current = document.activeElement;

    const container = containerRef.current;
    if (!container) return;

    const getFocusable = () =>
      [...container.querySelectorAll(FOCUSABLE)].filter(
        (el) => el.offsetParent !== null || el === document.activeElement
      );

    // El primer control del diálogo recibe el foco; si no hay ninguno,
    // lo toma el contenedor para que el lector de pantalla lo anuncie.
    const focusables = getFocusable();
    if (focusables.length > 0) focusables[0].focus();
    else container.focus();

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }

      if (e.key !== "Tab") return;

      const items = getFocusable();
      if (items.length === 0) {
        e.preventDefault();
        return;
      }

      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;

      if (e.shiftKey && (active === first || !container.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
      previouslyFocused.current?.focus?.();
    };
  }, [isOpen, onClose]);

  return containerRef;
};

export default useFocusTrap;
