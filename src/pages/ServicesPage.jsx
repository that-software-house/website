import React, { useState } from 'react';
import { useSEO } from '@/hooks/useSEO';
import './ServicesPage.css';
import smbPackageImg from '../assets/smb-coffee-shop.jpg';
import smbFormImg from '../assets/smb-dental-clinic.jpg';
import SectionCta from '@/components/SectionCta';

const ServicesPage = () => {
  useSEO({
    title: 'Small Business Web Packages | That Software House',
    description: 'Affordable, modern websites for local businesses. Fast, customized web packages designed to help small businesses grow online.',
    keywords: 'small business website, affordable web design, local business website, web packages, Austin TX',
    canonicalUrl: 'https://thatsoftwarehouse.com/services',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Small Business Web Packages',
      provider: { '@type': 'Organization', name: 'That Software House' },
      description: 'Customized, modern websites for local businesses that are fast, affordable and reliable.',
      areaServed: 'Worldwide',
      serviceType: 'Web Design',
    },
  });
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Add your form submission logic here
  };

  return (
    <div className="services-page">
      {/* Hero Section */}
      <section className="services-hero">
        <div className="services-hero-content">
          <h1 className="services-hero-title">Small Business Web Packages</h1>
        </div>
        <div className="services-hero-image">
          <img src={smbPackageImg} alt="Small business owner with packages" />
        </div>
      </section>

      {/* Value Proposition Section */}
      <section className="services-value">
        <div className="services-container">
          <h2 className="services-value-title">
            We build customized, modern websites for local businesses that are fast, affordable and reliable.
          </h2>

          <div className="services-value-content">
            <p>
              We've been building websites for 15+ years, and here's what we've learned: most small businesses get stuck with cookie-cutter templates that don't actually help them grow.
            </p>
            <p>
              When the bakery down the street needs a website that shows off their custom cakes, or the family auto shop wants something that doesn't look like it's from 2005, we build something that actually works for their business.
            </p>
            <p>
              We're not talking about flashy features that take forever to load. We build sites that look great on phones, show up in Google searches, and most importantly - turn the people who visit into actual customers.
            </p>
            <p>
              The best part? We work with real budgets, not Silicon Valley fantasies. Because we know that every dollar matters when you're running a business.
            </p>
          </div>
        </div>
      </section>

      {/* Why Work With Us Section */}
      <section className="services-why">
        <div className="services-container">
          <h2 className="services-why-title">Why work with us?</h2>

          <ul className="services-why-list">
            <li>
              <span className="list-bullet">•</span>
              <span>Transparent Pricing - no surprises or hidden fees</span>
            </li>
            <li>
              <span className="list-bullet">•</span>
              <span>Rapid delivery in as little as 2 weeks for a simple website</span>
            </li>
            <li>
              <span className="list-bullet">•</span>
              <span>Fully responsive and SEO ready sites</span>
            </li>
            <li>
              <span className="list-bullet">•</span>
              <span>
                Our packages <strong>start at $500</strong> for simple one-page sites and scale up based on the complexity, number of pages, and any custom features or integrations you need.
              </span>
            </li>
          </ul>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="services-contact">
        <div className="services-contact-container">
          <div className="services-contact-image">
            <img src={smbFormImg} alt="Person working in kitchen" />
          </div>

          <div className="services-contact-form-wrapper">
            <h2 className="services-contact-title">
              Interested to work with us? Please leave your info below.
            </h2>

            <form className="services-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name or Business Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>

              <button type="submit" className="services-submit">
                Submit
              </button>
            </form>
          </div>
        </div>
      </section>

      <SectionCta
        eyebrow="Let’s collaborate"
        title="Need a site that works as hard as you?"
        description="Share your goals and we’ll send a clear scope, budget, and timeline that fits your business."
        buttonLabel="Talk to us"
        buttonHref="/contact"
      />
    </div>
  );
};

export default ServicesPage;
