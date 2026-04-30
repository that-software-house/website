import { useRef } from 'react'
import './SpotlightCard.css'

function SpotlightCard({
  children,
  className = '',
  spotlightColor = 'var(--spotlight-color)',
}) {
  const divRef = useRef(null)

  const handleMouseMove = (event) => {
    const card = divRef.current

    if (!card) {
      return
    }

    const rect = card.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    card.style.setProperty('--mouse-x', `${x}px`)
    card.style.setProperty('--mouse-y', `${y}px`)
    card.style.setProperty('--spotlight-color', spotlightColor)
  }

  return (
    <div
      className={`card-spotlight ${className}`.trim()}
      onMouseMove={handleMouseMove}
      ref={divRef}
    >
      {children}
    </div>
  )
}

export default SpotlightCard
