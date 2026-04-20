import React from 'react';
import { Link } from 'react-router-dom';
import { useSEO } from '@/hooks/useSEO';
import './SMBWebsites.css';

const features = [
  {
    number: '01',
    title: 'Custom Design — No Templates',
    description: 'Every site is built for your business, not reskinned from a theme marketplace. Mobile-first, fast by default, and distinct from every competitor in your market.',
  },
  {
    number: '02',
    title: 'AI Chat Integration',
    description: 'An AI assistant that answers FAQs, qualifies leads, and books appointments — 24/7, without a receptionist. Powered by your own content, not a generic script.',
  },
  {
    number: '03',
    title: 'SEO Foundations',
    description: 'Technical setup done right from day one: structured data, Core Web Vitals, Google Business integration, and a site architecture search engines can actually read.',
  },
  {
    number: '04',
    title: 'Performance Hosting',
    description: 'No WordPress plugin sprawl. A clean, managed hosting stack with automated backups, SSL, and <100ms time-to-first-byte globally.',
  },
  {
    number: '05',
    title: 'Analytics & Conversion Tracking',
    description: 'Know which pages earn calls, which earn leads, and which earn nothing. We wire up Google Analytics 4 and conversion tracking before we hand over the keys.',
  },
];

const packages = [
  {
    name: 'Launch',
    price: '$2,500',
    period: 'one-time',
    delivery: '10–14 days',
    items: [
      'Up to 6 pages',
      'Custom design',
      'Mobile-first & fast',
      'Basic SEO setup',
      'Contact form & map',
      'Google Analytics 4',
    ],
    featured: false,
  },
  {
    name: 'Growth',
    price: '$4,500',
    period: 'one-time',
    delivery: '14–21 days',
    items: [
      'Up to 12 pages',
      'Everything in Launch',
      'AI chat integration',
      'Full SEO foundations',
      'Conversion tracking',
      'Blog setup',
    ],
    featured: true,
  },
  {
    name: 'Authority',
    price: '$8,500',
    period: 'one-time',
    delivery: '3–5 weeks',
    items: [
      'Unlimited pages',
      'Everything in Growth',
      'Custom AI assistant training',
      'E-commerce integration',
      'Online booking system',
      '60-day post-launch support',
    ],
    featured: false,
  },
];

const caseStudies = [
  {
    client: 'Heritage Dental Clinic',
    industry: 'Healthcare',
    challenge: 'Stuck on a slow WordPress site requiring weekly plugin fixes. Losing mobile leads to competitors.',
    solution: 'Custom high-speed site with AI intake assistant handling after-hours appointment bookings.',
    results: [
      { label: 'Load time', value: '−64%' },
      { label: 'Online bookings', value: '+42%' },
    ],
  },
  {
    client: 'Riverside Law Group',
    industry: 'Professional Services',
    challenge: 'Generic template site. Ranked on page 3 for all primary keywords. No lead tracking.',
    solution: 'Custom site with structured data, local SEO buildout, and a consultation booking AI.',
    results: [
      { label: 'Organic traffic', value: '+280%' },
      { label: 'Consultations booked', value: '+3.1×' },
    ],
  },
];

