import { useNavigate } from "react-router-dom";
import "./Register.css";

export default function Register() {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Registro enviado");
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2 className="register-title">Regístrate</h2>

        <form onSubmit={handleSubmit} className="register-form">
          {/* Nombre */}
          <div className="form-group">
            <input type="text" placeholder="Nombre" required />
          </div>

          {/* Correo electrónico */}
          <div className="form-group">
            <input type="email" placeholder="Correo electrónico" required />
          </div>

          {/* Rol */}
          <div className="form-group">
            <select required>
              <option value="">Rol</option>
              <option value="admin">Administrador</option>
              <option value="inquilino">Inquilino</option>
              <option value="propietario">Propietario</option>
            </select>
          </div>

          {/* Consorcio */}
          <div className="form-group">
            <select required>
              <option value="">Seleccionar consorcio</option>
              <option value="edificio">Edificio</option>
              <option value="torre">Torre</option>
            </select>
          </div>

          {/* Número de unidad */}
          <div className="form-group">
            <input type="text" placeholder="Número de unidad/superficie (opcional)" />
          </div>

          {/* Contraseña */}
          <div className="form-group">
            <input type="password" placeholder="Contraseña" required />
          </div>

          {/* Confirmar contraseña */}
          <div className="form-group">
            <input type="password" placeholder="Confirmar contraseña" required />
          </div>

          {/* Términos */}
          <div className="form-terms">
            <input type="checkbox" required />
            <span>Acepto los términos y condiciones</span>
          </div>

          {/* Botón */}
          <button type="submit" className="btn-register">Registrarme</button>
        </form>

        {/* Divider */}
        <div className="divider">o</div>

        {/* Social buttons */}
        <div className="social-buttons">
          <button className="btn-google">Regístrate con Google</button>
          <button className="btn-microsoft">Regístrate con Microsoft</button>
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
