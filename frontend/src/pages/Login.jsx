import { useState } from "react";
import { useNavigate } from "react-router-dom";
import paths from "../constants/paths";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./Login.css";
import { apiPost } from "../apis/client";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await apiPost("/users/login", { email, password });

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
        <h2 className="login-title">¡Bienvenido de nuevo!</h2>
        <p className="login-subtitle">Inicia sesión para continuar</p>

        <form onSubmit={handleSubmit} className="login-form">
          {/* Email */}
          <div className="form-group">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Correo electrónico"
              required
            />
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

          {/* Botón */}
          <button type="submit" className="btn-login">
            Iniciar sesión <span className="arrow">→</span>
          </button>
        </form>

        <p className="register-link">
          ¿No tienes cuenta?{" "}
          <span onClick={() => navigate("/register")}>Regístrate aquí</span>
        </p>
      </div>
    </div>
  );
}




