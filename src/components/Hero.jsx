import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Cpu, MapPin, MonitorSmartphone, Users } from 'lucide-react';
import voxLogo from '../assets/clients/vox-health.svg';
import codeMinderLogo from '../assets/clients/codeminder-purple.svg';
import oracleLogo from '../assets/clients/oracle.png';
import kaizenLogo from '../assets/clients/kaizen-health.png';
import microsoftLogo from '../assets/clients/microsoft.png';
import './Hero.css';

const services = [
  {
    title: 'Staff Augmentation',
    description: 'Enabling your team to reach project goals.',
    icon: Users,
    link: '/services',
  },
  {
    title: 'Custom software development',
    description: 'Build software tailored to your business',
    icon: MonitorSmartphone,
    link: '/custom-software',
  },
  {
    title: 'AI development',
    description: 'Disrupt the market',
    icon: Cpu,
    link: '/ai-software',
  },
];

const trustLogos = [
  { src: voxLogo, alt: 'Vox Health' },
  { src: codeMinderLogo, alt: 'CodeMinder' },
  { src: oracleLogo, alt: 'Oracle' },
  { src: kaizenLogo, alt: 'Kaizen Health' },
  { src: microsoftLogo, alt: 'Microsoft' },
];

const Hero = () => {
  return (
    <section className="hero hero-main">
      <video
        className="hero-video"
        autoPlay
        muted
        loop
        playsInline
        src="/video/hero1.mp4"
      />
      <div className="hero-media-overlay" />
      <div className="container hero-main__inner">
        <div className="hero-pill">
          <MapPin size={16} />
          <span>
            Based in <strong>Austin, Texas</strong>. Operating <strong>worldwide.</strong>
          </span>
        </div>
        <h1 className="hero-heading">
          End-to-end software development
          <br />
          from <span className="hero-heading--gradient"> people who've built at scale</span>
        </h1>

        <div className="hero-cards">
          {services.map((service, idx) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.title}
                className="hero-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08, duration: 0.5 }}
              >
                <div className="hero-card__top">
                  <Icon size={28} />
                </div>
                <div className="hero-card__body">
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                </div>
                <Link className="hero-card__cta" to={service.link} aria-label={`Learn more about ${service.title}`}>
                  <ArrowRight size={18} />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="trust-band">
        <div className="container trust-band__inner">
          <div className="trust-band__label">
            <span>Trusted by</span>
            <strong>Leading brands and startups</strong>
          </div>
          <div className="trust-band__logos">
            {trustLogos.map((logo) => (
              <div key={logo.alt} className="trust-logo">
                <img src={logo.src} alt={logo.alt} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
