import { NavLink } from "react-router-dom";
import paths from "../constants/paths";
import "./Sidebar.css";

export default function Sidebar() {
  return (
    <div className="sidebar">
      <h2>Menu</h2>
      <ul>
        <li><NavLink to={paths.reports}>Reportes</NavLink></li>
        <li><NavLink to={paths.commonExpenses}>Gastos Comunes</NavLink></li>
        <li><NavLink to={paths.individualExpenses}>Gastos Particulares</NavLink></li>
        <li><NavLink to={paths.overdues}>Moras</NavLink></li>
        <li><NavLink to={paths.fees}>Comisiones</NavLink></li>
      </ul>
    </div>
  );
}
