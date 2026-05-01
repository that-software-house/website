import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSEO } from '@/hooks/useSEO';
import './Work.css';

const filters = ['All', 'Healthcare', 'Fintech', 'Insurtech', 'Infra / AI'];

const caseStudies = [
  {
    index: '01',
    slug: 'vox-health',
    name: 'Vox Health',
    subtitle: 'Brand identity & design system',
    tags: ['Healthcare AI', 'Brand Identity', 'Design System'],
    domain: 'Healthcare',
    engagement: 'Brand sprint',
    result: 'Zero to launched in 13 days',
    stage: 'Startup · 2025',
    headline: 'Building a brand from the ground up.',
    story: 'The CEO of Vox Health came to us with a clear mission and nothing else — no logo, no colors, no visual direction. Just a dental AI platform that automates scheduling, insurance verification, and patient communication for dental practices. We assigned a senior designer from day one, ran a structured discovery session to anchor the strategy, explored three distinct brand systems, and delivered a complete identity, design system, and live website in under two weeks. Constant communication throughout. Zero radio silence.',
    imageLabel: 'Brand System: Final Identity, Design Tokens & Component Library',
    stats: [
      { n: '13', label: 'Days zero to launched' },
      { n: '3+', label: 'Brand systems explored' },
      { n: '2', label: 'Focused refinement rounds' },
      { n: '0', label: 'Days of radio silence' },
    ],
  },
];

const clients = ['Vox Health', 'CodeMinder', 'orbital/', 'Ledgerwise', 'Parallel.fi', 'Harbormesa', '.insure', 'Keystone', 'Northwind', 'finch.run', 'Aperture', 'Atlas Rad'];

function CaseStudyImage({ label }) {
  return (
    <div className="work-cs-image">
      <svg className="work-cs-image__grid" viewBox="0 0 800 450" preserveAspectRatio="none">
        {[...Array(9)].map((_, i) => (
          <line key={`v${i}`} x1={i * 100} y1="0" x2={i * 100} y2="450" stroke="white" strokeWidth="1" />
        ))}
        {[...Array(5)].map((_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 112} x2="800" y2={i * 112} stroke="white" strokeWidth="1" />
        ))}
      </svg>
      <div className="work-cs-image__label">Studio Review</div>
      <div className="work-cs-image__desc">{label}</div>
      <div className="work-cs-image__sub">Screen capture</div>
    </div>
  );
}

