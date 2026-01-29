import React from 'react';
import './ContactFormSection.css';

const budgetOptions = [
  'UP TO $10K',
  '$10-$20K',
  '$20-$50K',
  '$50-$100K',
  '>$100K',
];

const ContactFormSection = () => {
  return (
    <section className="contact-form-section" id="contact">
      <div className="contact-form-container">
        <div className="contact-form-header">
          <div className="contact-label-row">
            <span className="contact-form-label">CONTACT US</span>
            <span className="contact-form-chip">Avg. reply in 24h</span>
          </div>
          <h2 className="contact-form-title">
            Have a project in mind?<br />Let's chat
          </h2>
          <p className="contact-form-sub">
            Tell us what you are building and we will share a clear plan, budget, and starting team within a day.
          </p>
        </div>

        <form
          className="contact-form"
          name="project-contact"
          method="POST"
          action="/thank-you"
          data-netlify="true"
          data-netlify-honeypot="bot-field"
          encType="multipart/form-data"
        >
          <input type="hidden" name="form-name" value="project-contact" />
          <p hidden>
            <label>
              Don&apos;t fill this out: <input name="bot-field" />
            </label>
          </p>

          <div className="form-row">
            <div className="form-field">
              <label className="field-label">YOUR NAME</label>
              <input
                type="text"
                name="name"
                placeholder="ENTER YOUR NAME *"
                required
                className="form-input"
              />
            </div>

            <div className="form-field">
              <label className="field-label">YOUR EMAIL</label>
              <input
                type="email"
                name="email"
                placeholder="ENTER YOUR EMAIL *"
                required
                className="form-input"
              />
            </div>
          </div>

          <div className="form-field">
            <label className="field-label">MESSAGE</label>
            <textarea
              name="message"
              placeholder="TELL US ABOUT YOUR PROJECT"
              rows="5"
              className="form-textarea"
              required
            />
          </div>

          <div className="form-file-upload">
            <input
              type="file"
              id="file-upload"
              name="attachment"
              className="file-input"
            />
            <label htmlFor="file-upload" className="file-upload-button">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
              </svg>
              ATTACH FILE
            </label>
          </div>

          <div className="form-budget">
            <label className="field-label">YOUR BUDGET FOR THIS PROJECT?</label>
            <div className="budget-options">
              {budgetOptions.map((budget) => (
                <label key={budget} className="budget-button">
                  <input type="radio" name="budget" value={budget} className="budget-radio" />
                  {budget}
                </label>
              ))}
            </div>
          </div>

          <div className="form-submit-section">
            <button type="submit" className="form-submit-button">
              Submit
            </button>
            <p className="form-terms">
              BY CLICKING THIS BUTTON YOU ACCEPT{' '}
              <a href="/terms" className="terms-link">TERMS OF SERVICE</a>{' '}
              AND{' '}
              <a href="/privacy" className="terms-link">PRIVACY POLICY</a>
            </p>
          </div>
        </form>
      </div>
    </section>
  );
};

export default ContactFormSection;
