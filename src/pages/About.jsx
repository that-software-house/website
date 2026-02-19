import React, { useState } from 'react';
import { useSEO } from '@/hooks/useSEO';
import './About.css';
import Clients from '../components/Clients';
import SectionCta from '@/components/SectionCta';

const About = () => {
  useSEO({
    title: 'About Us | That Software House',
    description: 'Meet the team behind That Software House. 7 experts with 25+ years of combined experience shipping 20+ products for startups and enterprises.',
    keywords: 'about that software house, software team Austin, engineering team, product studio',
    canonicalUrl: 'https://thatsoftwarehouse.com/about',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      name: 'About That Software House',
      url: 'https://thatsoftwarehouse.com/about',
      mainEntity: {
        '@type': 'Organization',
        name: 'That Software House',
        numberOfEmployees: { '@type': 'QuantitativeValue', value: 7 },
        foundingLocation: { '@type': 'Place', name: 'Austin, TX' },
      },
    },
  });
  const [expandedCapability, setExpandedCapability] = useState(null);

  const stats = [
    { number: '7', label: 'Team Experts' },
    { number: '> 25 years', label: 'Founding Team Experience' },
    { number: '20+', label: 'Projects Shipped' }
  ];

  const values = [
    {
      title: 'Mastery',
      description: 'We practice our craft every day. Design crits, code reviews, and retros keep the bar rising.'
    },
    {
      title: 'Dependability',
      description: 'We keep our word. Clear scope, honest timelines, and predictable releases you can plan around.'
    },
    {
      title: 'Passion',
      description: 'We like building useful software. Curiosity pushes us forward and pragmatism gets it shipped.'
    },
    {
      title: 'Flexibility',
      description: 'Strong process. Soft edges. We adapt to your goals, stack, and constraints without dropping quality.'
    },
    {
      title: 'Discipline',
      description: 'Security, tests, and documentation come standard. Compliance is built in, not bolted on.'
    },
    {
      title: 'Creativity',
      description: 'We combine design sense with engineering rigor to find simple answers to hard problems.'
    }
  ];

  const capabilities = [
    {
      title: 'Plan & Prototype',
      description: 'Clarify the problem, scope the MVP, and prove value fast.',
      details: [
        'Product strategy, scope, and milestones',
        'UX research, wireframes, and clickable prototype',
        'Technical blueprint: data model, API plan, architecture',
        'Compliance-by-design basics: HIPAA, SOC 2',
        'Budget and timeline you can take to investors'
      ]
    },
    {
      title: 'Build the Product',
      description: 'Ship a secure web or mobile app with the stack you need.',
      details: [
        'Web & mobile: React, Next.js, React Native',
        'Backend: Node, Python, Postgres/Mongo',
        'Integrations: auth, payments, Stripe, Plaid, EHRs',
        'AI features: chatbots and RAG on your data',
        'CI/CD, automated tests, accessibility'
      ]
    },
    {
      title: 'Launch & Grow',
      description: 'Take it live, cut cloud costs, and keep improving.',
      details: [
        'AWS hosting, performance tuning, and SRE runbooks',
        'FinOps review to reduce cloud spend',
        'Analytics dashboards and product metrics',
        'Marketing site, basic SEO, and launch support',
        'Ongoing sprints, support retainers, and security hardening (SSO, BAAs)'
      ]
    }
  ];

  const toggleCapability = (index) => {
    setExpandedCapability(expandedCapability === index ? null : index);
  };

  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-container">
          <h1 className="about-hero-title">About</h1>
          <p className="about-hero-description">
            That Software House (TSH) is a small, senior team that turns messy ideas into dependable software.
            We blend product strategy, UX design, and solid engineering - no buzzwords, just clear milestones and honest builds.
            With 15+ years building enterprise SAAS and consumer tech, security, compliance and scalable software come standard.
          </p>
          <p className="about-hero-description">
            We move quickly and can build prototypes in days, MVPs in weeks and then harden for scale and keep an eye on the cloud bill.
            We plug in like an elastic product squad: map the roadmap, design the flows, build the features, test, launch, learn, improve.
            Fewer decks, more deploys. Outcomes over overhead.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="about-stats">
        <div className="about-container">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card">
                <div className="stat-label">{stat.label}</div>
                <div className="stat-number">{stat.number}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="about-values">
        <div className="about-container">
          <h2 className="section-title">Our values</h2>
          <div className="values-grid">
            {values.map((value, index) => (
              <div key={index} className="value-card">
                <h3 className="value-title">{value.title}</h3>
                <p className="value-description">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section className="about-capabilities">
        <div className="about-container">
          <h2 className="section-title">Capabilities</h2>
          <div className="capabilities-list">
            {capabilities.map((capability, index) => (
              <div key={index} className="capability-item">
                <button
                  className="capability-header"
                  onClick={() => toggleCapability(index)}
                >
                  <span className="capability-title">{capability.title}</span>
                  <span className="capability-icon">
                    {expandedCapability === index ? '−' : '+'}
                  </span>
                </button>
                {expandedCapability === index && (
                  <div className="capability-content">
                    <p className="capability-description">{capability.description}</p>
                    {capability.details && (
                      <ul className="capability-details">
                        {capability.details.map((detail, idx) => (
                          <li key={idx}>{detail}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Section */}
      <section className="about-leadership">
        <div className="about-container">
          <h2 className="section-title">Leadership</h2>
          <div className="leadership-grid">
            <div className="leader-card">
              <div className="leader-avatar">
                <span>SS</span>
              </div>
              <h3 className="leader-name">Snehal Shah</h3>
              <p className="leader-title">CTO, Co-Founder</p>
              <a
                href="https://www.linkedin.com/in/snehalrshah/"
                target="_blank"
                rel="noopener noreferrer"
                className="leader-linkedin"
                aria-label="View Snehal Shah's LinkedIn profile"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                </svg>
              </a>
            </div>
            <div className="leader-card">
              <div className="leader-avatar">
                <span>AS</span>
              </div>
              <h3 className="leader-name">Afshin Saniesales</h3>
              <p className="leader-title">Advisor, Co-Founder</p>
              <a
                href="https://www.linkedin.com/in/saniesales/"
                target="_blank"
                rel="noopener noreferrer"
                className="leader-linkedin"
                aria-label="View Afshin Saniesales's LinkedIn profile"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      <SectionCta
        eyebrow="Let’s collaborate"
        title="Ready to start your next chapter?"
        description="Tell us about your goals and we’ll share a clear plan, budget, and the team that can ship it."
        buttonLabel="Talk to us"
        buttonHref="/contact"
      />
    </div>
  );
};

export default About;
