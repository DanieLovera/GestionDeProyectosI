import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import "./Register.css";
import axios from 'axios';

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState("");
  const [consortium, setConsortium] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const API_URL = import.meta.env.VITE_API_URL;
    axios.post(`${API_URL}/users/register`, { name, email, password, role, consortium })
      .then(response => {
        console.log("Registro exitoso:", response.data);
        alert("Registro exitoso");
        navigate("/login");
      })
      .catch(error => {
        console.error("Error al registrar:", error);
        alert("Error al registrar");
      });
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2 className="register-title">Regístrate</h2>

        <form onSubmit={handleSubmit} className="register-form">
          {/* Nombre */}
          <div className="form-group">
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre" required />
          </div>

          {/* Correo electrónico */}
          <div className="form-group">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Correo electrónico" required />
          </div>

          {/* Rol */}
          <div className="form-group">
            <select required value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="">Rol</option>
              <option value="admin">Administrador</option>
              <option value="inquilino">Inquilino</option>
              <option value="propietario">Propietario</option>
            </select>
          </div>

          {/* Consorcio */}
          <div className="form-group">
            <select required value={consortium} onChange={(e) => setConsortium(e.target.value)}>
              <option value="">Seleccionar consorcio</option>
              <option value="edificio">Edificio</option>
              <option value="torre">Torre</option>
            </select>
          </div>

          {/* Número de unidad */}
          <div className="form-group">
            <input
              type="text"
              placeholder="Número de unidad/superficie (opcional)"
            />
          </div>

          {/* Contraseña */}
          <div className="form-group password-field">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {/* Confirmar contraseña */}
          <div className="form-group password-field">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirmar contraseña"
              required
            />
            <span
              className="toggle-password"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {/* Botón */}
          <button type="submit" className="btn-register">
            Registrarme
          </button>
        </form>

        {/* Divider */}
        <div className="divider">o</div>

        {/* Social buttons */}
        <div className="social-buttons">
          <button className="btn-google">
            <FcGoogle size={20} /> Regístrate con Google
          </button>
          <button className="btn-microsoft">
            <img
              src="https://img.icons8.com/color/48/microsoft.png"
              alt="Microsoft"
              width="20"
              height="20"
            />
            Regístrate con Microsoft
          </button>
        </div>

        {/* Link a login */}
        <p className="login-link">
          ¿Tienes cuenta?{" "}
          <span onClick={() => navigate("/login")}>Iniciar sesión</span>
        </p>
      </div>
    </div>
  );
}
