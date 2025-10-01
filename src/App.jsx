import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";

import Sidebar from "./components/Sidebar.jsx";
import Header from "./components/Header.jsx";
import Home from "./pages/Home.jsx";
import Reports from "./pages/Reports.jsx";
import CommonExpenses from "./pages/CommonExpenses.jsx";
import IndividualExpenses from "./pages/IndividualExpenses.jsx";
import Overdues from "./pages/Overdues.jsx";
import Fees from "./pages/Fees.jsx";

import paths from "./constants/paths.js";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Landing page sin sidebar ni header */}
                <Route path={paths.home} element={<Home />} />

                {/* Todas las demás páginas usan layout con Sidebar y Header */}
                <Route
                    path="*"
                    element={
                        <Container fluid className="vh-100">
                            <Row className="h-100">
                                <Col xs="auto" className="p-0">
                                    <Sidebar />
                                </Col>
                                <Col className="d-flex flex-column p-0">
                                    <Header />
                                    <div className="flex-grow-1 bg-white py-2 px-3 mx-4 shadow-sm rounded">
                                        <Routes>
                                            <Route path={paths.reports} element={<Reports />} />
                                            <Route path={paths.commonExpenses} element={<CommonExpenses />} />
                                            <Route path={paths.individualExpenses} element={<IndividualExpenses />} />
                                            <Route path={paths.overdues} element={<Overdues />} />
                                            <Route path={paths.fees} element={<Fees />} />
                                        </Routes>
                                    </div>
                                </Col>
                            </Row>
                        </Container>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;

