import React from 'react';
import { Compass, Globe, PenTool } from 'lucide-react';
import SectionCta from '../components/SectionCta';
import './ValidateIdea.css';

const servicePillars = [
  {
    title: 'Design prototype',
    icon: PenTool,
    intro:
      'TSH turns your concept into a clickable prototype so stakeholders can experience the product before development starts.',
    points: [
      'Translate your idea into clear user flows and key screens',
      'Create an interactive prototype in Figma for demos and testing',
      'Refine usability based on quick feedback loops with target users',
    ],
    outcome:
      'You can pitch with confidence and validate the core experience without committing to a full build.',
  },
  {
    title: 'Product Discovery',
    icon: Compass,
    intro:
      'TSH runs focused discovery sessions to define what to build first and how to ship it with minimal risk.',
    points: [
      'Clarify the problem, audience, and measurable product goals',
      'Prioritize MVP features and remove non-essential scope',
      'Map technical approach, delivery plan, and realistic timeline',
    ],
    outcome:
      'You get a practical roadmap that aligns product direction, budget, and execution from day one.',
  },
  {
    title: 'Website development',
    icon: Globe,
    intro:
      'TSH builds a fast, conversion-focused website that communicates your value proposition and supports early growth.',
    points: [
      'Craft messaging and page structure around your ideal customer',
      'Develop a performant site optimized for mobile and SEO basics',
      'Set up lead capture, analytics, and clear conversion paths',
    ],
    outcome:
      'Your website becomes a working validation asset that attracts prospects, partners, and investors.',
  },
];

const ValidateIdea = () => {
  return (
    <div className="validate-page">
      <section className="validate-hero">
        <div className="container validate-hero__content">
          <p className="validate-hero__eyebrow">Pre-seed support</p>
          <h1>Validate your idea</h1>
          <p className="validate-hero__lead">
            Before investing heavily in engineering, TSH helps you prove demand, sharpen the
            product direction, and create assets you can use to win early customers and investors.
          </p>
        </div>
      </section>

      <section className="validate-sections">
        <div className="container">
          <div className="validate-sections__grid">
            {servicePillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <article key={pillar.title} className="validate-card">
                  <div className="validate-card__icon">
                    <Icon size={24} />
                  </div>
                  <h2>{pillar.title}</h2>
                  <p>{pillar.intro}</p>
                  <ul>
                    {pillar.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                  <p className="validate-card__outcome">{pillar.outcome}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <SectionCta
        eyebrow="Ready to validate?"
        title="Let’s pressure-test your idea together"
        description="Share your concept and we will map the fastest path from idea to a launch-ready MVP plan."
        buttonLabel="Book a discovery call"
        buttonHref="/contact"
      />
    </div>
  );
};

export default ValidateIdea;
