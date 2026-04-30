import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSEO } from '@/hooks/useSEO';
import './Approach.css';

const phases = [
  {
    id: '01',
    tag: 'Diligence',
    name: 'We find out what you actually need.',
    meta: ['2 weeks', '$18k fixed', '1 principal'],
    description: 'A real audit, not a sales call. One principal spends two weeks inside your codebase, model evals, data model, and hiring plan. You get a written report with diagrams, specific risks, and recommendations we would put in front of a board.',
    deliverables: ['Architecture review doc', 'Data + model audit', 'Risk register', 'Hiring recommendations', '1hr live readout', 'Board-ready summary'],
  },
  {
    id: '02',
    tag: 'Plan',
    name: 'A plan an engineer can execute from.',
    meta: ['1 week', 'Fixed fee', '2 engineers'],
    description: 'No slide decks. No discovery workshop. We write the build plan the way we would write it for ourselves: stack choices, model and eval strategy, deployment topology, team shape, and week-by-week milestones tied to demoable outputs.',
    deliverables: ['Technical build plan', 'Week-by-week milestones', 'Named team & ownership', 'Fixed-fee or T&M SOW', 'Kickoff date on calendar', 'Failure-mode register'],
  },
  {
    id: '03',
    tag: 'Build',
    name: 'The team sits next to yours.',
    meta: ['12–26 weeks', '2–4 engineers', 'Weekly demos'],
    description: 'Code in your repo from week one. Your engineers review our PRs. Our engineers review yours. We keep a shared Linear, Shortcut, or Jira and everything moves there. Every Friday the principal sends a one-page written update.',
    deliverables: ['Daily standups', 'Weekly demo to users', 'Friday written update', 'Shared on-call for prod', 'Eval harness shipped', 'Runbooks + SLOs'],
  },
  {
    id: '04',
    tag: 'Handoff',
    name: 'We leave a codebase you can actually inherit.',
    meta: ['2–4 weeks', 'Or stay fractional', '6mo warranty'],
    description: 'We help hire the engineers who take over, or we stay on fractionally. Either way, the principal writes a handoff letter with context, decisions, and where the system will bend first. If it breaks because of something we shipped, we fix it on our clock.',
    deliverables: ['Handoff letter', 'Architecture decision log', 'On-call playbooks', 'Hire-one, hire-two interviews', '6-month warranty', 'Optional retainer'],
  },
];

const principles = [
  { n: '01', title: 'Write the boring parts first.', body: 'Auth, migrations, deploys, and error handling. The AI layer is the last thing we build, not the first.' },
  { n: '02', title: 'Every model ships with an eval.', body: 'If we cannot measure it, we do not deploy it. Every model has a harness your team can run.' },
  { n: '03', title: 'One principal, one project.', body: 'Principals lead a maximum of two engagements at once. If we are in, we are in.' },
  { n: '04', title: 'Written over spoken.', body: 'Weekly Friday update. Monthly review. Handoff letter. Important things go in writing.' },
  { n: '05', title: 'No black-box code.', body: 'Every file has an owner on your side by month two. We do not leave behind mystery systems.' },
  { n: '06', title: 'Say no before the SOW.', body: 'We turn down work when the problem is wrong or we are not the best fit.' },
];

