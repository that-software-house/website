import React from 'react';
import { Link } from 'react-router-dom';
import { useSEO } from '@/hooks/useSEO';
import './FractionalLeadership.css';

const offerings = [
  {
    number: '01',
    title: 'Technical Strategy',
    description: 'Build-vs-buy decisions, stack selection, make-or-miss architecture calls before you are locked in. We have seen how these decisions play out in production.',
  },
  {
    number: '02',
    title: 'Architecture Review',
    description: 'An honest audit of your current system — what will scale, what will break at 10x, and where the hidden liability sits. Written, not verbal.',
  },
  {
    number: '03',
    title: 'Engineering Team Building',
    description: 'Interviewing, leveling, and hiring your first senior engineers. We know who to look for because we have been those engineers.',
  },
  {
    number: '04',
    title: 'Vendor & Model Selection',
    description: 'AI platform evaluation, cloud provider diligence, and tooling decisions with the context of someone who has actually run these systems at scale.',
  },
  {
    number: '05',
    title: 'Engineering Culture',
    description: 'On-call runbooks, code review standards, incident protocols, and the documentation culture that separates companies that scale from companies that stall.',
  },
  {
    number: '06',
    title: 'Board & Investor Liaison',
    description: 'Technical due diligence support, investor Q&A, and the plain-language explanations that help non-technical stakeholders make informed decisions.',
  },
];

const formats = [
  {
    title: 'Part-time Embed',
    detail: '2 days / week',
    price: 'From $8k / month',
    description: 'Ongoing fractional CTO or VP Engineering. Attends standups, joins architecture reviews, and is reachable when the hard call needs to be made.',
    featured: false,
  },
  {
    title: 'Intensive Sprint',
    detail: '4 weeks · full-time',
    price: 'From $28k',
    description: 'A focused engagement to resolve a specific technical crisis — architecture overhaul, team assessment, or pre-raise diligence. Clear deliverable at the end.',
    featured: true,
  },
  {
    title: 'Advisory Retainer',
    detail: '8 hrs / month',
    price: 'From $3,200 / month',
    description: 'Strategic availability for founders who have a technical team but want a senior voice on the hard calls — model choices, hiring decisions, investor Q&A.',
    featured: false,
  },
];

const FractionalLeadership = () => {
  useSEO({
    title: 'Fractional Technical Leadership | That Software House',
    description: 'Fractional CTO, VP Engineering, and principal engineer services for early-stage startups and growth teams. Senior technical leadership without the full-time hiring risk.',
    keywords: 'fractional CTO, technical leadership, VP engineering, Austin startup, engineering advisory, AI team building',
    canonicalUrl: 'https://thatsoftwarehouse.com/fractional-leadership',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Fractional Technical Leadership',
      provider: { '@type': 'Organization', name: 'That Software House' },
      description: 'Fractional CTO and principal engineer services for startups and growth teams.',
      areaServed: 'Worldwide',
      serviceType: 'Technology Consulting',
    },
  });

  return (
    <div className="studio-page fractional-page">
      <section className="studio-page-hero studio-section-shell">
        <div className="fractional-hero__content">
          <div className="eyebrow">
            <span className="eyebrow__bar" />
            <span className="eyebrow__tag">[ 01 / Fractional Leadership ]</span>
            <span>Senior leadership. No full-time commitment.</span>
          </div>
          <h1>
            A senior CTO without the <em>full-time hire risk</em>.
          </h1>
          <p className="fractional-hero__sub">
            Most early teams are one bad architecture decision away from six months of re-work.
            We embed a principal engineer or fractional CTO who has shipped in your domain —
            part-time, fully accountable, with a written stake in your outcome.
          </p>
          <div className="fractional-hero__actions">
            <Link to="/contact" className="studio-button studio-button--primary">
              Schedule a leadership call
              <span className="studio-button__arrow" aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>

        <aside className="fractional-hero__card studio-card studio-card--featured">
          <div className="fractional-card__label">Who we work with</div>
          <div className="fractional-card__items">
            <div>
              <strong>Seed — Series B founders</strong>
              <span>Without a full-time CTO. Need to make the right calls before the wrong ones are irreversible.</span>
            </div>
            <div>
              <strong>Technical founders in growth mode</strong>
              <span>Who want a senior sparring partner and a second pair of eyes on architecture decisions.</span>
            </div>
            <div>
              <strong>Teams pre-raise</strong>
              <span>Need investor-facing technical clarity and a CTO who can handle diligence calls.</span>
            </div>
          </div>
        </aside>
      </section>

      <section className="fractional-offerings studio-section-shell">
        <div className="home-studio__label">02 / What we cover</div>
        <div className="fractional-offerings__grid">
          {offerings.map((item) => (
            <div key={item.number} className="fractional-offering">
              <div className="fractional-offering__num">{item.number}</div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="fractional-formats studio-section-shell">
        <div>
          <div className="home-studio__label">03 / Engagement formats</div>
          <h2>Pick the format that fits your stage.</h2>
        </div>
        <div className="fractional-formats__grid">
          {formats.map((fmt) => (
            <div key={fmt.title} className={`fractional-format ${fmt.featured ? 'fractional-format--featured' : ''}`}>
              {fmt.featured && (
                <div className="fractional-format__badge">
                  <span className="studio-pill studio-pill--live">
                    <span className="studio-pill__dot" />
                    Most common
                  </span>
                </div>
              )}
              <div className="fractional-format__top">
                <h3>{fmt.title}</h3>
                <span className="fractional-format__detail">{fmt.detail}</span>
              </div>
              <div className="fractional-format__price">{fmt.price}</div>
              <p>{fmt.description}</p>
              <Link to="/contact" className={`studio-button ${fmt.featured ? 'studio-button--primary' : 'studio-button--secondary'}`}>
                Talk to us
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
            Tell us what decision is <em>keeping you up</em>.
          </h2>
          <div className="studio-big-cta__meta studio-big-cta__fine">
            We reply within 24 hours. If we are not the right fit, we say so and point you to who is.
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
          <span><span className="studio-page-meta__label">IDX</span> 03 / Fractional Leadership</span>
          <span><span className="studio-page-meta__label">REV</span> 2026.04.20</span>
          <span><span className="studio-page-meta__label">LOC</span> Austin, TX · 30.26°N, 97.74°W</span>
        </div>
        <div>From $3,200 / month ↗</div>
      </div>
    </div>
  );
};

export default FractionalLeadership;
