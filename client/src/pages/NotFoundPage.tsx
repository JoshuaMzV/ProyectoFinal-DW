import { Container, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import '../styles/pages/NotFoundPage.scss';

const NotFoundPage = () => {
    const navigate = useNavigate();

    return (
        <Container className="not-found-page text-center">
            <div className="not-found-content">
                <h1 className="error-code">404</h1>
                <h2 className="error-title">Página No Encontrada</h2>
                <p className="error-message">
                    Lo sentimos, la página que estás buscando no existe o ha sido movida.
                </p>
                <div className="error-illustration">
                    <span className="emoji">🗳️</span>
                    <span className="emoji">❌</span>
                </div>
                <div className="action-buttons mt-4">
                    <Button 
                        variant="primary" 
                        size="lg"
                        onClick={() => navigate('/')}
                        className="me-3"
                    >
                        🏠 Ir al Inicio
                    </Button>
                    <Button 
                        variant="outline-secondary" 
                        size="lg"
                        onClick={() => navigate(-1)}
                    >
                        ← Volver Atrás
                    </Button>
                </div>
            </div>
        </Container>
    );
};

export default NotFoundPage;
