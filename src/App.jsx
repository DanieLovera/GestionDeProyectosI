import { BrowserRouter } from "react-router";
import { Container, Row, Col } from "react-bootstrap";

import Sidebar from "./components/Sidebar.jsx";
import Header from "./components/Header.jsx";
import Routes from "./components/Routes.jsx";

function App() {
    return (
        <BrowserRouter>
            <Container fluid className="vh-100">
                <Row className="h-100">
                    <Col xs="auto" className="p-0">
                        <Sidebar />
                    </Col>

                    <Col className="d-flex flex-column p-0">
                        <Header />
                        <div className="flex-grow-1 bg-white py-2 px-3 mx-4 shadow-sm rounded">
                            <Routes />
                        </div>
                    </Col>
                </Row>
            </Container>
        </BrowserRouter>
    );
}

export default App;
