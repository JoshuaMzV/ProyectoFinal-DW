import { useState, useEffect } from 'react';
import { Card, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { getAllCampaigns, Campaign } from '../services/conpaignService';

const HomePage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [error, setError] = useState('');

    // Redirigir según rol si está logueado
    useEffect(() => {
        if (user) {
            if (user.role === 'admin') {
                navigate('/admin');
            } else if (user.role === 'votante') {
                navigate('/voter');
            }
        }
    }, [user, navigate]);

    useEffect(() => {
        const fetchCampaigns = async () => {
            try {
                const data = await getAllCampaigns();
                setCampaigns(data);
            } catch (err) {
                setError('No se pudieron cargar las campañas. Intente de nuevo más tarde.');
            }
        };

        fetchCampaigns();
    }, []);

    return (
        <Container>
            <h1 className="my-4">Campañas de Votación Disponibles</h1>
            {error && <Alert variant="danger">{error}</Alert>}
            <Row>
                {campaigns.length > 0 ? (
                    campaigns.map((campaign) => (
                        <Col md={4} key={campaign.id} className="mb-4">
                            <Card>
                                <Card.Body className="d-flex flex-column">
                                    <Card.Title>{campaign.titulo}</Card.Title>
                                    <Card.Text>
                                        {campaign.descripcion}
                                    </Card.Text>
                                    <Card.Text className="mt-auto">
                                        <strong>Estado:</strong> {campaign.estado}
                                    </Card.Text>
                                    <Link to={`/campaign/${campaign.id}`} style={{ textDecoration: 'none' }}>
                                        <Button variant="primary" className="w-100">
                                            Ver Detalles y Votar
                                        </Button>
                                    </Link>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))
                ) : (
                    <p>No hay campañas disponibles en este momento.</p>
                )}
            </Row>
        </Container>
    );
};

export default HomePage;