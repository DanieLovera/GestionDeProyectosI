import { BrowserRouter } from "react-router";
import { Container, Row, Col } from "react-bootstrap";

import SideBar from "./components/SideBar.jsx";
import Header from "./components/Header.jsx";
import Routes from "./components/Routes.jsx";

function App() {
    return (
        <BrowserRouter>
            <Container fluid className="vh-100">
                <Row className="h-100">
                    <Col xs="auto" className="p-0">
                        <SideBar />
                    </Col>

                    <Col className="d-flex flex-column p-3">
                        <Header />
                        <div className="flex-grow-1 bg-white py-2 px-3 shadow-sm rounded">
                            <Routes />
                        </div>
                    </Col>
                </Row>
            </Container>
        </BrowserRouter>
    );
}

export default App;
