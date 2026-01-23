import React from 'react';
import { Link } from 'react-router-dom';
import { Search, TrendingUp, FileText, Link2, BarChart3, CheckCircle2, ArrowRight } from 'lucide-react';
import './SeoPage.css';

const SeoPage = () => {
  const services = [
    {
      icon: Search,
      title: 'Technical SEO',
      description: 'Site audits, speed optimization, mobile responsiveness, and structured data implementation.',
    },
    {
      icon: FileText,
      title: 'Content Strategy',
      description: 'Keyword research, content planning, and SEO-optimized copywriting that ranks and converts.',
    },
    {
      icon: Link2,
      title: 'Link Building',
      description: 'Quality backlink acquisition through outreach, guest posting, and digital PR campaigns.',
    },
    {
      icon: BarChart3,
      title: 'Analytics & Reporting',
      description: 'Monthly performance reports, ranking tracking, and actionable insights for growth.',
    },
  ];

  const plans = [
    {
      name: 'Essentials',
      price: '$1,000',
      period: '/month',
      description: 'For businesses starting their SEO journey',
      features: [
        'Technical SEO audit & fixes',
        'On-page optimization (10 pages)',
        'Monthly keyword tracking',
        'Basic analytics reporting',
        'Email support',
      ],
      cta: 'Get Started',
      popular: false,
    },
    {
      name: 'Growth',
      price: '$2,500',
      period: '/month',
      description: 'For businesses ready to scale',
      features: [
        'Everything in Essentials',
        'Content strategy & 4 blog posts',
        'Link building (5 links/month)',
        'Competitor analysis',
        'Bi-weekly strategy calls',
        'Priority support',
      ],
      cta: 'Get Started',
      popular: true,
    },
    {
      name: 'Authority',
      price: '$5,000',
      period: '/month',
      description: 'For businesses dominating their market',
      features: [
        'Everything in Growth',
        '8 blog posts + landing pages',
        'Premium link building (15 links)',
        'Local SEO optimization',
        'Weekly strategy calls',
        'Dedicated account manager',
      ],
      cta: 'Get Started',
      popular: false,
    },
  ];

  const results = [
    { metric: '340%', label: 'Average traffic increase' },
    { metric: '2.5x', label: 'Lead generation boost' },
    { metric: '60+', label: 'Keywords on page 1' },
    { metric: '3 mo', label: 'Minimum commitment' },
  ];

  return (
    <div className="seo-page">
      {/* Hero Section */}
      <section className="seo-hero">
        <video
          className="seo-hero-video"
          autoPlay
          muted
          loop
          playsInline
          poster="/video/seo-growth.mp4"
        >
          <source src="/video/seo-growth.mp4" type="video/mp4" />
        </video>
        <div className="seo-hero-overlay" />
        <div className="container">
          <div className="seo-hero-content">
            <div className="seo-hero-badge">
              <TrendingUp size={16} />
              <span>SEO & Growth Services</span>
            </div>
            <h1>Rank higher. Get found. Grow faster.</h1>
            <p>
              We help businesses dominate search results with data-driven SEO strategies
              that drive organic traffic and convert visitors into customers.
            </p>
            <div className="seo-hero-cta">
              <Link to="/contact" className="seo-btn-primary">
                Get a Free Audit
                <ArrowRight size={18} />
              </Link>
              <a href="#pricing" className="seo-btn-secondary">View Pricing</a>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="seo-results">
        <div className="container">
          <div className="seo-results-grid">
            {results.map((item, index) => (
              <div key={index} className="seo-result-card">
                <span className="seo-result-metric">{item.metric}</span>
                <span className="seo-result-label">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="seo-services">
        <div className="container">
          <div className="seo-section-header">
            <h2>What we do</h2>
            <p>Comprehensive SEO services to boost your online visibility</p>
          </div>
          <div className="seo-services-grid">
            {services.map((service, index) => (
              <div key={index} className="seo-service-card">
                <div className="seo-service-icon">
                  <service.icon size={24} />
                </div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="seo-pricing">
        <div className="container">
          <div className="seo-section-header">
            <h2>Simple, transparent pricing</h2>
            <p>Choose the plan that fits your growth goals. 3-month minimum commitment.</p>
          </div>
          <div className="seo-pricing-grid">
            {plans.map((plan, index) => (
              <div key={index} className={`seo-pricing-card ${plan.popular ? 'popular' : ''}`}>
                {plan.popular && <span className="popular-badge">Most Popular</span>}
                <h3>{plan.name}</h3>
                <div className="seo-price">
                  <span className="price-amount">{plan.price}</span>
                  <span className="price-period">{plan.period}</span>
                </div>
                <p className="seo-plan-description">{plan.description}</p>
                <ul className="seo-features">
                  {plan.features.map((feature, i) => (
                    <li key={i}>
                      <CheckCircle2 size={16} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/contact" className="seo-plan-cta">
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="seo-process">
        <div className="container">
          <div className="seo-section-header">
            <h2>Our process</h2>
            <p>A proven methodology for sustainable SEO growth</p>
          </div>
          <div className="seo-process-steps">
            <div className="seo-process-step">
              <span className="step-number">01</span>
              <h3>Audit & Analysis</h3>
              <p>Deep dive into your current SEO health, competitors, and opportunities.</p>
            </div>
            <div className="seo-process-step">
              <span className="step-number">02</span>
              <h3>Strategy & Roadmap</h3>
              <p>Custom 90-day plan with clear milestones and KPIs.</p>
            </div>
            <div className="seo-process-step">
              <span className="step-number">03</span>
              <h3>Execute & Optimize</h3>
              <p>Implementation with continuous testing and refinement.</p>
            </div>
            <div className="seo-process-step">
              <span className="step-number">04</span>
              <h3>Report & Scale</h3>
              <p>Transparent reporting and scaling what works.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SeoPage;
