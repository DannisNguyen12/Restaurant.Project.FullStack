// Error.jsx
import './Error.css';

export default function Error404() {
  return (
    <main className="error-container">
      <div className="error-content">
        <p className="error-code">404</p>
        <h1 className="error-title">Page not found</h1>
        <p className="error-description">
          Sorry, we couldn’t find the page you’re looking for.
        </p>
        <div className="error-actions">
          <a href="#" className="btn-primary">Go back home</a>
          <a href="#" className="btn-secondary">
            Contact support <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </main>
  )
}