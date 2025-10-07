import { Card } from "react-bootstrap";

export default function TotalExpense({ total }) {
    const formatTotal = total.toLocaleString("es-AR", {
        style: "currency",
        currency: "ARS",
    });

    return (
        <Card className="border-0 shadow-sm mb-3">
            <Card.Body>
                <div className="d-flex flex-column">
                    <h6 className="fw-bold text-dark mb-2">Total del mes</h6>
                    <h3 className="fw-semibold text-dark mb-0">{formatTotal}</h3>
                </div>
            </Card.Body>
        </Card>
    );
}
