import { useState } from "react";
import { useNavigate } from "react-router-dom";
import paths from "../constants/paths";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import "./Login.css";
import { apiPost } from "../apis/client";

export default function Login() {
  const [role, setRole] = useState("Administrador");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [consortium, setConsortium] = useState("");
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const response = await apiPost("/users/login", {
      email,
      password,
      consortium,
    });

    localStorage.setItem("token", response.accessToken); 
    localStorage.setItem("gdpi_user", JSON.stringify(response.user));

    console.log("Inicio de sesión exitoso:", response);
    navigate(paths.reports);
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    alert("Credenciales incorrectas o error en el servidor.");
  }
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
            <input type="text" value={consortium} onChange={(e) => setConsortium(e.target.value)} placeholder="Selecciona tu consorcio" required />
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

          {/* Links */}
          <div className="login-links">
            <a href="#">¿Olvidaste tu contraseña?</a>
            <a href="#">Recibir link por email</a>
          </div>

          {/* Botón */}
          <button type="submit" className="btn-login">
            Iniciar sesión <span className="arrow">→</span>
          </button>

          {/* Checkbox */}
          <div className="remember-me">
            <input type="checkbox" id="remember" />
            <label htmlFor="remember">Recuérdame</label>
          </div>
        </form>

        {/* Divider */}
        <div className="divider">ou</div>

        {/* Social */}
        <div className="social-buttons">
          <button className="btn-google">
            <FcGoogle size={20} /> Iniciar sesión con Google
          </button>
          <button className="btn-microsoft">
            <img
              src="https://img.icons8.com/color/48/microsoft.png"
              alt="Microsoft"
              width="20"
              height="20"
            />
            Iniciar sesión con Microsoft
          </button>
        </div>

        {/* Footer */}
        <div className="login-footer">
          <a href="#">Idioma: ES / EN</a> ·
          <a href="#">Términos</a> ·
          <a href="#">Privacidad</a> ·
          <a href="#">Contacto</a>
        </div>
      </div>
    </div>
  );
}
