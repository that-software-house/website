import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './Contact.css';

const Contact = () => {
  const [scheduleName, setScheduleName] = useState('');
  const [scheduleEmail, setScheduleEmail] = useState('');
  const [scheduleDate, setScheduleDate] = useState(null);
  const [scheduleTime, setScheduleTime] = useState(null);
  const [scheduleReason, setScheduleReason] = useState('');
  const [scheduleStatus, setScheduleStatus] = useState(null);
  const [scheduleLoading, setScheduleLoading] = useState(false);

  const formatDate = (date) => {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const formatTime = (date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handleScheduleSubmit = async (event) => {
    event.preventDefault();
    setScheduleStatus(null);

    if (!scheduleName.trim() || !scheduleEmail.trim() || !scheduleDate || !scheduleTime) {
      setScheduleStatus({
        type: 'error',
        message: 'Please add your name, email, date, and time to schedule a meeting.',
      });
      return;
    }

    const formattedDate = formatDate(scheduleDate);
    const formattedTime = formatTime(scheduleTime);
    const baseUrl =
      'https://calendar.zoho.com/eventreq/zz0801123048eba502da4d422846acf2b1b883b8d1cf743e8f02124fee436449b8776743a8d4bc9cff846adddd69e774bcc8b6c0d7';
    const params = new URLSearchParams({
      name: scheduleName.trim(),
      mailId: scheduleEmail.trim(),
      date: formattedDate,
      time: formattedTime,
      reason: scheduleReason.trim() || 'General meeting',
    });

    setScheduleLoading(true);

    try {
      const response = await fetch(`${baseUrl}?${params.toString()}`, {
        method: 'GET',
        mode: 'cors',
      });

      if (!response.ok) {
        throw new Error('Schedule request failed');
      }

      setScheduleStatus({
        type: 'success',
        message: 'Thanks! Your appointment request was sent. We will confirm shortly.',
      });
      setScheduleName('');
      setScheduleEmail('');
      setScheduleDate(null);
      setScheduleTime(null);
      setScheduleReason('');
    } catch (error) {
      setScheduleStatus({
        type: 'error',
        message:
          'Sorry, we could not schedule the appointment right now. Please try again or email us.',
      });
    } finally {
      setScheduleLoading(false);
    }
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

          {/* Scheduling Section */}
          <div className="contact-schedule-section">
            <h2 className="form-heading">Schedule a meeting:</h2>
            <form className="contact-form schedule-form" onSubmit={handleScheduleSubmit}>
              <div className="form-group">
                <input
                  type="text"
                  name="scheduleName"
                  placeholder="Full name"
                  autoComplete="name"
                  value={scheduleName}
                  onChange={(event) => setScheduleName(event.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <input
                  type="email"
                  name="scheduleEmail"
                  placeholder="email@company.com"
                  autoComplete="email"
                  value={scheduleEmail}
                  onChange={(event) => setScheduleEmail(event.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group form-row">
                <DatePicker
                  selected={scheduleDate}
                  onChange={(date) => setScheduleDate(date)}
                  className="form-input"
                  placeholderText="Select a date"
                  dateFormat="MM/dd/yyyy"
                  minDate={new Date()}
                  required
                />
                <DatePicker
                  selected={scheduleTime}
                  onChange={(date) => setScheduleTime(date)}
                  className="form-input"
                  placeholderText="Select a time"
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={30}
                  timeFormat="HH:mm"
                  timeCaption="Time"
                  dateFormat="HH:mm"
                  required
                />
              </div>

              <div className="form-group">
                <textarea
                  name="scheduleReason"
                  placeholder="Reason for appointment"
                  rows="4"
                  value={scheduleReason}
                  onChange={(event) => setScheduleReason(event.target.value)}
                  className="form-textarea"
                />
              </div>

              <div className="form-submit">
                <button type="submit" className="contact-primary-btn" disabled={scheduleLoading}>
                  {scheduleLoading ? 'Scheduling...' : 'Schedule meeting'}
                </button>
                {scheduleStatus && (
                  <p className={`form-status ${scheduleStatus.type}`}>{scheduleStatus.message}</p>
                )}
              </div>
            </form>
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
              action="/thank-you"
              data-netlify="true"
              data-netlify-honeypot="bot-field"
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
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <textarea
                  id="projectDescription"
                  name="projectDescription"
                  placeholder="Project description"
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
                  className="form-input"
                />
              </div>

              <div className="form-privacy">
                <p>
                  By filling in the form, you agree to our Privacy Policy, including our cookie use.
                </p>
              </div>

              <div className="form-submit">
                <button type="submit" className="contact-primary-btn">
                  Let's talk
                </button>
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
