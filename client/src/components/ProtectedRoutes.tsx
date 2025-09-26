import { JSX } from 'react';
import { useAuth } from '../context/authContext';
import { Navigate } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';

// Este componente es un "envoltorio" o "wrapper"
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
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

    // Si hay un usuario y no estamos cargando, mostramos el contenido
    return children;
};

export default ProtectedRoute;