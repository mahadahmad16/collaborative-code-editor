import {
  Link,
  Navigate,
  Outlet,
  Route,
  Routes,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { EditorProvider } from "./context/EditorContext";

import useAuth from "./hooks/useAuth";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CreateRoom from "./pages/CreateRoom";
import JoinRoom from "./pages/JoinRoom";
import Editor from "./pages/Editor";
import NotFound from "./pages/NotFound";
import Loading from "./components/Loading";

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="full-page-loading">
        <Loading message="Loading CodeSync..." />
      </div>
    );
  }

  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate to="/login" replace />
  );
};

const PublicRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="full-page-loading">
        <Loading message="Loading CodeSync..." />
      </div>
    );
  }

  return isAuthenticated ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <Outlet />
  );
};

const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <main className="landing-page">
      <header className="landing-nav">
        <Link to="/" className="landing-brand">
          <span className="brand-mark">&lt;/&gt;</span>
          <span>CodeSync</span>
        </Link>

        <div className="landing-nav__actions">
          <Link to="/login" className="landing-link">
            Sign in
          </Link>

          <Link
            to="/register"
            className="button button--primary"
          >
            Get started
          </Link>
        </div>
      </header>

      <section className="landing-hero">
        <div className="landing-hero__content">
          <div className="hero-badge">
            <span />
            Real-time collaborative coding
          </div>

          <h1>
            Build together.
            <br />
            <span>Code in sync.</span>
          </h1>

          <p>
            CodeSync gives developers a shared coding environment
            where teams can write, discuss, and execute code together
            in real time.
          </p>

          <div className="landing-hero__actions">
            <Link
              to="/register"
              className="button button--primary button--large"
            >
              Start coding free
            </Link>

            <Link
              to="/login"
              className="button button--secondary button--large"
            >
              Sign in
            </Link>
          </div>
        </div>

        <div className="landing-editor-preview">
          <div className="preview-header">
            <div className="preview-dots">
              <span />
              <span />
              <span />
            </div>

            <span>index.js</span>

            <div className="preview-status">
              <span />
              Live
            </div>
          </div>

          <div className="preview-body">
            <div className="preview-line">
              <span>1</span>
              <code>
                <b>const</b> <i>team</i> = [
                <em>"You"</em>, <em>"Me"</em>];
              </code>
            </div>

            <div className="preview-line">
              <span>2</span>
              <code>
                <b>function</b> <i>buildTogether</i>() {"{"}
              </code>
            </div>

            <div className="preview-line">
              <span>3</span>
              <code>
                &nbsp;&nbsp;return team.join(
                <em>" + "</em>);
              </code>
            </div>

            <div className="preview-line">
              <span>4</span>
              <code>{"}"}</code>
            </div>

            <div className="preview-line">
              <span>5</span>
              <code>
                <i>console</i>.log(buildTogether());
              </code>
            </div>
          </div>

          <div className="preview-footer">
            <span>● 3 developers online</span>
            <span>JavaScript</span>
          </div>
        </div>
      </section>

      <section className="landing-features">
        <div className="feature">
          <span className="feature__number">01</span>

          <h3>Real-time editing</h3>

          <p>
            Changes are synchronized instantly so everyone sees the
            same code.
          </p>
        </div>

        <div className="feature">
          <span className="feature__number">02</span>

          <h3>Shared workspaces</h3>

          <p>
            Create rooms and invite teammates into a dedicated coding
            environment.
          </p>
        </div>

        <div className="feature">
          <span className="feature__number">03</span>

          <h3>Run your code</h3>

          <p>
            Execute your code and inspect the output without leaving
            your workspace.
          </p>
        </div>
      </section>
    </main>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <EditorProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />

          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/create-room" element={<CreateRoom />} />
            <Route path="/join-room" element={<JoinRoom />} />
            <Route path="/editor/:roomId" element={<Editor />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </EditorProvider>
    </AuthProvider>
  );
};

export default App;