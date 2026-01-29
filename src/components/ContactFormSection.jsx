import React, { useState } from 'react';
import './ContactFormSection.css';

const ContactFormSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    budget: ''
  });

  const [fileName, setFileName] = useState('');
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');

  const budgetOptions = [
    'UP TO $10K',
    '$10-$20K',
    '$20-$50K',
    '$50-$100K',
    '>$100K'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBudgetSelect = (budget) => {
    setFormData(prev => ({
      ...prev,
      budget
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      setFile(file);
    }
  };

  const validate = () => {
    const validationErrors = {};
    if (!formData.name.trim()) validationErrors.name = 'Name is required';
    if (!formData.email.trim()) validationErrors.email = 'Email is required';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      validationErrors.email = 'Enter a valid email';
    }
    return validationErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setErrors({});
      setStatus('sending');

      const formDataPayload = new FormData();
      formDataPayload.append('form-name', 'project-contact');
      Object.entries(formData).forEach(([key, value]) => {
        formDataPayload.append(key, value);
      });
      if (file) {
        formDataPayload.append('attachment', file);
      }

      fetch('/', {
        method: 'POST',
        body: formDataPayload,
      })
        .then(() => {
          setStatus('success');
          setFormData({ name: '', email: '', message: '', budget: '' });
          setFile(null);
          setFileName('');
          setTimeout(() => setStatus('idle'), 3000);
        })
        .catch(() => {
          setStatus('error');
          setTimeout(() => setStatus('idle'), 3000);
        });
    } else {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 2200);
    }
  };

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
          onSubmit={handleSubmit}
          name="project-contact"
          method="POST"
          action="/"
          data-netlify="true"
          data-netlify-honeypot="bot-field"
          encType="multipart/form-data"
        >
          <input type="hidden" name="form-name" value="project-contact" />
          <p hidden>
            <label>
              Don&apos;t fill this out: <input name="bot-field" onChange={handleChange} />
            </label>
          </p>
          <div className="form-row">
            <div className="form-field">
              <label className="field-label">YOUR NAME</label>
              <input
                type="text"
                name="name"
                placeholder="ENTER YOUR NAME *"
                value={formData.name}
                onChange={handleChange}
                required
                className="form-input"
              />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>

            <div className="form-field">
              <label className="field-label">YOUR EMAIL</label>
              <input
                type="email"
                name="email"
                placeholder="ENTER YOUR EMAIL *"
                value={formData.email}
                onChange={handleChange}
                required
                className="form-input"
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>
          </div>

          <div className="form-field">
            <label className="field-label">MESSAGE</label>
            <textarea
              name="message"
              placeholder="TELL US ABOUT YOUR PROJECT"
              value={formData.message}
              onChange={handleChange}
              rows="5"
              className="form-textarea"
            />
          </div>

          <div className="form-file-upload">
            <input
              type="file"
              id="file-upload"
              onChange={handleFileChange}
              name="attachment"
              className="file-input"
            />
            <label htmlFor="file-upload" className="file-upload-button">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
              </svg>
              ATTACH FILE
            </label>
            {fileName && <span className="file-name">{fileName}</span>}
          </div>

          <div className="form-budget">
            <label className="field-label">YOUR BUDGET FOR THIS PROJECT?</label>
            <div className="budget-options">
              {budgetOptions.map((budget) => (
                <button
                  key={budget}
                  type="button"
                  className={`budget-button ${formData.budget === budget ? 'active' : ''}`}
                  onClick={() => handleBudgetSelect(budget)}
                >
                  {budget}
                </button>
              ))}
            </div>
          </div>

          <div className="form-submit-section">
            <button type="submit" className="form-submit-button" disabled={status === 'sending'}>
              {status === 'sending' ? 'Sending…' : 'Submit'}
            </button>
            <p className="form-terms">
              BY CLICKING THIS BUTTON YOU ACCEPT{' '}
              <a href="/terms" className="terms-link">TERMS OF SERVICE</a>{' '}
              AND{' '}
              <a href="/privacy" className="terms-link">PRIVACY POLICY</a>
            </p>
          </div>
        </form>

        <div className={`form-toast ${status !== 'idle' ? 'visible' : ''}`} role="status" aria-live="polite">
          {status === 'success'
            ? 'We got your note. Expect a reply in < 24 hours.'
            : status === 'error'
              ? 'Please correct highlighted fields or retry.'
              : 'Submitting...'}
        </div>
      </div>
    </section>
  );
};

export default ContactFormSection;
