import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Card, Button, ListGroup, Spinner, Alert } from 'react-bootstrap';
// 1. Importa la nueva función para votar
import { getCampaignById, voteForCandidate, Campaign } from '../services/conpaignService';

const CampaignDetailPage = () => {
    // useParams nos da acceso a los parámetros de la URL, en este caso el ':id'
    const { id } = useParams<{ id: string }>();

    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(''); // Estado para mensajes de éxito
    const [isLoading, setIsLoading] = useState(true);

    // Extraemos la lógica de fetching para poder reutilizarla
    const fetchCampaign = useCallback(async () => {
        if (id) {
            try {
                const data = await getCampaignById(id);
                setCampaign(data);
            } catch (err) {
                setError('No se pudo cargar la información de la campaña.');
            } finally {
                setIsLoading(false);
            }
        }
    }, [id]);

    useEffect(() => {
        fetchCampaign();
    }, [fetchCampaign]);

    // 2. Hacemos la función 'async' para poder llamar a la API
    const handleVote = async (candidateId: number) => {
        // Limpiamos mensajes anteriores
        setError('');
        setSuccess('');

        if (!id) return;

        try {
            // 3. Llamamos a la API para registrar el voto
            const response = await voteForCandidate(id, candidateId);
            setSuccess(response.message); // Mostramos el mensaje de éxito de la API

            // 4. ¡El paso clave! Volvemos a pedir los datos de la campaña para refrescar los votos
            await fetchCampaign();

        } catch (err: any) {
            // 5. Manejamos los errores, como si el usuario ya votó
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError('Ocurrió un error inesperado al votar.');
            }
        }
    };

    if (isLoading) {
        return <Spinner animation="border" />;
    }

    if (error && !campaign) {
        return <Alert variant="danger">{error}</Alert>;
    }

    if (!campaign) {
        return <p>Campaña no encontrada.</p>;
    }

    return (
        <Container>
            {/* Mostramos los mensajes de éxito o error al votar */}
            {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}
            {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}

            <Card>
                <Card.Header as="h2">{campaign!.titulo}</Card.Header>
                <Card.Body>
                    <Card.Text>{campaign!.descripcion}</Card.Text>
                    <hr />
                    <h3>Candidatos</h3>
                    <ListGroup>
                        {campaign!.candidates && campaign!.candidates.map(candidate => (
                            <ListGroup.Item key={candidate.id} className="d-flex justify-content-between align-items-center">
                                {candidate.nombre}
                                <span>
                                    <strong>Votos: {candidate.voteCount}</strong>
                                    <Button 
                                        variant="success" 
                                        className="ms-3" 
                                        onClick={() => handleVote(candidate.id)}
                                        disabled={campaign!.estado !== 'habilitada'}
                                    >
                                        Votar
                                    </Button>
                                </span>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                </Card.Body>
                <Card.Footer>
                    <strong>Estado de la campaña:</strong> {campaign!.estado}
                </Card.Footer>
            </Card>
        </Container>
    );
};

export default CampaignDetailPage;
