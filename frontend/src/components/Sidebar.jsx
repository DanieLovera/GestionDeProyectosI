import { NavLink } from "react-router-dom";
import paths from "../constants/paths";
import "./Sidebar.css";

export default function Sidebar() {
  return (
    <div className="sidebar">
      <h2 className="sidebar-brand">GDPI</h2>
      <ul className="sidebar-menu">
        <li><NavLink to={paths.reports} className={({ isActive }) => isActive ? "active" : ""}>Reportes</NavLink></li>
        <li><NavLink to={paths.commonExpenses} className={({ isActive }) => isActive ? "active" : ""}>Gastos Comunes</NavLink></li>
        <li><NavLink to={paths.individualExpenses} className={({ isActive }) => isActive ? "active" : ""}>Gastos Particulares</NavLink></li>
        <li><NavLink to={paths.expensesDistribution} className={({ isActive }) => isActive ? "active" : ""}>Expensas</NavLink></li>
        <li><NavLink to={paths.overdues} className={({ isActive }) => isActive ? "active" : ""}>Moras</NavLink></li>
        <li><NavLink to={paths.fees} className={({ isActive }) => isActive ? "active" : ""}>Comisiones</NavLink></li>
      </ul>
    </div>
  );
}
