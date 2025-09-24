import paths from "../constants/paths.js";

import { Routes as ReactRoutes, Route } from "react-router";

import CommonExpenses from "../pages/CommonExpenses.jsx";
import IndividualExpenses from "../pages/IndividualExpenses.jsx";
import Reports from "../pages/Reports.jsx";
import Overdues from "../pages/Overdues.jsx";
import Fees from "../pages/Fees.jsx";

function Routes() {
    return (
        <ReactRoutes>
            <Route path={paths.reports} element={<Reports />} />
            <Route path={paths.individualExpenses} element={<IndividualExpenses />} />
            <Route path={paths.commonExpenses} element={<CommonExpenses />} />
            <Route path={paths.overdues} element={<Overdues />} />
            <Route path={paths.fees} element={<Fees />} />
        </ReactRoutes>
    );
}

export default Routes;
