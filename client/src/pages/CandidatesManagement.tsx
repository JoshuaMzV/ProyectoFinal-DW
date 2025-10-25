import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Table, Alert, Spinner, Modal } from 'react-bootstrap';
import { useAuth } from '../context/authContext';
import { getAllCampaigns } from '../services/conpaignService';
import { getAllCandidates, createCandidate, deleteCandidate, Candidate } from '../services/candidateService';
import { getAllVoters } from '../services/voterService';
import '../styles/pages/CandidatesManagement.scss';

interface Campaign {
    id: number;
    titulo: string;
}

interface Voter {
    id: number;
    nombre_completo: string;
}

const CandidatesManagement = () => {
    const { user } = useAuth();
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [voters, setVoters] = useState<Voter[]>([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState<'success' | 'error'>('success');
    
    // Form states
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        nombre: '',
        campaign_id: '',
        addType: 'manual' // 'manual' o 'from_voter'
    });
    const [selectedVoter, setSelectedVoter] = useState<Voter | null>(null);

    // Cargar candidatos y campañas
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [candidatesData, campaignsData, votersData] = await Promise.all([
                getAllCandidates(),
                getAllCampaigns(),
                getAllVoters()
            ]);
            setCandidates(candidatesData);
            setCampaigns(campaignsData);
            setVoters(votersData);
        } catch (err: any) {
            setMessageType('error');
            setMessage('Error al cargar los datos');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: any) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleVoterSelect = (voter: Voter) => {
        setSelectedVoter(voter);
        setFormData({
            ...formData,
            nombre: voter.nombre_completo,
            addType: 'from_voter'
        });
    };

    const handleCreateCandidate = async () => {
        if (!formData.nombre || !formData.campaign_id) {
            setMessageType('error');
            setMessage('Por favor completa todos los campos');
            return;
        }

        try {
            await createCandidate(formData.nombre, parseInt(formData.campaign_id));
            setMessageType('success');
            setMessage('✅ Candidato creado exitosamente');
            setFormData({ nombre: '', campaign_id: '', addType: 'manual' });
            setSelectedVoter(null);
            setShowModal(false);
            await loadData();
        } catch (err: any) {
            setMessageType('error');
            setMessage(`❌ ${err.response?.data?.message || err.message}`);
        }
    };

    const handleDeleteCandidate = async (candidateId: number, candidateName: string, voteCount: number) => {
        if (voteCount > 0) {
            setMessageType('error');
            setMessage(`❌ No puedes eliminar "${candidateName}" porque ya tiene ${voteCount} voto(s)`);
            return;
        }

        if (window.confirm(`¿Estás seguro de que deseas eliminar a "${candidateName}"?`)) {
            try {
                await deleteCandidate(candidateId);
                setMessageType('success');
                setMessage(`✅ "${candidateName}" eliminado correctamente`);
                await loadData();
            } catch (err: any) {
                setMessageType('error');
                setMessage(`❌ ${err.response?.data?.message || err.message}`);
            }
        }
    };

    if (!user || user.role !== 'admin') {
        return (
            <Container className="mt-4">
                <Alert variant="danger">No tienes acceso a esta página. Solo administradores pueden acceder.</Alert>
            </Container>
        );
    }

    return (
        <Container className="candidates-management mt-4 mb-4">
            <Row>
                <Col md={12}>
                    <Card className="management-card">
                        <Card.Header className="management-header">
                            <h2 className="mb-0">👥 Gestión de Candidatos</h2>
                        </Card.Header>

                        <Card.Body>
                            {message && (
                                <Alert
                                    variant={messageType === 'success' ? 'success' : 'danger'}
                                    onClose={() => setMessage('')}
                                    dismissible
                                >
                                    {message}
                                </Alert>
                            )}

                            <Button
                                variant="success"
                                size="lg"
                                onClick={() => setShowModal(true)}
                                className="mb-4"
                            >
                                ➕ Agregar Candidato
                            </Button>

                            {loading ? (
                                <div className="text-center py-5">
                                    <Spinner animation="border" />
                                    <p className="mt-2">Cargando candidatos...</p>
                                </div>
                            ) : candidates.length === 0 ? (
                                <Alert variant="info">📭 No hay candidatos registrados aún.</Alert>
                            ) : (
                                <div className="table-responsive">
                                    <Table hover className="candidates-table">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>👤 Nombre</th>
                                                <th>📋 Campaña</th>
                                                <th>🗳️ Votos</th>
                                                <th>⚙️ Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {candidates.map((candidate, index) => (
                                                <tr key={candidate.id}>
                                                    <td>{index + 1}</td>
                                                    <td className="candidate-name">{candidate.nombre}</td>
                                                    <td>{candidate.campaign_titulo || 'N/A'}</td>
                                                    <td>
                                                        <span className="badge bg-info">{candidate.voteCount}</span>
                                                    </td>
                                                    <td>
                                                        <Button
                                                            variant="danger"
                                                            size="sm"
                                                            onClick={() => handleDeleteCandidate(candidate.id, candidate.nombre, candidate.voteCount)}
                                                            disabled={candidate.voteCount > 0}
                                                            title={candidate.voteCount > 0 ? 'No puedes eliminar un candidato con votos' : 'Eliminar candidato'}
                                                        >
                                                            🗑️ Eliminar
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Modal para crear candidato */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header closeButton className="management-modal-header">
                    <Modal.Title>➕ Agregar Nuevo Candidato</Modal.Title>
                </Modal.Header>
                <Modal.Body className="management-modal-body">
                    {/* Tabs para elegir entre crear manual o desde votante */}
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Tipo de Agregación</Form.Label>
                        <div className="btn-group w-100" role="group">
                            <input
                                type="radio"
                                className="btn-check"
                                name="addType"
                                id="addTypeManual"
                                value="manual"
                                checked={formData.addType === 'manual'}
                                onChange={handleInputChange}
                            />
                            <label className="btn btn-outline-primary" htmlFor="addTypeManual">
                                ✏️ Crear Manual
                            </label>

                            <input
                                type="radio"
                                className="btn-check"
                                name="addType"
                                id="addTypeVoter"
                                value="from_voter"
                                checked={formData.addType === 'from_voter'}
                                onChange={handleInputChange}
                            />
                            <label className="btn btn-outline-primary" htmlFor="addTypeVoter">
                                👥 Desde Votante
                            </label>
                        </div>
                    </Form.Group>

                    {formData.addType === 'manual' ? (
                        <>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Nombre del Candidato</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleInputChange}
                                    placeholder="Ej: Juan Pérez"
                                    className="form-control-lg"
                                />
                            </Form.Group>
                        </>
                    ) : (
                        <>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Seleccionar Votante</Form.Label>
                                <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '4px' }}>
                                    {voters.length === 0 ? (
                                        <Alert variant="info" className="mb-0">No hay votantes disponibles</Alert>
                                    ) : (
                                        voters.map(voter => (
                                            <Button
                                                key={voter.id}
                                                variant={selectedVoter?.id === voter.id ? 'primary' : 'light'}
                                                className="w-100 text-start p-2"
                                                onClick={() => handleVoterSelect(voter)}
                                                style={{ border: 'none', borderRadius: '0', textAlign: 'left' }}
                                            >
                                                {voter.nombre_completo}
                                            </Button>
                                        ))
                                    )}
                                </div>
                            </Form.Group>
                            {selectedVoter && (
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">Nombre (copiado)</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.nombre}
                                        disabled
                                        className="form-control-lg"
                                    />
                                </Form.Group>
                            )}
                        </>
                    )}

                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Seleccionar Campaña</Form.Label>
                        <Form.Select
                            name="campaign_id"
                            value={formData.campaign_id}
                            onChange={handleInputChange}
                            className="form-control-lg"
                        >
                            <option value="">-- Selecciona una campaña --</option>
                            {campaigns.map(campaign => (
                                <option key={campaign.id} value={campaign.id}>
                                    {campaign.titulo}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button 
                        variant="secondary" 
                        onClick={() => {
                            setShowModal(false);
                            setFormData({ nombre: '', campaign_id: '', addType: 'manual' });
                            setSelectedVoter(null);
                        }}
                    >
                        Cancelar
                    </Button>
                    <Button variant="success" onClick={handleCreateCandidate} size="lg">
                        ✅ Crear Candidato
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default CandidatesManagement;
