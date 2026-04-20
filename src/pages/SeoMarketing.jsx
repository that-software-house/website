import React from 'react';
import { Link } from 'react-router-dom';
import { useSEO } from '@/hooks/useSEO';
import './SeoMarketing.css';

const services = [
  {
    number: '01',
    title: 'GEO-Ready Brand Optimization',
    description: 'LLM search is real. We optimize your content, schema, and positioning so Claude, ChatGPT, and Perplexity cite you — not your competitor — when buyers ask the right question.',
  },
  {
    number: '02',
    title: 'Technical SEO',
    description: 'Site architecture, Core Web Vitals, structured data, and crawlability audits. The kind of SEO that compounds over months, not weeks.',
  },
  {
    number: '03',
    title: 'Content Strategy',
    description: 'Keyword research, topical authority planning, and SEO-optimized writing that earns rankings instead of renting them. No AI slop.',
  },
  {
    number: '04',
    title: 'Local SEO',
    description: 'Google Business optimization, local citation building, and proximity ranking for businesses that serve a geography.',
  },
  {
    number: '05',
    title: 'Product Marketing',
    description: 'Positioning, messaging architecture, and GTM strategy for technical products that are hard to explain to a non-technical buyer.',
  },
  {
    number: '06',
    title: 'Analytics & Reporting',
    description: 'Monthly performance reports with rankings, traffic, and leads tracked against revenue — not vanity metrics.',
  },
];

const results = [
  { value: '340%', label: 'Avg. organic traffic increase' },
  { value: '2.5×', label: 'Lead generation improvement' },
  { value: '60+', label: 'Keywords moved to page 1' },
  { value: 'GEO', label: 'LLM citation coverage' },
];

const plans = [
  {
    name: 'Essentials',
    price: '$1,000',
    period: '/month',
    commitment: '3-month minimum',
    items: [
      'Technical SEO audit & fixes',
      'On-page optimization (10 pages)',
      'Monthly keyword tracking',
      'Basic analytics reporting',
      'Email support',
    ],
    featured: false,
  },
  {
    name: 'Growth',
    price: '$2,500',
    period: '/month',
    commitment: '3-month minimum',
    items: [
      'Everything in Essentials',
      'GEO-ready content strategy',
      '4 SEO blog posts / month',
      'Link building (5 links / month)',
      'Competitor analysis',
      'Bi-weekly strategy calls',
    ],
    featured: true,
  },
  {
    name: 'Authority',
    price: '$5,000',
    period: '/month',
    commitment: '6-month minimum',
    items: [
      'Everything in Growth',
      '8 posts + landing pages / month',
      'Premium link building (15 links)',
      'Product marketing & positioning',
      'Weekly strategy calls',
      'Dedicated account manager',
    ],
    featured: false,
  },
];

const SeoMarketing = () => {
  useSEO({
    title: 'SEO & Marketing | That Software House',
    description: 'GEO-ready SEO, technical optimization, and product marketing for businesses that need to get found — in Google and in AI search. From $1,000/month.',
    keywords: 'SEO marketing, GEO optimization, technical SEO, product marketing, local SEO, Austin TX',
    canonicalUrl: 'https://thatsoftwarehouse.com/seo-marketing',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'SEO & Marketing',
      provider: { '@type': 'Organization', name: 'That Software House' },
      description: 'GEO-ready SEO and product marketing services including technical SEO, content strategy, and LLM brand optimization.',
      areaServed: 'Worldwide',
      serviceType: 'Search Engine Optimization',
    },
  });

  return (
    <div className="studio-page seo-marketing-page">
      <section className="studio-page-hero studio-section-shell">
        <div className="seo-mkt-hero__content">
          <div className="eyebrow">
            <span className="eyebrow__bar" />
            <span className="eyebrow__tag">[ 01 / SEO & Marketing ]</span>
            <span>Rank in Google. Get cited by AI. Convert both.</span>
          </div>
          <h1>
            Get found. Get cited. <em>Get customers.</em>
          </h1>
          <p className="seo-mkt-hero__sub">
            We do the SEO that compounds — technical foundations, content that earns authority, and GEO-ready
            optimization so your brand appears when buyers ask AI the questions your customers are already asking.
          </p>
          <div className="seo-mkt-hero__actions">
            <Link to="/contact" className="studio-button studio-button--primary">
              Get a free audit
              <span className="studio-button__arrow" aria-hidden="true">↗</span>
            </Link>
            <a href="#pricing" className="studio-button studio-button--secondary">
              View pricing
              <span className="studio-button__arrow" aria-hidden="true">↗</span>
            </a>
          </div>
        </div>

        <div className="seo-mkt-hero__results">
          {results.map((r) => (
            <div key={r.label} className="seo-mkt-result">
              <div>{r.value}</div>
              <span>{r.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="seo-mkt-services studio-section-shell">
        <div className="home-studio__label">02 / Services</div>
        <div className="seo-mkt-services__list">
          {services.map((svc) => (
            <div key={svc.number} className="seo-mkt-service-row">
              <div className="seo-mkt-service-row__num">{svc.number}</div>
              <div className="seo-mkt-service-row__name">{svc.title}</div>
              <p className="seo-mkt-service-row__desc">{svc.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="seo-mkt-pricing studio-section-shell">
        <div>
          <div className="home-studio__label">03 / Pricing</div>
          <h2>Simple, transparent pricing.</h2>
          <p>Monthly retainers. No lock-in traps. Cancel after the minimum with 30-day notice.</p>
        </div>
        <div className="seo-mkt-pricing__grid">
          {plans.map((plan) => (
            <div key={plan.name} className={`seo-mkt-plan ${plan.featured ? 'seo-mkt-plan--featured' : ''}`}>
              {plan.featured && (
                <span className="studio-pill studio-pill--live">
                  <span className="studio-pill__dot" />
                  Most popular
                </span>
              )}
              <h3>{plan.name}</h3>
              <div className="seo-mkt-plan__price">
                <span>{plan.price}</span>
                <small>{plan.period}</small>
              </div>
              <div className="seo-mkt-plan__commit">{plan.commitment}</div>
              <ul className="seo-mkt-plan__items">
                {plan.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <Link to="/contact" className={`studio-button ${plan.featured ? 'studio-button--primary' : 'studio-button--secondary'}`}>
                Get started
                <span className="studio-button__arrow" aria-hidden="true">↗</span>
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="studio-big-cta">
        <div>
          <div className="studio-big-cta__meta">04 / Start a conversation</div>
          <h2 className="studio-big-cta__title">
            Not sure which plan fits? <em>Ask us.</em>
          </h2>
          <div className="studio-big-cta__meta studio-big-cta__fine">
            We offer a free 30-minute audit call for any business considering SEO. No pitch. Just an honest read of where you stand.
          </div>
        </div>
        <div className="studio-big-cta__actions">
          <Link to="/contact" className="studio-button studio-button--primary">
            Book a free audit
            <span className="studio-button__arrow" aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>

      <div className="studio-page-meta">
        <div className="studio-page-meta__left">
          <span><span className="studio-page-meta__label">IDX</span> 04 / SEO & Marketing</span>
          <span><span className="studio-page-meta__label">REV</span> 2026.04.20</span>
          <span><span className="studio-page-meta__label">LOC</span> Austin, TX · 30.26°N, 97.74°W</span>
        </div>
        <div>From $1,000 / month ↗</div>
      </div>
    </div>
  );
};

export default SeoMarketing;
