// src/components/AppHeader/AppHeader.tsx
import { Navbar, Container, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../Routes';
import logo from '../../assets/logo.jpg'; 
import './AppHeader.css';

export default function AppHeader() {
  return (
    <Navbar bg="light" expand="lg" className="app-header">
      <Container>
        <div className="app-header__logo-wrap">
          <img src={logo} alt="Логотип" className="app-header__logo" />
        </div>

        <Navbar.Toggle aria-controls="main-navbar" />

        <Navbar.Collapse id="main-navbar">
          <Nav className="ms-auto">
            <Nav.Link as={Link} to={ROUTES.MAIN}>
              Главная
            </Nav.Link>
            <Nav.Link as={Link} to={ROUTES.TIRES}>
              Шины
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}