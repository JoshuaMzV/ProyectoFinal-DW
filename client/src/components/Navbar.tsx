import { Navbar, Nav, Container, NavDropdown, Image } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { useEffect, useState } from 'react';
import { getMyCompleteProfile } from '../services/profileService';
import '../styles/components/Navbar.scss';

const AppNavbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [showGestion, setShowGestion] = useState(false);

    const handleGestionToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowGestion(!showGestion);
    };

    useEffect(() => {
        // Solo cargar la imagen si es votante
        if (user && user.role === 'votante') {
            const loadProfileImage = async () => {
                try {
                    const profile = await getMyCompleteProfile();
                    if (profile.profile_image_path) {
                        setProfileImage(`http://localhost:5000${profile.profile_image_path}`);
                    }
                } catch (err) {
                    console.error('Error loading profile image:', err);
                }
            };
            loadProfileImage();
        }
    }, [user]);

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
                    <Nav className="ms-auto align-items-center">
                        {user ? (
                            <div className="d-flex align-items-center gap-3">
                                {/* Mostrar foto si es votante y existe */}
                                {user.role === 'votante' && profileImage && (
                                    <Image
                                        src={profileImage}
                                        alt="Perfil"
                                        roundedCircle
                                        className="profile-image-navbar"
                                    />
                                )}
                                
                                <NavDropdown 
                                    title={
                                        <span className="welcome-text">
                                            <span>Bienvenido, {user.nombre_completo || user.role}</span>
                                            <span className="arrow-down">▼</span>
                                        </span>
                                    } 
                                    id="basic-nav-dropdown"
                                    className="nav-dropdown"
                                >
                                    {user.role === 'votante' && (
                                        <>
                                            <NavDropdown.Item as={Link} to="/profile">
                                                👤 Mi Perfil
                                            </NavDropdown.Item>
                                            <NavDropdown.Divider />
                                        </>
                                    )}
                                    {user.role === 'admin' && (
                                        <>
                                            <NavDropdown.Item as={Link} to="/create-admin">
                                                ➕ Crear Admin
                                            </NavDropdown.Item>
                                            <NavDropdown.Divider />
                                            <NavDropdown.Item as={Link} to="/report">
                                                📊 Reporte General
                                            </NavDropdown.Item>
                                            <NavDropdown.Divider />
                                            <NavDropdown.Item 
                                                className="gestion-title"
                                                onClick={handleGestionToggle}
                                            >
                                                ⚙️ Gestión {showGestion ? '▲' : '▼'}
                                            </NavDropdown.Item>
                                            {showGestion && (
                                                <>
                                                    <NavDropdown.Item as={Link} to="/candidates-management" className="gestion-subitem">
                                                        👥 Gestión de Candidatos
                                                    </NavDropdown.Item>
                                                    <NavDropdown.Item as={Link} to="/voters-management" className="gestion-subitem">
                                                        👤 Gestión de Votantes
                                                    </NavDropdown.Item>
                                                </>
                                            )}
                                            <NavDropdown.Divider />
                                        </>
                                    )}
                                    <NavDropdown.Item onClick={handleLogout}>
                                        🚪 Cerrar Sesión
                                    </NavDropdown.Item>
                                </NavDropdown>
                            </div>
                        ) : (
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