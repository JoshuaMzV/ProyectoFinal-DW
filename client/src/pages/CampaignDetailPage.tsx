import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Card, Button, ListGroup, Spinner, Alert } from 'react-bootstrap';
// Chart
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

// 1. Importa la nueva función para votar (debe ir antes de ejecutar código)
import { getCampaignById, voteForCandidate, Campaign } from '../services/conpaignService';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const CampaignDetailPage = () => {
    // useParams nos da acceso a los parámetros de la URL, en este caso el ':id'
    const { id } = useParams<{ id: string }>();

    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(''); // Estado para mensajes de éxito
    const [isLoading, setIsLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [isVoting, setIsVoting] = useState<Record<number, boolean>>({});

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

    // Countdown: calcula el tiempo restante en segundos
    useEffect(() => {
        if (!campaign || !campaign.fecha_fin) return;
        const end = new Date(campaign.fecha_fin).getTime();
        const update = () => {
            const now = Date.now();
            const diff = Math.max(0, Math.floor((end - now) / 1000));
            setTimeLeft(diff);
        };
        update();
        const t = setInterval(update, 1000);
        return () => clearInterval(t);
    }, [campaign]);

    // 2. Hacemos la función 'async' para poder llamar a la API
    const handleVote = async (candidateId: number) => {
        // Limpiamos mensajes anteriores
        setError('');
        setSuccess('');

        if (!id) return;

        try {
            setIsVoting(prev => ({ ...prev, [candidateId]: true }));
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
        } finally {
            setIsVoting(prev => ({ ...prev, [candidateId]: false }));
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

            <Card className="acrylic-card">
                <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-3">
                        <div>
                            <Card.Title as="h2" className="mb-1 campaign-title">{campaign!.titulo}</Card.Title>
                            <Card.Subtitle className="text-muted">{campaign!.descripcion}</Card.Subtitle>
                        </div>
                        <div className="text-end">
                            <div className="time-badge mb-2">{timeLeft === null ? 'calculando...' : (timeLeft > 0 ? `${Math.floor(timeLeft/3600)}h ${Math.floor((timeLeft%3600)/60)}m` : 'Finalizada')}</div>
                            <div className="status-chip">{campaign!.estado}</div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-6">
                            <div className="mb-3 voters-section">
                                <h5 className="mb-2">Votantes</h5>
                                <p className="text-muted small">Lista de votantes y candidatos disponibles. Seleccione un candidato para emitir su voto.</p>

                                <ListGroup className="vote-list">
                                    {(campaign!.candidates || []).map(candidate => (
                                        <ListGroup.Item key={candidate.id} className="vote-row d-flex justify-content-between align-items-center">
                                            <div>
                                                <div className="candidate-name">{candidate.nombre}</div>
                                                <div className="candidate-sub small text-muted">Votos: {candidate.voteCount}</div>
                                            </div>
                                            <div>
                                                <Button
                                                    variant="outline-light"
                                                    className="vote-btn"
                                                    onClick={() => handleVote(candidate.id)}
                                                    disabled={campaign!.estado !== 'habilitada' || (timeLeft !== null && timeLeft <= 0) || !!isVoting[candidate.id]}
                                                >
                                                    {isVoting[candidate.id] ? (
                                                        <>
                                                            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />{' '}
                                                            Votando...
                                                        </>
                                                    ) : (
                                                        'Votar'
                                                    )}
                                                </Button>
                                            </div>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            </div>
                        </div>

                        <div className="col-md-6">
                            <div className="chart-wrap mb-3">
                                <Bar
                                    data={{
                                        labels: (campaign!.candidates || []).map(c => c.nombre),
                                        datasets: [
                                            {
                                                label: 'Votos',
                                                data: (campaign!.candidates || []).map(c => c.voteCount),
                                                backgroundColor: 'rgba(255, 99, 132, 0.6)'
                                            }
                                        ]
                                    }}
                                    options={{
                                        responsive: true,
                                        plugins: {
                                            legend: { display: false },
                                            title: { display: true, text: 'Resultados actuales' }
                                        }
                                    }}
                                />
                            </div>
                            {/* Estado mostrado arriba en el chip; bloque eliminado porque es redundante */}
                        </div>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default CampaignDetailPage;
