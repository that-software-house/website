import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import ProductArchitectureArtifact from './ProductArchitectureArtifact'
import './ProductStory.css'

const storyScenes = [
  {
    label: 'messy',
    eyebrow: '01 / MESSY IDEA',
    headline: 'Every serious product starts messy.',
    body: 'Loose ideas, unclear flows, half-built tools, missing integrations, and business pressure all arrive at the same table.',
  },
  {
    label: 'blueprint',
    eyebrow: '02 / PRODUCT BLUEPRINT',
    headline: 'The first job is turning noise into structure.',
    body: 'We map the product, users, workflows, risks, and technical path before anyone burns weeks building the wrong thing.',
  },
  {
    label: 'system',
    eyebrow: '03 / ENGINEERING SYSTEM',
    headline: 'Then the system gets engineered properly.',
    body: 'Frontend, backend, APIs, auth, data, cloud, and integrations come together as one dependable product architecture.',
  },
  {
    label: 'ready',
    eyebrow: '04 / PRODUCTION READY',
    headline: 'What ships has to survive real users.',
    body: 'Security, monitoring, scale, handoff, and maintainability are built into the system before it reaches production.',
  },
]

const scenePoints = [0, 1 / 3, 2 / 3, 1]

function StoryCopy({ scene, index }) {
  const Heading = index === 0 ? 'h2' : 'h3'

  return (
    <>
      <p className="product-story__eyebrow">{scene.eyebrow}</p>
      <Heading className="product-story__headline">{scene.headline}</Heading>
      <p className="product-story__body">{scene.body}</p>
    </>
  )
}

