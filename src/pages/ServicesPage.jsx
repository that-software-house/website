import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSEO } from '@/hooks/useSEO'
import './ServicesPage.css'

const services = [
  {
    id: '01',
    slug: 'main-street',
    label: 'Local Business',
    name: 'Main Street Modernization',
    tagline: 'A real website that works as hard as you do.',
    description:
      'Starting at $749, we build established local businesses—law firms, dental clinics, CPAs—a brand new, fully functional website on high-performance modern stacks. No AI add-ons, no bloated plugins—just a fast, secure site built to convert from day one.',
    bullets: [
      'Brand new fully functional website',
      'Mobile-first, performance-optimized',
      'Contact forms, booking integrations',
      'SEO-ready from launch',
      'Built on modern stacks (Next.js, Astro)',
    ],
    stack: {
      label: 'Breakeven Stack',
      rows: [
        { k: 'Starting at', v: '$749' },
        { k: 'Includes', v: 'Full website (no AI)' },
        { k: 'Maintenance', v: '$89 / mo' },
        { k: 'Timeline', v: '7–14 days' },
      ],
    },
    who: ['Dental Clinics', 'Law Firms', 'CPAs', 'Auto Body', 'Salons'],
    href: '/modernization',
  },
  {
    id: '02',
    slug: 'website-management',
    label: 'Ongoing Care',
    name: 'Website Management',
    tagline: 'We keep it fast, secure, and alive.',
    description:
      'Websites break, go stale, and drift from what they promised. We handle the full lifecycle—hosting, updates, edits, monitoring, and performance—so you never have to think about it again.',
    bullets: [
      'Uptime monitoring & incident response',
      'Content updates on request',
      'Security patches & dependency updates',
      'Monthly performance reports',
      'Priority support queue',
    ],
    stack: {
      label: 'Retainer',
      rows: [
        { k: 'Starting at', v: '$89 / mo' },
        { k: 'Includes', v: 'Hosting + support' },
        { k: 'Edit requests', v: 'Unlimited small' },
        { k: 'Response time', v: '< 24 hrs' },
      ],
    },
    who: ['Small businesses', 'Clinics', 'Agencies offloading'],
    href: '/contact',
  },
  {
    id: '03',
    slug: 'seo-marketing',
    label: 'Growth',
    name: 'SEO & Marketing',
    tagline: 'Found. Clicked. Converted.',
    description:
      'We pair technical SEO with content strategy built on real search data. No vanity traffic. We target the queries your actual customers use and build the authority that compounds over time.',
    bullets: [
      'Technical SEO audit & remediation',
      'Local SEO for multi-location businesses',
      'Content strategy & production',
      'Google Business Profile optimization',
      'Monthly ranking & traffic reporting',
    ],
    stack: {
      label: 'Growth Retainer',
      rows: [
        { k: 'Starting at', v: '$499 / mo' },
        { k: 'Includes', v: 'Audit + ongoing' },
        { k: 'First results', v: '60–90 days' },
        { k: 'Reporting', v: 'Monthly' },
      ],
    },
    who: ['Local businesses', 'Multi-location', 'E-commerce'],
    href: '/seo-marketing',
  },
  {
    id: '04',
    slug: 'startups',
    label: 'Startups',
    name: 'Startup Product Development',
    tagline: 'From zero to something shippable.',
    description:
      'For seed and Series A teams who need to build fast without hiring a full team. We step in as your engineering partner—product strategy, UX, full-stack engineering, and launch. Senior judgment, no agency overhead.',
    bullets: [
      'Product strategy & roadmap',
      'UX/UI design to production',
      'Full-stack engineering (Next.js, Node, Python)',
      'Auth, billing, infra, CI/CD',
      'Embedded sprint cadence with founders',
    ],
    stack: {
      label: 'Engagement',
      rows: [
        { k: 'Starting at', v: '$8,500 / mo' },
        { k: 'Includes', v: 'Design + eng' },
        { k: 'Team size', v: '2–4 seniors' },
        { k: 'Min. term', v: '3 months' },
      ],
    },
    who: ['Seed Founders', 'Series A Teams', 'Technical co-founder gaps'],
    href: '/build-your-product',
  },
  {
    id: '05',
    slug: 'custom-software',
    label: 'Enterprise',
    name: 'Custom Software & AI',
    tagline: 'Purpose-built tools that fit how you actually work.',
    description:
      "For businesses with processes that off-the-shelf software can't handle. We build internal tools, workflow automation, and AI-powered systems tailored to your operations—not the other way around.",
    bullets: [
      'Internal tools & admin dashboards',
      'Process automation & workflow systems',
      'Custom AI engines & LLM integrations',
      'Legacy system modernization',
      'API integrations & data pipelines',
    ],
    stack: {
      label: 'Project-Based',
      rows: [
        { k: 'Starting at', v: '$15,000' },
        { k: 'Scope', v: 'Discovery first' },
        { k: 'Delivery', v: '4–16 weeks' },
        { k: 'Support', v: 'Included 90 days' },
      ],
    },
    who: ['Healthcare ops', 'Fintech', 'SaaS teams', 'Operators'],
    href: '/custom-software',
  },
  {
    id: '06',
    slug: 'consulting',
    label: 'End-to-End',
    name: 'Scale & Growth Consulting',
    tagline: 'Strategic guidance for teams at an inflection point.',
    description:
      "Sometimes you don't need more code—you need someone who's been in the room before. We advise growth-stage teams on architecture decisions, team structure, vendor selection, and technical strategy.",
    bullets: [
      'Technical due diligence',
      'Architecture & stack review',
      'Build vs. buy recommendations',
      'Engineering team structure',
      'Vendor & platform selection',
    ],
    stack: {
      label: 'Advisory',
      rows: [
        { k: 'Starting at', v: '$2,500 / mo' },
        { k: 'Cadence', v: 'Bi-weekly calls' },
        { k: 'Access', v: 'Async + sync' },
        { k: 'Term', v: 'Month-to-month' },
      ],
    },
    who: ['Series A–C', 'PE-backed ops', 'CTOs without bandwidth'],
    href: '/contact',
  },
]

