import "react-datepicker/dist/react-datepicker.css";

import { useState, useEffect } from "react";
import { Modal, Button, Form, InputGroup, Spinner } from "react-bootstrap";
import DatePicker from "react-datepicker";
import { es } from "date-fns/locale";
import { NumericFormat } from "react-number-format";
import { format } from "date-fns";

export default function RegisterPaymentModal({ show, onSave, onClose, unitOptions = [], defaultUnitId, pendingByUnit = {} }) {
  // inicializar/actualizar datos cuando se abre el modal o cambia el defaultUnitId
  const [data, setData] = useState({ unitId: defaultUnitId || "", amount: "", date: null, method: "transferencia" });
  const [error, setError] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

  const clear = () => {
    setData({ unitId: defaultUnitId || "", amount: "", date: null, method: "transferencia" });
    setError({});
  };

  useEffect(() => {
    if (show) {
      // cuando se abra el modal, setear valores iniciales (unitId puede cambiar entre aperturas)
      setData((p) => ({
        unitId: defaultUnitId || "",
        amount: "",
        date: new Date(),
        method: p.method || "transferencia",
      }));
      setError({});
    }
  }, [show, defaultUnitId]);

  const validate = () => {
    const e = {};
    if (!data.unitId) e.unitId = "Unidad obligatoria";
    if (!data.amount) {
      e.amount = "Monto obligatorio";
    } else {
      const max = Number(pendingByUnit?.[data.unitId] || 0);
      const val = Number(data.amount);
      if (max > 0 && val > max) {
        e.amount = `El monto no puede superar el pendiente ($${max.toLocaleString("es-AR")})`;
      } else if (val <= 0) {
        e.amount = "El monto debe ser mayor a 0";
      }
    }
    if (!data.date) e.date = "Fecha obligatoria";
    setError(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setIsProcessing(true);
      // enviar amount como número (fallback a 0 si no es válido)
      // incluir ambas claves unitId y unit_id para compatibilidad con backend/frontend
      const payload = {
        ...data,
        date: format(data.date, "yyyy-MM-dd"),
        amount: Number(data.amount) || 0,
        unitId: data.unitId || data.unit_id || "",
        unit_id: data.unitId || data.unit_id || ""
      };
      await onSave(payload);
      clear();
    } finally {
      setIsProcessing(false);
    }
  };

  const close = () => {
    onClose();
    setError({});
  };

  return (
    <Modal show={show} onHide={close} backdrop="static" centered>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton={!isProcessing}>
          <Modal.Title>Registrar pago</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {isProcessing && (
            <div className="d-flex align-items-center gap-2 mb-2">
              <Spinner size="sm" /> <span>Procesando...</span>
            </div>
          )}

          <Form.Group className="mb-3">
            <Form.Label>Unidad</Form.Label>
            <Form.Select
              value={data.unitId}
              onChange={(e) => setData((p) => ({ ...p, unitId: e.target.value }))}
              isInvalid={!!error.unitId}
            >
              <option value="">-- Seleccionar unidad --</option>
              {unitOptions.map((u) => (
                <option key={u.value} value={u.value}>{u.label}</option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">{error.unitId}</Form.Control.Feedback>
            {data.unitId && (
              <div className="form-text">
                Pendiente: {Number(pendingByUnit?.[data.unitId] || 0).toLocaleString("es-AR", { style: "currency", currency: "ARS" })}
              </div>
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Método</Form.Label>
            <Form.Select value={data.method} onChange={(e) => setData((p) => ({ ...p, method: e.target.value }))}>
              <option value="transferencia">Transferencia</option>
              <option value="efectivo">Efectivo</option>
              <option value="tarjeta">Tarjeta</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Monto</Form.Label>
            <InputGroup>
              <InputGroup.Text>$</InputGroup.Text>
              <NumericFormat
                className={`form-control ${error.amount ? "is-invalid" : ""}`}
                value={data.amount}
                thousandSeparator="."
                decimalSeparator="," 
                decimalScale={2}
                fixedDecimalScale
                allowNegative={false}
                onValueChange={(v) => setData((p) => ({ ...p, amount: v.value }))}
              />
              <Form.Control.Feedback type="invalid">{error.amount}</Form.Control.Feedback>
            </InputGroup>
          </Form.Group>

          <Form.Group>
            <Form.Label>Fecha</Form.Label>
            <DatePicker
              className={`form-control ${error.date ? "is-invalid" : ""}`}
              placeholderText="Seleccionar fecha"
              locale={es}
              dateFormat="dd/MM/yyyy"
              selected={data.date}
              onChange={(d) => setData((p) => ({ ...p, date: d }))}
            />
            {error.date && <div className="invalid-feedback d-block">{error.date}</div>}
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={close}>Cancelar</Button>
          <Button type="submit" variant="primary">Guardar</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
