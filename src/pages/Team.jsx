import React from 'react';
import { useSEO } from '@/hooks/useSEO';
import './Team.css';

const stats = [
  ['14', 'Engineers on staff'],
  ['9.4yr', 'Average production seniority'],
  ['0', 'Juniors on client code'],
  ['6yr', 'Median tenure at TSH'],
];

const principals = [
  ['Rk', 'Rohit Kumar', 'Principal · SEO & Marketing', 'Expert in technical SEO, conversion optimization, and high-performance digital marketing for e-commerce and scaling brands.'],
];

const policies = [
  ['01', 'No juniors on your codebase.', 'Our minimum bar is seven years of production experience in a domain where regressions are expensive.'],
  ['02', 'No subcontracting.', 'Every engineer on your project is a full member of the team, not a hidden second-tier vendor.'],
  ['03', 'Principal stays until handoff.', 'The principal you meet on the first call stays in kickoff, architecture review, and retro.'],
  ['04', 'We say no in writing.', 'If diligence says you should not hire us, we document it and send it.'],
];

const Team = () => {
  useSEO({
    title: 'Team | That Software House',
    description: 'Meet the principal and staff engineers behind That Software House.',
    keywords: 'software engineering team, principal engineers, healthcare AI engineers, fintech architects',
    canonicalUrl: 'https://thatsoftwarehouse.com/team',
  });

  return (
    <div className="studio-page team-page">
      <section className="studio-page-hero studio-section-shell">
        <div>
          <div className="eyebrow">
            <span className="eyebrow__bar" />
            <span className="eyebrow__tag">[ 04 / Team ]</span>
            <span>14 engineers · 0 juniors · 0 recruiters</span>
          </div>
          <h1>The people in the code.</h1>
        </div>
        <div className="studio-page-hero__copy">
          <strong>Everyone here has shipped production software in healthcare or fintech for at least seven years.</strong> We do not hire off LinkedIn cold. Every engineer on this page joined through someone we already worked with. You meet them on the first call.
        </div>
      </section>

      <section className="team-stats studio-section-shell">
        {stats.map(([value, label]) => (
          <div key={label}>
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </section>

      <section className="team-grid studio-section-shell">
        <div className="team-grid__label">
          <span>/ leadership · 02</span>
          <span>The founders</span>
        </div>
        <div className="team-grid__people">
          <article className="team-card">
            <div className="team-card__portrait">
              <strong>SS</strong>
              <span>// cto</span>
            </div>
            <h2>Snehal Shah</h2>
            <div className="team-card__role">CTO & Co-Founder</div>
            <p>15+ years building enterprise SaaS and consumer tech. Previously led engineering at high-growth startups and specializes in production AI, HIPAA-compliant architectures, and scalable cloud systems.</p>
          </article>
          <article className="team-card">
            <div className="team-card__portrait">
              <strong>AS</strong>
              <span>// coo</span>
            </div>
            <h2>Ash Saniesales</h2>
            <div className="team-card__role">COO & Co-Founder</div>
            <p>Leads operations and strategic growth roadmaps. Expert in conversion-first technical marketing, business data intelligence, and ensuring every project delivers measurable ROI for our partners.</p>
          </article>
        </div>
      </section>

      <section className="team-grid studio-section-shell">
        <div className="team-grid__label">
          <span>/ principals · 01</span>
          <span>The people who lead engagements</span>
        </div>
        <div className="team-grid__people">
          {principals.map(([initials, name, role, bio]) => (
            <article key={name} className="team-card">
              <div className="team-card__portrait">
                <strong>{initials}</strong>
                <span>// principal</span>
              </div>
              <h2>{name}</h2>
              <div className="team-card__role">{role}</div>
              <p>{bio}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="team-policy studio-section-shell">
        <div>
          <div className="eyebrow">
            <span className="eyebrow__bar" />
            <span className="eyebrow__tag">[ Hiring ]</span>
          </div>
          <h2>Four rules we do not break.</h2>
        </div>
        <div className="team-policy__grid">
          {policies.map(([number, title, body]) => (
            <div key={number} className="team-policy__item">
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="studio-page-meta">
        <div className="studio-page-meta__left">
          <span><span className="studio-page-meta__label">IDX</span> 04 / Team</span>
          <span><span className="studio-page-meta__label">REV</span> 2026.04.17</span>
          <span><span className="studio-page-meta__label">HC</span> 14 eng · 9.4yr avg</span>
        </div>
        <div>Careers closed ↗</div>
      </div>
    </div>
  );
};

export default Team;
