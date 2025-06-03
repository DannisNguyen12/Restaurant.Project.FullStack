
import './Footer.css';

export default function Footer() {
  return (
    <footer role="contentinfo" aria-label="Site Footer" className="site-footer">
      <div className="footer-content">
        <div className="footer-top">
          <p className="privacy-policy">
            <a href="/privacy-policy">Privacy Policy</a>
          </p>
          
          <div className="footer-divider" aria-hidden="true"></div>
          
          <div className="design-credit">
            <a href="https://b12.com"  target="_blank" rel="noopener noreferrer">
              Web design by B12
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}