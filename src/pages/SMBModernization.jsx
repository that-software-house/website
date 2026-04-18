import React from 'react';
import { Link } from 'react-router-dom';
import { useSEO } from '@/hooks/useSEO';
import './SMBModernization.css';

const features = [
  {
    title: 'Zero-Plugin Reliability',
    description: 'Stop paying for a site that breaks on auto-updates. We move you to a "Clean Stack" where security is managed and speed is native.',
    icon: '⚡'
  },
  {
    title: 'AI Virtual Receptionist',
    description: 'Capture leads 24/7 with a chat-based assistant that doesn’t just take messages—it answers FAQs and preps your meetings.',
    icon: '🤖'
  },
  {
    title: 'The RAG Vault',
    description: 'We turn your firm’s PDF archives and text documents into a private, searchable AI brain for your team.',
    icon: '📂'
  },
  {
    title: 'Conversion-First SEO',
    description: 'Stop chasing "views." We optimize your site to turn local searches into paying clients.',
    icon: '📈'
  }
];

const caseStudies = [
  {
    client: 'Heritage Dental Clinic',
    industry: 'Healthcare',
    challenge: 'Stuck on a slow WordPress site that required weekly plugin fixes and lost mobile leads.',
    solution: 'Migrated to a high-speed custom stack with an AI intake assistant to handle after-hours bookings.',
    results: [
      { label: 'Load Time', value: '-64%' },
      { label: 'Online Bookings', value: '+42%' }
    ]
  },
  {
    client: 'Miller & Associates CPA',
    industry: 'Professional Services',
    challenge: 'Spent hours manually searching through thousands of old tax advisory PDFs for client prep.',
    solution: 'Implemented a private RAG "Vault" that allows the team to query their own archives in seconds.',
    results: [
      { label: 'Prep Time', value: '-80%' },
      { label: 'Search Speed', value: 'Instant' }
    ]
  }
];

const SMBModernization = () => {
  useSEO({
    title: 'Main Street Modernization | That Software House',
    description: 'Migrate your business from legacy WordPress to high-performance AI-driven infrastructure starting at $749.',
    keywords: 'WordPress migration, SMB software, AI receptionist, business automation, Austin web design',
    canonicalUrl: 'https://thatsoftwarehouse.com/modernization',
  });

  return (
    <div className="studio-page modernization-page">
      <section className="studio-page-hero studio-section-shell">
        <div className="modernization-hero-content">
          <div className="eyebrow">
            <span className="eyebrow__bar" />
            <span className="eyebrow__tag">[ 01 / Modernization ]</span>
            <span>Stop managing plugins. Start managing your business.</span>
          </div>
          <h1>Your business has evolved. Your website is <em>stuck in 2018</em>.</h1>
          <p className="hero-sub">
            We migrate local leaders off fragile WordPress setups and into high-performance, AI-driven infrastructure starting at <strong>$749</strong>.
          </p>
          <div className="hero-actions">
            <Link to="/contact" className="studio-button studio-button--primary">
              Start my migration
              <span className="studio-button__arrow" aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="modernization-features studio-section-shell">
        <div className="section-label">02 / The Benefits</div>
        <div className="features-grid">
          {features.map((feature) => (
            <div key={feature.title} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="modernization-pricing studio-section-shell">
        <div className="section-label">03 / Transparent Pricing</div>
        <div className="pricing-container">
          <div className="pricing-card featured">
            <div className="pricing-header">
              <h2>The Launch</h2>
              <div className="price">Starts at <em>$749</em></div>
            </div>
            <ul className="pricing-list">
              <li>Complete WordPress Migration</li>
              <li>High-Performance Clean Stack</li>
              <li>Basic SEO Setup</li>
              <li>Mobile-First Optimization</li>
              <li>7-14 Day Delivery</li>
            </ul>
            <Link to="/contact" className="studio-button studio-button--primary">Get Started</Link>
          </div>
          <div className="pricing-card">
            <div className="pricing-header">
              <h2>The Engine</h2>
              <div className="price"><em>$89</em> / mo</div>
            </div>
            <ul className="pricing-list">
              <li>Hosting & Technical Support</li>
              <li>Weekly Performance Backups</li>
              <li>Security Monitoring</li>
              <li>Unlimited Technical Updates</li>
              <li>Priority Email Support</li>
            </ul>
            <Link to="/contact" className="studio-button studio-button--secondary">Subscribe</Link>
          </div>
        </div>
      </section>

      <section className="modernization-cases studio-section-shell">
        <div className="section-label">04 / Proven Results</div>
        <div className="cases-grid">
          {caseStudies.map((study) => (
            <div key={study.client} className="case-card">
              <div className="case-header">
                <span>{study.industry}</span>
                <h3>{study.client}</h3>
              </div>
              <div className="case-body">
                <div className="case-split">
                  <div>
                    <h4>The Challenge</h4>
                    <p>{study.challenge}</p>
                  </div>
                  <div>
                    <h4>The Solution</h4>
                    <p>{study.solution}</p>
                  </div>
                </div>
                <div className="case-stats">
                  {study.results.map((res) => (
                    <div key={res.label} className="stat-item">
                      <strong>{res.value}</strong>
                      <span>{res.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="studio-big-cta">
        <div>
          <div className="studio-big-cta__meta">05 / Ready to move?</div>
          <h2 className="studio-big-cta__title">
            Take your business to the <em>AI-era</em> today.
          </h2>
          <div className="studio-big-cta__meta studio-big-cta__fine">
            We handle the entire migration process. You get a faster, safer, and more intelligent website.
          </div>
        </div>
        <div className="studio-big-cta__actions">
          <Link to="/contact" className="studio-button studio-button--primary">
            Start My Migration
            <span className="studio-button__arrow" aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>

      <div className="studio-page-meta">
        <div className="studio-page-meta__left">
          <span><span className="studio-page-meta__label">IDX</span> 01 / Modernization</span>
          <span><span className="studio-page-meta__label">REV</span> 2026.04.17</span>
          <span><span className="studio-page-meta__label">LOC</span> Austin, TX</span>
        </div>
        <div>Starts at $749 ↗</div>
      </div>
    </div>
  );
};

export default SMBModernization;
