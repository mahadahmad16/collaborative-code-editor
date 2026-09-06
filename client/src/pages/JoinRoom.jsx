import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import useAuth from "../hooks/useAuth";

import { api } from "../services/api";
import {
  getErrorMessage,
  isValidRoomId,
} from "../utils/helpers";

const JoinRoom = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [roomId, setRoomId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedRoomId = roomId.trim();

    if (!trimmedRoomId) {
      setError("Please enter a room ID.");
      return;
    }

    if (!isValidRoomId(trimmedRoomId)) {
      setError("Please enter a valid room ID.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await api.post(
        `/rooms/${trimmedRoomId}/join`
      );

      navigate(`/editor/${trimmedRoomId}`);
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Unable to join this room."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-page">
      <Navbar />

      <main className="form-page">
        <div className="form-card">
          <div className="form-card__header">
            <span className="form-card__eyebrow">
              Collaboration
            </span>

            <h1>Join a room</h1>

            <p>
              Enter the room ID shared by your teammate to join
              their workspace.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="roomId">Room ID</label>

              <input
                id="roomId"
                type="text"
                value={roomId}
                onChange={(event) =>
                  setRoomId(event.target.value)
                }
                placeholder="e.g. a83f91c2e7"
                autoComplete="off"
              />

              {error && (
                <span className="form-error">
                  {error}
                </span>
              )}
            </div>

            <button
              className="button button--primary button--full"
              type="submit"
              disabled={loading}
            >
              {loading ? "Joining..." : "Join room"}
            </button>
          </form>

          {user && (
            <p className="form-card__footer">
              Joining as{" "}
              <strong>{user.name}</strong>
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default JoinRoom;