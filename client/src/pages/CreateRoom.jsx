import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { api } from "../services/api";
import { getErrorMessage } from "../utils/helpers";
import {
  DEFAULT_LANGUAGE,
  LANGUAGE_LABELS,
} from "../utils/constants";

const CreateRoom = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    language: DEFAULT_LANGUAGE,
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Please enter a room name.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/rooms", {
        name: form.name.trim(),
        description: form.description.trim(),
        language: form.language,
      });

      const room = response.data.room;
      const roomId = room?.id || room?._id;

      if (!roomId) {
        throw new Error("Room was created without an ID.");
      }

      navigate(`/editor/${roomId}`);
    } catch (error) {
      setError(getErrorMessage(error, "Unable to create room."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <Navbar />

      <main className="form-page">
        <section className="form-card">
          <div className="form-card__header">
            <Link to="/dashboard" className="back-link">
              ← Back to dashboard
            </Link>

            <span className="eyebrow">New workspace</span>
            <h1>Create a coding room</h1>
            <p>
              Set up a shared environment and invite others to collaborate.
            </p>
          </div>

          <form className="room-form" onSubmit={handleSubmit}>
            {error && <div className="form-error">{error}</div>}

            <label>
              Room name
              <input
                type="text"
                name="name"
                placeholder="e.g. MERN Project"
                value={form.name}
                onChange={handleChange}
              />
            </label>

            <label>
              Description
              <textarea
                name="description"
                placeholder="What are you building?"
                rows="4"
                value={form.description}
                onChange={handleChange}
              />
            </label>

            <label>
              Default language
              <select
                name="language"
                value={form.language}
                onChange={handleChange}
              >
                {Object.entries(LANGUAGE_LABELS).map(
                  ([value, label]) => (
                    <option value={value} key={value}>
                      {label}
                    </option>
                  )
                )}
              </select>
            </label>

            <button
              className="button button--primary button--full"
              type="submit"
              disabled={loading}
            >
              {loading ? "Creating room..." : "Create room"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
};

export default CreateRoom;