import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./Register.css";
import { apiPost } from "../apis/client";

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const role = "Administrador"; 
  const [consortium, setConsortium] = useState(""); 

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await apiPost("/users/register", {
        name,
        email,
        password,
        role,
        consortium,
      });

      console.log("Registro exitoso:", response);
      try { localStorage.setItem("consortium", consortium); } catch {}
      alert("Registro exitoso");
      navigate("/login");
    } catch (error) {
      console.error("Error al registrar:", error);
      alert("Error al registrar: " + error.message);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2 className="register-title">Regístrate</h2>

        <form onSubmit={handleSubmit} className="register-form">
          {/* Nombre */}
          <div className="form-group">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre"
              required
            />
          </div>

          {/* Correo electrónico */}
          <div className="form-group">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Correo electrónico"
              required
            />
          </div>

          {/* Consorcio (campo libre, no select) */}
          <div className="form-group">
            <input
              type="text"
              value={consortium}
              onChange={(e) => setConsortium(e.target.value)}
              placeholder="Nombre de Consorcio"
              required
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

        {/* Link a login */}
        <p className="login-link">
          ¿Tienes cuenta?{" "}
          <span onClick={() => navigate("/login")}>Iniciar sesión</span>
        </p>
      </div>
    </div>
  );
}
