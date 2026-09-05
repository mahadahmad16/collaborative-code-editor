import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Loading from "../components/Loading";
import useAuth from "../hooks/useAuth";
import { api } from "../services/api";
import { getErrorMessage } from "../utils/helpers";

const Dashboard = () => {
  const { user } = useAuth();

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadRooms = async () => {
      try {
        const response = await api.get("/rooms");
        setRooms(response.data.rooms || []);
      } catch (error) {
        setError(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };

    loadRooms();
  }, []);

  return (
    <div className="app-shell">
      <Navbar />

      <main className="dashboard">
        <section className="dashboard__hero">
          <div>
            <span className="eyebrow">Workspace</span>
            <h1>
              Welcome back,{" "}
              <span>{user?.name?.split(" ")[0] || "Developer"}</span>.
            </h1>
            <p>
              Create a room, invite your team, and start coding together.
            </p>
          </div>

          <div className="dashboard__actions">
            <Link to="/create-room" className="button button--primary">
              + Create room
            </Link>

            <Link to="/join-room" className="button button--secondary">
              Join room
            </Link>
          </div>
        </section>

        <section className="dashboard__stats">
          <div className="stat-card">
            <span>Active rooms</span>
            <strong>{rooms.length}</strong>
          </div>

          <div className="stat-card">
            <span>Collaboration</span>
            <strong>Live</strong>
          </div>

          <div className="stat-card">
            <span>Code execution</span>
            <strong>Ready</strong>
          </div>
        </section>

        <section className="dashboard__section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Your workspace</span>
              <h2>Recent rooms</h2>
            </div>
          </div>

          {loading ? (
            <Loading message="Loading your rooms..." />
          ) : error ? (
            <div className="empty-state">
              <h3>Unable to load rooms</h3>
              <p>{error}</p>
            </div>
          ) : rooms.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__icon">&lt;/&gt;</div>
              <h3>No rooms yet</h3>
              <p>
                Create your first collaborative coding room to get started.
              </p>

              <Link to="/create-room" className="button button--primary">
                Create your first room
              </Link>
            </div>
          ) : (
            <div className="room-grid">
              {rooms.map((room) => (
                <Link
                  to={`/editor/${room.id || room._id}`}
                  className="room-card"
                  key={room.id || room._id}
                >
                  <div className="room-card__top">
                    <span className="room-card__icon">&lt;/&gt;</span>

                    <span className="room-card__status">
                      Active
                    </span>
                  </div>

                  <h3>{room.name || "Untitled Room"}</h3>

                  <p>
                    {room.description ||
                      "Collaborative coding workspace"}
                  </p>

                  <div className="room-card__footer">
                    <span>
                      {room.language || "JavaScript"}
                    </span>

                    <span>Open →</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;