import "./Header.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Header() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const raw = localStorage.getItem('gdpi_user');
    if (raw) setUser(JSON.parse(raw));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('gdpi_user');
    setUser(null);
    navigate('/');
  };

  return (
    <div className="header d-flex justify-content-between align-items-center px-4">
      <div className="fw-bold text-sidebar">Buenos Aires</div>

      <div className="user-info d-flex align-items-center">
        {user ? (
          <>
            <span className="fw-bold me-2">{user.name}</span>
            <button className="btn btn-sm btn-outline-secondary me-2" onClick={handleLogout}>Salir</button>
          </>
        ) : (
          <>
            <span className="fw-bold me-2">Invitado</span>
            <i className="bi bi-person-circle fs-3"></i>
          </>
        )}
      </div>
    </div>
  );
}

export default Header;


