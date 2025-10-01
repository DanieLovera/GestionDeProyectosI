import Sidebar from "./Sidebar";
import "./MenuLayout.css";

export default function MenuLayout({ children }) {
  return (
    <div className="menu-layout">
      <Sidebar />
      <div className="menu-content">
        {children}
      </div>
    </div>
  );
}
