import { Modal, Button, Table, Spinner, Badge } from "react-bootstrap";
import { useQuery } from "@tanstack/react-query";
import { getUnitMovements } from "../services/reports";
import { exportToCsv } from "../utils/exportToCsv";

export default function UnitMovementsModal({ show, onClose, unit, month }) {
  const unitId = unit?.id;
  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["reports-unit-movements", unitId, month],
    queryFn: () => getUnitMovements(unitId, parseInt(month)),
    enabled: show && Boolean(unitId),
  });

  const periodLabel = data?.period
    ? `${String(data.period.month).padStart(2, "0")}/${data.period.year}`
    : "";

  const handleExport = () => {
    if (!data?.movements?.length) return;
    const rows = data.movements.map((m) => ({
      Fecha: m.date,
      Tipo: m.type === "payment" ? "Pago" : m.type === "expense" ? "Expensa" : m.type,
      Descripcion: m.description,
      Importe: m.amount,
    }));
    exportToCsv(`movimientos_${unit?.name || unit?.id}_${periodLabel}.csv`, rows);
  };

  return (
    <Modal show={show} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          Movimientos — {unit?.name || unit?.id}
          {periodLabel ? ` (${periodLabel})` : ""}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {isLoading && (
          <div className="d-flex justify-content-center py-4">
            <Spinner animation="border" />
          </div>
        )}
        {isError && (
          <div className="alert alert-danger" role="alert">
            Error al cargar movimientos{error?.message ? `: ${error.message}` : ""}
          </div>
        )}
        {!isLoading && !isError && (
          <>
            {(!data?.movements || data.movements.length === 0) ? (
              <div className="text-center text-muted py-3">Sin movimientos para el período.</div>
            ) : (
              <Table striped bordered hover responsive>
                <thead className="table-light">
                  <tr>
                    <th>Fecha</th>
                    <th>Tipo</th>
                    <th>Descripción</th>
                    <th className="text-end">Importe</th>
                  </tr>
                </thead>
                <tbody>
                  {data.movements.map((m, idx) => (
                    <tr key={idx}>
                      <td>{m.date}</td>
                      <td>
                        {m.type === "payment" ? (
                          <Badge bg="success">Pago</Badge>
                        ) : m.type === "expense" ? (
                          <Badge bg="secondary">Expensa</Badge>
                        ) : (
                          <Badge bg="info">{m.type}</Badge>
                        )}
                      </td>
                      <td>{m.description}</td>
                      <td className="text-end">
                        {m.amount.toLocaleString("es-AR", { style: "currency", currency: "ARS" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3} className="text-end fw-bold">Saldo</td>
                    <td className="text-end fw-bold">
                      {data.balance.toLocaleString("es-AR", { style: "currency", currency: "ARS" })}
                    </td>
                  </tr>
                </tfoot>
              </Table>
            )}
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={handleExport} disabled={!data?.movements?.length}>
          Exportar CSV
        </Button>
        <Button variant="primary" onClick={onClose}>Cerrar</Button>
      </Modal.Footer>
    </Modal>
  );
}
