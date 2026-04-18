import React from 'react';
import { Link } from 'react-router-dom';
import { useSEO } from '@/hooks/useSEO';
import './Vault.css';

const modules = [
  {
    id: 'leadflow',
    title: 'LeadFlow AI',
    tag: 'Operations Infrastructure',
    tags: ['AI', 'CRM', 'Leads', 'SMB'],
    description: 'Auto-capture leads from email, web forms, and social DMs with zero manual data entry. Built for high-volume service businesses that cannot afford to lose a lead in the "inbox black hole."',
    stats: ['99.4% Extraction Accuracy', 'Real-time Triage', 'CRM Integration'],
    cta: 'View Module'
  },
  {
    id: 'invoicechaser',
    title: 'Invoice Chaser',
    tag: 'Financial Infrastructure',
    tags: ['AI', 'Finance', 'Collections', 'SMB'],
    description: 'A collections copilot that prioritizes overdue accounts by risk and generates technical, firm follow-up drafts. It treats cash flow as a data problem, not a manual chore.',
    stats: ['3.1x Faster Close Speed', 'Risk-Based Prioritization', 'Automated Drafts'],
    cta: 'View Module'
  },
  {
    id: 'docanalyzer',
    title: 'Document RAG Vault',
    tag: 'Knowledge Infrastructure',
    description: 'The foundation of our CPA and Law Firm modernizations. It turns thousands of static PDFs and records into a private, searchable AI brain for your staff.',
    stats: ['1,400+ Docs/sec Indexing', 'HIPAA/SOC2 Ready', 'Semantic Retrieval'],
    cta: 'Explore RAG'
  },
  {
    id: 'videoanalyzer',
    title: 'Video Intelligence',
    tag: 'Content Engineering',
    description: 'Extract technical insights, keyframes, and multi-platform content from raw video. The engine behind our GEO (Generative Engine Optimization) strategy.',
    stats: ['Multi-Model Analysis', 'Automated Social Maps', 'Vector-Based Search'],
    cta: 'View Engine'
  }
];

const Vault = () => {
  useSEO({
    title: 'Technical Vault | That Software House',
    description: 'Explore the technical infrastructure modules built by That Software House for high-stakes business operations.',
    keywords: 'AI infrastructure, lead flow automation, invoice chaser, RAG vault, software engineering Austin',
    canonicalUrl: 'https://https://thatsoftwarehouse.com/vault',
  });

  return (
    <div className="studio-page vault-page">
      <section className="studio-page-hero studio-section-shell">
        <div className="vault-hero">
          <div className="eyebrow">
            <span className="eyebrow__bar" />
            <span className="eyebrow__tag">[ 03 / The Vault ]</span>
            <span>Battle-Tested Infrastructure Modules</span>
          </div>
          <h1>Proprietary <em>Engines</em> for modern business.</h1>
          <p className="hero-sub">
            We don't just build from scratch every time. We've engineered a suite of core modules that we embed and customize for our partners to solve high-stakes operational problems.
          </p>
        </div>
      </section>

      <section className="vault-modules studio-section-shell">
        <div className="modules-grid">
          {modules.map((module) => (
            <div key={module.id} className="module-card">
              <div className="module-header">
                <span className="module-tag">{module.tag}</span>
                <h2>{module.title}</h2>
              </div>
              <p className="module-description">{module.description}</p>
              <div className="module-stats">
                {module.stats.map((stat) => (
                  <div key={stat} className="stat-pill">{stat}</div>
                ))}
              </div>
              <Link to={`/contact`} className="module-cta">
                {module.cta} ↗
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="vault-labs studio-section-shell">
        <div className="labs-cta">
          <div className="labs-content">
            <span className="labs-tag">// The Labs</span>
            <h2>Looking for our free utilities?</h2>
            <p>Our internal engineers build small tools to solve daily friction—from text cleaners to data visualizers. We've moved these to our self-hosted Mac-Mini lab.</p>
          </div>
          <a href="https://labs.thatsoftwarehouse.com" target="_blank" rel="noopener noreferrer" className="studio-button studio-button--secondary">
            Visit TSH Labs ↗
          </a>
        </div>
      </section>

      <div className="studio-page-meta">
        <div className="studio-page-meta__left">
          <span><span className="studio-page-meta__label">IDX</span> 03 / Vault</span>
          <span><span className="studio-page-meta__label">REV</span> 2026.04.17</span>
          <span><span className="studio-page-meta__label">LOC</span> Self-Hosted Lab</span>
        </div>
        <div>Request custom module ↗</div>
      </div>
    </div>
  );
};

export { modules as projects };
export default Vault;
