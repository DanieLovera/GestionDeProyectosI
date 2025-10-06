import { useNavigate } from "react-router-dom";
import paths from "../constants/paths.js";
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      {/* Gradiente sobre la imagen */}
      <div className="gradient-overlay"></div>

      {/* Contenido */}
      <div className="home-content">
        <h1>Consorcios organizados <br /> y eficientes</h1>
        <p>Gestión simplificada para tu comunidad</p>

        <div className="button-group">
            <button onClick={() => navigate(paths.reports)} className="btn-white">
              Ver panel
            </button>
            <button onClick={() => navigate(paths.reports)} className="btn-blue">
              Ir a panel
            </button>
        </div>
      </div>
    </div>
  );
}
