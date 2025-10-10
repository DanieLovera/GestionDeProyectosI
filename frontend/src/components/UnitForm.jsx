import { useEffect, useState } from "react";
import { Modal, Button, Form, InputGroup } from "react-bootstrap";

export default function UnitForm({ show, onClose, onSave, initial }) {
  const [name, setName] = useState("");
  const [surface, setSurface] = useState(0);
  const [owner, setOwner] = useState("");

  useEffect(() => {
    if (initial) {
      setName(initial.name || "");
      setSurface(initial.surface || 0);
      setOwner(initial.owner || "");
    } else {
      setName("");
      setSurface(0);
      setOwner("");
    }
  }, [initial, show]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || Number(surface) <= 0) return;
    onSave({ name, surface: Number(surface), owner });
  };

  return (
    <Modal show={show} onHide={onClose} backdrop="static" centered>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>{initial ? "Editar unidad" : "Nueva unidad"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <Form.Label>Nombre</Form.Label>
            <Form.Control value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="mb-3">
            <Form.Label>Superficie (m²)</Form.Label>
            <InputGroup>
              <Form.Control type="number" min={1} step={1} value={surface} onChange={(e) => setSurface(e.target.value)} required />
              <InputGroup.Text>m²</InputGroup.Text>
            </InputGroup>
          </div>
          <div className="mb-3">
            <Form.Label>Propietario</Form.Label>
            <Form.Control value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="Opcional" />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" type="submit">Guardar</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
