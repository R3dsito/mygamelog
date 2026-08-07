import { Link } from "react-router-dom";
import "./styles.scss";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <Link to="/" className="footer__wordmark brand-wordmark">
            myGameLog
          </Link>
          <p className="footer__tagline">Tu backlog, en un solo lugar.</p>
        </div>

        <nav className="footer__nav" aria-label="Enlaces del pie de página">
          <Link to="/">Home</Link>
          <Link to="/feed">Feed</Link>
        </nav>

        <p className="footer__credit">
          Datos de juegos por{" "}
          <a href="https://www.igdb.com" target="_blank" rel="noopener noreferrer">
            IGDB
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
