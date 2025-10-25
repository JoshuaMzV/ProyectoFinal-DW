import React from 'react';
import { Table, Button } from 'react-bootstrap';

interface Candidate {
  id: number;
  nombre: string;
  campaign_titulo?: string;
  voteCount?: number;
}

interface Props {
  candidates: Candidate[];
  onDelete?: (id: number) => void;
}

const CandidatesTable: React.FC<Props> = ({ candidates = [], onDelete }) => {
  return (
    <Table hover>
      <thead>
        <tr>
          <th>#</th>
          <th>Nombre</th>
          <th>Campaña</th>
          <th>Votos</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {candidates.map((c, i) => (
          <tr key={c.id}>
            <td>{i + 1}</td>
            <td>{c.nombre}</td>
            <td>{c.campaign_titulo}</td>
            <td>{c.voteCount ?? 0}</td>
            <td>
              <Button size="sm" variant="danger" onClick={() => onDelete?.(c.id)}>Eliminar</Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default CandidatesTable;
