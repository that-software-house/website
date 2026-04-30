import { Link } from 'react-router-dom'
import './Footer.css'

const footerGroups = [
  {
    title: 'Company',
    links: [
      { label: 'Work', path: '/work' },
      { label: 'Approach', path: '/approach' },
      { label: 'Team', path: '/team' },
      { label: 'Contact', path: '/contact' },
    ],
  },
  {
    title: 'Services',
    links: [
      { label: 'Custom Software', path: '/services' },
      { label: 'AI Development', path: '/services' },
      { label: 'Staff Augmentation', path: '/services' },
      { label: 'SEO & Marketing', path: '/services' },
      { label: 'SMB Websites', path: '/services' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Vault', path: '/vault' },
      { label: 'Case Notes', path: '/work' },
      { label: 'Build Process', path: '/approach' },
    ],
  },
]

function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <nav className="site-footer__nav" aria-label="Footer navigation">
          {footerGroups.map((group) => (
            <section className="site-footer__group" key={group.title}>
              <h2>{group.title}</h2>
              <ul>
                {group.links.map((link) => (
                  <li key={`${group.title}-${link.label}`}>
                    <Link to={link.path}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}

          <section className="site-footer__group">
            <h2>Contact</h2>
            <ul>
              <li>
                <a href="mailto:contact@thatsoftwarehouse.com">
                  contact@thatsoftwarehouse.com
                </a>
              </li>
            </ul>
          </section>
        </nav>

        <div className="site-footer__bottom">
          <span>&copy; 2026 That Software House</span>
          <span>Austin, Texas</span>
        </div>
      </div>
    </footer>
  )
}

export default Footer
