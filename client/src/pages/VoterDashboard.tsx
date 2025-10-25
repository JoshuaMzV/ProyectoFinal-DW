import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, ListGroup, Alert, Spinner, Modal } from 'react-bootstrap';
import { useAuth } from '../context/authContext';
import { getAllCampaigns, voteForCandidate } from '../services/conpaignService';
import TimeCounter from '../components/TimeCounter';
import '../styles/pages/VoterDashboard.scss';

const VoterDashboard = () => {
    const { user } = useAuth();
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [votingCandidateId, setVotingCandidateId] = useState<number | null>(null);
    const [showResultsModal, setShowResultsModal] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState<any>(null);

    // Cargar campañas disponibles
    useEffect(() => {
        const loadCampaigns = async () => {
            setLoading(true);
            try {
                const data = await getAllCampaigns();
                setCampaigns(data);
            } catch (err: any) {
                setMessage(`Error al cargar campañas: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        loadCampaigns();
    }, []);

    // Guard: Si no es votante, mostrar error
    if (!user || user.role !== 'votante') {
        return <Alert variant="danger">No tienes acceso a este panel. Solo votantes pueden acceder.</Alert>;
    }

    // Manejar voto
    const handleVote = async (campaignId: number, candidateId: number) => {
        setVotingCandidateId(candidateId);
        try {
            const response = await voteForCandidate(campaignId.toString(), candidateId);
            setMessage(`✅ ${response.message}`);
            // Recargar campañas para actualizar votos
            const data = await getAllCampaigns();
            setCampaigns(data);
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || err.message;
            setMessage(`❌ Error: ${errorMsg}`);
        } finally {
            setVotingCandidateId(null);
        }
    };

    // Abrir modal de resultados
    const handleShowResults = (campaign: any) => {
        setSelectedCampaign(campaign);
        setShowResultsModal(true);
    };

    const handleCloseResults = () => {
        setShowResultsModal(false);
        setSelectedCampaign(null);
    };

    return (
        <Container className="voter-dashboard">
            <Row>
                <Col md={12}>
                    <h1 className="page-title">Panel de Votante</h1>
                </Col>
            </Row>

            {message && (
                <Row className="mt-3">
                    <Col md={12}>
                        <Alert variant={message.includes('✅') ? 'success' : 'danger'} onClose={() => setMessage('')} dismissible>
                            {message}
                        </Alert>
                    </Col>
                </Row>
            )}

            {loading ? (
                <Row className="mt-4">
                    <Col md={12} className="text-center">
                        <Spinner animation="border" />
                        <p className="mt-2">Cargando campañas...</p>
                    </Col>
                </Row>
            ) : campaigns.length === 0 ? (
                <Row className="mt-4">
                    <Col md={12}>
                        <Alert variant="info">
                            No hay campañas disponibles en este momento.
                        </Alert>
                    </Col>
                </Row>
            ) : (
                <Row className="mt-4">
                    {campaigns.map(campaign => (
                        <Col md={12} key={campaign.id} className="mb-4">
                            <Card>
                                <Card.Header>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h5 className="mb-1" style={{ color: '#ffffff', textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>{campaign.titulo}</h5>
                                            <TimeCounter fechaFin={campaign.fecha_fin} campaignId={campaign.id} />
                                        </div>
                                        <span className={`badge bg-${campaign.estado === 'habilitada' ? 'success' : campaign.estado === 'deshabilitada' ? 'warning' : 'danger'}`}>
                                            {campaign.estado}
                                        </span>
                                    </div>
                                </Card.Header>
                                <Card.Body>
                                    <p><strong>Descripción:</strong> {campaign.descripcion || 'N/A'}</p>

                                    <h6 className="mt-3">Candidatos:</h6>
                                    {campaign.candidates && campaign.candidates.length > 0 ? (
                                        <ListGroup className="mb-3">
                                            {campaign.candidates.map((candidate: any) => (
                                                <ListGroup.Item key={candidate.id} className="d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <strong>{candidate.nombre}</strong>
                                                        <br />
                                                        <small className="text-muted">Votos: {candidate.voteCount}</small>
                                                    </div>
                                                    <Button
                                                        variant="success"
                                                        size="sm"
                                                        onClick={() => handleVote(campaign.id, candidate.id)}
                                                        disabled={campaign.estado !== 'habilitada' || votingCandidateId === candidate.id}
                                                    >
                                                        {votingCandidateId === candidate.id ? 'Votando...' : 'Votar'}
                                                    </Button>
                                                </ListGroup.Item>
                                            ))}
                                        </ListGroup>
                                    ) : (
                                        <p className="text-muted">No hay candidatos en esta campaña aún.</p>
                                    )}

                                    {/* Botón para ver resultados */}
                                    {campaign.candidates && campaign.candidates.length > 0 && (
                                        <div className="d-grid mt-3">
                                            <Button 
                                                variant="outline-primary" 
                                                onClick={() => handleShowResults(campaign)}
                                            >
                                                📊 Ver Resultados Gráficos
                                            </Button>
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}

            {/* Modal de Resultados */}
            <Modal show={showResultsModal} onHide={handleCloseResults} size="lg">
                <Modal.Header closeButton style={{ backgroundColor: '#001a4d', color: '#ffffff' }}>
                    <Modal.Title>📊 Resultados - {selectedCampaign?.titulo}</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ backgroundColor: '#f9f9f9' }}>
                    {selectedCampaign && selectedCampaign.candidates && selectedCampaign.candidates.length > 0 ? (
                        <>
                            <p style={{ color: '#001a4d', fontWeight: 'bold', marginBottom: '20px' }}>
                                Total: {selectedCampaign.candidates.length} candidatos
                            </p>
                            {selectedCampaign.candidates.map((candidate: any) => {
                                const maxVotes = Math.max(...selectedCampaign.candidates.map((c: any) => c.voteCount), 1);
                                const percentage = (candidate.voteCount / maxVotes) * 100;
                                return (
                                    <div key={candidate.id} style={{ marginBottom: '20px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <strong style={{ fontSize: '16px' }}>{candidate.nombre}</strong>
                                            <span style={{ color: '#F4A500', fontWeight: 'bold', fontSize: '16px' }}>
                                                {candidate.voteCount} voto{candidate.voteCount !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                        <div style={{
                                            backgroundColor: '#e9ecef',
                                            height: '40px',
                                            borderRadius: '5px',
                                            overflow: 'hidden',
                                            border: '2px solid #001a4d'
                                        }}>
                                            <div style={{
                                                backgroundColor: '#F4A500',
                                                height: '100%',
                                                width: `${percentage}%`,
                                                transition: 'width 0.3s ease',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'flex-end',
                                                paddingRight: '10px'
                                            }}>
                                                <span style={{ color: '#001a4d', fontWeight: 'bold', fontSize: '12px' }}>
                                                    {Math.round(percentage)}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </>
                    ) : (
                        <p className="text-muted text-center">No hay datos para mostrar</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseResults}>
                        Cerrar
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default VoterDashboard;
