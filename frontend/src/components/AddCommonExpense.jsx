import "react-datepicker/dist/react-datepicker.css";

import { useState } from "react";
import { Modal, Button, Form, InputGroup, Spinner } from "react-bootstrap";
import { FaCalendarAlt, FaDollarSign } from "react-icons/fa";
import DatePicker from "react-datepicker";
import { es } from "date-fns/locale";
import { NumericFormat } from "react-number-format";
import { format } from "date-fns";
import { startOfMonth, endOfMonth } from "date-fns";

import "./AddCommonExpense.css";

export default function AddCommonExpense({ show, onSave, onClose }) {
    const [data, setData] = useState({
        description: "",
        amount: "",
        date: "",
    });
    const [error, setError] = useState({});
    const [isSaving, setIsSaving] = useState(false);

    const clearData = () => setData({ description: "", amount: "", date: "" });
    const clearError = () => setError({});
    const clearState = () => {
        clearData();
        clearError();
    };

    const validateForm = () => {
        const error = {};

        if (!data.description.trim()) error.description = "El campo concepto es obligatorio";
        if (!data.amount) error.amount = "El campo monto es obligatorio y debe ser numérico";
        if (!data.date) error.date = "El campo fecha es obligatorio";

        setError(error);
        return Object.keys(error).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData((prev) => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (date) => {
        setData((prev) => ({ ...prev, date }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            try {
                setIsSaving(true);
                await onSave({
                    ...data,
                    date: format(data.date, "yyyy-MM-dd"),
                });
                clearState();
            } catch {
                // Handle error if needed
                console.error("Error saving expense");
            } finally {
                setIsSaving(false);
            }
        }
    };

    const handleClose = () => {
        onClose();
        clearError();
    };

    return (
        <Modal show={show} onHide={handleClose} backdrop="static" centered>
            <div className="modal-wrapper">
                {isSaving && (
                    <div className="saving-overlay">
                        <Spinner animation="border" role="status" variant="primary" className="saving-spinner" />
                        <span className="saving-text fw-semibold text-primary">Guardando...</span>
                    </div>
                )}

                <Form onSubmit={handleSubmit}>
                    <Modal.Header className="py-3 px-4" closeButton={!isSaving}>
                        <Modal.Title>Agregar gasto común</Modal.Title>
                    </Modal.Header>

                    <Modal.Body className="py-3 px-4">
                        <Form.Group className="mb-3">
                            <Form.Label htmlFor="description">
                                Concepto <span className="text-danger">*</span>
                            </Form.Label>
                            <Form.Control
                                type="text"
                                name="description"
                                placeholder="Ingresar concepto"
                                autoComplete="off"
                                value={data.description}
                                isInvalid={!!error.description}
                                onChange={handleChange}
                            />
                            <Form.Control.Feedback type="invalid">{error.description}</Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label htmlFor="description">
                                Monto <span className="text-danger">*</span>
                            </Form.Label>
                            <InputGroup>
                                <InputGroup.Text>
                                    <FaDollarSign />
                                </InputGroup.Text>
                                <NumericFormat
                                    className={`form-control ${error.amount ? "is-invalid" : ""}`}
                                    name="amount"
                                    placeholder="0,00"
                                    autoComplete="off"
                                    thousandSeparator="."
                                    decimalSeparator=","
                                    decimalScale={2}
                                    fixedDecimalScale
                                    allowNegative={false}
                                    value={data.amount}
                                    onValueChange={(values) => {
                                        setData((prev) => ({ ...prev, amount: values.value }));
                                    }}
                                />
                                <Form.Control.Feedback type="invalid">{error.amount}</Form.Control.Feedback>
                            </InputGroup>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label htmlFor="date">
                                Fecha <span className="text-danger">*</span>
                            </Form.Label>
                            <InputGroup>
                                <InputGroup.Text>
                                    <FaCalendarAlt />
                                </InputGroup.Text>
                                <DatePicker
                                    className={`form-control ${error.date ? "is-invalid" : ""}`}
                                    placeholderText="Seleccionar fecha"
                                    locale={es}
                                    dateFormat="dd/MM/yyyy"
                                    maxDate={new Date()}
                                    selected={data.date}
                                    onChange={handleDateChange}
                                />
                                {error.date && <div className="invalid-feedback d-block">{error.date}</div>}
                            </InputGroup>
                        </Form.Group>
                    </Modal.Body>

                    <Modal.Footer className="py-3 px-4">
                        <Button className="m-0" variant="secondary" onClick={handleClose}>
                            Cancelar
                        </Button>
                        <Button className="m-0 ms-3" type="submit" variant="primary">
                            Guardar
                        </Button>
                    </Modal.Footer>
                </Form>
            </div>
        </Modal>
    );
}
