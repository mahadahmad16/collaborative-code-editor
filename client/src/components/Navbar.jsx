import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <header className="navbar">
      <div className="navbar__brand">
        <Link to="/">
          <span className="navbar__logo">&lt;/&gt;</span>
          <span>CodeSync</span>
        </Link>
      </div>

      <nav className="navbar__links">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/create-room">Create Room</Link>
        <Link to="/join-room">Join Room</Link>
      </nav>

      <div className="navbar__actions">
        <button className="navbar__profile" type="button">
          <span className="navbar__avatar">M</span>
          <span className="navbar__username">User</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;