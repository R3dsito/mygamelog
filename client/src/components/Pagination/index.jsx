import "./styles.scss";

/**
 * Paginación prev/siguiente con indicador de posición.
 * El indicador es aria-live para que el cambio de página se anuncie:
 * la lista se reemplaza sin recargar y si no, no habría feedback.
 */
const Pagination = ({ page, totalPages, onChange, label = "Paginación" }) => {
  if (totalPages <= 1) return null;

  return (
    <nav className="pagination" aria-label={label}>
      <button
        type="button"
        className="pagination__button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
      >
        <i className="fa-solid fa-chevron-left" aria-hidden="true" /> Anterior
      </button>

      <p className="pagination__status" aria-live="polite">
        Página {page} de {totalPages}
      </p>

      <button
        type="button"
        className="pagination__button"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
      >
        Siguiente <i className="fa-solid fa-chevron-right" aria-hidden="true" />
      </button>
    </nav>
  );
};

export default Pagination;
