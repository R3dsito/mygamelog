import { useCallback, useEffect, useState } from "react";

/**
 * Navegación con flechas para un combobox con lista de resultados.
 *
 * El foco NO se mueve a las opciones: se queda en el input y la opción
 * activa se comunica con aria-activedescendant, que es el patrón esperado
 * para un buscador. Enter elige, Escape cierra.
 *
 * @param itemCount  cantidad de resultados visibles
 * @param isOpen     si la lista está desplegada
 * @param onSelect   recibe el índice elegido
 * @param onDismiss  cierra la lista
 */
const useListboxNavigation = ({ itemCount, isOpen, onSelect, onDismiss }) => {
  const [activeIndex, setActiveIndex] = useState(-1);

  // Al cambiar los resultados, la opción activa anterior deja de ser válida.
  useEffect(() => {
    setActiveIndex(-1);
  }, [itemCount, isOpen]);

  const handleKeyDown = useCallback(
    (e) => {
      if (!isOpen || itemCount === 0) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setActiveIndex((i) => (i + 1) % itemCount);
          break;
        case "ArrowUp":
          e.preventDefault();
          setActiveIndex((i) => (i <= 0 ? itemCount - 1 : i - 1));
          break;
        case "Home":
          e.preventDefault();
          setActiveIndex(0);
          break;
        case "End":
          e.preventDefault();
          setActiveIndex(itemCount - 1);
          break;
        case "Enter":
          if (activeIndex >= 0) {
            e.preventDefault();
            onSelect(activeIndex);
          }
          break;
        case "Escape":
          e.preventDefault();
          onDismiss();
          setActiveIndex(-1);
          break;
        default:
          break;
      }
    },
    [isOpen, itemCount, activeIndex, onSelect, onDismiss]
  );

  return { activeIndex, setActiveIndex, handleKeyDown };
};

export default useListboxNavigation;
