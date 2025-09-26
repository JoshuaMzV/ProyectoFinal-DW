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
        <Navbar bg="dark" variant="dark" expand="lg" className="mb-3">
            <Container>
                <Navbar.Brand as={Link} to="/">Sistema de Votaciones</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ms-auto">
                        {user ? (
                            // Si hay un usuario, muestra su rol y el botón de logout
                            <NavDropdown title={`Bienvenido, ${user.rol}`} id="basic-nav-dropdown">
                                <NavDropdown.Item onClick={handleLogout}>
                                    Cerrar Sesión
                                </NavDropdown.Item>
                            </NavDropdown>
                        ) : (
                            // Si no hay usuario, muestra los links de login y registro
                            <>
                                <Nav.Link as={Link} to="/login">Iniciar Sesión</Nav.Link>
                                <Nav.Link as={Link} to="/register">Registrarse</Nav.Link>
                            </>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default AppNavbar;