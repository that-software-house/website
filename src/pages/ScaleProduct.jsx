import React from 'react';
import { Monitor, RefreshCw, Search, Users } from 'lucide-react';
import { useSEO } from '@/hooks/useSEO';
import SectionCta from '../components/SectionCta';
import './ScaleProduct.css';

const scaleServices = [
  {
    title: 'UX audit',
    icon: Search,
    intro:
      'TSH audits your product experience end to end to uncover friction that slows activation, adoption, and retention.',
    points: [
      'Review critical user journeys and identify high-friction moments',
      'Prioritize usability fixes based on business impact and effort',
      'Translate findings into an actionable improvement roadmap',
    ],
  },
  {
    title: 'Product redesign',
    icon: RefreshCw,
    intro:
      'TSH redesigns your product interface to improve clarity, scalability, and conversion without disrupting core operations.',
    points: [
      'Modernize UI patterns and interaction flows for better usability',
      'Create reusable design systems to accelerate future feature delivery',
      'Align redesign decisions with product metrics and growth goals',
    ],
  },
  {
    title: 'Team extension',
    icon: Users,
    intro:
      'TSH extends your internal team with product, design, and engineering specialists who can execute immediately.',
    points: [
      'Embed senior contributors who align with your roadmap and process',
      'Increase delivery capacity without long hiring cycles',
      'Maintain momentum across feature work, improvements, and experiments',
    ],
  },
  {
    title: 'Website redesign',
    icon: Monitor,
    intro:
      'TSH redesigns your website to clearly communicate value, strengthen credibility, and convert more qualified traffic.',
    points: [
      'Refine messaging and structure around your growth-stage audience',
      'Upgrade visual language while improving speed and responsiveness',
      'Optimize key conversion paths for demos, signups, and inbound leads',
    ],
  },
];

const ScaleProduct = () => {
  useSEO({
    title: 'Scale Your Product | That Software House',
    description: 'Scale, optimize, and reach more users. UX audits, product redesigns, performance optimization, and team augmentation to grow your product.',
    keywords: 'scale product, UX audit, product redesign, performance optimization, staff augmentation',
    canonicalUrl: 'https://thatsoftwarehouse.com/scale-your-product',
  });

  return (
    <div className="scale-product-page">
      <section className="scale-product-hero">
        <div className="container scale-product-hero__content">
          <p className="scale-product-hero__eyebrow">Series A & beyond support</p>
          <h1>Scale, optimize & reach more users</h1>
          <p className="scale-product-hero__lead">
            TSH helps growth-stage teams improve experience quality, accelerate delivery, and
            upgrade product and web touchpoints to support scale.
          </p>
        </div>
      </section>

      <section className="scale-product-sections">
        <div className="container">
          <div className="scale-product-sections__grid">
            {scaleServices.map((service) => {
              const Icon = service.icon;
              return (
                <article key={service.title} className="scale-product-card">
                  <div className="scale-product-card__icon">
                    <Icon size={24} />
                  </div>
                  <h2>{service.title}</h2>
                  <p>{service.intro}</p>
                  <ul>
                    {service.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <SectionCta
        eyebrow="Ready to scale?"
        title="Let’s optimize your product for the next growth stage"
        description="Share your current product challenges and we will recommend the highest-impact path to improve experience and velocity."
        buttonLabel="Talk to TSH"
        buttonHref="/contact"
      />
    </div>
  );
};

export default ScaleProduct;
