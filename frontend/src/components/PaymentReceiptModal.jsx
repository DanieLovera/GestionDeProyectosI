import { Modal, Button } from "react-bootstrap";

export default function PaymentReceiptModal({ show, onClose, receipt }) {
  // si no hay receipt, mostramos un modal con mensaje de espera para evitar errores y pantalla en negro
  if (!receipt) {
    return (
      <Modal show={show} onHide={onClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Recibo de pago</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center text-muted">Recibo no disponible aún.</div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={onClose}>Cerrar</Button>
        </Modal.Footer>
      </Modal>
    );
  }

  // formateo seguro del monto (evita llamar toLocaleString sobre undefined)
  const rawAmount = Number(receipt?.amount);
  const amountForDisplay = !isNaN(rawAmount) ? rawAmount : 0;
  const dateForDisplay = receipt?.date || "N/A";
  const numberForDisplay = receipt?.number ?? "N/A";
  const unitForDisplay = receipt?.unitName ?? "N/A";
  const methodForDisplay = receipt?.method ?? "N/A";

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Recibo de pago</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="mb-2"><strong>Número:</strong> {numberForDisplay}</div>
        <div className="mb-2"><strong>Fecha:</strong> {dateForDisplay}</div>
        <div className="mb-2"><strong>Unidad:</strong> {unitForDisplay}</div>
        <div className="mb-2"><strong>Método:</strong> {methodForDisplay}</div>
        <div className="mb-2">
          <strong>Monto:</strong>{" "}
          {amountForDisplay.toLocaleString("es-AR", { style: "currency", currency: "ARS" })}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={onClose}>Cerrar</Button>
      </Modal.Footer>
    </Modal>
  );
}
