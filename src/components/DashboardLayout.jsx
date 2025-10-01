import { Container, Row, Col } from "react-bootstrap";
import Sidebar from "./Sidebar.jsx";
import Header from "./Header.jsx";

function DashboardLayout({ children }) {
    return (
        <Container fluid className="vh-100">
            <Row className="h-100">
                <Col xs="auto" className="p-0">
                    <Sidebar />
                </Col>
                <Col className="d-flex flex-column p-0">
                    <Header />
                    <div className="flex-grow-1 bg-white py-2 px-3 mx-4 shadow-sm rounded">
                        {children}
                    </div>
                </Col>
            </Row>
        </Container>
    );
}

export default DashboardLayout;
