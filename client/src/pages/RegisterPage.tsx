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

    const [nombreInput, setNombreInput] = useState(''); // Campo de entrada del nombre real
    const [generatedUsername, setGeneratedUsername] = useState(''); // Username generado automáticamente
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // Función para generar username automáticamente desde el nombre completo
    const generateUsername = (nombre: string) => {
        // Validar que tenga al menos 2 palabras
        const palabras = nombre.trim().split(/\s+/);
        if (palabras.length < 2) {
            return ''; // No se puede generar si no hay 2 palabras
        }

        // Tomar primer nombre completo
        const primerNombre = palabras[0];

        // Tomar primera letra de cada palabra restante
        const iniciales = palabras.slice(1).map(p => p.charAt(0).toUpperCase()).join('');

        // Generar número aleatorio (1-999)
        const numeroAleatorio = Math.floor(Math.random() * 999) + 1;

        // Formato: "PrimerNombre + Iniciales + Numero"
        // Ejemplo: Emilio Juanete Aguilar Moza → EmilioJAM1
        return `${primerNombre}${iniciales}${numeroAleatorio}`;
    };

    const handleNombreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const valor = e.target.value;
        setNombreInput(valor);

        // Generar username automáticamente si hay 2+ palabras
        const generado = generateUsername(valor);
        setGeneratedUsername(generado);
        
        // Guardar el nombre real en nombre_completo
        setFormData({
            ...formData,
            nombre_completo: valor,
        });
    };

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
            // 3. Llamamos a la función del servicio con los datos del formulario + username generado
            const dataToSend = {
                ...formData,
                username: generatedUsername,
            };
            const response = await register(dataToSend);
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
                                <Form.Group className="mb-3">
                                    <Form.Label>Número de Colegiado</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        name="numero_colegiado" 
                                        placeholder="Ej: 12345" 
                                        value={formData.numero_colegiado}
                                        onChange={handleInputChange} 
                                        required 
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Nombre *</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        placeholder="Ej: Juan Pérez García" 
                                        value={nombreInput}
                                        onChange={handleNombreChange} 
                                        required
                                        autoComplete="off"
                                    />
                                    <Form.Text className="text-muted">
                                        Ingresa tu nombre completo (mínimo 2 palabras)
                                    </Form.Text>
                                </Form.Group>

                                {generatedUsername && (
                                    <Form.Group className="mb-3">
                                        <Form.Label>Nombre de Usuario (Auto-generado)</Form.Label>
                                        <Form.Control 
                                            type="text" 
                                            value={generatedUsername}
                                            disabled
                                            className="bg-light"
                                        />
                                    </Form.Group>
                                )}

                                <Form.Group className="mb-3">
                                    <Form.Label>Correo Electrónico</Form.Label>
                                    <Form.Control 
                                        type="email" 
                                        name="email" 
                                        placeholder="su.correo@ejemplo.com" 
                                        value={formData.email}
                                        onChange={handleInputChange} 
                                        required 
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>DPI</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        name="dpi" 
                                        placeholder="13 dígitos sin espacios" 
                                        value={formData.dpi}
                                        onChange={handleInputChange} 
                                        required 
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Fecha de Nacimiento</Form.Label>
                                    <Form.Control 
                                        type="date" 
                                        name="fecha_nacimiento" 
                                        value={formData.fecha_nacimiento}
                                        onChange={handleInputChange} 
                                        required 
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Contraseña</Form.Label>
                                    <Form.Control 
                                        type="password" 
                                        name="password" 
                                        placeholder="Cree una contraseña segura" 
                                        value={formData.password}
                                        onChange={handleInputChange} 
                                        required 
                                    />
                                </Form.Group>

                                <div className="d-grid">
                                    <Button 
                                        variant="primary" 
                                        type="submit"
                                        disabled={!formData.nombre_completo || !generatedUsername}
                                    >
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