import { JSX } from 'react';
import { useAuth } from '../context/authContext';
import { Navigate } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';

// Este componente es un "envoltorio" o "wrapper"
const ProtectedRoute = ({ children, adminOnly }: { children: JSX.Element; adminOnly?: boolean }) => {
    const { user, isLoading } = useAuth(); // Obtenemos isLoading

    if (isLoading) {
        // Mientras verificamos la sesión, mostramos un spinner centrado
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
                <Spinner animation="border" />
            </div>
        );
    }

    if (!user) {
        // Si ya no estamos cargando y no hay usuario, redirigimos
        return <Navigate to="/login" />;
    }

    if (adminOnly && user.rol !== 'admin') {
        // Si la ruta es solo para admin y el usuario no es admin
        return <Navigate to="/" />;
    }

    // Si hay un usuario y no estamos cargando, mostramos el contenido
    return children;
};

export default ProtectedRoute;