import { forwardRef, useImperativeHandle, useRef } from 'react'
import './ProductArchitectureArtifact.css'

const modules = [
  { id: 'northwest', rows: 3 },
  { id: 'northeast', rows: 3 },
  { id: 'west', rows: 2 },
  { id: 'east', rows: 2 },
  { id: 'southwest', rows: 3 },
  { id: 'southeast', rows: 3 },
]

const labelSets = {
  messy: ['IDEA', 'USER FLOW', 'DATA', 'API', 'AUTH', 'RISK'],
  blueprint: ['PRODUCT', 'USERS', 'WORKFLOWS', 'RISKS', 'TECH PATH', 'SCOPE'],
  system: ['PRODUCT', 'API', 'AUTH', 'DATA', 'CLOUD', 'INTEGRATIONS'],
  ready: ['PRODUCT', 'API', 'AUTH', 'DATA', 'CLOUD', 'PRODUCTION'],
}

const ProductArchitectureArtifact = forwardRef(function ProductArchitectureArtifact(
  { state = 'messy' },
  ref,
) {
  const labels = labelSets[state] ?? labelSets.messy
  const rootRef = useRef(null)
  const objectRef = useRef(null)
  const baseRef = useRef(null)
  const connectorRef = useRef(null)
  const signalRef = useRef(null)
  const moduleRefs = useRef([])
  const labelRefs = useRef([])

  useImperativeHandle(ref, () => ({
    root: rootRef.current,
    object: objectRef.current,
    base: baseRef.current,
    connectors: connectorRef.current,
    signal: signalRef.current,
    fragments: moduleRefs.current.filter(Boolean),
    labels: labelRefs.current.filter(Boolean),
  }))

  return (
    <div
      className={`architecture-artifact architecture-artifact--${state}`}
      ref={rootRef}
    >
      <div className="architecture-artifact__stage" aria-hidden="true">
        <div className="architecture-artifact__object" ref={objectRef}>
          <div className="architecture-artifact__floor" />

          <div className="architecture-artifact__plate" ref={baseRef}>
            <div className="architecture-artifact__plate-light" />
            <div className="architecture-artifact__plate-grid" />
            <div className="architecture-artifact__plate-channel architecture-artifact__plate-channel--x" />
            <div className="architecture-artifact__plate-channel architecture-artifact__plate-channel--y" />
            <div className="architecture-artifact__plate-spine" />

            <svg
              className="architecture-artifact__connectors"
              preserveAspectRatio="none"
              ref={connectorRef}
              viewBox="0 0 720 480"
            >
              <polyline points="154,130 306,130 306,220 360,220" />
              <polyline points="566,130 414,130 414,220 360,220" />
              <polyline points="150,250 270,250 270,240 360,240" />
              <polyline points="570,250 450,250 450,240 360,240" />
              <polyline points="168,354 300,354 300,292 360,292" />
              <polyline points="552,354 420,354 420,292 360,292" />
            </svg>

            <svg
              className="architecture-artifact__signal"
              preserveAspectRatio="none"
              ref={signalRef}
              viewBox="0 0 720 480"
            >
              <polyline points="154,130 306,130 306,220 360,220 414,220 414,130 566,130" />
              <polyline points="360,220 360,292 420,292 420,354 552,354" />
            </svg>

            <div className="architecture-artifact__kernel">
              <span>CORE</span>
              <i />
              <i />
              <i />
            </div>

            {modules.map((module, index) => (
              <section
                className={`architecture-artifact__module architecture-artifact__module--${module.id}`}
                key={module.id}
                ref={(element) => {
                  moduleRefs.current[index] = element
                }}
              >
                <div className="architecture-artifact__module-surface">
                  <div className="architecture-artifact__module-head">
                    <span
                      ref={(element) => {
                        labelRefs.current[index] = element
                      }}
                    >
                      {labels[index]}
                    </span>
                    <i />
                  </div>

                  <div className="architecture-artifact__module-body">
                    {Array.from({ length: module.rows }).map((_, rowIndex) => (
                      <span className="architecture-artifact__trace" key={rowIndex}>
                        <i />
                        <i />
                        <i />
                      </span>
                    ))}
                  </div>

                  <div className="architecture-artifact__port architecture-artifact__port--in" />
                  <div className="architecture-artifact__port architecture-artifact__port--out" />
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
})

export default ProductArchitectureArtifact
