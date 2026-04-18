import React from 'react';
import { Link } from 'react-router-dom';
import { useSEO } from '@/hooks/useSEO';
import './Home.css';

const cases = [
  {
    number: '01',
    label: 'Healthcare',
    title: 'Clinical LLM copilot for a 180-clinic network',
    description: 'Ambient scribing, HIPAA-scoped retrieval, and a judge model that flags hallucinations before notes hit the EHR. Pilot to production in 11 weeks with Epic integration.',
    stats: [
      { value: '41%', label: 'Reduction in charting time' },
      { value: '11wk', label: 'Pilot → prod' },
    ],
  },
  {
    number: '02',
    label: 'Fintech',
    title: 'Real-time fraud risk engine at 9,200 TPS',
    description: 'Replaced a legacy rules engine with a hybrid gradient-boosted plus LLM reasoning layer. Sub-80ms P99 on payment auth, with audit trails regulators can read.',
    stats: [
      { value: '78ms', label: 'P99 latency' },
      { value: '2.3x', label: 'Fraud catch rate' },
    ],
  },
  {
    number: '03',
    label: 'Insurtech',
    title: 'Underwriting agent platform, zero to launch',
    description: 'Agent orchestration, document extraction, and a human-in-the-loop review UI built alongside the founding team. Closed a $14M Series A off the production deployment.',
    stats: [
      { value: '$14M', label: 'Series A raised' },
      { value: '6mo', label: '0 → 1 to launch' },
    ],
  },
];

const approach = [
  {
    number: '01',
    title: 'Technical diligence',
    description: 'A paid, two-week audit of your architecture, data, and team. You get a written report we would show a board. If we think you should not hire us, we say so in writing.',
    meta: '2 weeks · $18k',
  },
  {
    number: '02',
    title: 'Architecture & plan',
    description: 'A specific build plan: stack, model choices, eval strategy, deployment topology, and the team shape on both sides. Not a slide deck. A document an engineer can execute from.',
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
    description: 'We help hire your first two engineers, or we stay on as a fractional platform team. Either way: written runbooks, on-call docs, and a six-month warranty on what we shipped.',
    meta: 'Ongoing',
  },
];

