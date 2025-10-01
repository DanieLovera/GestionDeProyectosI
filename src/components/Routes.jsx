import { Routes, Route } from "react-router-dom";
import paths from "../constants/paths.js";
import Home from "../pages/Home.jsx";
import Register from "../pages/Register.jsx";
import Login from "../pages/Login.jsx"; 

export default function AppRoutes() {
  return (
    <Routes>
      <Route path={paths.home} element={<Home />} />
      <Route path={paths.register} element={<Register />} />
      <Route path={paths.login} element={<Login />} /> 
    </Routes>
  );
}
