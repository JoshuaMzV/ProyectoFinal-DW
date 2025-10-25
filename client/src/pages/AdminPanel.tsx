import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert } from 'react-bootstrap';
import { useAuth } from '../context/authContext';
import { getAllCampaigns } from '../services/conpaignService';
import CampaignEditCard from '../components/CampaignEditCard';
import axios from 'axios';

const AdminPanel = () => {
    const { user } = useAuth();
    const apiClient = axios.create({
        baseURL: (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(/\/$/, ''),
        headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`
        }
    });

    // Estado: crear campaña
    const [campaignTitle, setCampaignTitle] = useState('');
    const [campaignDesc, setCampaignDesc] = useState('');
    const [campaignStartDate, setCampaignStartDate] = useState('');
    const [campaignEndDate, setCampaignEndDate] = useState('');
    const [campaignStatus, setCampaignStatus] = useState('deshabilitada');
    const [campaignMessage, setCampaignMessage] = useState('');

    // Estado: agregar candidato
    const [selectedCampaignId, setSelectedCampaignId] = useState('');
    const [candidateName, setCandidateName] = useState('');
    const [candidateUserId, setCandidateUserId] = useState('');
    const [selectedExistingCandidateId, setSelectedExistingCandidateId] = useState('');
    const [candidateMode, setCandidateMode] = useState('new'); // 'new', 'existing', o 'from-list'
    const [candidateMessage, setCandidateMessage] = useState('');

    // Estado: listar campañas
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [campaignsLoading, setCampaignsLoading] = useState(false);

    // Estado: listar votantes (para agregar candidato desde usuario existente)
    const [voters, setVoters] = useState<any[]>([]);

    // Estado: listar todos los candidatos del sistema
    const [allCandidates, setAllCandidates] = useState<any[]>([]);

    // Cargar campañas
    const loadCampaigns = async () => {
        setCampaignsLoading(true);
        try {
            const data = await getAllCampaigns();
            setCampaigns(data);
        } catch (err) {
            setCampaignMessage('Error al cargar campañas');
        } finally {
            setCampaignsLoading(false);
        }
    };

    // Cargar todos los candidatos del sistema
    const loadAllCandidates = async () => {
        try {
            const response = await apiClient.get('/campaigns');
            const data = response.data;
            // Extraer todos los candidatos de todas las campañas
            const candidates: any[] = [];
            data.forEach((campaign: any) => {
                if (campaign.candidates && campaign.candidates.length > 0) {
                    campaign.candidates.forEach((cand: any) => {
                        candidates.push({
                            ...cand,
                            campaignId: campaign.id,
                            campaignTitle: campaign.titulo
                        });
                    });
                }
            });
            setAllCandidates(candidates);
        } catch (err) {
            console.error('Error al cargar candidatos:', err);
        }
    };

    // Hook: Cargar campañas y candidatos al montar
    useEffect(() => {
        loadCampaigns();
        // intentionally not adding loadAllCandidates to deps to avoid re-creation loops
        loadAllCandidates();
    }, []);

    // Guard: Si no es admin, mostrar error
    if (!user || user.role !== 'admin') {
        return <Alert variant="danger">No tienes acceso a este panel. Solo admins pueden acceder.</Alert>;
    }

    // Opción 1: Crear Campaña
    const handleCreateCampaign = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!campaignTitle.trim()) {
            setCampaignMessage('El título es requerido');
            return;
        }

        try {
            const response = await apiClient.post('/campaigns', {
                titulo: campaignTitle,
                descripcion: campaignDesc,
                estado: campaignStatus,
                fecha_inicio: campaignStartDate || null,
                fecha_fin: campaignEndDate || null
            });
            setCampaignMessage(`✅ Campaña "${response.data.titulo}" creada exitosamente con ID ${response.data.id}`);
            setCampaignTitle('');
            setCampaignDesc('');
            setCampaignStartDate('');
            setCampaignEndDate('');
            setCampaignStatus('deshabilitada');
            await loadCampaigns();
        } catch (err: any) {
            setCampaignMessage(`❌ Error: ${err.response?.data?.message || err.message}`);
        }
    };

    // Opción 2: Agregar Candidato
    const handleAddCandidate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCampaignId) {
            setCandidateMessage('Selecciona una campaña');
            return;
        }
        if (candidateMode === 'new' && !candidateName.trim()) {
            setCandidateMessage('Ingresa el nombre del candidato');
            return;
        }
        if (candidateMode === 'existing' && !candidateUserId) {
            setCandidateMessage('Selecciona un votante');
            return;
        }
        if (candidateMode === 'from-list' && !selectedExistingCandidateId) {
            setCandidateMessage('Selecciona un candidato de la lista');
            return;
        }

        try {
            if (candidateMode === 'from-list') {
                // Encontrar el candidato seleccionado
                const selectedCandidate = allCandidates.find(c => c.id === selectedExistingCandidateId);
                if (!selectedCandidate) {
                    setCandidateMessage('❌ Candidato no encontrado');
                    return;
                }

                // Agregar el candidato a la nueva campaña (copiando el nombre)
                await apiClient.post(`/campaigns/${selectedCampaignId}/candidates`, {
                    nombre: selectedCandidate.nombre,
                    userId: null
                });

                setCandidateMessage(`✅ Candidato "${selectedCandidate.nombre}" agregado a la campaña`);
            } else {
                const response = await apiClient.post(`/campaigns/${selectedCampaignId}/candidates`, {
                    nombre: candidateMode === 'new' ? candidateName : null,
                    userId: candidateMode === 'existing' ? parseInt(candidateUserId) : null
                });

                setCandidateMessage(`✅ Candidato agregado exitosamente`);
            }

            setCandidateName('');
            setCandidateUserId('');
            setCandidateMode('new');
            setSelectedCampaignId('');
            setSelectedExistingCandidateId('');
            await loadCampaigns();
            await loadAllCandidates();
        } catch (err: any) {
            setCandidateMessage(`❌ Error: ${err.response?.data?.message || err.message}`);
        }
    };

    // Cargar votantes para modal
    const loadVoters = async () => {
        try {
            const response = await apiClient.get('/auth/votantes');
            setVoters(response.data.votantes || []);
            setShowVotersModal(true);
        } catch (err) {
            setCandidateMessage('Error al cargar votantes');
        }
    };

    return (
        <Container className="mt-4">
            <Row>
                <Col md={12}>
                    <h1>Panel de Administrador</h1>
                    <p>Bienvenido, <strong>{user.role}</strong></p>
                </Col>
            </Row>

            {/* Opción 1: Crear Campaña */}
            <Row className="mt-4">
                <Col md={6}>
                    <Card>
                        <Card.Header className="bg-primary text-white">
                            <strong>1️⃣ Crear Campaña</strong>
                        </Card.Header>
                        <Card.Body>
                            {campaignMessage && (
                                <Alert variant={campaignMessage.includes('✅') ? 'success' : 'danger'} onClose={() => setCampaignMessage('')} dismissible>
                                    {campaignMessage}
                                </Alert>
                            )}
                            <Form onSubmit={handleCreateCampaign}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Título *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Ej: Elecciones Junta Directiva 2025"
                                        value={campaignTitle}
                                        onChange={(e) => setCampaignTitle(e.target.value)}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Descripción</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        placeholder="Descripción de la campaña"
                                        value={campaignDesc}
                                        onChange={(e) => setCampaignDesc(e.target.value)}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Estado</Form.Label>
                                    <Form.Select value={campaignStatus} onChange={(e) => setCampaignStatus(e.target.value)}>
                                        <option value="deshabilitada">Deshabilitada</option>
                                        <option value="habilitada">Habilitada</option>
                                        <option value="finalizada">Finalizada</option>
                                    </Form.Select>
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Fecha Inicio</Form.Label>
                                    <Form.Control
                                        type="datetime-local"
                                        value={campaignStartDate}
                                        onChange={(e) => setCampaignStartDate(e.target.value)}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Fecha Fin</Form.Label>
                                    <Form.Control
                                        type="datetime-local"
                                        value={campaignEndDate}
                                        onChange={(e) => setCampaignEndDate(e.target.value)}
                                    />
                                </Form.Group>
                                <Button variant="primary" type="submit">
                                    Crear Campaña
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Opción 2: Agregar Candidato */}
                <Col md={6}>
                    <Card>
                        <Card.Header className="bg-success text-white">
                            <strong>2️⃣ Agregar Candidato</strong>
                        </Card.Header>
                        <Card.Body>
                            {candidateMessage && (
                                <Alert variant={candidateMessage.includes('✅') ? 'success' : 'danger'} onClose={() => setCandidateMessage('')} dismissible>
                                    {candidateMessage}
                                </Alert>
                            )}
                            <Form onSubmit={handleAddCandidate}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Selecciona Campaña *</Form.Label>
                                    <Form.Select value={selectedCampaignId} onChange={(e) => setSelectedCampaignId(e.target.value)}>
                                        <option value="">-- Selecciona una campaña --</option>
                                        {campaigns.map(camp => (
                                            <option key={camp.id} value={camp.id}>
                                                {camp.titulo} (ID: {camp.id})
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Tipo de Candidato</Form.Label>
                                    <div>
                                        <Form.Check
                                            type="radio"
                                            label="Nuevo candidato (solo nombre)"
                                            name="candidateMode"
                                            value="new"
                                            checked={candidateMode === 'new'}
                                            onChange={(e) => setCandidateMode(e.target.value)}
                                        />
                                        <Form.Check
                                            type="radio"
                                            label="Usuario votante existente"
                                            name="candidateMode"
                                            value="existing"
                                            checked={candidateMode === 'existing'}
                                            onChange={(e) => setCandidateMode(e.target.value)}
                                        />
                                        <Form.Check
                                            type="radio"
                                            label="De lista de candidatos ya creados"
                                            name="candidateMode"
                                            value="from-list"
                                            checked={candidateMode === 'from-list'}
                                            onChange={(e) => setCandidateMode(e.target.value)}
                                        />
                                    </div>
                                </Form.Group>

                                {candidateMode === 'new' && (
                                    <Form.Group className="mb-3">
                                        <Form.Label>Nombre del Candidato *</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Ej: Juan Pérez"
                                            value={candidateName}
                                            onChange={(e) => setCandidateName(e.target.value)}
                                        />
                                    </Form.Group>
                                )}

                                {candidateMode === 'existing' && (
                                    <Form.Group className="mb-3">
                                        <Form.Label>Selecciona Votante *</Form.Label>
                                        <div className="d-flex gap-2">
                                            <Form.Select
                                                value={candidateUserId}
                                                onChange={(e) => setCandidateUserId(e.target.value)}
                                                disabled={voters.length === 0}
                                            >
                                                <option value="">-- Carga votantes --</option>
                                                {voters.map(voter => (
                                                    <option key={voter.id} value={voter.id}>
                                                        {voter.nombre_completo} ({voter.numero_colegiado})
                                                    </option>
                                                ))}
                                            </Form.Select>
                                            <Button variant="outline-secondary" onClick={loadVoters}>
                                                Cargar Votantes
                                            </Button>
                                        </div>
                                    </Form.Group>
                                )}

                                {candidateMode === 'from-list' && (
                                    <Form.Group className="mb-3">
                                        <Form.Label>Selecciona Candidato Existente *</Form.Label>
                                        {allCandidates.length > 0 ? (
                                            <Form.Select
                                                value={selectedExistingCandidateId}
                                                onChange={(e) => setSelectedExistingCandidateId(e.target.value)}
                                            >
                                                <option value="">-- Selecciona candidato --</option>
                                                {allCandidates.map((cand: any) => (
                                                    <option key={cand.id} value={cand.id}>
                                                        {cand.nombre} - {cand.campaignTitle} ({cand.voteCount} votos)
                                                    </option>
                                                ))}
                                            </Form.Select>
                                        ) : (
                                            <p className="text-muted text-center py-2">
                                                📭 No hay candidatos en el sistema
                                            </p>
                                        )}
                                    </Form.Group>
                                )}

                                <Button variant="success" type="submit">
                                    Agregar Candidato
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Opción 3: Ver y Editar Campañas */}
            <Row className="mt-4">
                <Col md={12}>
                    <Card>
                        <Card.Header className="bg-info text-white d-flex justify-content-between align-items-center">
                            <strong>3️⃣ Campañas Creadas</strong>
                            <small>{campaigns.length} campaña(s)</small>
                        </Card.Header>
                        <Card.Body>
                            {campaignsLoading ? (
                                <p>⏳ Cargando campañas...</p>
                            ) : campaigns.length === 0 ? (
                                <p className="text-muted">📭 No hay campañas creadas aún.</p>
                            ) : (
                                <div>
                                    <p className="text-muted small">💡 Haz clic en una campaña para expandir y ver opciones de edición</p>
                                    {campaigns.map(campaign => (
                                        <CampaignEditCard
                                            key={campaign.id}
                                            campaign={campaign}
                                            onUpdate={loadCampaigns}
                                        />
                                    ))}
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default AdminPanel;
