import { Routes, Route } from "react-router-dom";
import paths from "../constants/paths.js";
import Home from "../pages/Home.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path={paths.home} element={<Home />} />
    </Routes>
  );
}

