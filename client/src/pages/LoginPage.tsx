import { useState } from 'react';
import { Form, Button, Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
// 1. YA NO importamos 'login' desde el servicio
import { LoginData } from '../services/authService';
// 2. EN SU LUGAR, importamos nuestro hook useAuth
import { useAuth } from '../context/authContext';

const LoginPage = () => {
    const navigate = useNavigate();
    const { login } = useAuth(); // 3. Obtenemos la función 'login' del CONTEXTO

    const [formData, setFormData] = useState<LoginData>({
        numero_colegiado: '',
        dpi: '',
        fecha_nacimiento: '',
        password: '',
    });
    const [error, setError] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');

        try {
            // 4. Ahora esta función 'login' es la del contexto.
            // Hará la llamada a la API Y actualizará el estado global.
            await login(formData);
            navigate('/');
        } catch (err: any) {
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError('Ocurrió un error inesperado. Intente de nuevo.');
            }
        }
    };

    return (
        <Container>
            {/* ... El resto del JSX del formulario no cambia ... */}
            <Row className="justify-content-md-center">
                <Col md={6}>
                    <Card>
                        <Card.Body>
                            <Card.Title className="text-center mb-4">Acceder al Sistema</Card.Title>
                            {error && <Alert variant="danger">{error}</Alert>}
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Número de Colegiado</Form.Label>
                                    <Form.Control type="text" name="numero_colegiado" onChange={handleInputChange} required />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>DPI</Form.Label>
                                    <Form.Control type="text" name="dpi" onChange={handleInputChange} required />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Fecha de Nacimiento</Form.Label>
                                    <Form.Control type="date" name="fecha_nacimiento" onChange={handleInputChange} required />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Contraseña</Form.Label>
                                    <Form.Control type="password" name="password" onChange={handleInputChange} required />
                                </Form.Group>
                                <div className="d-grid">
                                    <Button variant="primary" type="submit">
                                        Ingresar
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default LoginPage;