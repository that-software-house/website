import React from 'react';
import { Link } from 'react-router-dom';
import { useSEO } from '@/hooks/useSEO';
import './EnterpriseAI.css';

const capabilities = [
  {
    number: '01',
    title: 'LLM Integration & Agents',
    description: 'Claude, GPT-4, Gemini, and open-source models wired into production systems—not demos. Agent orchestration, retrieval pipelines, and human-in-the-loop review UIs.',
  },
  {
    number: '02',
    title: 'Enterprise Application Engineering',
    description: 'Full-stack application development for regulated industries. HIPAA-scoped, SOC-2-aware, built with audit trails regulators can actually read.',
  },
  {
    number: '03',
    title: 'Data Pipeline & Infrastructure',
    description: 'Streaming ingestion, vector stores, and eval pipelines that keep models honest as data shifts. Sub-100ms P99 on the paths that matter.',
  },
  {
    number: '04',
    title: 'AI Workflow Automation',
    description: 'Document extraction, classification, and multi-step reasoning pipelines that replace brittle rules engines—and come with the evals to prove it.',
  },
];

const industries = [
  { label: 'Healthcare', note: 'HIPAA · Epic · HL7 FHIR' },
  { label: 'Fintech', note: 'SOC-2 · PCI · real-time fraud' },
  { label: 'Insurtech', note: 'Underwriting · document extraction' },
  { label: 'Legal', note: 'Contract analysis · discovery' },
  { label: 'B2B SaaS', note: 'Copilots · intelligent search' },
  { label: 'Enterprise', note: 'Internal tools · process automation' },
];

const process = [
  {
    number: '01',
    title: 'Technical diligence',
    description: 'A paid two-week audit of your architecture, data, and team. We write a report you could show a board. If we think you should not hire us, we say so in writing.',
    meta: '2 weeks · $18k',
  },
  {
    number: '02',
    title: 'Architecture & plan',
    description: 'Stack, model choices, eval strategy, deployment topology, and team shape on both sides. Not a slide deck — a document an engineer can execute from.',
    meta: '1 week · fixed fee',
  },
  {
    number: '03',
    title: 'Build',
    description: 'Two to four senior engineers embedded with your team. Weekly demos to paying users or a design partner. Code in your repo, owned by you, from week one.',
    meta: '12–26 weeks',
  },
  {
    number: '04',
    title: 'Handoff or stay',
    description: 'We help hire your first two engineers, or we stay on as a fractional platform team. Written runbooks, on-call docs, and a six-month warranty on what we shipped.',
    meta: 'Ongoing',
  },
];

const EnterpriseAI = () => {
  useSEO({
    title: 'Enterprise Apps & AI | That Software House',
    description: 'Production AI systems and enterprise applications for healthcare, fintech, and high-stakes software teams. LLM integration, agent workflows, and data pipelines.',
    keywords: 'enterprise AI development, LLM integration, AI agents, healthcare AI, fintech AI, Austin software studio',
    canonicalUrl: 'https://thatsoftwarehouse.com/enterprise-ai',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Enterprise Apps & AI',
      provider: { '@type': 'Organization', name: 'That Software House' },
      description: 'Production AI systems and enterprise application engineering for regulated industries.',
      areaServed: 'Worldwide',
      serviceType: 'Enterprise Software Development',
    },
  });

  return (
    <div className="studio-page enterprise-ai-page">
      <section className="studio-page-hero studio-section-shell">
        <div className="enterprise-ai-hero__content">
          <div className="eyebrow">
            <span className="eyebrow__bar" />
            <span className="eyebrow__tag">[ 01 / Enterprise AI ]</span>
            <span>Senior engineers only. No juniors on your codebase.</span>
          </div>
          <h1>
            Production AI for teams that cannot afford to <em>get it wrong</em>.
          </h1>
          <p className="enterprise-ai-hero__sub">
            We build LLM-powered applications and enterprise software for healthcare, fintech, and high-stakes domains.
            Every deployment is production-grade: eval pipelines, compliance controls, and code your engineers can own.
          </p>
          <div className="enterprise-ai-hero__actions">
            <Link to="/contact" className="studio-button studio-button--primary">
              Start with a diligence call
              <span className="studio-button__arrow" aria-hidden="true">↗</span>
            </Link>
            <Link to="/work" className="studio-button studio-button--secondary">
              See our work
              <span className="studio-button__arrow" aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>

        <div className="enterprise-ai-hero__stats">
          <div className="enterprise-ai-stat">
            <div>$412M+</div>
            <span>Raised by client founders</span>
          </div>
          <div className="enterprise-ai-stat">
            <div>38</div>
            <span>Products shipped</span>
          </div>
          <div className="enterprise-ai-stat">
            <div>6 yrs</div>
            <span>In production AI</span>
          </div>
        </div>
      </section>

      <section className="enterprise-ai-capabilities studio-section-shell">
        <div className="home-studio__label">02 / Capabilities</div>
        <div className="enterprise-ai-capabilities__grid">
          {capabilities.map((cap) => (
            <div key={cap.number} className="enterprise-ai-cap">
              <div className="enterprise-ai-cap__num">{cap.number}</div>
              <h3>{cap.title}</h3>
              <p>{cap.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="enterprise-ai-industries studio-section-shell">
        <div>
          <div className="home-studio__label">03 / Industries</div>
          <h2>Where we operate</h2>
          <p>
            We go deep in regulated domains where the cost of a wrong output is measured in lives, dollars, or liability.
            If your domain carries real consequence, we are calibrated for it.
          </p>
        </div>
        <div className="enterprise-ai-industries__grid">
          {industries.map((ind) => (
            <div key={ind.label} className="enterprise-ai-industry">
              <strong>{ind.label}</strong>
              <span>{ind.note}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="enterprise-ai-process studio-section-shell">
        <div>
          <div className="home-studio__label">04 / How we work</div>
          <h2>Four phases. No discovery decks.</h2>
        </div>
        <div className="enterprise-ai-process__list">
          {process.map((step) => (
            <div key={step.number} className="enterprise-ai-process__row">
              <div>{step.number}</div>
              <div>{step.title}</div>
              <p>{step.description}</p>
              <span>{step.meta}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="studio-big-cta">
        <div>
          <div className="studio-big-cta__meta">05 / Start a conversation</div>
          <h2 className="studio-big-cta__title">
            Tell us what you&apos;re <em>actually</em> trying to ship.
          </h2>
          <div className="studio-big-cta__meta studio-big-cta__fine">
            Engagements start with a two-week technical diligence at $18k. We reply within 24 hours.
          </div>
        </div>
        <div className="studio-big-cta__actions">
          <Link to="/contact" className="studio-button studio-button--primary">
            Talk to us
            <span className="studio-button__arrow" aria-hidden="true">↗</span>
          </Link>
          <Link to="/work" className="studio-button studio-button--secondary">
            See our work
            <span className="studio-button__arrow" aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>

      <div className="studio-page-meta">
        <div className="studio-page-meta__left">
          <span><span className="studio-page-meta__label">IDX</span> 02 / Enterprise AI</span>
          <span><span className="studio-page-meta__label">REV</span> 2026.04.20</span>
          <span><span className="studio-page-meta__label">LOC</span> Austin, TX · 30.26°N, 97.74°W</span>
        </div>
        <div>Diligence from $18k ↗</div>
      </div>
    </div>
  );
};

export default EnterpriseAI;
