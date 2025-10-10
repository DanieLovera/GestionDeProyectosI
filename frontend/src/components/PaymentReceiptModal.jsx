import { Modal, Button } from "react-bootstrap";

export default function PaymentReceiptModal({ show, onClose, receipt }) {
  // receipt: { number, date, unitName, amount, method }
  if (!receipt) return null;
  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Recibo de pago</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="mb-2"><strong>Número:</strong> {receipt.number}</div>
        <div className="mb-2"><strong>Fecha:</strong> {receipt.date}</div>
        <div className="mb-2"><strong>Unidad:</strong> {receipt.unitName}</div>
        <div className="mb-2"><strong>Método:</strong> {receipt.method}</div>
        <div className="mb-2"><strong>Monto:</strong> {receipt.amount.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={onClose}>Cerrar</Button>
      </Modal.Footer>
    </Modal>
  );
}
