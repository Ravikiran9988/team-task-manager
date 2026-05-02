import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="brand">
        <span className="brand-dot" />
        Team Task Manager
      </div>
      <div className="nav-links">
        <Link className={location.pathname === "/dashboard" ? "active" : ""} to="/dashboard">
          Dashboard
        </Link>
        <Link
          className={location.pathname.startsWith("/projects") ? "active" : ""}
          to="/projects"
        >
          Projects
        </Link>
      </div>
      <div className="nav-user">
        <span>{user.name}</span>
        <span className="role-chip">{user.role}</span>
        <button className="btn ghost" onClick={logout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