const Approach = () => {
  const [activePhase, setActivePhase] = useState(0);

  useSEO({
    title: 'Approach | That Software House',
    description: 'The exact sequence That Software House uses from first email to shipped code, including diligence, planning, build, and handoff.',
    keywords: 'software diligence process, engineering engagement model, AI build process',
    canonicalUrl: 'https://thatsoftwarehouse.com/approach',
  });

  const phase = phases[activePhase];

  return (
    <div className="approach-page">
      {/* Hero */}
      <section className="approach-hero">
        <div className="approach-inner">
          <div className="approach-hero__grid">
            <div className="approach-hero__left">
              <h1 className="approach-hero__title">
                How the work<br />actually runs.
              </h1>
            </div>
            <div className="approach-hero__right">
              <p className="approach-hero__body">
                <strong>We publish how we work because most agencies do not.</strong> This is the exact sequence from first email to shipped code. If your engagement should look different, we tell you on the call—not after the SOW.
              </p>
              <div className="approach-hero__actions">
                <a href="#phases" className="approach-btn approach-btn--primary">See the phases</a>
                <Link to="/contact" className="approach-btn approach-btn--ghost">Start a conversation</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Phases */}
      <section id="phases" className="approach-phases">
        <div className="approach-inner">
          {/* Tab row */}
          <div className="approach-tabs">
            {phases.map((p, i) => (
              <div key={p.id} className="approach-tab-col">
                <button
                  className={`approach-tab${activePhase === i ? ' is-active' : ''}`}
                  onClick={() => setActivePhase(i)}
                  type="button"
                >
                  <span className="approach-tab__id">{p.id}</span>
                  <span className="approach-tab__tag">{p.tag}</span>
                </button>
                <div className={`approach-tab__bar${i <= activePhase ? ' is-filled' : ''}`} />
              </div>
            ))}
          </div>

          {/* Detail */}
          <div className="approach-detail" key={activePhase}>
            <div className="approach-detail__left">
              <div className="approach-detail__label">Phase {phase.id} — {phase.tag}</div>
              <h2 className="approach-detail__title">{phase.name}</h2>
              <p className="approach-detail__body">{phase.description}</p>
              <div className="approach-detail__chips">
                {phase.meta.map((m) => (
                  <span key={m} className="approach-chip">{m}</span>
                ))}
              </div>
            </div>
            <div className="approach-detail__right">
              <div className="approach-detail__label">Deliverables</div>
              <ul className="approach-deliverables">
                {phase.deliverables.map((d, i) => (
                  <li key={i} className="approach-deliverable">
                    <span className="approach-deliverable__dot" />
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Phase nav */}
          <div className="approach-phases__nav">
            <button
              className="approach-phases__nav-btn"
              onClick={() => setActivePhase((p) => Math.max(0, p - 1))}
              disabled={activePhase === 0}
              type="button"
            >
              ← Previous phase
            </button>
            <span className="approach-phases__nav-count">
              {activePhase + 1} / {phases.length}
            </span>
            <button
              className="approach-phases__nav-btn"
              onClick={() => setActivePhase((p) => Math.min(phases.length - 1, p + 1))}
              disabled={activePhase === phases.length - 1}
              type="button"
            >
              Next phase →
            </button>
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="approach-principles">
        <div className="approach-inner">
          <div className="approach-principles__header">
            <div>
              <div className="approach-section-eyebrow">Principles</div>
              <h2 className="approach-principles__title">
                Six things we act on,<br />not post.
              </h2>
            </div>
            <p className="approach-principles__sub">
              These are not values written on a wall. They are constraints that run the engagement.
            </p>
          </div>
          <div className="approach-principles__grid">
            {principles.map((p, i) => (
              <div key={p.n} className={`approach-principle${i < 3 ? ' has-bottom-border' : ''}${i % 3 < 2 ? ' has-right-border' : ''}`}>
                <div className="approach-principle__num">{p.n}</div>
                <div className="approach-principle__title">{p.title}</div>
                <p className="approach-principle__body">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="approach-cta">
        <div className="approach-inner approach-cta__grid">
          <div>
            <div className="approach-section-eyebrow">2 slots open · Q3</div>
            <h2 className="approach-cta__title">
              If the process sounds<br />right, let's talk.
            </h2>
            <p className="approach-cta__body">
              First call is a working session, not a pitch. We figure out together whether the problem fits the engagement.
            </p>
          </div>
          <div className="approach-cta__action">
            <a
              href="mailto:hello@thatsoftwarehouse.com"
              className="approach-btn approach-btn--primary approach-btn--lg"
            >
              Start a conversation ↗
            </a>
            <p className="approach-cta__note">Usually respond within a few hours.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Approach;
