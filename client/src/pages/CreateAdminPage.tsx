import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { createAdmin } from '../services/adminService';

interface FormData {
    username: string;
    nombre_completo: string;
    password: string;
    confirmPassword: string;
}

const CreateAdminPage: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<FormData>({
        username: '',
        nombre_completo: '',
        password: '',
        confirmPassword: ''
    });

    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validations
        if (!formData.username.trim()) {
            setError('El nombre de usuario es requerido');
            return;
        }

        if (!formData.nombre_completo.trim()) {
            setError('El nombre completo es requerido');
            return;
        }

        if (!formData.password) {
            setError('La contraseña es requerida');
            return;
        }

        if (formData.password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        try {
            setLoading(true);
            await createAdmin(
                formData.username,
                formData.nombre_completo,
                formData.password
            );

            // Success
            alert('Admin creado exitosamente');
            navigate('/admin');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al crear el admin');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="mt-5">
            <Row className="justify-content-center">
                <Col md={6}>
                    <h2 className="text-center mb-4">Crear Nuevo Admin</h2>

                    {error && (
                        <Alert variant="danger" onClose={() => setError('')} dismissible>
                            {error}
                        </Alert>
                    )}

                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Nombre de Usuario</Form.Label>
                            <Form.Control
                                type="text"
                                name="username"
                                placeholder="Ingresa el nombre de usuario"
                                value={formData.username}
                                onChange={handleChange}
                                disabled={loading}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Nombre Completo</Form.Label>
                            <Form.Control
                                type="text"
                                name="nombre_completo"
                                placeholder="Ingresa el nombre completo"
                                value={formData.nombre_completo}
                                onChange={handleChange}
                                disabled={loading}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Contraseña</Form.Label>
                            <Form.Control
                                type="password"
                                name="password"
                                placeholder="Ingresa la contraseña"
                                value={formData.password}
                                onChange={handleChange}
                                disabled={loading}
                            />
                            <Form.Text className="text-muted">
                                Mínimo 6 caracteres
                            </Form.Text>
                        </Form.Group>

                        <Form.Group className="mb-4">
                            <Form.Label>Confirmar Contraseña</Form.Label>
                            <Form.Control
                                type="password"
                                name="confirmPassword"
                                placeholder="Confirma la contraseña"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                disabled={loading}
                            />
                        </Form.Group>

                        <div className="d-grid gap-2">
                            <Button
                                variant="primary"
                                size="lg"
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? 'Creando admin...' : 'Crear Admin'}
                            </Button>
                        </div>
                    </Form>

                    <div className="mt-3 text-center">
                        <Button
                            variant="outline-secondary"
                            onClick={() => navigate(-1)}
                        >
                            ← Volver
                        </Button>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default CreateAdminPage;
