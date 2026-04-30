import React from 'react';
import { Link } from 'react-router-dom';
import { useSEO } from '@/hooks/useSEO';
import './Team.css';

const stats = [
  { n: '14', label: 'Engineers on staff' },
  { n: '9.4yr', label: 'Average production seniority' },
  { n: '0', label: 'Juniors on client code' },
  { n: '6yr', label: 'Median tenure at TSH' },
];

const leadership = [
  {
    initials: 'SS',
    handle: 'cto',
    name: 'Snehal Shah',
    title: 'CTO & Co-Founder',
    bio: '15+ years building enterprise SaaS and consumer tech. Previously led engineering at high-growth startups and specializes in production AI, HIPAA-compliant architectures, and scalable cloud systems.',
  },
  {
    initials: 'AS',
    handle: 'coo',
    name: 'Ash Saniesales',
    title: 'COO & Co-Founder',
    bio: 'Leads operations and strategic growth roadmaps. Expert in conversion-first technical marketing, business data intelligence, and ensuring every project delivers measurable ROI for our partners.',
  },
];

const principals = [
  {
    initials: 'RK',
    handle: 'principal',
    name: 'Rohit Kumar',
    title: 'Principal · SEO & Marketing',
    bio: 'Expert in technical SEO, conversion optimization, and high-performance digital marketing for e-commerce and scaling brands.',
  },
];

const rules = [
  { n: '01', title: 'No juniors on your codebase.', body: 'Our minimum bar is seven years of production experience in a domain where regressions are expensive.' },
  { n: '02', title: 'No subcontracting.', body: 'Every engineer on your project is a full member of the team, not a hidden second-tier vendor.' },
  { n: '03', title: 'Principal stays until handoff.', body: 'The principal you meet on the first call stays in kickoff, architecture review, and retro.' },
  { n: '04', title: 'We say no in writing.', body: 'If diligence says you should not hire us, we document it and send it.' },
];

function Avatar({ initials, size = 60 }) {
  return (
    <div className="team-avatar" style={{ width: size, height: size }}>
      <span className="team-avatar__initials" style={{ fontSize: size * 0.28 }}>{initials}</span>
    </div>
  );
}

function PersonCard({ person, large }) {
  return (
    <div className={`team-card${large ? ' team-card--large' : ''}`}>
      <div className="team-card__header">
        <Avatar initials={person.initials} size={large ? 72 : 60} />
        <div>
          <div className="team-card__handle">// {person.handle}</div>
          <div className={`team-card__name${large ? ' team-card__name--large' : ''}`}>{person.name}</div>
          <div className="team-card__title">{person.title}</div>
        </div>
      </div>
      <p className="team-card__bio">{person.bio}</p>
    </div>
  );
}

function PlaceholderCard() {
  return (
    <div className="team-card team-card--placeholder">
      <div className="team-placeholder__circle">
        <span>+</span>
      </div>
      <span className="team-placeholder__label">Principal · TBD</span>
    </div>
  );
}

const Team = () => {
  useSEO({
    title: 'Team | That Software House',
    description: 'Meet the principal and staff engineers behind That Software House.',
    keywords: 'software engineering team, principal engineers, healthcare AI engineers, fintech architects',
    canonicalUrl: 'https://thatsoftwarehouse.com/team',
  });

  return (
    <div className="team-page">
      {/* Hero */}
      <section className="team-hero">
        <div className="team-inner">
          <div className="team-hero__grid">
            <div>
              <h1 className="team-hero__title">
                The people<br />in the code.
              </h1>
            </div>
            <div className="team-hero__right">
              <p className="team-hero__body">
                <strong>Everyone here has shipped production software in healthcare or fintech for at least seven years.</strong> We do not hire off LinkedIn cold. Every engineer on this page joined through someone we already worked with. You meet them on the first call.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="team-stats">
        <div className="team-inner team-stats__grid">
          {stats.map((s, i) => (
            <div key={s.n} className={`team-stat${i > 0 ? ' team-stat--bordered' : ''}`}>
              <div className="team-stat__num">{s.n}</div>
              <div className="team-stat__label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Leadership */}
      <section className="team-section">
        <div className="team-inner">
          <div className="team-section__meta">
            <div className="team-section__eyebrow">Leadership · 02</div>
            <div className="team-section__sub">The founders</div>
          </div>
          <div className="team-people team-people--2col">
            {leadership.map((p) => (
              <PersonCard key={p.name} person={p} large />
            ))}
          </div>
        </div>
      </section>

      {/* Principals */}
      <section className="team-section">
        <div className="team-inner">
          <div className="team-section__meta">
            <div className="team-section__eyebrow">Principals · 01</div>
            <div className="team-section__sub">The people who lead engagements</div>
          </div>
          <div className="team-people team-people--3col">
            {principals.map((p) => (
              <PersonCard key={p.name} person={p} />
            ))}
            <PlaceholderCard />
            <PlaceholderCard />
          </div>
        </div>
      </section>

      {/* Hiring rules */}
      <section className="team-hiring">
        <div className="team-inner">
          <div className="team-hiring__header">
            <div>
              <div className="team-eyebrow">Hiring</div>
              <h2 className="team-hiring__title">
                Four rules we<br />do not break.
              </h2>
            </div>
            <p className="team-hiring__note">
              Careers currently closed. We hire through existing relationships only.
            </p>
          </div>
          <div className="team-rules">
            {rules.map((r, i) => (
              <div
                key={r.n}
                className={`team-rule${i < 2 ? ' has-bottom-border' : ''}${i % 2 === 0 ? ' has-right-border' : ''}`}
              >
                <div className="team-rule__num">{r.n}</div>
                <div className="team-rule__title">{r.title}</div>
                <p className="team-rule__body">{r.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="team-cta">
        <div className="team-inner team-cta__grid">
          <div>
            <div className="team-eyebrow">2 slots open · Q3</div>
            <h2 className="team-cta__title">
              You meet the team<br />on the first call.
            </h2>
            <p className="team-cta__body">
              No account managers, no handoffs. The principal who reads your intake is the principal who runs your engagement.
            </p>
          </div>
          <div className="team-cta__action">
            <Link to="/contact" className="team-btn">Start a conversation ↗</Link>
            <p className="team-cta__note">Usually respond within a few hours.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Team;
