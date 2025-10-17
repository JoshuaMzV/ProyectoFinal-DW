import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Form, ListGroup, Alert } from 'react-bootstrap';
import { useAuth } from '../context/authContext';

const AdminPanel = () => {
    const { user } = useAuth();
    const [message, setMessage] = useState('');

    useEffect(() => {
        // placeholder: podríamos cargar campañas existentes
    }, []);

    if (!user) return null;

    return (
        <Container>
            <Row className="mt-4">
                <Col>
                    <Card>
                        <Card.Header>Panel Administrativo</Card.Header>
                        <Card.Body>
                            <p>Bienvenido, <strong>{user.rol}</strong></p>
                            {message && <Alert variant="info">{message}</Alert>}

                            <h5>Crear Campaña (scaffold)</h5>
                            <Form>
                                <Form.Group className="mb-2">
                                    <Form.Label>Título</Form.Label>
                                    <Form.Control name="titulo" />
                                </Form.Group>
                                <Form.Group className="mb-2">
                                    <Form.Label>Descripción</Form.Label>
                                    <Form.Control name="descripcion" />
                                </Form.Group>
                                <Button variant="primary">Crear</Button>
                            </Form>

                            <hr />
                            <h5>Campañas existentes</h5>
                            <ListGroup>
                                <ListGroup.Item>Placeholder: listar campañas</ListGroup.Item>
                            </ListGroup>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default AdminPanel;
