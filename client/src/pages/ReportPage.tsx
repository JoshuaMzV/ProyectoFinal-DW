import { useState, useEffect } from 'react';
import { Container, Table, Card, Button, Alert, Spinner, Row, Col, Form } from 'react-bootstrap';
import { useAuth } from '../context/authContext';
import { getAllCampaigns } from '../services/conpaignService';
import '../styles/pages/ReportPage.scss';

interface CampaignReport {
    id: number;
    titulo: string;
    descripcion: string;
    estado: string;
    totalCandidatos: number;
    totalVotos: number;
    fecha_inicio?: string;
    fecha_fin?: string;
}

const ReportPage = () => {
    const { user } = useAuth();
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [reportData, setReportData] = useState<CampaignReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState<'success' | 'error'>('success');
    const [exportFormat, setExportFormat] = useState('csv');

    useEffect(() => {
        loadReport();
    }, []);

    const loadReport = async () => {
        setLoading(true);
        try {
            const data = await getAllCampaigns();
            setCampaigns(data);

            // Procesar datos para el reporte
            const report = data.map(campaign => ({
                id: campaign.id,
                titulo: campaign.titulo,
                descripcion: campaign.descripcion || 'N/A',
                estado: campaign.estado,
                totalCandidatos: campaign.candidates?.length || 0,
                totalVotos: campaign.candidates?.reduce((sum: number, c: any) => sum + (c.voteCount || 0), 0) || 0,
                fecha_inicio: campaign.fecha_inicio,
                fecha_fin: campaign.fecha_fin,
            }));

            setReportData(report);
            setMessageType('success');
            setMessage('✅ Reporte cargado exitosamente');
        } catch (err: any) {
            setMessageType('error');
            setMessage('❌ Error al cargar el reporte');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const exportToCSV = () => {
        const headers = ['ID', 'Campaña', 'Estado', 'Candidatos', 'Total Votos', 'Inicio', 'Fin'];
        const rows = reportData.map(r => [
            r.id,
            r.titulo,
            r.estado,
            r.totalCandidatos,
            r.totalVotos,
            r.fecha_inicio?.split('T')[0] || 'N/A',
            r.fecha_fin?.split('T')[0] || 'N/A',
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte-votaciones-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        setMessageType('success');
        setMessage('✅ Reporte exportado a CSV');
    };

    const exportToJSON = () => {
        const jsonContent = JSON.stringify(reportData, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte-votaciones-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        setMessageType('success');
        setMessage('✅ Reporte exportado a JSON');
    };

    const printReport = () => {
        window.print();
    };

    if (!user || user.role !== 'admin') {
        return (
            <Container className="mt-4">
                <Alert variant="danger">❌ No tienes acceso a esta página. Solo administradores pueden acceder.</Alert>
            </Container>
        );
    }

    return (
        <Container className="report-page mt-4 mb-4">
            <Row>
                <Col md={12}>
                    <Card className="report-card">
                        <Card.Header className="report-header">
                            <h2 className="mb-0">📊 Reporte General de Votaciones</h2>
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

                            <div className="report-actions mb-4">
                                <h5>📥 Exportar Reporte</h5>
                                <div className="btn-group" role="group">
                                    <Button
                                        variant="info"
                                        onClick={exportToCSV}
                                        className="me-2"
                                    >
                                        📄 Descargar CSV
                                    </Button>
                                    <Button
                                        variant="warning"
                                        onClick={exportToJSON}
                                        className="me-2"
                                    >
                                        📋 Descargar JSON
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        onClick={printReport}
                                    >
                                        🖨️ Imprimir
                                    </Button>
                                </div>
                            </div>

                            <hr />

                            <h5 className="mb-3">📈 Resumen de Campañas</h5>

                            {loading ? (
                                <div className="text-center py-5">
                                    <Spinner animation="border" />
                                    <p className="mt-2">Cargando reporte...</p>
                                </div>
                            ) : reportData.length === 0 ? (
                                <Alert variant="info">📭 No hay campañas para mostrar.</Alert>
                            ) : (
                                <>
                                    <div className="table-responsive">
                                        <Table hover striped bordered className="report-table">
                                            <thead>
                                                <tr className="table-header">
                                                    <th>#</th>
                                                    <th>📌 Campaña</th>
                                                    <th>🔄 Estado</th>
                                                    <th>👥 Candidatos</th>
                                                    <th>🗳️ Total Votos</th>
                                                    <th>📅 Inicio</th>
                                                    <th>📅 Fin</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {reportData.map((campaign, index) => (
                                                    <tr key={campaign.id}>
                                                        <td className="fw-bold">{index + 1}</td>
                                                        <td>
                                                            <strong>{campaign.titulo}</strong>
                                                            <br />
                                                            <small className="text-muted">{campaign.descripcion}</small>
                                                        </td>
                                                        <td>
                                                            <span className={`badge bg-${campaign.estado === 'habilitada' ? 'success' : campaign.estado === 'deshabilitada' ? 'warning' : 'danger'}`}>
                                                                {campaign.estado}
                                                            </span>
                                                        </td>
                                                        <td className="text-center">
                                                            <span className="badge bg-info">{campaign.totalCandidatos}</span>
                                                        </td>
                                                        <td className="text-center">
                                                            <strong className="text-primary">{campaign.totalVotos}</strong>
                                                        </td>
                                                        <td>{campaign.fecha_inicio?.split('T')[0] || 'N/A'}</td>
                                                        <td>{campaign.fecha_fin?.split('T')[0] || 'N/A'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </div>

                                    {/* Estadísticas de resumen */}
                                    <hr />
                                    <Row className="statistics mt-4">
                                        <Col md={3} className="mb-3">
                                            <Card className="stat-card">
                                                <Card.Body className="text-center">
                                                    <h4 className="stat-number">{reportData.length}</h4>
                                                    <p className="stat-label">Total de Campañas</p>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                        <Col md={3} className="mb-3">
                                            <Card className="stat-card">
                                                <Card.Body className="text-center">
                                                    <h4 className="stat-number">{reportData.reduce((sum, c) => sum + c.totalCandidatos, 0)}</h4>
                                                    <p className="stat-label">Total de Candidatos</p>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                        <Col md={3} className="mb-3">
                                            <Card className="stat-card">
                                                <Card.Body className="text-center">
                                                    <h4 className="stat-number">{reportData.reduce((sum, c) => sum + c.totalVotos, 0)}</h4>
                                                    <p className="stat-label">Total de Votos</p>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                        <Col md={3} className="mb-3">
                                            <Card className="stat-card">
                                                <Card.Body className="text-center">
                                                    <h4 className="stat-number">{reportData.filter(c => c.estado === 'habilitada').length}</h4>
                                                    <p className="stat-label">Campañas Activas</p>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    </Row>
                                </>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default ReportPage;
