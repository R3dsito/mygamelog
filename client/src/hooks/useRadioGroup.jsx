import { useRef } from "react";

/**
 * Semántica de radiogroup con roving tabindex.
 *
 * El grupo entero ocupa una sola parada de tabulación: se entra con Tab y
 * se elige con las flechas, en vez de tabular por cada opción. Home y End
 * saltan a los extremos. Mover el foco también selecciona, que es el
 * comportamiento esperado de un grupo de radios.
 *
 * @param count          cantidad de opciones
 * @param selectedIndex  índice seleccionado, o -1 si ninguno
 * @param onSelect       recibe el índice elegido
 */
const useRadioGroup = ({ count, selectedIndex, onSelect }) => {
  const itemRefs = useRef([]);

  const moveTo = (index) => {
    const next = (index + count) % count;
    itemRefs.current[next]?.focus();
    onSelect(next);
  };

  const handleKeyDown = (e, index) => {
    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
        e.preventDefault();
        moveTo(index + 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        e.preventDefault();
        moveTo(index - 1);
        break;
      case "Home":
        e.preventDefault();
        moveTo(0);
        break;
      case "End":
        e.preventDefault();
        moveTo(count - 1);
        break;
      default:
        break;
    }
  };

  // Sin selección, la parada de tabulación es la primera opción.
  const tabStop = selectedIndex >= 0 ? selectedIndex : 0;

  const getRadioProps = (index) => ({
    role: "radio",
    "aria-checked": index === selectedIndex,
    tabIndex: index === tabStop ? 0 : -1,
    ref: (el) => {
      itemRefs.current[index] = el;
    },
    onKeyDown: (e) => handleKeyDown(e, index),
  });

  return { getRadioProps };
};

export default useRadioGroup;
