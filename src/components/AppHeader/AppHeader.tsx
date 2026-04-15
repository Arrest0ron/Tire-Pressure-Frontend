import { Link } from "react-router-dom";
import logo from "../../assets/logo.jpg";
import "./AppHeader.css";

export default function AppHeader() {
return (
    <header className="header">
      <nav className="header-inner" aria-label="Основная навигация">
        <Link to="/" className="logo">
          <img src={logo} alt="Логотип" />
        </Link>
      </nav>
    </header>
  );
}
