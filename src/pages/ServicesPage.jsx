import React from 'react';
import { Link } from 'react-router-dom';
import { useSEO } from '@/hooks/useSEO';
import './ServicesPage.css';

const services = [
  {
    number: '01',
    title: 'Main Street Modernization',
    body: 'We migrate established local businesses—law firms, dental clinics, CPAs—off "digital fossils" like legacy WordPress. We move you to high-performance, zero-maintenance stacks that don’t "break" when you aren’t looking. Fast, secure, and built to convert.',
    bullets: [
      'Migration to modern stacks (Framer, Webflow, Custom)',
      'Zero-plugin dependency for maximum stability',
      'Technical SEO and high-speed performance',
      'Mobile-first design for local search dominance',
    ],
    panel: [
      ['Launch', 'From $749'],
      ['Maintenance', '$89 / mo'],
      ['Timeline', '7–14 days'],
      ['Technology', 'Framer / Next.js'],
    ],
    cta: 'Start modernization',
    href: '/modernization',
  },
  {
    number: '02',
    title: 'AI-Powered Intelligence',
    body: 'We turn your firm’s private records into a searchable "AI Brain." Our custom RAG models allow you to instantly find information in old client files, and our 24/7 AI Receptionist handles client intake so you don’t have to.',
    bullets: [
      'Custom AI Chat-First Intake & Receptionist',
      'Private RAG (Knowledge) migration for internal docs',
      'Automated meeting prep and client summaries',
      'HIPAA & SOC 2 compliance readiness',
    ],
    panel: [
      ['Launch', 'Custom Scope'],
      ['Impact', 'Instant Search'],
      ['Team', '1-2 Senior Eng.'],
      ['Focus', 'Internal Data'],
    ],
    cta: 'Incorporate AI',
  },
  {
    number: '03',
    title: 'High-Velocity Startups',
    body: 'For solo founders or funded teams that need to ship production-grade features immediately. We drop in as your senior product squad, building MVPs in weeks and hardening your prototype for scale and investment.',
    bullets: [
      'Full-stack build: Web, Mobile, & Backend',
      'Senior engineers only (no learning on your dime)',
      'Investor-ready tech due diligence',
      'Rapid prototype-to-production cycles',
    ],
    panel: [
      ['Timeline', '4–12 weeks'],
      ['Team size', '2–4 engineers'],
      ['Code ownership', 'Yours, day 1'],
      ['Rate', 'Custom Fee'],
    ],
    cta: 'Build my MVP',
  },
  {
    number: '04',
    title: 'Generative SEO & GEO',
    body: 'For e-commerce and high-intent brands. We move beyond keywords to GEO (Generative Engine Optimization). We ensure your brand is the one LLMs—ChatGPT, Perplexity, Claude—recommend when users ask for solutions in your niche.',
    bullets: [
      'Technical SEO audit for e-commerce scale',
      'GEO: Optimizing for LLM brand citation',
      'Entity-based content architecture',
      'Conversion-leak audits for checkout flows',
    ],
    panel: [
      ['Focus', 'E-com / Scale'],
      ['Strategy', 'GEO-First'],
      ['Metric', 'LLM Citations'],
      ['Type', 'Select Retainer'],
    ],
    cta: 'Secure my brand',
  },
  {
    number: '05',
    title: 'High-Stakes Founder Design',
    body: 'We engineer pitch decks and investor slides for founders who cannot afford to lose a round. We’ve helped startups raise millions by perfecting the technical narrative and visual clarity required for Series A+ diligence.',
    bullets: [
      'Series A/B Pitch Deck Engineering',
      'Technical Narrative & Storytelling',
      'Data Visualization for Due Diligence',
      'Founder Branding & Slide Systems',
    ],
    panel: [
      ['Outcome', 'Round Success'],
      ['Team', 'Lead Designer'],
      ['Focus', 'Investor Clarity'],
      ['Track Record', '$412M+ Raised'],
    ],
    cta: 'Perfect my deck',
  },
];

const noFit = [
  'Generic social media "growth" services. We don’t chase views; we chase conversions.',
  'Maintenance of existing legacy WordPress sites. We migrate; we don’t patch.',
  'Projects where leadership prefers "cheap" over "senior quality."',
  'Staff augmentation without a technical roadmap. We lead; we do not fill chairs.',
  'Engagements focused only on vanity metrics instead of business data.',
];

const ServicesPage = () => {
  useSEO({
    title: 'Services | That Software House',
    description: 'Main Street Modernization, AI-Powered Intelligence, High-Velocity Startups, and Selective Growth Support for established businesses.',
    keywords: 'WordPress migration, AI virtual receptionist, startup software engineering, conversion-first marketing, software studio Austin',
    canonicalUrl: 'https://thatsoftwarehouse.com/services',
  });

  return (
    <div className="studio-page services-page">
      <section className="studio-page-hero studio-section-shell">
        <div>
          <div className="eyebrow">
            <span className="eyebrow__bar" />
            <span className="eyebrow__tag">[ 02 / Services ]</span>
            <span>Technical Infrastructure for Business.</span>
          </div>
          <h1>Infrastructure for Main Street and Beyond.</h1>
        </div>
        <div className="studio-page-hero__copy">
          <strong>No digital fossils. No vanity metrics.</strong> We build the technical foundation your business needs to grow. From $749 modernizations for local leaders to custom AI engines for funded startups.
        </div>
      </section>

      <section className="services-list studio-section-shell">
        {services.map((service) => (
          <article key={service.number} className="service-row">
            <div className="service-row__index">
              Service
              <em>{service.number}</em>
            </div>
            <div>
              <h2>{service.title}</h2>
            </div>
            <div className="service-row__body">
              <p>{service.body}</p>
              <ul>
                {service.bullets.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="service-row__panel">
              <h3>Engagement shape</h3>
              {service.panel.map(([key, value]) => (
                <div key={key} className="service-row__panel-row">
                  <span>{key}</span>
                  <strong>{value}</strong>
                </div>
              ))}
              <Link to={service.href || "/contact"} className="service-row__panel-cta">
                {service.cta} ↗
              </Link>
            </div>
          </article>
        ))}
      </section>

      <section className="services-refuse studio-section-shell">
        <div>
          <h2>Work we will not take.</h2>
          <div className="services-refuse__sub">clarity is faster than pretense</div>
        </div>
        <ul>
          {noFit.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="studio-big-cta">
        <div>
          <div className="studio-big-cta__meta">03 / Start a conversation</div>
          <h2 className="studio-big-cta__title">
            Bring us the messy version. We can work from <em>that</em>.
          </h2>
          <div className="studio-big-cta__meta studio-big-cta__fine">
            We will tell you quickly whether this needs a migration, a custom build, or a pass.
          </div>
        </div>
        <div className="studio-big-cta__actions">
          <Link to="/contact" className="studio-button studio-button--primary">
            Talk to us
            <span className="studio-button__arrow" aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>

      <div className="studio-page-meta">
        <div className="studio-page-meta__left">
          <span><span className="studio-page-meta__label">IDX</span> 02 / Services</span>
          <span><span className="studio-page-meta__label">REV</span> 2026.04.17</span>
          <span><span className="studio-page-meta__label">MIN</span> $749 Launch</span>
        </div>
        <div>Reply within 24h ↗</div>
      </div>
    </div>
  );
};

export default ServicesPage;
