import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Form, ListGroup, Alert } from 'react-bootstrap';
import { useAuth } from '../context/authContext';
import * as campaignService from '../services/conpaignService';

const AdminPanel = () => {
    const { user } = useAuth();
    const [message, setMessage] = useState('');
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const loadCampaigns = async () => {
        setLoading(true);
        try {
            const data = await campaignService.getAllCampaigns();
            setCampaigns(data);
        } catch (err) {
            console.error('Error loading campaigns', err);
        } finally { setLoading(false); }
    };

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

                            <h5>Crear Campaña</h5>
                            <Form onSubmit={async (e) => {
                                e.preventDefault();
                                const form = e.currentTarget as HTMLFormElement;
                                const titulo = (form.elements.namedItem('titulo') as HTMLInputElement).value;
                                const descripcion = (form.elements.namedItem('descripcion') as HTMLInputElement).value;
                                try {
                                    const res = await campaignService.createCampaign({ titulo, descripcion });
                                    setMessage('Campaña creada correctamente');
                                    loadCampaigns();
                                } catch (err: any) {
                                    console.error(err);
                                    setMessage(err?.response?.data?.message || 'Error al crear campaña');
                                }
                            }}>
                                <Form.Group className="mb-2">
                                    <Form.Label>Título</Form.Label>
                                    <Form.Control name="titulo" required />
                                </Form.Group>
                                <Form.Group className="mb-2">
                                    <Form.Label>Descripción</Form.Label>
                                    <Form.Control name="descripcion" />
                                </Form.Group>
                                <Button variant="primary" type="submit">Crear</Button>
                            </Form>

                            <hr />
                            <h5>Campañas existentes</h5>
                            <ListGroup>
                                {loading && <ListGroup.Item>Cargando...</ListGroup.Item>}
                                {!loading && campaigns.length === 0 && <ListGroup.Item>No hay campañas</ListGroup.Item>}
                                {campaigns.map(c => (
                                    <ListGroup.Item key={c.id}>
                                        <strong>{c.titulo}</strong> — {c.descripcion}
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default AdminPanel;
