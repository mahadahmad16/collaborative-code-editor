import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { getInitials } from "../utils/helpers";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="navbar">
      <div className="navbar__brand">
        <Link to="/dashboard">
          <span className="brand-mark">&lt;/&gt;</span>
          <span>CodeSync</span>
        </Link>
      </div>

      <nav className="navbar__links">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/create-room">Create Room</Link>
        <Link to="/join-room">Join Room</Link>
      </nav>

      <div className="navbar__actions" ref={menuRef}>
        <button
          className="navbar__profile"
          type="button"
          onClick={() => setMenuOpen((current) => !current)}
          aria-expanded={menuOpen}
          aria-haspopup="menu"
        >
          <span className="navbar__avatar">
            {getInitials(user?.name)}
          </span>

          <span className="navbar__username">
            {user?.name || "User"}
          </span>

          <span className="navbar__chevron">
            {menuOpen ? "⌃" : "⌄"}
          </span>
        </button>

        {menuOpen && (
          <div className="navbar__menu" role="menu">
            <div className="navbar__menu-user">
              <strong>{user?.name || "User"}</strong>
              <span>{user?.email || ""}</span>
            </div>

            <div className="navbar__menu-divider" />

            <button
              type="button"
              className="navbar__menu-item"
              onClick={() => setMenuOpen(false)}
            >
              Profile
            </button>

            <button
              type="button"
              className="navbar__menu-item navbar__menu-item--danger"
              onClick={handleLogout}
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;