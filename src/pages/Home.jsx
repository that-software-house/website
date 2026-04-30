import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useSEO } from '@/hooks/useSEO'
import FinalCTASection from '../components/FinalCTASection'
import HeroSection from '../components/HeroSection'
import OperatingSystemSection from '../components/OperatingSystemSection'
import ProductStory from '../components/ProductStory'
import './Home.css'

function Home() {
  const pageRef = useRef(null)

  useSEO({
    title: 'That Software House | End-to-End Software Development',
    description:
      'That Software House turns messy ideas into dependable software across product strategy, UX, engineering, launch, and scale.',
    keywords:
      'software development studio, product strategy, custom software, AI integration, Austin software studio',
    canonicalUrl: 'https://thatsoftwarehouse.com/',
    openGraph: {
      title: 'That Software House | End-to-End Software Development',
      description:
        'Senior software development from product strategy and UX to engineering, launch, and scale.',
      image: 'https://thatsoftwarehouse.com/og-image.png',
      url: 'https://thatsoftwarehouse.com/',
    },
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'That Software House',
      url: 'https://thatsoftwarehouse.com',
      logo: 'https://thatsoftwarehouse.com/favicon.svg',
      description:
        'Senior engineering studio building production software systems for founders and growing businesses.',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Austin',
        addressRegion: 'TX',
        addressCountry: 'US',
      },
      contactPoint: {
        '@type': 'ContactPoint',
        email: 'contact@thatsoftwarehouse.com',
        contactType: 'sales',
      },
    },
  })

  useLayoutEffect(() => {
    const page = pageRef.current

    if (!page) {
      return undefined
    }

    gsap.registerPlugin(ScrollTrigger)

    const media = gsap.matchMedia()

    media.add('(prefers-reduced-motion: no-preference)', () => {
      const context = gsap.context(() => {
        gsap.utils.toArray('.motion-reveal', page).forEach((element) => {
          gsap.to(element, {
            autoAlpha: 1,
            clipPath: 'inset(0 0 0% 0)',
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: element,
              start: 'top 78%',
              once: true,
            },
          })
        })

        gsap.utils.toArray('[data-parallax]', page).forEach((element) => {
          gsap.to(element, {
            yPercent: Number(element.dataset.parallax),
            ease: 'none',
            scrollTrigger: {
              trigger: element,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.6,
            },
          })
        })
      }, page)

      return () => context.revert()
    })

    return () => media.revert()
  }, [])

  return (
    <main className="home-page" ref={pageRef}>
      <HeroSection />
      <ProductStory />
      <OperatingSystemSection />
      <FinalCTASection />
    </main>
  )
}

export default Home
