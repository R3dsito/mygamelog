const Loader = ({ label = "Cargando" }) => {
  return (
    <span className="loader" role="status" aria-live="polite">
      <span className="visually-hidden">{label}</span>
    </span>
  );
};

export default Loader;
