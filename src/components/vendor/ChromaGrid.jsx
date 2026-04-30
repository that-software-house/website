import { useEffect, useRef } from 'react'
import './ChromaGrid.css'

function ChromaGrid({
  items,
  className = '',
  radius = 320,
  columns = 4,
}) {
  const rootRef = useRef(null)
  const fadeRef = useRef(null)

  useEffect(() => {
    const grid = rootRef.current

    if (!grid) {
      return
    }

    const { width, height } = grid.getBoundingClientRect()
    grid.style.setProperty('--x', `${width / 2}px`)
    grid.style.setProperty('--y', `${height / 2}px`)
  }, [])

  const handleMove = (event) => {
    const grid = rootRef.current

    if (!grid) {
      return
    }

    const rect = grid.getBoundingClientRect()
    grid.style.setProperty('--x', `${event.clientX - rect.left}px`)
    grid.style.setProperty('--y', `${event.clientY - rect.top}px`)
    fadeRef.current?.style.setProperty('opacity', '0')
  }

  const handleLeave = () => {
    fadeRef.current?.style.setProperty('opacity', '1')
  }

  const handleCardMove = (event) => {
    const card = event.currentTarget
    const rect = card.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    card.style.setProperty('--mouse-x', `${x}px`)
    card.style.setProperty('--mouse-y', `${y}px`)
  }

  return (
    <div
      className={`chroma-grid ${className}`.trim()}
      onPointerLeave={handleLeave}
      onPointerMove={handleMove}
      ref={rootRef}
      style={{
        '--r': `${radius}px`,
        '--cols': columns,
      }}
    >
      {items.map((item) => (
        <article
          className="chroma-card"
          key={item.title}
          onMouseMove={handleCardMove}
          style={{
            '--card-accent': item.accent,
            '--card-gradient': item.gradient,
            '--spotlight-color': item.spotlight,
          }}
        >
          <div className="chroma-img-wrapper">
            <img alt={item.alt} loading="lazy" src={item.image} />
          </div>
          <footer className="chroma-info">
            <span className="chroma-marker">{item.marker}</span>
            <h3 className="name">{item.title}</h3>
            <p className="role">{item.subtitle}</p>
            <p className="chroma-description">{item.description}</p>
            <span className="location">{item.meta}</span>
          </footer>
        </article>
      ))}
      <div className="chroma-overlay" />
      <div className="chroma-fade" ref={fadeRef} />
    </div>
  )
}

export default ChromaGrid
