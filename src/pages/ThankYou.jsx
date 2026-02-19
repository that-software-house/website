import React from 'react';
import { useSEO } from '@/hooks/useSEO';
import './Contact.css';

const ThankYou = () => {
  useSEO({
    title: 'Thank You | That Software House',
    description: 'Thanks for reaching out. Our team will get back to you within one business day.',
  });
  return (
    <div className="contact-page">
      <section className="contact-hero">
        <div className="contact-container">
          <h1 className="contact-title">Thank you!</h1>
          <p className="contact-description">
            We’ve received your message. Our team will reach out within one business day.
          </p>
        </div>
      </section>
    </div>
  );
};

export default ThankYou;
