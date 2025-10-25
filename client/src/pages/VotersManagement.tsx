import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/authContext';
import { getAllVoters, deleteVoter, Voter } from '../services/voterService';
import '../styles/pages/VotersManagement.scss';

const VotersManagement = () => {
    const { user } = useAuth();
    const [voters, setVoters] = useState<Voter[]>([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState<'success' | 'error'>('success');

    // Cargar votantes
    useEffect(() => {
        loadVoters();
    }, []);

    const loadVoters = async () => {
        setLoading(true);
        try {
            const data = await getAllVoters();
            setVoters(data);
        } catch (err: any) {
            setMessageType('error');
            setMessage('Error al cargar los votantes');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteVoter = async (voterId: number, voterName: string) => {
        if (window.confirm(`¿Estás seguro de que deseas eliminar al votante "${voterName}"? Esta acción no se puede deshacer.`)) {
            try {
                await deleteVoter(voterId);
                setMessageType('success');
                setMessage(`✅ "${voterName}" eliminado correctamente`);
                await loadVoters();
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
        <Container className="voters-management mt-4 mb-4">
            <Row>
                <Col md={12}>
                    <Card className="management-card">
                        <Card.Header className="management-header">
                            <h2 className="mb-0">👥 Gestión de Votantes</h2>
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

                            <div className="stats-section mb-4">
                                <div className="stat-badge">
                                    <span className="stat-label">Total de Votantes:</span>
                                    <span className="stat-value">{voters.length}</span>
                                </div>
                            </div>

                            {loading ? (
                                <div className="text-center py-5">
                                    <Spinner animation="border" />
                                    <p className="mt-2">Cargando votantes...</p>
                                </div>
                            ) : voters.length === 0 ? (
                                <Alert variant="info">📭 No hay votantes registrados aún.</Alert>
                            ) : (
                                <div className="table-responsive">
                                    <Table hover className="voters-table">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>👤 Nombre Completo</th>
                                                <th>📧 Email</th>
                                                <th>👤 Usuario</th>
                                                <th>#️⃣ Colegiado</th>
                                                <th>📅 Registrado</th>
                                                <th>⚙️ Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {voters.map((voter, index) => (
                                                <tr key={voter.id}>
                                                    <td>{index + 1}</td>
                                                    <td className="voter-name">{voter.nombre_completo}</td>
                                                    <td>{voter.email}</td>
                                                    <td>{voter.username}</td>
                                                    <td>{voter.numero_colegiado || 'N/A'}</td>
                                                    <td>
                                                        {voter.created_at
                                                            ? new Date(voter.created_at).toLocaleDateString('es-ES')
                                                            : 'N/A'}
                                                    </td>
                                                    <td>
                                                        <Button
                                                            variant="danger"
                                                            size="sm"
                                                            onClick={() => handleDeleteVoter(voter.id, voter.nombre_completo)}
                                                            title="Eliminar votante"
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
        </Container>
    );
};

export default VotersManagement;
