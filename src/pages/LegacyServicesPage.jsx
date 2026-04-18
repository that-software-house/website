import React, { useState } from 'react';
import { useSEO } from '@/hooks/useSEO';
import './LegacyServicesPage.css';
import smbPackageImg from '../assets/smb-coffee-shop.jpg';
import smbFormImg from '../assets/smb-dental-clinic.jpg';

const LegacyServicesPage = () => {
  useSEO({
    title: 'Small Business Web Packages | That Software House',
    description: 'Affordable, modern websites for local businesses. Fast, customized web packages designed to help small businesses grow online.',
    keywords: 'small business website, affordable web design, local business website, web packages, Austin TX',
    canonicalUrl: 'https://thatsoftwarehouse.com/small-business-websites',
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
  };

  return (
    <div className="legacy-services-page">
      <section className="legacy-services-page__hero">
        <div className="legacy-services-page__hero-content">
          <h1>Small Business Web Packages</h1>
        </div>
        <div className="legacy-services-page__hero-image">
          <img src={smbPackageImg} alt="Small business owner with packages" />
        </div>
      </section>

      <section className="legacy-services-page__value">
        <div className="container">
          <h2>
            We build customized, modern websites for local businesses that are fast, affordable and reliable.
          </h2>
          <div className="legacy-services-page__copy">
            <p>We&apos;ve been building websites for 15+ years, and here&apos;s what we&apos;ve learned: most small businesses get stuck with cookie-cutter templates that don&apos;t actually help them grow.</p>
            <p>When the bakery down the street needs a website that shows off their custom cakes, or the family auto shop wants something that doesn&apos;t look like it&apos;s from 2005, we build something that actually works for their business.</p>
            <p>We&apos;re not talking about flashy features that take forever to load. We build sites that look great on phones, show up in Google searches, and most importantly turn visitors into actual customers.</p>
            <p>The best part? We work with real budgets, not Silicon Valley fantasies. Every dollar matters when you are running a business.</p>
          </div>
        </div>
      </section>

      <section className="legacy-services-page__why">
        <div className="container">
          <h2>Why work with us?</h2>
          <ul>
            <li>Transparent pricing with no surprises or hidden fees</li>
            <li>Rapid delivery in as little as 2 weeks for a simple website</li>
            <li>Fully responsive and SEO-ready sites</li>
            <li>Packages start at $500 for simple one-page sites and scale with scope</li>
          </ul>
        </div>
      </section>

      <section className="legacy-services-page__contact">
        <div className="legacy-services-page__contact-grid">
          <div className="legacy-services-page__contact-image">
            <img src={smbFormImg} alt="Person working in kitchen" />
          </div>
          <div className="legacy-services-page__contact-form">
            <h2>Interested in working with us? Leave your info below.</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                name="name"
                placeholder="Your Name or Business Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <button type="submit">Submit</button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LegacyServicesPage;
