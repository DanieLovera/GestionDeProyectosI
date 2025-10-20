import { useState } from "react";
import { useNavigate } from "react-router-dom";
import paths from "../constants/paths";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import "./Login.css";
import axios from 'axios';

export default function Login() {
  const [role, setRole] = useState("Administrador");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [consortium, setConsortium] = useState("");
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();


  const handleSubmit = (e) => {
    e.preventDefault();
    // mock login: store user in localStorage and navigate
    const user = { name: role === 'Administrador' ? 'Admin Demo' : 'Propietario Demo', role };
    axios.post(`${API_URL}/users/login`, { email: email, password: password, consortium: consortium })
      .then(response => {
        localStorage.setItem('gdpi_user', JSON.stringify(user));
        navigate(paths.reports);
      })
      .catch(error => {
        console.error('Error logging in:', error);
      });
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Tabs */}
        <div className="login-tabs">
          <button
            className={role === "Administrador" ? "active" : ""}
            onClick={() => setRole("Administrador")}
          >
            Administrador
          </button>
          <button
            className={role === "Propietario" ? "active" : ""}
            onClick={() => setRole("Propietario")}
          >
            Propietario
          </button>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {/* Consorcio */}
          <div className="form-group">
            <input type="text" value={consortium} onChange={(e) => setConsortium(e.target.value)} placeholder="Nombre de tu consorcio" required />
          </div>

          {/* Email */}
          <div className="form-group">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="usuario@correo.com" required />
          </div>

          {/* Password */}
          <div className="form-group password-field">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              required
            />
            <span
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {/* Error mensaje (simulación) */}
          <p className="error-text">Contraseña débil</p>

          {/* Botón */}
          <button type="submit" className="btn-login">
            Iniciar sesión <span className="arrow">→</span>
          </button>
        </form>
        
      </div>
    </div>
  );
}