const SMBWebsites = () => {
  useSEO({
    title: 'Websites for Small Businesses | That Software House',
    description: 'Custom websites for local businesses. Fast, mobile-first, and built to convert — not just look good. AI chat, SEO foundations, and performance hosting included.',
    keywords: 'small business website, local business web design, custom website, Austin web design, SMB website development',
    canonicalUrl: 'https://thatsoftwarehouse.com/smb-websites',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Websites for Small Businesses',
      provider: { '@type': 'Organization', name: 'That Software House' },
      description: 'Custom website design and development for local businesses. Mobile-first, fast, and built to convert.',
      areaServed: 'United States',
      serviceType: 'Web Design',
    },
  });

  return (
    <div className="studio-page smb-websites-page">
      <section className="studio-page-hero studio-section-shell">
        <div className="smb-web-hero__content">
          <div className="eyebrow">
            <span className="eyebrow__bar" />
            <span className="eyebrow__tag">[ 01 / SMB Websites ]</span>
            <span>Custom. Fast. Built to convert.</span>
          </div>
          <h1>
            A website that works as hard as <em>you do</em>.
          </h1>
          <p className="smb-web-hero__sub">
            Your customers decide in seconds. We build sites that give them a reason to stay —
            custom-designed, lightning-fast, with AI chat that turns after-hours visits into booked appointments.
          </p>
          <div className="smb-web-hero__actions">
            <Link to="/contact" className="studio-button studio-button--primary">
              Get a free quote
              <span className="studio-button__arrow" aria-hidden="true">↗</span>
            </Link>
            <a href="#packages" className="studio-button studio-button--secondary">
              See packages
              <span className="studio-button__arrow" aria-hidden="true">↗</span>
            </a>
          </div>
        </div>

        <div className="smb-web-hero__proof studio-card studio-card--featured">
          <div className="smb-web-proof__label">What our sites deliver</div>
          <div className="smb-web-proof__stats">
            <div>
              <div>+2.5×</div>
              <span>Lead conversion vs. template sites</span>
            </div>
            <div>
              <div>&lt;1s</div>
              <span>Load time on mobile, globally</span>
            </div>
            <div>
              <div>10–14d</div>
              <span>Average delivery for Launch package</span>
            </div>
          </div>
        </div>
      </section>

      <section className="smb-web-features studio-section-shell">
        <div className="home-studio__label">02 / What&apos;s included</div>
        <div className="smb-web-features__list">
          {features.map((feat) => (
            <div key={feat.number} className="smb-web-feature-row">
              <div className="smb-web-feature-row__num">{feat.number}</div>
              <div className="smb-web-feature-row__name">{feat.title}</div>
              <p className="smb-web-feature-row__desc">{feat.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="packages" className="smb-web-packages studio-section-shell">
        <div>
          <div className="home-studio__label">03 / Packages</div>
          <h2>Fixed-price. No surprises.</h2>
          <p>Every package includes design, development, SEO setup, and a 30-day warranty on what we ship.</p>
        </div>
        <div className="smb-web-packages__grid">
          {packages.map((pkg) => (
            <div key={pkg.name} className={`smb-web-package ${pkg.featured ? 'smb-web-package--featured' : ''}`}>
              {pkg.featured && (
                <span className="studio-pill studio-pill--live">
                  <span className="studio-pill__dot" />
                  Most popular
                </span>
              )}
              <h3>{pkg.name}</h3>
              <div className="smb-web-package__price">
                <span>{pkg.price}</span>
                <small>{pkg.period}</small>
              </div>
              <div className="smb-web-package__delivery">Delivered in {pkg.delivery}</div>
              <ul className="smb-web-package__items">
                {pkg.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <Link to="/contact" className={`studio-button ${pkg.featured ? 'studio-button--primary' : 'studio-button--secondary'}`}>
                Get started
                <span className="studio-button__arrow" aria-hidden="true">↗</span>
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="smb-web-cases studio-section-shell">
        <div>
          <div className="home-studio__label">04 / Proven results</div>
          <h2>Built for real businesses.</h2>
        </div>
        <div className="smb-web-cases__grid">
          {caseStudies.map((study) => (
            <div key={study.client} className="smb-web-case">
              <div className="smb-web-case__header">
                <span>{study.industry}</span>
                <h3>{study.client}</h3>
              </div>
              <div className="smb-web-case__body">
                <div>
                  <h4>The challenge</h4>
                  <p>{study.challenge}</p>
                </div>
                <div>
                  <h4>The solution</h4>
                  <p>{study.solution}</p>
                </div>
              </div>
              <div className="smb-web-case__stats">
                {study.results.map((res) => (
                  <div key={res.label}>
                    <strong>{res.value}</strong>
                    <span>{res.label}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="studio-big-cta">
        <div>
          <div className="studio-big-cta__meta">05 / Get started</div>
          <h2 className="studio-big-cta__title">
            Ready to stop <em>losing leads</em> to a slow site?
          </h2>
          <div className="studio-big-cta__meta studio-big-cta__fine">
            We quote within 24 hours. Most Launch sites are live in 10–14 days.
          </div>
        </div>
        <div className="studio-big-cta__actions">
          <Link to="/contact" className="studio-button studio-button--primary">
            Get a free quote
            <span className="studio-button__arrow" aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>

      <div className="studio-page-meta">
        <div className="studio-page-meta__left">
          <span><span className="studio-page-meta__label">IDX</span> 05 / SMB Websites</span>
          <span><span className="studio-page-meta__label">REV</span> 2026.04.20</span>
          <span><span className="studio-page-meta__label">LOC</span> Austin, TX · 30.26°N, 97.74°W</span>
        </div>
        <div>From $2,500 ↗</div>
      </div>
    </div>
  );
};

export default SMBWebsites;