const stats = [
  {
    n: '20+',
    label: 'Products shipped',
    sub: 'Healthcare, fintech, SaaS, AI, local ops',
  },
  {
    n: '25+',
    label: 'Years founding-team experience',
    sub: "Senior judgment from people who've built at scale",
  },
  {
    n: '$749',
    label: 'Starting price',
    sub: 'For a fully functional local business website',
  },
  {
    n: '2',
    label: 'Studios',
    sub: 'Austin + San Francisco',
  },
]

function PricingCard({ stack }) {
  return (
    <div className="sp-pricing-card">
      <div className="sp-pricing-card__label">{stack.label}</div>
      {stack.rows.map((row, i) => (
        <div key={i} className={`sp-pricing-card__row${i === 0 ? ' sp-pricing-card__row--first' : ''}`}>
          <span>{row.k}</span>
          <strong>{row.v}</strong>
        </div>
      ))}
    </div>
  )
}

function ServiceRow({ svc, isOpen, onToggle }) {
  return (
    <div className="sp-service-row">
      <button
        className="sp-service-row__header"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <div className="sp-service-row__id">
          <div className="sp-service-row__id-label">Service</div>
          <div className="sp-service-row__id-num">{svc.id}</div>
        </div>
        <div className="sp-service-row__meta">
          <div className="sp-service-row__category">{svc.label}</div>
          <div className="sp-service-row__name">{svc.name}</div>
        </div>
        <div className={`sp-service-row__toggle${isOpen ? ' sp-service-row__toggle--open' : ''}`}>
          +
        </div>
      </button>

      <div className={`sp-service-row__body${isOpen ? ' sp-service-row__body--open' : ''}`}>
        <div className="sp-service-row__body-inner">
          <div className="sp-service-row__spacer" />
          <div className="sp-service-row__content">
            <div className="sp-service-row__left">
              <p className="sp-service-row__desc">{svc.description}</p>
              <ul className="sp-service-row__bullets">
                {svc.bullets.map((b, i) => (
                  <li key={i}>
                    <span className="sp-bullet-dash">—</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <div className="sp-service-row__tags">
                {svc.who.map((tag, i) => (
                  <span key={i} className="sp-tag">{tag}</span>
                ))}
              </div>
            </div>
            <div className="sp-service-row__right">
              <PricingCard stack={svc.stack} />
              <Link to={svc.href} className="sp-cta-btn">
                Start a conversation
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ServicesPage() {
  const [openIdx, setOpenIdx] = useState(null)

  useSEO({
    title: 'Services | That Software House',
    description:
      'Main Street Modernization, Website Management, SEO & Marketing, Startup Product Development, Custom Software & AI, and Scale & Growth Consulting.',
    keywords:
      'WordPress migration, AI virtual receptionist, startup software engineering, conversion-first marketing, software studio Austin',
    canonicalUrl: 'https://thatsoftwarehouse.com/services',
  })

  const toggle = (i) => setOpenIdx((prev) => (prev === i ? null : i))

  return (
    <div className="sp-page">
      {/* Hero */}
      <section className="sp-hero">
        <div className="sp-hero__inner">
          <div className="sp-hero__left">
            <h1 className="sp-hero__h1">
              Infrastructure<br />
              for Main<br />
              Street and<br />
              Beyond.
            </h1>
          </div>
          <div className="sp-hero__right">
            <p className="sp-hero__body">
              <strong>No digital fossils. No vanity metrics.</strong> We build the technical foundation your business needs to grow. From $749 modernizations for local leaders to custom AI engines for funded startups.
            </p>
            <div className="sp-hero__actions">
              <a href="#services" className="sp-btn sp-btn--primary">See all services</a>
              <Link to="/contact" className="sp-btn sp-btn--secondary">Start a conversation</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="sp-stats">
        <div className="sp-stats__inner">
          {stats.map((s, i) => (
            <div key={i} className="sp-stat">
              <div className="sp-stat__num">{s.n}</div>
              <div className="sp-stat__label">{s.label}</div>
              <div className="sp-stat__sub">{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Services accordion */}
      <section id="services" className="sp-services">
        <div className="sp-services__inner">
          <div className="sp-services__header">
            <div className="sp-services__eyebrow">What we build</div>
            <h2 className="sp-services__h2">Six ways we can work together.</h2>
          </div>

          {services.map((svc, i) => (
            <ServiceRow
              key={svc.id}
              svc={svc}
              isOpen={openIdx === i}
              onToggle={() => toggle(i)}
            />
          ))}
          <div className="sp-services__divider" />
        </div>
      </section>

      {/* CTA section */}
      <section className="sp-cta-section">
        <div className="sp-cta-section__inner">
          <div className="sp-cta-section__copy">
            <div className="sp-cta-section__eyebrow">How we work with you</div>
            <h2 className="sp-cta-section__h2">
              A senior team that<br />stays close to the work.
            </h2>
            <p className="sp-cta-section__body">
              We work directly with the people closest to the business, explain tradeoffs in plain language, and keep momentum visible from first audit to launch.
            </p>
          </div>
          <div className="sp-cta-section__action">
            <Link to="/contact" className="sp-btn sp-btn--primary sp-btn--lg">
              Start a conversation
            </Link>
            <p className="sp-cta-section__note">Usually respond within a few hours.</p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ServicesPage
