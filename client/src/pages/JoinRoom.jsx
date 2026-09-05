import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { isValidRoomId } from "../utils/helpers";

const JoinRoom = () => {
  const navigate = useNavigate();

  const [roomId, setRoomId] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    const value = roomId.trim();

    if (!isValidRoomId(value)) {
      setError("Please enter a valid room ID.");
      return;
    }

    navigate(`/editor/${value}`);
  };

  return (
    <div className="app-shell">
      <Navbar />

      <main className="form-page">
        <section className="form-card form-card--compact">
          <div className="form-card__header">
            <Link to="/dashboard" className="back-link">
              ← Back to dashboard
            </Link>

            <span className="eyebrow">Join workspace</span>
            <h1>Join a coding room</h1>
            <p>
              Enter the room ID shared by your teammate.
            </p>
          </div>

          <form className="room-form" onSubmit={handleSubmit}>
            {error && <div className="form-error">{error}</div>}

            <label>
              Room ID
              <input
                type="text"
                placeholder="Enter room ID"
                value={roomId}
                onChange={(event) => {
                  setRoomId(event.target.value);
                  setError("");
                }}
                autoFocus
              />
            </label>

            <button
              className="button button--primary button--full"
              type="submit"
            >
              Join room
            </button>
          </form>
        </section>
      </main>
    </div>
  );
};

export default JoinRoom;