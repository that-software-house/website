import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import './Header.css';

const navItems = [
  { to: '/services', label: 'Services', number: '01' },
  { to: '/work', label: 'Work', number: '02' },
  { to: '/vault', label: 'Vault', number: '03' },
  { to: '/approach', label: 'Approach', number: '04' },
  { to: '/team', label: 'Team', number: '05' },
  { to: '/contact', label: 'Contact', number: '06' },
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsMenuOpen(false);
    document.body.style.overflow = '';
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  return (
    <header className="studio-header">
      <div className="studio-header__inner">
        <Link to="/" className="studio-logo" aria-label="That Software House home">
          <span className="studio-logo__mark">tsh</span>
          <span className="studio-logo__wordmark">
            That Software House <em>— est. 2020</em>
          </span>
        </Link>

        <nav className="studio-nav" aria-label="Primary navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `studio-nav__link${isActive ? ' studio-nav__link--active' : ''}`
              }
            >
              <span className="studio-nav__number">{item.number}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="studio-header__actions">
          <Link to="/contact" className="studio-availability">
            <span className="studio-availability__dot" />
            <span>2 slots open · Q3</span>
          </Link>
          <button
            className="studio-menu-toggle"
            aria-label="Toggle navigation"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((prev) => !prev)}
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <div className={`studio-mobile-drawer${isMenuOpen ? ' studio-mobile-drawer--open' : ''}`}>
        <div className="studio-mobile-drawer__inner">
          <div className="studio-mobile-meta">
            <p>Senior engineers for healthcare, fintech, and production AI.</p>
            <div className="studio-mobile-meta__tags">
              <span>Technical diligence</span>
              <span>Production builds</span>
              <span>Fractional platform</span>
            </div>
          </div>

          <div className="studio-mobile-nav">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `studio-mobile-nav__link${isActive ? ' studio-mobile-nav__link--active' : ''}`
                }
              >
                <span className="studio-mobile-nav__number">{item.number}</span>
                {item.label}
              </NavLink>
            ))}
          </div>

          <Link to="/contact" className="studio-button studio-button--primary">
            Start a conversation
            <span className="studio-button__arrow" aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>

      <div
        className={`studio-nav-overlay${isMenuOpen ? ' studio-nav-overlay--visible' : ''}`}
        onClick={() => setIsMenuOpen(false)}
        aria-hidden
      />
    </header>
  );
};

export default Header;
