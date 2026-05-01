import { Link } from 'react-router-dom'
import './FinalCTASection.css'

function FinalCTASection() {
  return (
    <section className="final-cta-section">
      <div className="final-cta-section__inner motion-reveal">
        <p>START</p>
        <h2>Ready to turn the messy thing into the dependable thing?</h2>
        <div className="final-cta-section__actions">
          <Link className="cta-btn cta-btn--primary" to="/contact">
            Start a conversation
          </Link>
          <Link className="cta-btn cta-btn--secondary-dark" to="/approach">
            See how we work
          </Link>
        </div>
      </div>
    </section>
  )
}

export default FinalCTASection
