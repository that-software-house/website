import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-main">
          <div className="footer-contact">
            <h3>Contact</h3>
            <a href="mailto:contact@thatsoftwarehouse.com" className="footer-email">
              contact@thatsoftwarehouse.com
            </a>
          </div>

          <div className="footer-locations">
            <h3>Locations</h3>
            <div className="locations-list">
              <div className="location">
                <h4>Austin, TX</h4>
              </div>
              <div className="location">
                <h4>San Francisco, CA</h4>
              </div>
            </div>
          </div>

          <div className="footer-social">
            <h3>Follow Us</h3>
            <div className="social-links">
              <a href="#" aria-label="Dribbble">Dribbble</a>
              <a href="#" aria-label="Clutch">Clutch</a>
              <a href="#" aria-label="X">X</a>
              <a href="#" aria-label="Instagram">Instagram</a>
              <a href="#" aria-label="LinkedIn">LinkedIn</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2025 THAT Software House. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
