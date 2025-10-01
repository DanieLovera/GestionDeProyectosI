import paths from "../constants/paths.js";
import { Routes as ReactRoutes, Route, Navigate } from "react-router-dom"; 
import DashboardLayout from "./DashboardLayout.jsx";

import Home from "../pages/Home.jsx";
import Reports from "../pages/Reports.jsx";
import CommonExpenses from "../pages/CommonExpenses.jsx";
import IndividualExpenses from "../pages/IndividualExpenses.jsx";
import Overdues from "../pages/Overdues.jsx";
import Fees from "../pages/Fees.jsx";

function Routes() {
    return (
        <ReactRoutes>
            {/* Landing page */}
            <Route path={paths.home} element={<Home />} />

            {/* Todas las demás páginas van dentro del layout */}
            <Route
                path={paths.reports}
                element={
                    <DashboardLayout>
                        <Reports />
                    </DashboardLayout>
                }
            />
            <Route
                path={paths.commonExpenses}
                element={
                    <DashboardLayout>
                        <CommonExpenses />
                    </DashboardLayout>
                }
            />
            <Route
                path={paths.individualExpenses}
                element={
                    <DashboardLayout>
                        <IndividualExpenses />
                    </DashboardLayout>
                }
            />
            <Route
                path={paths.overdues}
                element={
                    <DashboardLayout>
                        <Overdues />
                    </DashboardLayout>
                }
            />
            <Route
                path={paths.fees}
                element={
                    <DashboardLayout>
                        <Fees />
                    </DashboardLayout>
                }
            />

            {/* Redirigir cualquier URL desconocida a Home */}
            <Route path="*" element={<Navigate to={paths.home} replace />} />
        </ReactRoutes>
    );
}

export default Routes;
