import Sidebar from "./Sidebar";
import Header from "./header";
import "./MenuLayout.css";

export default function MenuLayout({ children }) {
  return (
    <div className="menu-layout">
      <Sidebar />
      <div className="main-area">
        <Header />
        <div className="menu-content">
          {children}
        </div>
      </div>
    </div>
  );
}