const Home = () => {
  useSEO({
    title: 'That Software House | Production AI for Founders',
    description: 'That Software House builds production AI systems for healthcare, fintech, and high-stakes software teams that cannot afford to get it wrong.',
    keywords: 'production AI studio, healthcare AI engineering, fintech software team, technical diligence, Austin software studio',
    canonicalUrl: 'https://thatsoftwarehouse.com/',
    openGraph: {
      title: 'That Software House | Production AI for Founders',
      description: 'Senior engineers building production AI for healthcare, fintech, and high-stakes software teams.',
      image: 'https://thatsoftwarehouse.com/og-image.png',
      url: 'https://thatsoftwarehouse.com/',
    },
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'That Software House',
      url: 'https://thatsoftwarehouse.com',
      logo: 'https://thatsoftwarehouse.com/favicon.svg',
      description: 'Senior engineering studio building production AI systems for healthcare and fintech teams.',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Austin',
        addressRegion: 'TX',
        addressCountry: 'US',
      },
      contactPoint: {
        '@type': 'ContactPoint',
        email: 'contact@thatsoftwarehouse.com',
        contactType: 'sales',
      },
    },
  });

  return (
    <div className="home-page">
      <section className="home-hero studio-section-shell">
        <div className="home-hero__left">
          <div className="eyebrow">
            <span className="eyebrow__bar" />
            <span className="eyebrow__tag">[ 01 ]</span>
            <span>AI-first engineering studio · Austin × SF</span>
          </div>

          <h1 className="home-hero__title">
            We build <em>production AI</em> for founders who <span>cannot afford</span> to get it wrong.
          </h1>

          <p className="home-hero__copy">
            <strong>Senior engineers only. No juniors on your codebase.</strong> <span>/</span> Healthcare and fintech since 2020. Average tenure on the team is 9.4 years. The person you meet on the first call is the person who writes your code.
          </p>

          <div className="home-hero__actions">
            <Link to="/work" className="studio-button studio-button--primary">
              See our work
              <span className="studio-button__arrow" aria-hidden="true">↗</span>
            </Link>
            <Link to="/contact" className="studio-button studio-button--secondary">
              Talk to us
              <span className="studio-button__arrow" aria-hidden="true">↗</span>
            </Link>
          </div>

          <div className="home-proof">
            <div className="home-proof__label">Founders we&apos;ve built with</div>
            <div className="home-proof__logos">
              <span>Vox Health</span>
              <span className="home-proof__logos--sans">CodeMinder</span>
              <span className="home-proof__logos--mono">orbital/</span>
              <span>Ledgerwise</span>
              <span className="home-proof__logos--sans">Parallel.fi</span>
            </div>
          </div>
        </div>

        <aside className="home-console">
          <div className="home-console__header">
            <div className="home-console__signal">
              <span>// signal</span>
              <span>studio status</span>
            </div>
            <div>Q3 2026</div>
          </div>

          <div className="studio-card studio-card--featured">
            <div className="home-console__card-top">
              <span>Next intake window</span>
              <span className="studio-pill studio-pill--live">
                <span className="studio-pill__dot" />
                Accepting
              </span>
            </div>
            <div className="home-console__availability">
              <div className="home-console__availability-big">
                Q3 <em>2026</em>
              </div>
              <div className="home-console__availability-meta">
                <div><span>Engagements</span> 2 / 4</div>
                <div><span>Min. commit</span> 12 weeks</div>
              </div>
            </div>
            <div className="home-console__slots">
              <div className="home-console__slot">
                <span>Apr 22 · Thu</span>
                <span>Intro call <small>— Marek, principal</small></span>
                <strong>Open</strong>
              </div>
              <div className="home-console__slot">
                <span>Apr 24 · Sat</span>
                <span>Technical review <small>— Sana, CTO-in-res.</small></span>
                <strong>Open</strong>
              </div>
              <div className="home-console__slot">
                <span>Apr 29 · Thu</span>
                <span>Architecture deep-dive <small>— Rhea</small></span>
                <em>Held</em>
              </div>
            </div>
          </div>

          <div className="studio-card">
            <div className="home-console__card-top">
              <span>Currently in the shop</span>
              <span className="studio-pill">02 active</span>
            </div>
            <div className="home-console__engagement">
              <div>
                <div className="home-console__project">HealthCare Platform</div>
                <div className="home-console__sub"><span>healthcare</span><span>series A</span>Remote · HIPAA-scoped</div>
                <div className="home-console__signal-log">
                  [Apr 17] HIPAA-scoped RAG eval: 98.2% accuracy on clinical docs.
                </div>
              </div>
              <div className="home-console__progress"><i style={{ '--value': '20%' }} /><span>20%</span></div>
            </div>
            <div className="home-console__engagement">
              <div>
                <div className="home-console__project">Accounting client intake AI</div>
                <div className="home-console__sub"><span>accounting</span><span>SMB</span>Local · RAG-driven</div>
                <div className="home-console__signal-log">
                  [Apr 16] Intake flow optimized: Client data prep reduced to &lt;2s.
                </div>
              </div>
              <div className="home-console__progress"><i style={{ '--value': '35%' }} /><span>35%</span></div>
            </div>
          </div>

          <div className="home-console__stats">
            <div>
              <div>$412M+</div>
              <span>Raised by client founders</span>
            </div>
            <div>
              <div>38</div>
              <span>Products shipped</span>
            </div>
            <div>
              <div>GEO-Ready</div>
              <span>LLM Brand Optimization</span>
            </div>
          </div>
        </aside>
      </section>

      <section className="home-studio studio-section-shell">
        <div className="home-studio__label">02 / The studio</div>
        <div>
          <h2>
            A small shop that writes code the way lawyers write contracts, <em>carefully, and on the hook</em> for every line.
          </h2>
          <p>
            14 engineers. Six years. Every project led by someone with a decade of production experience in the domain you are shipping into. We do not staff a team of juniors learning on your MVP, and we do not broker out the work. The engineers in the kickoff call are the engineers in the merge requests.
          </p>
        </div>
      </section>

      <section className="home-cases studio-section-shell">
        {cases.map((item) => (
          <Link key={item.number} to="/work" className="home-case">
            <div className="home-case__top">
              <span>Case / {item.number}</span>
              <span>{item.label}</span>
            </div>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <div className="home-case__stats">
              {item.stats.map((stat) => (
                <div key={stat.label}>
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>
          </Link>
        ))}
      </section>

      <section className="home-approach studio-section-shell">
        <div>
          <div className="home-studio__label">03 / How we work</div>
          <h2>Four phases. No discovery decks.</h2>
        </div>
        <div className="home-approach__list">
          {approach.map((item) => (
            <div key={item.number} className="home-approach__row">
              <div>{item.number}</div>
              <div>{item.title}</div>
              <p>{item.description}</p>
              <span>{item.meta}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="home-quote studio-section-shell">
        <div className="home-quote__label">04 / Word from</div>
        <div>
          <blockquote>
            The TSH team shipped our first production model in seven weeks. Our in-house attempt took ten months and never left staging.
          </blockquote>
          <cite>— Vahid Kowsari · CEO, Vox Health (Series A, NYC)</cite>
        </div>
        <div className="home-quote__meta">
          <div><span>Engagement</span><strong>22wk embed</strong></div>
          <div><span>Stack</span><strong>Py · vLLM · Postgres</strong></div>
          <div><span>Compliance</span><strong>HIPAA · BAA</strong></div>
          <div><span>Outcome</span><strong>Closed Series A, Q1 ’26</strong></div>
        </div>
      </section>

      <section className="studio-big-cta">
        <div>
          <div className="studio-big-cta__meta">05 / Start a conversation</div>
          <h2 className="studio-big-cta__title">
            Tell us what you&apos;re <em>actually</em> trying to ship.
          </h2>
          <div className="studio-big-cta__meta studio-big-cta__fine">
            We reply within 24 hours, or we tell you why we cannot take the work. Either way, you get a real engineer on the email.
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
          <span><span className="studio-page-meta__label">IDX</span> 00 / Home</span>
          <span><span className="studio-page-meta__label">REV</span> 2026.04.17</span>
          <span><span className="studio-page-meta__label">LOC</span> Austin, TX · 30.26°N, 97.74°W</span>
        </div>
        <div>Reply within 24h ↗</div>
      </div>
    </div>
  );
};

export default Home;
