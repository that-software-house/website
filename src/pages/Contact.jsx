import React, { useState } from 'react';
import { useSEO } from '@/hooks/useSEO';
import './Contact.css';

const domainOptions = ['Healthcare', 'Fintech', 'Insurtech', 'AI infrastructure', 'Other'];
const engagementOptions = ['2-wk diligence', 'Production build', '0 → 1 team', 'Fractional platform', 'Not sure yet'];
const budgetOptions = ['$15–30k / mo', '$30–60k / mo', '$60–100k / mo', '$100k+ / mo', 'Fixed, $18k diligence'];

const timeline = [
  { time: 'T+0', title: 'A principal reads it.', tag: 'Within 4 hours · business day', body: 'Snehal or Ash depending on the domain. Not a router, not an SDR.' },
  { time: 'T+1d', title: 'You get a written reply.', tag: 'Within 24 hours', body: "Either a 30-minute slot, a here's why not, or a referral. The reply is written, not a calendar link." },
  { time: 'T+1w', title: '30-minute scoping call.', tag: 'Video · 30 min', body: "No deck. You walk us through the actual problem. We tell you what we'd do and what we would not." },
  { time: 'T+2w', title: 'Either a diligence SOW or a pass.', tag: 'Fixed fee · $18k', body: "If we're in, you get a fixed-fee diligence SOW in your inbox the day after the call. If not, you get the reason." },
];

const contactInfo = [
  { label: 'Principal intake', value: 'contact@thatsoftwarehouse.com', href: 'mailto:contact@thatsoftwarehouse.com' },
  { label: 'Healthcare leads', value: 'contact@thatsoftwarehouse.com', href: 'mailto:contact@thatsoftwarehouse.com' },
  { label: 'Austin studio', value: '1208 E 6th St, Suite 210, Austin TX 78702' },
  { label: 'SF studio', value: '482 Valencia St, Floor 3, San Francisco CA 94103' },
];

function ChipGroup({ options, selected, onToggle }) {
  return (
    <div className="contact-chip-group">
      {options.map((opt) => {
        const active = selected === opt;
        return (
          <button
            key={opt}
            type="button"
            className={`contact-chip${active ? ' contact-chip--active' : ''}`}
            onClick={() => onToggle(active ? '' : opt)}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

const Contact = () => {
  useSEO({
    title: 'Contact | That Software House',
    description: 'Talk directly with a principal engineer at That Software House about technical diligence, production AI, and high-stakes software builds.',
    keywords: 'contact software engineering studio, production AI consultation, technical diligence intake',
    canonicalUrl: 'https://thatsoftwarehouse.com/contact',
  });

  const [domain, setDomain] = useState('');
  const [engagement, setEngagement] = useState('');
  const [budget, setBudget] = useState('');

  return (
    <div className="contact-page">
      {/* Hero */}
      <section className="contact-hero">
        <div className="contact-inner">
          <div className="contact-hero__grid">
            <div>
              <h1 className="contact-hero__title">
                Tell us what<br />you're actually<br />building.
              </h1>
            </div>
            <div className="contact-hero__right">
              <p className="contact-hero__body">
                <strong>A principal reads every inbound.</strong> Within 24 hours you'll get either a scoping call slot, a written "here's why we're wrong for this" reply, or a referral to someone better suited. No sales flow, no nurture sequence, no demo request.
              </p>
              <div className="contact-info">
                {contactInfo.map((row) => (
                  <div key={row.label} className="contact-info__row">
                    <span className="contact-info__label">{row.label}</span>
                    {row.href ? (
                      <a href={row.href} className="contact-info__value">{row.value}</a>
                    ) : (
                      <span className="contact-info__value">{row.value}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Form + Sidebar */}
      <section className="contact-body">
        <div className="contact-inner">
          <div className="contact-layout">
            {/* Form */}
            <form
              className="contact-form-card"
              name="principal-intake"
              method="POST"
              action="/thank-you"
              data-netlify="true"
              data-netlify-honeypot="bot-field"
            >
              <input type="hidden" name="form-name" value="principal-intake" />
              <input type="hidden" name="domain" value={domain} />
              <input type="hidden" name="engagement_shape" value={engagement} />
              <input type="hidden" name="budget_ceiling" value={budget} />
              <p hidden>
                <label>Do not fill this out: <input name="bot-field" /></label>
              </p>

              <div className="contact-form__eyebrow">Intake form · Accepting Q3</div>
              <h2 className="contact-form__heading">Tell us what you're actually building.</h2>

              <div className="contact-form__grid">
                <div className="contact-field">
                  <label className="contact-label">Your name *</label>
                  <input className="contact-input" type="text" name="name" placeholder="Full name" required />
                </div>
                <div className="contact-field">
                  <label className="contact-label">Founder email *</label>
                  <input className="contact-input" type="email" name="email" placeholder="you@company.com" required />
                </div>
              </div>

              <div className="contact-form__grid">
                <div className="contact-field">
                  <label className="contact-label">Company</label>
                  <input className="contact-input" type="text" name="company" placeholder="Company name" />
                </div>
                <div className="contact-field">
                  <label className="contact-label">Stage</label>
                  <input className="contact-input" type="text" name="stage" placeholder="Seed, Series A, Growth…" />
                </div>
              </div>

              <div className="contact-field">
                <label className="contact-label">Domain</label>
                <ChipGroup options={domainOptions} selected={domain} onToggle={setDomain} />
              </div>

              <div className="contact-field">
                <label className="contact-label">What are you trying to ship? *</label>
                <textarea
                  className="contact-textarea"
                  name="ask"
                  placeholder="Describe the problem, the current state, and what good looks like…"
                  rows={4}
                  required
                />
              </div>

              <div className="contact-field">
                <label className="contact-label">Engagement shape</label>
                <ChipGroup options={engagementOptions} selected={engagement} onToggle={setEngagement} />
              </div>

              <div className="contact-field">
                <label className="contact-label">Budget ceiling</label>
                <ChipGroup options={budgetOptions} selected={budget} onToggle={setBudget} />
              </div>

              <div className="contact-form__submit">
                <p className="contact-form__disclaimer">
                  By sending this you agree we'll reply within 24h.<br />No mailing list. No CRM.
                </p>
                <button type="submit" className="contact-submit-btn">
                  Send to a principal ↗
                </button>
              </div>
            </form>

            {/* Sidebar */}
            <div className="contact-sidebar">
              <div className="contact-sidebar__capacity">
                <div className="contact-sidebar__eyebrow">2 slots open · Q3</div>
                <p className="contact-sidebar__capacity-body">
                  We limit active engagements to keep principals close to the work. Current capacity for Q3 is two new starts.
                </p>
              </div>

              <div className="contact-sidebar__timeline">
                <div className="contact-sidebar__eyebrow contact-sidebar__eyebrow--dark">What happens next</div>
                {timeline.map((t, i) => (
                  <div key={t.time} className={`contact-timeline-item${i < timeline.length - 1 ? ' has-border' : ''}`}>
                    <div className="contact-timeline-item__badge">{t.time}</div>
                    <div>
                      <div className="contact-timeline-item__title">{t.title}</div>
                      <div className="contact-timeline-item__tag">{t.tag}</div>
                      <p className="contact-timeline-item__body">{t.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
