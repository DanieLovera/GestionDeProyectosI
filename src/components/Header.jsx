import "./Header.css";

function Header() {
  return (
    <div className="header d-flex justify-content-between align-items-center px-4">
      <div className="fw-bold text-sidebar">
        Buenos Aires
      </div>

      <div className="user-info">
        <span className="fw-bold me-2">Messi</span>
        <i className="bi bi-person-circle fs-3"></i>
      </div>
    </div>
  );
}

export default Header;


