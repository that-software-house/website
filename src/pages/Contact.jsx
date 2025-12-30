import React, { useState } from 'react';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    projectDescription: '',
    howDidYouFind: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    // Netlify will handle the form submission
    // The form will be submitted automatically due to data-netlify attribute
  };

  return (
    <div className="contact-page">
      <section className="contact-hero">
        <div className="contact-container">
          <h1 className="contact-title">Contact us</h1>
          <p className="contact-description">
            We partner with startups, scale-ups, SMB's and enterprises to turn ambitious ideas into
            secure, scalable software. Let's discuss your project.
          </p>
        </div>
      </section>

      <section className="contact-content">
        <div className="contact-container">
          {/* Email Section */}
          <div className="contact-email-section">
            <a href="mailto:contact@thatsoftwarehouse.com" className="contact-email-link">
              contact@thatsoftwarehouse.com
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            </a>
          </div>

          {/* Divider */}
          <div className="contact-divider">
            <span className="divider-line"></span>
            <span className="divider-text">or</span>
            <span className="divider-line"></span>
          </div>

          {/* Form Section */}
          <div className="contact-form-section">
            <h2 className="form-heading">Or fill out the form:</h2>
            <form
              name="contact"
              method="POST"
              data-netlify="true"
              data-netlify-honeypot="bot-field"
              onSubmit={handleSubmit}
              className="contact-form"
            >
              {/* Hidden field for Netlify */}
              <input type="hidden" name="form-name" value="contact" />

              {/* Honeypot field for spam protection */}
              <p hidden>
                <label>
                  Don't fill this out: <input name="bot-field" />
                </label>
              </p>

              <div className="form-group">
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  placeholder="Full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="email@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <textarea
                  id="projectDescription"
                  name="projectDescription"
                  placeholder="Project description"
                  value={formData.projectDescription}
                  onChange={handleChange}
                  required
                  rows="6"
                  className="form-textarea"
                />
              </div>

              <div className="form-group">
                <input
                  type="text"
                  id="howDidYouFind"
                  name="howDidYouFind"
                  placeholder="How did you find That Software House"
                  value={formData.howDidYouFind}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-privacy">
                <p>
                  By filling in the form, you agree to our Privacy Policy, including our cookie use.
                </p>
              </div>

              <div className="form-submit">
                <button type="submit" className="contact-primary-btn">Let's talk</button>
              </div>
            </form>
          </div>

          {/* Additional Links */}
          <div className="contact-links">
            <a href="mailto:contact@thatsoftwarehouse.com" className="contact-link-item">
              General Inquiries →
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
