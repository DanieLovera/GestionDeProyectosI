import { Routes, Route } from "react-router-dom";
import paths from "../constants/paths.js";
import Home from "../pages/Home.jsx";
import Register from "../pages/Register.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path={paths.home} element={<Home />} />
      <Route path={paths.register} element={<Register />} />
    </Routes>
  );
}

