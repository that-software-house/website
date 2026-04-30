import './AnimatedHeroBackground.css'

function AnimatedHeroBackground() {
  return (
    <div className="animated-hero-background" aria-hidden="true">
      <div className="animated-hero-background__mesh" />
      <div className="animated-hero-background__planes">
        <span />
        <span />
        <span />
      </div>
      <div className="animated-hero-background__nodes">
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className="animated-hero-background__guides" />
      <div className="animated-hero-background__grain" />
    </div>
  )
}

export default AnimatedHeroBackground
