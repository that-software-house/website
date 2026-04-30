import { Link } from 'react-router-dom'
import AnimatedHeroBackground from './AnimatedHeroBackground'
import InteractiveGridPattern from './InteractiveGridPattern'
import './HeroSection.css'

function HeroSection() {
  return (
    <section className="hero">
      <div className="hero-atmosphere" aria-hidden="true">
        <div className="hero-orb hero-orb--yellow" />
        <div className="hero-orb hero-orb--mint" />
        <div className="hero-grid-layer">
          <InteractiveGridPattern width={64} height={64} squares={[30, 20]} />
        </div>
      </div>
      <AnimatedHeroBackground />

      <div className="hero__inner motion-reveal">
        <p className="hero__eyebrow">THAT SOFTWARE HOUSE</p>
        <h1 className="hero__headline">
          End-to-end software development from people who’ve built at scale.
        </h1>
        <p className="hero__body">
          We turn messy ideas into dependable software from product strategy and
          UX to engineering, launch, and scale.
        </p>

        <div className="hero__actions">
          <Link className="hero__cta hero__cta--primary" to="/contact">
            Start a conversation
          </Link>
          <Link className="hero__cta hero__cta--secondary" to="/approach">
            See how we work
          </Link>
        </div>

        <p className="hero__proof">
          20+ products shipped · 25+ years founding-team experience · Healthcare
          · Fintech · SaaS
        </p>
      </div>
    </section>
  )
}

export default HeroSection
