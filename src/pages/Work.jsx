import React from 'react';
import { useSEO } from '@/hooks/useSEO';
import './Work.css';

const projects = [
  ['01', 'Vox Health clinical copilot', 'HIPAA · 180 clinics · ambient scribing', '22wk embed', '41% less charting time', 'Series A · 2025'],
  ['02', 'Parallel.fi risk engine', 'fintech · payments · 9,200 TPS', '14wk + ongoing', '78ms P99 auth', 'Series B · 2024'],
  ['03', 'Orbital underwriting agent', 'insurtech · doc extraction · HITL', '26wk · 0→1', '$14M Series A', 'Series A · 2025'],
  ['04', 'Ledgerwise reconciliation', 'fintech · accounting automation', '18wk embed', '3.1x close speed', 'Seed · 2024'],
  ['05', 'CodeMinder MVP build', 'devtools · static analysis + LLM', '11wk · 0→1', '$3.2M pre-seed', 'Pre-seed · 2025'],
  ['06', 'Atlas Radiology triage model', 'healthcare · FDA Class II path', '36wk active', '0.94 AUROC, 9 sites', 'Series A · ongoing'],
];

const clients = ['Vox Health', 'CodeMinder', 'orbital/', 'Ledgerwise', 'Parallel.fi', 'Harbor', 'mesa.insure', 'Keystone', 'Northwind', 'finch.run', 'Aperture', 'Atlas Rad'];

const Work = () => {
  useSEO({
    title: 'Work | That Software House',
    description: 'Selected healthcare, fintech, and AI product engagements from That Software House.',
    keywords: 'software studio case studies, healthcare AI work, fintech engineering portfolio',
    canonicalUrl: 'https://thatsoftwarehouse.com/work',
  });

  return (
    <div className="studio-page work-page">
      <section className="studio-page-hero studio-section-shell">
        <div>
          <div className="eyebrow">
            <span className="eyebrow__bar" />
            <span className="eyebrow__tag">[ 01 / Work ]</span>
            <span>Selected engagements · 2020 — present</span>
          </div>
          <h1>38 products. Six years. Zero ghost-written case studies.</h1>
        </div>
        <div className="studio-page-hero__copy">
          <strong>Every engagement on this page is a real deployment you can reference.</strong> If a client is not here, it is because they are pre-launch or under NDA. Ask on a call and we will connect you to the founder directly when we can.
        </div>
      </section>

      <div className="work-index studio-section-shell">
        <span>Showing 6 of 38</span>
        <div className="work-index__filters">
          <span>All</span>
          <span>Healthcare</span>
          <span>Fintech</span>
          <span>Insurtech</span>
          <span>Infra / AI</span>
        </div>
        <span>Sort: most recent</span>
      </div>

      <section className="work-projects studio-section-shell">
        {projects.map(([number, name, sub, engagement, result, stage]) => (
          <article key={number} className="work-project">
            <div className="work-project__index">/ {number}</div>
            <div className="work-project__name">
              {name}
              <span>{sub}</span>
            </div>
            <div className="work-project__cell">
              <span>Engagement</span>
              <strong>{engagement}</strong>
            </div>
            <div className="work-project__cell">
              <span>Result</span>
              <strong>{result}</strong>
            </div>
            <div className="work-project__cell">
              <span>Stage</span>
              <strong>{stage}</strong>
            </div>
            <div className="work-project__arrow">↗</div>
          </article>
        ))}
      </section>

      <section className="work-featured studio-section-shell">
        <div>
          <div className="work-featured__label">Featured · Case / 01</div>
          <h2>Vox Health, from a founder&apos;s laptop to 180 clinics.</h2>
          <p>
            Vahid came to us with a working prototype, an $8M seed, and a six-week deadline to show something to Kaiser&apos;s innovation group. <strong>We shipped a HIPAA-scoped ambient scribe with an independent judge model for hallucination detection</strong>, integrated with Epic via FHIR, running on-prem at the customer&apos;s data center. Charting time dropped 41% in the pilot. The Kaiser meeting became a Kaiser contract. The contract became a Series A.
          </p>
          <div className="work-featured__stats">
            <div><strong>41%</strong><span>Reduction in charting time</span></div>
            <div><strong>11wk</strong><span>Pilot to production</span></div>
            <div><strong>180</strong><span>Clinics live at 18mo</span></div>
            <div><strong>$22M</strong><span>Series A raised post-launch</span></div>
          </div>
        </div>
        <div className="work-placeholder">
          <div>// Studio Review</div>
          <div>Clinical Dashboard: Multi-site EHR Integration with Ambient Scribe Model</div>
          <div>Deployed Q1 2026</div>
        </div>
      </section>

      <section className="work-clients studio-section-shell">
        <div className="work-clients__label">Selected clients</div>
        <div className="work-clients__grid">
          {clients.map((client) => (
            <span key={client}>{client}</span>
          ))}
        </div>
      </section>

      <div className="studio-page-meta">
        <div className="studio-page-meta__left">
          <span><span className="studio-page-meta__label">IDX</span> 01 / Work</span>
          <span><span className="studio-page-meta__label">REV</span> 2026.04.17</span>
          <span><span className="studio-page-meta__label">CNT</span> 38 engagements · 6 shown</span>
        </div>
        <div>Ask about NDAs ↗</div>
      </div>
    </div>
  );
};

export default Work;
