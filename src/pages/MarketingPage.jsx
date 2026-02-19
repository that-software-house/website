import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { useSEO } from '@/hooks/useSEO';
import './MarketingPage.css';

const MarketingPage = () => {
  useSEO({
    title: 'Marketing for Tech Products | That Software House',
    description: 'Marketing for products that are hard to explain. Strategy, positioning, content, and growth for SaaS, AI, and technical products.',
    keywords: 'tech marketing, SaaS marketing, product marketing, GTM strategy, content marketing, Austin TX',
    canonicalUrl: 'https://thatsoftwarehouse.com/marketing',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Tech Product Marketing',
      provider: { '@type': 'Organization', name: 'That Software House' },
      description: 'Strategy, positioning, content, and growth marketing for technical products.',
      areaServed: 'Worldwide',
      serviceType: 'Product Marketing',
    },
  });
  const serviceGroups = [
    {
      title: 'Strategy & Positioning',
      summary: 'Align product, market, and narrative for technical buyers.',
      items: [
        'ICP definition & segmentation',
        'Messaging architecture',
        'Pricing & packaging support',
        'Launch planning & GTM roadmaps',
      ],
    },
    {
      title: 'Content & Storytelling',
      summary: 'Turn complex products into clear, compelling stories.',
      items: [
        'Product messaging & website copy',
        'Case studies & customer proof',
        'Thought leadership content',
        'Launch kits & sales enablement',
      ],
    },
    {
      title: 'Performance & Demand Gen',
      summary: 'Pipeline-first campaigns built for measurable growth.',
      items: [
        'Paid search & paid social',
        'Account-based marketing programs',
        'Landing pages & conversion testing',
        'Partner and ecosystem plays',
      ],
    },
    {
      title: 'Lifecycle & Retention',
      summary: 'Keep users engaged from onboarding through expansion.',
      items: [
        'Lifecycle email journeys',
        'Product-led growth experiments',
        'In-app adoption campaigns',
        'Expansion & upsell motions',
      ],
    },
    {
      title: 'Marketing Ops & Analytics',
      summary: 'Infrastructure to measure, learn, and scale.',
      items: [
        'Attribution & funnel reporting',
        'CRM + marketing automation',
        'Dashboard design & KPIs',
        'Experiment design & insights',
      ],
    },
  ];

  const channels = [
    'Search',
    'Paid Social',
    'Shopping',
    'Feed Management',
    'Amazon',
    'Programmatic',
    'Ad Creative',
    'Video',
    'Affiliate',
    'Mobile',
  ];

  const segments = [
    {
      title: 'B2B',
      description: 'Pipeline programs that support technical sales teams and long buying cycles.',
    },
    {
      title: 'Retail Brands',
      description: 'Full-funnel strategies that grow brand demand and market share.',
    },
    {
      title: 'Ecommerce',
      description: 'Performance marketing systems that improve ROAS and retention.',
    },
    {
      title: 'User Acquisition',
      description: 'Growth loops for consumer apps and marketplaces that scale quickly.',
    },
    {
      title: 'Startups',
      description: 'Lean marketing for seed through Series C with clear milestones.',
    },
  ];

  const engagements = [
    {
      title: 'Launch Sprint',
      description: 'A focused 4-6 week engagement to ship your GTM foundation.',
      items: [
        'Messaging + positioning system',
        'Landing pages and launch assets',
        'Campaign plan with channels',
        'Baseline analytics dashboard',
      ],
    },
    {
      title: 'Growth Retainer',
      description: 'Ongoing execution to create steady demand and product adoption.',
      items: [
        'Monthly campaign launches',
        'Content + creative production',
        'Conversion rate optimization',
        'Weekly performance reviews',
      ],
    },
    {
      title: 'Scale Partnership',
      description: 'A cross-functional marketing pod to expand globally or vertically.',
      items: [
        'Full-funnel lifecycle programs',
        'Multi-channel budget management',
        'Experimentation roadmap',
        'Dedicated growth lead',
      ],
    },
  ];

  const steps = [
    {
      title: 'Diagnose',
      description: 'Audit your market, funnel, and positioning to find the growth constraints.',
    },
    {
      title: 'Design',
      description: 'Build a clear narrative, campaign plan, and measurement framework.',
    },
    {
      title: 'Deploy',
      description: 'Launch campaigns, content, and lifecycle journeys across core channels.',
    },
    {
      title: 'Optimize',
      description: 'Iterate on performance data to compound results over time.',
    },
  ];

  return (
    <div className="marketing-page">
      <section className="marketing-hero">
        <div className="container marketing-hero-grid">
          <div className="marketing-hero-copy reveal" style={{ '--delay': '0.05s' }}>
            <span className="marketing-badge">
              <Sparkles size={14} />
              Technology Marketing Studio
            </span>
            <h1>Marketing for products that are hard to explain.</h1>
            <p>
              We help technical teams turn sophisticated products into clear stories, demand engines,
              and measurable revenue growth.
            </p>
            <div className="marketing-hero-actions">
              <Link to="/contact" className="marketing-btn-primary">
                Book a marketing audit
                <ArrowRight size={18} />
              </Link>
              <a href="#capabilities" className="marketing-btn-secondary">
                Explore capabilities
              </a>
            </div>
            <div className="marketing-hero-tags">
              <span>Positioning</span>
              <span>Performance</span>
              <span>Lifecycle</span>
              <span>Ops + Analytics</span>
            </div>
          </div>
          <div className="marketing-hero-card reveal" style={{ '--delay': '0.15s' }}>
            <div className="marketing-hero-card-header">
              <span>Services list</span>
              <div className="marketing-hero-card-line" />
            </div>
            <div className="marketing-hero-card-body">
              {serviceGroups.map((group) => (
                <div key={group.title} className="marketing-hero-service">
                  <h3>{group.title}</h3>
                  <ul>
                    {group.items.slice(0, 3).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="capabilities" className="marketing-services">
        <div className="container">
          <div className="marketing-section-header reveal" style={{ '--delay': '0.05s' }}>
            <h2>Core capabilities</h2>
            <p>End-to-end marketing support tailored for technology companies.</p>
          </div>
          <div className="marketing-services-grid">
            {serviceGroups.map((service, index) => (
              <div key={service.title} className="marketing-service-card reveal" style={{ '--delay': `${0.1 + index * 0.05}s` }}>
                <h3>{service.title}</h3>
                <p>{service.summary}</p>
                <ul>
                  {service.items.map((item) => (
                    <li key={item}>
                      <CheckCircle2 size={16} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="marketing-channels">
        <div className="container">
          <div className="marketing-section-header reveal" style={{ '--delay': '0.05s' }}>
            <h2>Channels we run</h2>
            <p>We activate the platforms that drive sustainable pipeline and growth.</p>
          </div>
          <div className="marketing-channel-grid">
            {channels.map((channel) => (
              <div key={channel} className="marketing-channel-pill">
                {channel}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="marketing-segments">
        <div className="container">
          <div className="marketing-section-header reveal" style={{ '--delay': '0.05s' }}>
            <h2>Teams we support</h2>
            <p>Specialized programs for different growth models and industries.</p>
          </div>
          <div className="marketing-segments-grid">
            {segments.map((segment, index) => (
              <div key={segment.title} className="marketing-segment-card reveal" style={{ '--delay': `${0.1 + index * 0.05}s` }}>
                <h3>{segment.title}</h3>
                <p>{segment.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="marketing-engagements">
        <div className="container">
          <div className="marketing-section-header reveal" style={{ '--delay': '0.05s' }}>
            <h2>Ways to work together</h2>
            <p>Flexible engagement models that match your pace and stage.</p>
          </div>
          <div className="marketing-engagements-grid">
            {engagements.map((engagement, index) => (
              <div key={engagement.title} className="marketing-engagement-card reveal" style={{ '--delay': `${0.1 + index * 0.05}s` }}>
                <h3>{engagement.title}</h3>
                <p>{engagement.description}</p>
                <ul>
                  {engagement.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="marketing-process">
        <div className="container">
          <div className="marketing-section-header reveal" style={{ '--delay': '0.05s' }}>
            <h2>Our approach</h2>
            <p>A practical GTM framework that keeps momentum high.</p>
          </div>
          <div className="marketing-process-grid">
            {steps.map((step, index) => (
              <div key={step.title} className="marketing-process-card reveal" style={{ '--delay': `${0.1 + index * 0.05}s` }}>
                <span className="marketing-step-index">0{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="marketing-cta">
        <div className="container marketing-cta-inner">
          <div>
            <span className="marketing-cta-label">Ready to build demand?</span>
            <h2>Let’s design the marketing system your product deserves.</h2>
            <p>Share your goals and we’ll map a clear plan for your next growth milestone.</p>
          </div>
          <Link to="/contact" className="marketing-btn-primary">
            Talk to our team
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default MarketingPage;
