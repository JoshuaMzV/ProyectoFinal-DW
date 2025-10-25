import React from 'react';
import { Card } from 'react-bootstrap';

interface Candidate {
    id: number;
    nombre: string;
    voteCount: number;
}

interface VotesChartSimpleProps {
    candidates: Candidate[];
    campañaTitulo: string;
}

const VotesChartSimple: React.FC<VotesChartSimpleProps> = ({ candidates, campañaTitulo }) => {
    console.log('VotesChartSimple received:', { candidates, campañaTitulo });

    if (!candidates || candidates.length === 0) {
        return (
            <Card className="mb-4">
                <Card.Header style={{ backgroundColor: '#001a4d', color: '#ffffff' }}>
                    <h5 className="mb-0">📊 Resultados - {campañaTitulo}</h5>
                </Card.Header>
                <Card.Body>
                    <p className="text-muted">No hay candidatos</p>
                </Card.Body>
            </Card>
        );
    }

    // Encontrar el máximo de votos para escalar la barra
    const maxVotes = Math.max(...candidates.map(c => c.voteCount), 1);

    return (
        <Card className="mb-4">
            <Card.Header style={{ backgroundColor: '#001a4d', color: '#ffffff' }}>
                <h5 className="mb-0">📊 Resultados - {campañaTitulo}</h5>
            </Card.Header>
            <Card.Body>
                {candidates.map(candidate => (
                    <div key={candidate.id} className="mb-3">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                            <strong>{candidate.nombre}</strong>
                            <span style={{ color: '#F4A500', fontWeight: 'bold' }}>
                                {candidate.voteCount} voto{candidate.voteCount !== 1 ? 's' : ''}
                            </span>
                        </div>
                        <div style={{
                            backgroundColor: '#e9ecef',
                            height: '30px',
                            borderRadius: '5px',
                            overflow: 'hidden',
                            border: '1px solid #001a4d'
                        }}>
                            <div style={{
                                backgroundColor: '#F4A500',
                                height: '100%',
                                width: `${(candidate.voteCount / maxVotes) * 100}%`,
                                transition: 'width 0.3s ease'
                            }} />
                        </div>
                    </div>
                ))}
            </Card.Body>
        </Card>
    );
};

export default VotesChartSimple;
