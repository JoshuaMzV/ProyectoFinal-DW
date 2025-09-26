import { useState } from 'react';
import { Form, Button, Container, Row, Col, Card, Alert } from 'react-bootstrap';
// 1. Importamos nuestra función de registro y el tipo de datos
import { register, RegisterData } from '../services/authService';

const RegisterPage = () => {
    const [formData, setFormData] = useState<RegisterData>({
        numero_colegiado: '',
        nombre_completo: '',
        email: '',
        dpi: '',
        fecha_nacimiento: '',
        password: '',
    });

    // Añadimos estados para manejar mensajes de éxito o error
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // 2. Convertimos la función a 'async' para poder usar 'await'
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setMessage('');

        try {
            // 3. Llamamos a la función del servicio con los datos del formulario
            const response = await register(formData);
            setMessage(response.message); // Mostramos el mensaje de éxito de la API

            // En un caso real, aquí redirigiríamos al usuario a la página de login
            // e.g., navigate('/login');

        } catch (err: any) {
            // 4. Si la API devuelve un error, lo capturamos y mostramos
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError('Ocurrió un error inesperado. Intente de nuevo.');
            }
        }
    };

    return (
        <Container>
            <Row className="justify-content-md-center">
                <Col md={6}>
                    <Card>
                        <Card.Body>
                            <Card.Title className="text-center mb-4">Crear una Cuenta Nueva</Card.Title>

                            {/* Mostramos alertas de éxito o error */}
                            {message && <Alert variant="success">{message}</Alert>}
                            {error && <Alert variant="danger">{error}</Alert>}

                            <Form onSubmit={handleSubmit}>
                                {/* ... Aquí va todo el mismo código del Form.Group para cada campo ... */}
                                <Form.Group className="mb-3">
                                    <Form.Label>Número de Colegiado</Form.Label>
                                    <Form.Control type="text" name="numero_colegiado" placeholder="Ej: 12345" onChange={handleInputChange} required />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Nombre Completo</Form.Label>
                                    <Form.Control type="text" name="nombre_completo" placeholder="Ingrese su nombre" onChange={handleInputChange} required />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Correo Electrónico</Form.Label>
                                    <Form.Control type="email" name="email" placeholder="su.correo@ejemplo.com" onChange={handleInputChange} required />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>DPI</Form.Label>
                                    <Form.Control type="text" name="dpi" placeholder="13 dígitos sin espacios" onChange={handleInputChange} required />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Fecha de Nacimiento</Form.Label>
                                    <Form.Control type="date" name="fecha_nacimiento" onChange={handleInputChange} required />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Contraseña</Form.Label>
                                    <Form.Control type="password" name="password" placeholder="Cree una contraseña segura" onChange={handleInputChange} required />
                                </Form.Group>
                                <div className="d-grid">
                                    <Button variant="primary" type="submit">
                                        Registrarse
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

export default RegisterPage;