import React from 'react';
import { useSEO } from '@/hooks/useSEO';
import './Approach.css';

const phases = [
  {
    number: '01',
    label: 'Diligence',
    title: 'We find out what you actually need.',
    meta: ['2 weeks', '$18k fixed', '1 principal'],
    body: 'A real audit, not a sales call. One principal spends two weeks inside your codebase, model evals, data model, and hiring plan. You get a written report with diagrams, specific risks, and recommendations we would put in front of a board.',
    deliverables: ['Architecture review doc', 'Data + model audit', 'Risk register', 'Hiring recommendations', '1hr live readout', 'Board-ready summary'],
  },
  {
    number: '02',
    label: 'Plan',
    title: 'A plan an engineer can execute from.',
    meta: ['1 week', 'Fixed fee', '2 engineers'],
    body: 'No slide decks. No discovery workshop. We write the build plan the way we would write it for ourselves: stack choices, model and eval strategy, deployment topology, team shape, and week-by-week milestones tied to demoable outputs.',
    deliverables: ['Technical build plan', 'Week-by-week milestones', 'Named team & ownership', 'Fixed-fee or T&M SOW', 'Kickoff date on calendar', 'Failure-mode register'],
  },
  {
    number: '03',
    label: 'Build',
    title: 'The team sits next to yours.',
    meta: ['12 — 26 weeks', '2 — 4 engineers', 'Weekly demos'],
    body: 'Code in your repo from week one. Your engineers review our PRs. Our engineers review yours. We keep a shared Linear, Shortcut, or Jira and everything moves there. Every Friday the principal sends a one-page written update.',
    deliverables: ['Daily standups', 'Weekly demo to users', 'Friday written update', 'Shared on-call for prod', 'Eval harness shipped', 'Runbooks + SLOs'],
  },
  {
    number: '04',
    label: 'Handoff',
    title: 'We leave a codebase you can actually inherit.',
    meta: ['2 — 4 weeks', 'Or stay fractional', '6mo warranty'],
    body: 'We help hire the engineers who take over, or we stay on fractionally. Either way, the principal writes a handoff letter with context, decisions, and where the system will bend first. If it breaks because of something we shipped, we fix it on our clock.',
    deliverables: ['Handoff letter', 'Architecture decision log', 'On-call playbooks', 'Hire-one, hire-two interviews', '6-month warranty', 'Optional retainer'],
  },
];

const principles = [
  ['01', 'Write the boring parts first.', 'Auth, migrations, deploys, and error handling. The AI layer is the last thing we build, not the first.'],
  ['02', 'Every model ships with an eval.', 'If we cannot measure it, we do not deploy it. Every model has a harness your team can run.'],
  ['03', 'One principal, one project.', 'Principals lead a maximum of two engagements at once. If we are in, we are in.'],
  ['04', 'Written over spoken.', 'Weekly Friday update. Monthly review. Handoff letter. Important things go in writing.'],
  ['05', 'No black-box code.', 'Every file has an owner on your side by month two. We do not leave behind mystery systems.'],
  ['06', 'Say no before the SOW.', 'We turn down work when the problem is wrong or we are not the best fit.'],
];

const Approach = () => {
  useSEO({
    title: 'Approach | That Software House',
    description: 'The exact sequence That Software House uses from first email to shipped code, including diligence, planning, build, and handoff.',
    keywords: 'software diligence process, engineering engagement model, AI build process',
    canonicalUrl: 'https://thatsoftwarehouse.com/approach',
  });

  return (
    <div className="studio-page approach-page">
      <section className="studio-page-hero studio-section-shell">
        <div>
          <div className="eyebrow">
            <span className="eyebrow__bar" />
            <span className="eyebrow__tag">[ 03 / Approach ]</span>
            <span>Four phases · no discovery decks</span>
          </div>
          <h1>How the work actually runs.</h1>
        </div>
        <div className="studio-page-hero__copy">
          <strong>We publish how we work because most agencies do not.</strong> This is the exact sequence from first email to shipped code. If your engagement should look different, we tell you on the call, not after the SOW.
        </div>
      </section>

      <section className="approach-phases studio-section-shell">
        {phases.map((phase) => (
          <article key={phase.number} className="approach-phase">
            <div className="approach-phase__number">
              {phase.number}
              <em>{phase.label}</em>
            </div>
            <div>
              <h2>{phase.title}</h2>
              <div className="approach-phase__meta">
                {phase.meta.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </div>
            <div className="approach-phase__body">
              <p>{phase.body}</p>
              <div className="approach-phase__deliverables">
                {phase.deliverables.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="approach-principles studio-section-shell">
        <div>
          <div className="eyebrow">
            <span className="eyebrow__bar" />
            <span className="eyebrow__tag">[ Principles ]</span>
          </div>
          <h2>Six things we act on, not post.</h2>
        </div>
        <div className="approach-principles__grid">
          {principles.map(([number, title, body]) => (
            <div key={number} className="approach-principles__item">
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="studio-page-meta">
        <div className="studio-page-meta__left">
          <span><span className="studio-page-meta__label">IDX</span> 03 / Approach</span>
          <span><span className="studio-page-meta__label">REV</span> 2026.04.17</span>
          <span><span className="studio-page-meta__label">WARR</span> 6mo on shipped code</span>
        </div>
        <div>Next: Team ↗</div>
      </div>
    </div>
  );
};

export default Approach;
