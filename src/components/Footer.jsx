import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Linkedin, Instagram, Twitter, Dribbble } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    // TODO: Implement newsletter subscription
    console.log('Subscribe:', email);
    setEmail('');
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Brand Column */}
          <div className="footer-brand-col">
            <div className="footer-brand">
              <span className="footer-logo">tsh</span>
              <span className="footer-tagline">software house</span>
            </div>
            <address className="footer-address">
              San Francisco, CA<br />
              Austin, TX
            </address>
            <a href="mailto:contact@thatsoftwarehouse.com" className="footer-email">
              contact@thatsoftwarehouse.com
            </a>
            <div className="footer-social">
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <Linkedin size={18} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <Instagram size={18} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="X">
                <Twitter size={18} />
              </a>
              <a href="https://dribbble.com" target="_blank" rel="noopener noreferrer" aria-label="Dribbble">
                <Dribbble size={18} />
              </a>
            </div>
          </div>

          {/* Company Column */}
          <div className="footer-col">
            <h4>Company</h4>
            <nav>
              <Link to="/about">About Us</Link>
              <Link to="/contact">Contact</Link>
              <Link to="/projects">Projects</Link>
            </nav>
          </div>

          {/* Services Column */}
          <div className="footer-col">
            <h4>Services</h4>
            <nav>
              <Link to="/validate-your-idea">Validate your idea</Link>
              <Link to="/build-your-product">Build your product</Link>
              <Link to="/scale-your-product">Scale your product</Link>
              <Link to="/custom-software">Custom Software</Link>
              <Link to="/ai-software">AI Solutions</Link>
              <Link to="/services">SMB Web Package</Link>
              <Link to="/seo">SEO & Growth</Link>
              <Link to="/marketing">Marketing</Link>
            </nav>
          </div>

          {/* Legal + Newsletter Column */}
          <div className="footer-col">
            <h4>Legal</h4>
            <nav>
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/terms">Terms of Service</Link>
            </nav>

            <div className="footer-newsletter">
              <p>Subscribe to our newsletter</p>
              <form onSubmit={handleSubscribe} className="newsletter-form">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button type="submit">Subscribe</button>
              </form>
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
