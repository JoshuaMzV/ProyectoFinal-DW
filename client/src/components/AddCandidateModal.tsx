import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

interface Props {
  show: boolean;
  onHide: () => void;
  onCreate?: (data: { nombre: string; campaign_id: number }) => void;
}

const AddCandidateModal: React.FC<Props> = ({ show, onHide, onCreate }) => {
  const [nombre, setNombre] = React.useState('');
  const [campaignId, setCampaignId] = React.useState<number | ''>('');

  const handleCreate = () => {
    if (!nombre || !campaignId) return;
    onCreate?.({ nombre, campaign_id: Number(campaignId) });
    setNombre('');
    setCampaignId('');
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Agregar Candidato</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group>
          <Form.Label>Nombre</Form.Label>
          <Form.Control value={nombre} onChange={(e) => setNombre(e.target.value)} />
        </Form.Group>
        <Form.Group className="mt-3">
          <Form.Label>ID de Campaña</Form.Label>
          <Form.Control value={campaignId as any} onChange={(e) => setCampaignId(e.target.value ? Number(e.target.value) : '')} />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancelar</Button>
        <Button variant="primary" onClick={handleCreate}>Crear</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddCandidateModal;
