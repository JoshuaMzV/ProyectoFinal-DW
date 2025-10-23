import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext'; // <-- Usamos nuestro hook!

const AppNavbar = () => {
    const { user, logout } = useAuth(); // Obtenemos el usuario y la función de logout
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <Navbar expand="lg" className="app-navbar mb-3">
            <Container>
                <Navbar.Brand as={Link} to="/">Sistema de Votaciones</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ms-auto">
                        {user ? (
                            // Si hay un usuario, muestra su nombre y primer apellido y el botón de logout
                            <NavDropdown title={
                                <span className="welcome-label">
                                    <span className="welcome-text">Bienvenido,</span>
                                    <span className="welcome-name"> {user.nombre ? user.nombre.split(' ')[0] : ''} {user.apellido ? user.apellido.split(' ')[0] : ''}</span>
                                </span>
                            } id="basic-nav-dropdown">
                                {user.rol === 'admin' && (
                                    <NavDropdown.Item as={Link} to="/admin">Panel Admin</NavDropdown.Item>
                                )}
                                <NavDropdown.Item onClick={handleLogout}>
                                    Cerrar Sesión
                                </NavDropdown.Item>
                            </NavDropdown>
                        ) : (
                            // Si no hay usuario, muestra los links de login y registro
                            <>
                                <Nav.Link className="animated-link" as={Link} to="/login">Iniciar Sesión</Nav.Link>
                                <Nav.Link className="animated-link" as={Link} to="/register">Registrarse</Nav.Link>
                            </>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default AppNavbar;