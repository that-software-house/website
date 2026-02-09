import React from 'react';
import { Brush, Gauge, Lightbulb, Rocket, Users } from 'lucide-react';
import SectionCta from '../components/SectionCta';
import './BuildProduct.css';

const seedServices = [
  {
    title: 'Branding',
    icon: Brush,
    intro:
      'TSH helps you define a clear brand identity so your product is memorable and trusted from the first touchpoint.',
    points: [
      'Position your product with a crisp value proposition and voice',
      'Design a practical visual system for product, web, and pitch assets',
      'Ensure brand consistency across every customer interaction',
    ],
  },
  {
    title: 'Technical workshop',
    icon: Lightbulb,
    intro:
      'TSH runs focused technical workshops to align business priorities with architecture and delivery decisions.',
    points: [
      'Review product goals and convert them into technical requirements',
      'Choose a scalable stack and integration approach for MVP and beyond',
      'Identify risks early and set delivery milestones with confidence',
    ],
  },
  {
    title: 'Custom mvp development',
    icon: Rocket,
    intro:
      'TSH builds a tailored MVP around your exact workflow, users, and market assumptions instead of forcing a template.',
    points: [
      'Develop your core features with secure, production-minded engineering',
      'Implement analytics to measure adoption and validate hypotheses',
      'Ship an MVP that is ready for real users and investor conversations',
    ],
  },
  {
    title: 'Rapid mvp development',
    icon: Gauge,
    intro:
      'TSH accelerates MVP delivery with lean sprints and reusable foundations so you can test the market faster.',
    points: [
      'Prioritize only high-impact features for the first release',
      'Use fast feedback loops to adapt scope without losing momentum',
      'Launch quickly while preserving quality, reliability, and UX',
    ],
  },
  {
    title: 'Dedicated team',
    icon: Users,
    intro:
      'TSH provides a dedicated cross-functional team that works as an extension of your company through build and growth phases.',
    points: [
      'Cover product, design, and engineering with one coordinated team',
      'Maintain predictable velocity with transparent communication',
      'Scale capacity as your roadmap and customer demand increase',
    ],
  },
];

const BuildProduct = () => {
  return (
    <div className="build-product-page">
      <section className="build-product-hero">
        <div className="container build-product-hero__content">
          <p className="build-product-hero__eyebrow">Seed stage support</p>
          <h1>Build your product & gain market traction</h1>
          <p className="build-product-hero__lead">
            TSH helps seed-stage teams move from vision to a launch-ready product with the right
            brand, architecture, build strategy, and execution team.
          </p>
        </div>
      </section>

      <section className="build-product-sections">
        <div className="container">
          <div className="build-product-sections__grid">
            {seedServices.map((service) => {
              const Icon = service.icon;
              return (
                <article key={service.title} className="build-product-card">
                  <div className="build-product-card__icon">
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
        eyebrow="Ready to build?"
        title="Let’s turn your concept into a traction-ready MVP"
        description="Share your goals and we will map the fastest path to launch with clear scope, timeline, and team."
        buttonLabel="Start with TSH"
        buttonHref="/contact"
      />
    </div>
  );
};

export default BuildProduct;