function CaseStudyCard({ cs, onClick, isActive }) {
  return (
    <div
      className={`work-card${isActive ? ' work-card--active' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      <div className="work-card__top">
        <div>
          <div className="work-card__domain">/ {cs.index} · {cs.domain}</div>
          <div className="work-card__name">{cs.name}</div>
          <div className="work-card__subtitle">{cs.subtitle}</div>
        </div>
        {cs.slug ? (
          <Link
            to={`/case-studies/${cs.slug}`}
            className="work-card__arrow"
            onClick={(e) => e.stopPropagation()}
            aria-label={`Read ${cs.name} case study`}
          >
            ↗
          </Link>
        ) : (
          <div className="work-card__arrow">↗</div>
        )}
      </div>
      <div className="work-card__tags">
        {cs.tags.map((t) => (
          <span key={t} className="work-card__tag">{t}</span>
        ))}
      </div>
      <div className="work-card__meta">
        {[
          { label: 'Engagement', value: cs.engagement },
          { label: 'Result', value: cs.result },
          { label: 'Stage', value: cs.stage },
        ].map((m) => (
          <div key={m.label}>
            <div className="work-card__meta-label">{m.label}</div>
            <div className="work-card__meta-value">{m.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FeaturedPanel({ cs }) {
  return (
    <div className="work-featured">
      <div className="work-featured__body">
        <div className="work-featured__grid">
          <div>
            <div className="work-featured__eyebrow">Featured · Case / {cs.index}</div>
            <h3 className="work-featured__title">{cs.name}, {cs.headline}</h3>
            <p className="work-featured__story">{cs.story}</p>
          </div>
          <div className="work-featured__stats">
            {cs.stats.map((s, i) => (
              <div key={i} className={`work-featured__stat${i < cs.stats.length - 1 ? ' has-border' : ''}`}>
                <span className="work-featured__stat-label">{s.label}</span>
                <span className="work-featured__stat-num">{s.n}</span>
              </div>
            ))}
          </div>
        </div>
        <CaseStudyImage label={cs.imageLabel || 'Studio preview'} />
      </div>
      <div className="work-featured__footer">
        <span className="work-featured__date">Deployed Q4 2025</span>
        {cs.slug ? (
          <Link to={`/case-studies/${cs.slug}`} className="work-featured__link">
            Read the full case study ↗
          </Link>
        ) : (
          <Link to="/contact" className="work-featured__link">Ask about NDA referrals ↗</Link>
        )}
      </div>
    </div>
  );
}

const Work = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedCase, setSelectedCase] = useState(0);

  useSEO({
    title: 'Work | That Software House',
    description: 'Selected healthcare, fintech, and AI product engagements from That Software House.',
    keywords: 'software studio case studies, healthcare AI work, fintech engineering portfolio',
    canonicalUrl: 'https://thatsoftwarehouse.com/work',
  });

  return (
    <div className="work-page">
      {/* Hero */}
      <section className="work-hero">
        <div className="work-inner">
          <div className="work-hero__grid">
            <div>
              <h1 className="work-hero__title">
                38 products.<br />Six years.<br />Zero ghost-written<br />case studies.
              </h1>
            </div>
            <div className="work-hero__right">
              <p className="work-hero__body">
                <strong>Every engagement on this page is a real deployment you can reference.</strong> If a client is not here, it is because they are pre-launch or under NDA. Ask on a call and we will connect you to the founder directly when we can.
              </p>
              <div className="work-hero__stats">
                {[
                  { n: '38', label: 'Engagements' },
                  { n: '6yr', label: 'Operating' },
                  { n: '0', label: 'Ghost-written' },
                ].map((s, i) => (
                  <div key={s.label} className={`work-hero__stat${i < 2 ? ' has-border' : ''}`}>
                    <div className="work-hero__stat-num">{s.n}</div>
                    <div className="work-hero__stat-label">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filter + grid */}
      <section className="work-grid-section">
        <div className="work-inner">
          {/* Filter bar */}
          <div className="work-filter-bar">
            <div className="work-filters">
              {filters.map((f) => (
                <button
                  key={f}
                  type="button"
                  className={`work-filter${activeFilter === f ? ' work-filter--active' : ''}`}
                  onClick={() => setActiveFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="work-filter-count">
              Showing 1 of 38 · <strong>Sort: most recent</strong>
            </div>
          </div>

          {/* Case study grid */}
          <div className="work-grid">
            <CaseStudyCard
              cs={caseStudies[0]}
              onClick={() => setSelectedCase(0)}
              isActive={selectedCase === 0}
            />
            {[...Array(5)].map((_, i) => (
              <div key={i} className="work-placeholder">
                <div className="work-placeholder__index">Case study {String(i + 2).padStart(2, '0')}</div>
                <div className="work-placeholder__note">
                  Under NDA or pre-launch.<br />Ask on a call.
                </div>
              </div>
            ))}
          </div>

          {/* Featured panel */}
          <FeaturedPanel cs={caseStudies[selectedCase]} />
        </div>
      </section>

      {/* Client strip */}
      <section className="work-clients">
        <div className="work-inner">
          <div className="work-clients__eyebrow">Selected clients</div>
          <div className="work-clients__grid">
            {clients.map((c) => (
              <div key={c} className="work-clients__item">{c}</div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="work-cta">
        <div className="work-inner work-cta__grid">
          <div>
            <div className="work-cta__eyebrow">2 slots open · Q3</div>
            <h2 className="work-cta__title">
              Want to talk to<br />one of these founders?
            </h2>
            <p className="work-cta__body">
              When we can, we connect prospective clients directly with founders who've been through the engagement. Ask on the first call.
            </p>
          </div>
          <div className="work-cta__action">
            <Link to="/contact" className="work-btn">Start a conversation ↗</Link>
            <p className="work-cta__note">Usually respond within a few hours.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Work;
