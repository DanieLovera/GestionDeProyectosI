import { Card } from "react-bootstrap";

export default function InfoCard({ title, info, formatFn }) {
    const infoFormatted = formatFn ? formatFn(info) : info;

    return (
        <Card className="border-0 shadow-sm mb-3">
            <Card.Body>
                <div className="d-flex flex-column">
                    <h6 className="fw-bold text-dark mb-2">{title}</h6>
                    <h3 className="fw-semibold text-dark mb-0">{infoFormatted}</h3>
                </div>
            </Card.Body>
        </Card>
    );
}
