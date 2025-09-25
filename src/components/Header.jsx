import "./Header.css";
import user from "../mocks/user";


function Header() {
    return (
        <div className="d-flex justify-content-between text-white bg-dark py-2 px-3 mb-3 shadow-lg header">
            <div className="align-self-center fw-bold">{user.location}</div>

            <div className="d-flex">
                <p className="px-2 m-1 align-self-center fw-bold">{user.name}</p>
                <i className="m-1 bi bi-person-circle fs-3 align-self-center"></i>
            </div>
        </div>
    );
}

export default Header;
