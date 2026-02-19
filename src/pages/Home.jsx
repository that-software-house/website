import React from 'react';
import { useSEO } from '@/hooks/useSEO';
import Hero from '../components/Hero';
import Services from '../components/Services';
import ValueProps from '../components/ValueProps';
import Clients from '../components/Clients';
import Stages from '../components/Stages';
import ContactFormSection from '../components/ContactFormSection';
import './Home.css';

const Home = () => {
  useSEO({
    title: 'That Software House | Product, Design & Engineering Studio',
    description: 'That Software House builds secure, scalable products for web, mobile, and AI. Based in Austin, Texas and serving clients worldwide.',
    keywords: 'software development, product design, engineering studio, web app, mobile app, AI, Austin TX',
    canonicalUrl: 'https://thatsoftwarehouse.com/',
    openGraph: {
      title: 'That Software House | Product, Design & Engineering Studio',
      description: 'End-to-end software development from people who\'ve built at scale.',
      image: 'https://thatsoftwarehouse.com/og-image.png',
      url: 'https://thatsoftwarehouse.com/',
    },
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'That Software House',
      url: 'https://thatsoftwarehouse.com',
      logo: 'https://thatsoftwarehouse.com/favicon.svg',
      description: 'Product, Design & Engineering Studio based in Austin, Texas.',
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
      sameAs: [
        'https://www.linkedin.com/company/that-software-house/',
        'https://www.instagram.com/thatsoftwarehouse/',
      ],
    },
  });
  const awards = [
    'Forbes Business Awards',
    'Top App Dev Firm',
    'Clutch Global 2025',
    'Newest upcoming firm in Austin',
  ];

  const testimonials = [
    {
      quote: '.',
      name: 'Swati Patil',
      title: 'CEO at GoCodeMinder',
      message: 'The team at TSH helped create a brand identity for my MVP and built the web application from scratch. Highly recommend them if you want to take a product from idea to MVP and beyond.'
    },
    {
      quote: '.',
      name: 'Vahid Kowsari',
      title: 'CEO at Vox Health',
      message: 'TSH was able to get a fully production ready product design done in under 2 weeks. Great team that pays attention to detail.'
    },
  ];

  const cases = [
    {
      title: 'Healthcare AI copilot',
      industry: 'Healthtech / AI',
      outcome: 'Cut triage time by 42% with a secure, compliant copilot.',
      badge: 'HIPAA-ready',
    },
    {
      title: 'Fintech mobile bank',
      industry: 'Fintech / Mobile',
      outcome: 'Scaled to 500k MAU with 4.8 app rating and 35% faster onboarding.',
      badge: 'iOS + Android',
    },
    {
      title: 'Logistics control tower',
      industry: 'Supply chain / Web',
      outcome: 'Unified fleet ops, dropping SLA breaches by 19% in 90 days.',
      badge: 'Realtime dashboards',
    },
  ];

  return (
    <>
      <Hero />

      <section className="recognition">
        <div className="container recognition-grid">
          {/*<div className="recognition-awards">*/}
          {/*  {awards.map((award) => (*/}
          {/*    <div key={award} className="award-card">*/}
          {/*      <div className="award-title">{award}</div>*/}
          {/*    </div>*/}
          {/*  ))}*/}
          {/*</div>*/}
          {testimonials.map((testimonial) => (
            <div className="recognition-testimonial">
              <p className="recognition-quote">{testimonial.message}</p>
              <div className="testimonial-meta">
                <div className="source">Review</div>
                <div className="stars">
                  <span>★★★★★</span>
                  <span className="score">5.0</span>
                </div>
              </div>
              <div className="author">
                <div className="author-avatar">S</div>
                <div>
                  <div className="author-name">{testimonial.name}</div>
                  <div className="author-title">{testimonial.title}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Services />
      <ValueProps />
      <Clients />
      <Stages />
      <ContactFormSection />
    </>
  );
};

export default Home;
