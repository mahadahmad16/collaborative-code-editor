import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <main className="not-found">
      <div className="not-found__content">
        <span className="not-found__code">404</span>

        <h1>Page not found</h1>

        <p>
          The page you're looking for doesn't exist or may have been moved.
        </p>

        <Link to="/" className="button button--primary">
          Back to home
        </Link>
      </div>
    </main>
  );
};

export default NotFound;