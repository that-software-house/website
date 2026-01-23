import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Sparkles, X, ChevronDown } from 'lucide-react';
import './Header.css';

const Header = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { to: '/ai-software', label: 'AI Solutions' },
    { to: '/custom-software', label: 'Custom Software' },
    { to: '/projects', label: 'Cases' },
    { to: '/about', label: 'About us' },
  ];

  const serviceItems = [
    { to: '/services', label: 'SMB Web Package' },
    { to: '/seo', label: 'SEO & Growth' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (isMenuOpen) return;
      setIsScrolled(window.scrollY > 12);
      setIsVisible(true);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  return (
    <header className={`header ${isVisible ? 'visible' : 'hidden'} ${isMenuOpen ? 'expanded' : ''} ${isScrolled ? 'scrolled' : 'at-top'}`}>
      <div className="header-container">
        <div className="logo">
          <Link to="/" aria-label="Home">
            tsh
          </Link>
          <span className="ai-pill">
            <Sparkles size={14} />
            Develop faster with AI
          </span>
        </div>

        <nav className="nav" aria-label="Primary navigation">
          {/* Services Dropdown */}
          <div
            className="nav-dropdown"
            onMouseEnter={() => setServicesOpen(true)}
            onMouseLeave={() => setServicesOpen(false)}
          >
            <button
              className={`nav-link nav-dropdown-trigger ${location.pathname === '/services' || location.pathname === '/seo' ? 'active' : ''}`}
              aria-expanded={servicesOpen}
            >
              Services
              <ChevronDown size={14} className={`dropdown-chevron ${servicesOpen ? 'open' : ''}`} />
            </button>
            <div className={`nav-dropdown-menu ${servicesOpen ? 'open' : ''}`}>
              {serviceItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`nav-dropdown-item ${location.pathname === item.to ? 'active' : ''}`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`nav-link ${location.pathname.startsWith(item.to) ? 'active' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="cta-wrapper">
          <Link to="/contact" className="cta-primary">Let&apos;s chat</Link>
          <button
            className="menu-toggle"
            aria-label="Toggle navigation"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((prev) => !prev)}
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <div className={`mobile-drawer ${isMenuOpen ? 'open' : ''}`}>
        <div className="mobile-drawer-inner">
          <div className="mobile-meta">
            <p>Product studio crafting AI-era experiences.</p>
            <div className="meta-tags">
              <span>Design systems</span>
              <span>AI apps</span>
              <span>Growth stacks</span>
            </div>
          </div>
          <div className="mobile-nav-links">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`nav-link ${location.pathname.startsWith(item.to) ? 'active' : ''}`}
              >
                {item.label}
              </Link>
            ))}
            <div className="mobile-nav-section">
              <span className="mobile-nav-label">Services</span>
              {serviceItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`nav-link ${location.pathname === item.to ? 'active' : ''}`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <Link to="/contact" className="cta-primary drawer-cta">
            Book a call
          </Link>
        </div>
      </div>

      <div
        className={`nav-overlay ${isMenuOpen ? 'visible' : ''}`}
        onClick={() => setIsMenuOpen(false)}
        aria-hidden
      />
    </header>
  );
};

export default Header;
