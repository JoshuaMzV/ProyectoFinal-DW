import { useState } from 'react';
import { Card, Button, Form, ListGroup, Alert, Collapse, Modal } from 'react-bootstrap';
import axios from 'axios';
import { deleteCampaign } from '../services/conpaignService';

interface Candidate {
    id: number;
    nombre: string;
    user_id?: number;
    voteCount?: number;
}

interface Campaign {
    id: number;
    titulo: string;
    descripcion: string;
    estado: string;
    candidates: Candidate[];
}

interface CampaignEditCardProps {
    campaign: Campaign;
    onUpdate: () => void;
}

const CampaignEditCard = ({ campaign, onUpdate }: CampaignEditCardProps) => {
    const apiClient = axios.create({
        baseURL: (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(/\/$/, ''),
        headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`
        }
    });

    const [expanded, setExpanded] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editTitle, setEditTitle] = useState(campaign.titulo);
    const [editDesc, setEditDesc] = useState(campaign.descripcion);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState<'success' | 'error'>('success');
    const [showResultsModal, setShowResultsModal] = useState(false);

    const handleSave = async () => {
        try {
            await apiClient.patch(`/campaigns/${campaign.id}`, {
                titulo: editTitle,
                descripcion: editDesc
            });
            setMessageType('success');
            setMessage('✅ Campaña actualizada exitosamente');
            setEditMode(false);
            onUpdate();
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
                await apiClient.delete(`/campaigns/${campaign.id}/candidates/${candidateId}`);
                setMessageType('success');
                setMessage(`✅ "${candidateName}" eliminado correctamente`);
                onUpdate();
            } catch (err: any) {
                setMessageType('error');
                setMessage(`❌ ${err.response?.data?.message || err.message}`);
            }
        }
    };

    const handleDeleteCampaign = async () => {
        if (window.confirm(`¿Estás seguro de que deseas eliminar la campaña "${campaign.titulo}"? Esta acción no se puede deshacer.`)) {
            try {
                await deleteCampaign(campaign.id);
                setMessageType('success');
                setMessage(`✅ Campaña "${campaign.titulo}" eliminada correctamente`);
                setTimeout(() => {
                    onUpdate();
                }, 1000);
            } catch (err: any) {
                setMessageType('error');
                setMessage(`❌ ${err.response?.data?.message || err.message}`);
            }
        }
    };

    return (
        <Card className="mb-3">
            <Card.Header
                className="d-flex justify-content-between align-items-center"
                style={{ 
                    cursor: 'pointer', 
                    backgroundColor: '#001a4d',
                    color: '#ffffff',
                    padding: '16px'
                }}
                onClick={() => setExpanded(!expanded)}
            >
                <div>
                    <h6 className="mb-0" style={{ color: '#ffffff', fontWeight: 600 }}>
                        {campaign.titulo}
                    </h6>
                    <small style={{ color: '#FFB700' }}>
                        ID: {campaign.id} | Candidatos: {campaign.candidates?.length || 0}
                    </small>
                </div>
                <div className="text-end">
                    <span className={`badge bg-${campaign.estado === 'habilitada' ? 'success' : campaign.estado === 'deshabilitada' ? 'warning' : 'danger'}`}>
                        {campaign.estado}
                    </span>
                    <Button
                        variant="danger"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCampaign();
                        }}
                        className="ms-2"
                        title="Eliminar campaña"
                    >
                        🗑️
                    </Button>
                </div>
            </Card.Header>

            <Collapse in={expanded}>
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

                    {!editMode ? (
                        <>
                            <p className="mb-2">
                                <strong>Descripción:</strong> {campaign.descripcion || 'N/A'}
                            </p>
                            <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => setEditMode(true)}
                                className="mb-3"
                            >
                                ✏️ Editar Información
                            </Button>
                        </>
                    ) : (
                        <div className="mb-3">
                            <Form.Group className="mb-2">
                                <Form.Label>Título</Form.Label>
                                <Form.Control
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                />
                            </Form.Group>
                            <Form.Group className="mb-2">
                                <Form.Label>Descripción</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    value={editDesc}
                                    onChange={(e) => setEditDesc(e.target.value)}
                                />
                            </Form.Group>
                            <div className="d-flex gap-2">
                                <Button variant="success" size="sm" onClick={handleSave}>
                                    💾 Guardar
                                </Button>
                                <Button variant="secondary" size="sm" onClick={() => {
                                    setEditMode(false);
                                    setEditTitle(campaign.titulo);
                                    setEditDesc(campaign.descripcion);
                                }}>
                                    ❌ Cancelar
                                </Button>
                            </div>
                        </div>
                    )}

                    <hr />

                    <h6>Candidatos ({campaign.candidates?.length || 0})</h6>
                    {campaign.candidates && campaign.candidates.length > 0 ? (
                        <ListGroup className="mb-3">
                            {campaign.candidates.map(candidate => {
                                const votes = candidate.voteCount || 0;
                                return (
                                    <ListGroup.Item key={candidate.id} className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <strong>{candidate.nombre}</strong>
                                            <br />
                                            <small className="text-muted">Votos: {votes}</small>
                                        </div>
                                        <Button
                                            variant={votes > 0 ? 'outline-secondary' : 'outline-danger'}
                                            size="sm"
                                            disabled={votes > 0}
                                            onClick={() => handleDeleteCandidate(candidate.id, candidate.nombre, votes)}
                                            title={votes > 0 ? 'No puedes eliminar un candidato con votos' : 'Eliminar candidato'}
                                        >
                                            🗑️
                                        </Button>
                                    </ListGroup.Item>
                                );
                            })}
                        </ListGroup>
                    ) : (
                        <p className="text-muted">No hay candidatos en esta campaña.</p>
                    )}

                    {/* Botón para ver resultados gráficos */}
                    {campaign.candidates && campaign.candidates.length > 0 && (
                        <div className="d-grid mt-3">
                            <Button 
                                variant="outline-success" 
                                onClick={() => setShowResultsModal(true)}
                            >
                                📊 Ver Resultados Gráficos
                            </Button>
                        </div>
                    )}
                </Card.Body>
            </Collapse>

            {/* Modal de Resultados */}
            <Modal show={showResultsModal} onHide={() => setShowResultsModal(false)} size="lg">
                <Modal.Header closeButton style={{ backgroundColor: '#001a4d', color: '#ffffff' }}>
                    <Modal.Title>📊 Resultados - {campaign.titulo}</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ backgroundColor: '#f9f9f9' }}>
                    {campaign.candidates && campaign.candidates.length > 0 ? (
                        <>
                            <p style={{ color: '#001a4d', fontWeight: 'bold', marginBottom: '20px' }}>
                                Total: {campaign.candidates.length} candidatos
                            </p>
                            {campaign.candidates.map((candidate) => {
                                const maxVotes = Math.max(...campaign.candidates.map((c) => c.voteCount || 0), 1);
                                const voteCount = candidate.voteCount || 0;
                                const percentage = (voteCount / maxVotes) * 100;
                                return (
                                    <div key={candidate.id} style={{ marginBottom: '20px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <strong style={{ fontSize: '16px' }}>{candidate.nombre}</strong>
                                            <span style={{ color: '#F4A500', fontWeight: 'bold', fontSize: '16px' }}>
                                                {voteCount} voto{voteCount !== 1 ? 's' : ''}
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
                    <Button variant="secondary" onClick={() => setShowResultsModal(false)}>
                        Cerrar
                    </Button>
                </Modal.Footer>
            </Modal>
        </Card>
    );
};

export default CampaignEditCard;
