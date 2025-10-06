import { Routes, Route, Navigate } from "react-router-dom";
import paths from "../constants/paths";

import Home from "../pages/Home";
import Register from "../pages/Register";
import Login from "../pages/Login";

import Reports from "../pages/Reports";
import CommonExpenses from "../pages/CommonExpenses";
import IndividualExpenses from "../pages/IndividualExpenses";
import Overdues from "../pages/Overdues";
import Fees from "../pages/Fees";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Páginas “libres” */}
  <Route path={paths.home} element={<Home />} />
  {/* Login/Register temporarily disabled - redirect to home */}
  <Route path={paths.register} element={<Navigate to={paths.home} replace />} />
  <Route path={paths.login} element={<Navigate to={paths.home} replace />} />

      {/* Páginas con sidebar */}
      <Route path={paths.reports} element={<Reports />} />
      <Route path={paths.commonExpenses} element={<CommonExpenses />} />
      <Route path={paths.individualExpenses} element={<IndividualExpenses />} />
      <Route path={paths.overdues} element={<Overdues />} />
      <Route path={paths.fees} element={<Fees />} />
    </Routes>
  );
}

