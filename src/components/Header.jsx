import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import './Header.css'

const navigationLinks = [
  { label: 'Work', path: '/work' },
  { label: 'Services', path: '/services' },
  { label: 'Approach', path: '/approach' },
  { label: 'Team', path: '/team' },
  { label: 'Vault', path: 'https://labs.thatsoftwarehouse.com' },
]

const getNavLinkClassName = ({ isActive }) =>
  isActive ? 'site-header__link is-active' : 'site-header__link'

const getCtaClassName = ({ isActive }) =>
  isActive ? 'site-header__cta is-active' : 'site-header__cta'

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const closeMenu = () => setIsMenuOpen(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={`site-header${scrolled ? ' is-scrolled' : ''}`}>
      <div className="site-header__container">
        <NavLink className="site-header__brand" to="/">
          <span className="site-header__mark">tsh</span>
          <span className="site-header__label">software house</span>
        </NavLink>

        <div className="site-header__actions">
          <nav className="site-header__nav" aria-label="Primary navigation">
            {navigationLinks.map((link) => (
              <NavLink
                className={getNavLinkClassName}
                key={link.path}
                to={link.path}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <NavLink className={getCtaClassName} to="/contact">
            Contact
          </NavLink>
        </div>

        <button
          aria-controls="site-header-menu"
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          className="site-header__menu-button"
          onClick={() => setIsMenuOpen((current) => !current)}
          type="button"
        >
          <span className="site-header__menu-icon" aria-hidden="true">
            <span />
            <span />
          </span>
        </button>
      </div>

      <div
        className={
          isMenuOpen
            ? 'site-header__mobile-panel is-open'
            : 'site-header__mobile-panel'
        }
        id="site-header-menu"
      >
        <nav className="site-header__mobile-nav" aria-label="Mobile navigation">
          {navigationLinks.map((link) => (
            <NavLink
              className={getNavLinkClassName}
              key={link.path}
              onClick={closeMenu}
              to={link.path}
            >
              {link.label}
            </NavLink>
          ))}
          <NavLink className={getCtaClassName} onClick={closeMenu} to="/contact">
            Contact
          </NavLink>
        </nav>
      </div>
    </header>
  )
}

export default Header
