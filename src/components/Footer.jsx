import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <>
      <footer className="studio-footer">
        <div>
          <div className="studio-footer__sig">That Software House</div>
          <div className="studio-footer__meta">
            Austin, TX · San Francisco, CA
            <br />
            <em>contact@thatsoftwarehouse.com</em>
            <br />
            Operating since 2020 · senior team only
          </div>
        </div>
        <div>
          <h4>Site</h4>
          <Link to="/">Home</Link>
          <Link to="/services">Services</Link>
          <Link to="/work">Work</Link>
          <Link to="/vault">Vault</Link>
          <Link to="/approach">Approach</Link>
        </div>
        <div>
          <h4>Company</h4>
          <Link to="/team">Team</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
        </div>
        <div>
          <h4>Scope</h4>
          <span className="studio-footer__plain">Healthcare / HIPAA</span>
          <span className="studio-footer__plain">Fintech / SOC 2</span>
          <span className="studio-footer__plain">Production AI</span>
          <span className="studio-footer__plain">Technical diligence</span>
        </div>
      </footer>
      <div className="studio-footer-bottom">
        <span>© 2026 That Software House, LLC</span>
        <span>Built by the team. No CMS. No trackers.</span>
      </div>
    </>
  );
};

export default Footer;
