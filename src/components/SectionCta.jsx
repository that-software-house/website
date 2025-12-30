import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap } from 'lucide-react';
import './SectionCta.css';

const SectionCta = ({
  eyebrow = 'Let’s build together',
  title = 'Have a project idea?',
  description = 'Let’s discuss how we can help bring your vision to life with AI-powered solutions.',
  buttonLabel = 'Get in touch',
  buttonHref = '/contact',
}) => {
  return (
    <section className="section-cta">
      <div className="section-cta__inner">
        <div className="section-cta__eyebrow">
          <Zap size={16} />
          <span>{eyebrow}</span>
        </div>
        <h2 className="section-cta__title">{title}</h2>
        <p className="section-cta__desc">{description}</p>
        <Link to={buttonHref} className="section-cta__button">
          {buttonLabel}
          <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
};

export default SectionCta;