function ProductStory() {
  const sectionRef = useRef(null)
  const artifactRef = useRef(null)
  const copyRefs = useRef([])
  const activeIndexRef = useRef(0)

  useLayoutEffect(() => {
    const section = sectionRef.current
    const artifact = artifactRef.current
    const copyStates = copyRefs.current.filter(Boolean)

    if (!section || !artifact?.object || !artifact?.fragments?.length || copyStates.length === 0) {
      return undefined
    }

    gsap.registerPlugin(ScrollTrigger)

    const media = gsap.matchMedia()

    media.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
      const context = gsap.context(() => {
        const rootStyles = getComputedStyle(document.documentElement)
        const token = (name) => rootStyles.getPropertyValue(name).trim()
        const tokenNumber = (name) => Number.parseFloat(token(name)) || 0
        const px = (value) => `${value}px`

        const space8 = tokenNumber('--space-8')
        const space16 = tokenNumber('--space-16')
        const space24 = tokenNumber('--space-24')
        const space32 = tokenNumber('--space-32')
        const space48 = tokenNumber('--space-48')
        const space64 = tokenNumber('--space-64')
        const space96 = tokenNumber('--space-96')

        const materials = {
          core: {
            '--module-surface-strong': 'var(--color-system-material-core-strong)',
            '--module-surface': 'var(--color-system-material-core)',
            '--module-surface-muted': 'var(--color-system-material-core-muted)',
            '--module-accent': 'var(--color-yellow)',
            '--module-rail': 'var(--color-mint)',
            '--module-glow': 'var(--color-yellow-dim)',
          },
          plan: {
            '--module-surface-strong': 'var(--color-system-material-plan-strong)',
            '--module-surface': 'var(--color-system-material-plan)',
            '--module-surface-muted': 'var(--color-system-material-plan-muted)',
            '--module-accent': 'var(--color-yellow)',
            '--module-rail': 'var(--color-yellow)',
            '--module-glow': 'var(--color-yellow-dim)',
          },
          data: {
            '--module-surface-strong': 'var(--color-system-material-data-strong)',
            '--module-surface': 'var(--color-system-material-data)',
            '--module-surface-muted': 'var(--color-system-material-data-muted)',
            '--module-accent': 'var(--color-sky)',
            '--module-rail': 'var(--color-sky)',
            '--module-glow': 'var(--hero-glow-sky)',
          },
          healthy: {
            '--module-surface-strong': 'var(--color-system-material-healthy-strong)',
            '--module-surface': 'var(--color-system-material-healthy)',
            '--module-surface-muted': 'var(--color-system-material-healthy-muted)',
            '--module-accent': 'var(--color-mint)',
            '--module-rail': 'var(--color-mint)',
            '--module-glow': 'var(--hero-glow-mint)',
          },
          production: {
            '--module-surface-strong': 'var(--color-system-material-production-strong)',
            '--module-surface': 'var(--color-system-material-production)',
            '--module-surface-muted': 'var(--color-system-material-production-muted)',
            '--module-accent': 'var(--color-yellow)',
            '--module-rail': 'var(--color-mint)',
            '--module-glow': 'var(--color-yellow-dim)',
          },
        }

        const moduleState = ({
          left,
          top,
          width,
          height,
          x = 0,
          y = 0,
          z = 0,
          rotate = '0deg',
          scale = 1,
          opacity = 1,
          shadow = 0.44,
          material = 'core',
        }) => ({
          autoAlpha: opacity,
          '--module-left': left,
          '--module-top': top,
          '--module-width': width,
          '--module-height': height,
          '--module-x': px(x),
          '--module-y': px(y),
          '--module-z': px(z),
          '--module-rotate': rotate,
          '--module-scale': scale,
          '--module-shadow-opacity': shadow,
          ...materials[material],
        })

        const lockedCamera = {
          '--artifact-scale': 1,
          '--artifact-rotate-x': '30deg',
          '--artifact-rotate-z': '-6deg',
          '--artifact-y': px(0),
        }

        const visualStates = {
          messy: {
            labels: ['IDEA', 'USER FLOW', 'DATA', 'API', 'AUTH', 'RISK'],
            root: {
              '--artifact-detail-opacity': 0.84,
              '--artifact-label-opacity': 0.82,
              '--artifact-kernel-opacity': 0.58,
              '--artifact-rail-opacity': 0.48,
              '--artifact-port-opacity': 0.56,
              '--artifact-connector-opacity': 0.12,
              '--artifact-signal-opacity': 0.12,
              '--artifact-signal-offset': 960,
              '--artifact-spine-opacity': 0,
            },
            object: lockedCamera,
            fragments: [
              moduleState({ left: '12%', top: '14%', width: '30%', height: '18%', x: space16 * -1, y: space16 * -1, z: space96, rotate: '-2deg', shadow: 0.6, material: 'plan' }),
              moduleState({ left: '59%', top: '15%', width: '29%', height: '18%', x: space16, y: space8 * -1, z: space64, rotate: '1deg', shadow: 0.54, material: 'data' }),
              moduleState({ left: '9%', top: '43%', width: '26%', height: '18%', x: space16 * -1, y: space8, z: space48, rotate: '-1deg', shadow: 0.5, material: 'data' }),
              moduleState({ left: '65%', top: '43%', width: '26%', height: '18%', x: space16, y: space16, z: space32, rotate: '1deg', shadow: 0.48, material: 'healthy' }),
              moduleState({ left: '17%', top: '70%', width: '29%', height: '17%', x: space8 * -1, y: space16, z: space24, rotate: '1deg', shadow: 0.44, material: 'plan' }),
              moduleState({ left: '56%', top: '70%', width: '32%', height: '17%', x: space16, y: space8, z: space16, rotate: '-1deg', shadow: 0.42, material: 'production' }),
            ],
          },
          blueprint: {
            labels: ['PRODUCT', 'USERS', 'WORKFLOWS', 'RISKS', 'TECHNICAL PATH', 'SCOPE'],
            root: {
              '--artifact-detail-opacity': 0.92,
              '--artifact-label-opacity': 0.94,
              '--artifact-kernel-opacity': 0.78,
              '--artifact-rail-opacity': 0.68,
              '--artifact-port-opacity': 0.66,
              '--artifact-connector-opacity': 0.42,
              '--artifact-signal-opacity': 0.28,
              '--artifact-signal-offset': 760,
              '--artifact-spine-opacity': 0.18,
            },
            object: lockedCamera,
            fragments: [
              moduleState({ left: '12%', top: '14%', width: '32%', height: '18%', z: space96, shadow: 0.58, material: 'plan' }),
              moduleState({ left: '56%', top: '14%', width: '32%', height: '18%', z: space64, shadow: 0.52, material: 'data' }),
              moduleState({ left: '12%', top: '42%', width: '32%', height: '18%', z: space48, shadow: 0.48, material: 'data' }),
              moduleState({ left: '56%', top: '42%', width: '32%', height: '18%', z: space48, shadow: 0.46, material: 'plan' }),
              moduleState({ left: '12%', top: '70%', width: '32%', height: '17%', z: space32, shadow: 0.42, material: 'data' }),
              moduleState({ left: '56%', top: '70%', width: '32%', height: '17%', z: space24, shadow: 0.42, material: 'healthy' }),
            ],
          },
          system: {
            labels: ['FRONTEND', 'API', 'AUTH', 'DATA', 'CLOUD', 'INTEGRATIONS'],
            root: {
              '--artifact-detail-opacity': 1,
              '--artifact-label-opacity': 1,
              '--artifact-kernel-opacity': 1,
              '--artifact-rail-opacity': 0.92,
              '--artifact-port-opacity': 0.82,
              '--artifact-connector-opacity': 0.68,
              '--artifact-signal-opacity': 0.74,
              '--artifact-signal-offset': 420,
              '--artifact-spine-opacity': 0.56,
            },
            object: lockedCamera,
            fragments: [
              moduleState({ left: '14%', top: '14%', width: '30%', height: '17%', z: space96, shadow: 0.58, material: 'core' }),
              moduleState({ left: '56%', top: '14%', width: '30%', height: '17%', z: space64, shadow: 0.54, material: 'data' }),
              moduleState({ left: '14%', top: '42%', width: '28%', height: '17%', z: space48, shadow: 0.5, material: 'healthy' }),
              moduleState({ left: '58%', top: '42%', width: '28%', height: '17%', z: space48, shadow: 0.5, material: 'healthy' }),
              moduleState({ left: '14%', top: '70%', width: '30%', height: '17%', z: space32, shadow: 0.46, material: 'data' }),
              moduleState({ left: '56%', top: '70%', width: '30%', height: '17%', z: space32, shadow: 0.46, material: 'data' }),
            ],
          },
          ready: {
            labels: ['FRONTEND', 'API', 'AUTH', 'DATA', 'CLOUD', 'INTEGRATIONS'],
            root: {
              '--artifact-detail-opacity': 1,
              '--artifact-label-opacity': 1,
              '--artifact-kernel-opacity': 1,
              '--artifact-rail-opacity': 1,
              '--artifact-port-opacity': 0.92,
              '--artifact-connector-opacity': 0.74,
              '--artifact-signal-opacity': 1,
              '--artifact-signal-offset': 0,
              '--artifact-spine-opacity': 1,
            },
            object: lockedCamera,
            fragments: [
              moduleState({ left: '14%', top: '14%', width: '30%', height: '17%', z: space96, shadow: 0.62, material: 'core' }),
              moduleState({ left: '56%', top: '14%', width: '30%', height: '17%', z: space64, shadow: 0.58, material: 'core' }),
              moduleState({ left: '14%', top: '42%', width: '28%', height: '17%', z: space48, shadow: 0.54, material: 'core' }),
              moduleState({ left: '58%', top: '42%', width: '28%', height: '17%', z: space48, shadow: 0.54, material: 'core' }),
              moduleState({ left: '14%', top: '70%', width: '30%', height: '17%', z: space32, shadow: 0.5, material: 'production' }),
              moduleState({ left: '56%', top: '70%', width: '30%', height: '17%', z: space32, shadow: 0.5, material: 'production' }),
            ],
          },
        }

        const setVisualState = (state, immediate = false) => {
          const duration = immediate ? 0 : 0.44
          const ease = immediate ? 'none' : 'power2.out'

          state.labels.forEach((label, index) => {
            if (artifact.labels[index]) {
              artifact.labels[index].textContent = label
            }
          })

          gsap.to(artifact.root, {
            ...state.root,
            duration,
            ease,
            overwrite: true,
          })

          gsap.to(artifact.object, {
            ...state.object,
            duration,
            ease,
            overwrite: true,
          })

          artifact.fragments.forEach((fragment, index) => {
            gsap.to(fragment, {
              ...state.fragments[index],
              duration,
              ease,
              overwrite: true,
            })
          })
        }

        const activateScene = (index, immediate = false) => {
          activeIndexRef.current = index
          gsap.killTweensOf(copyStates)
          gsap.set(copyStates, {
            autoAlpha: 0,
          })
          gsap.set(copyStates[index], {
            visibility: 'visible',
          })
          gsap.fromTo(
            copyStates[index],
            {
              autoAlpha: immediate ? 1 : 0,
            },
            {
              autoAlpha: 1,
              duration: immediate ? 0 : 0.18,
              ease: 'power2.out',
              overwrite: true,
            },
          )
          setVisualState(visualStates[storyScenes[index].label], immediate)
        }

        activateScene(0, true)

        const progressProxy = { value: 0 }
        const master = gsap.timeline({
          defaults: {
            ease: 'none',
          },
          scrollTrigger: {
            trigger: section,
            pin: true,
            scrub: 0.18,
            start: 'top top',
            end: '+=145%',
            anticipatePin: 1,
            fastScrollEnd: true,
            invalidateOnRefresh: true,
            snap: {
              snapTo: (value) => scenePoints.reduce((closest, point) => (
                Math.abs(point - value) < Math.abs(closest - value) ? point : closest
              ), scenePoints[0]),
              duration: { min: 0.12, max: 0.22 },
              delay: 0.04,
              ease: 'power2.out',
            },
            onUpdate: (self) => {
              const activeIndex = Math.round(self.progress * (storyScenes.length - 1))

              if (activeIndex !== activeIndexRef.current) {
                activateScene(activeIndex)
              }
            },
          },
        })
          .addLabel('messy', 0)
          .to(progressProxy, { value: 1, duration: 1 }, 0)
          .addLabel('blueprint', 1)
          .to(progressProxy, { value: 2, duration: 1 }, 1)
          .addLabel('system', 2)
          .to(progressProxy, { value: 3, duration: 1 }, 2)
          .addLabel('ready', 3)

        return () => {
          master.scrollTrigger?.kill()
          master.kill()
        }
      }, section)

      return () => context.revert()
    })

    return () => media.revert()
  }, [])

  return (
    <section className="product-story" ref={sectionRef}>
      <div className="product-story__desktop">
        <div className="product-story__copy">
          {storyScenes.map((scene, index) => (
            <article
              className="product-story__state"
              data-state={scene.label}
              key={scene.label}
              ref={(element) => {
                copyRefs.current[index] = element
              }}
            >
              <StoryCopy scene={scene} index={index} />
            </article>
          ))}
        </div>

        <div className="product-story__visual-frame">
          <ProductArchitectureArtifact ref={artifactRef} state="messy" />
        </div>
      </div>

      <div className="product-story__mobile">
        {storyScenes.map((scene, index) => (
          <article className="product-story__mobile-beat" key={scene.label}>
            <div className="product-story__mobile-copy">
              <StoryCopy scene={scene} index={index} />
            </div>
            <ProductArchitectureArtifact state={scene.label} />
          </article>
        ))}
      </div>
    </section>
  )
}

export default ProductStory
