import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSEO } from '@/hooks/useSEO';
import './Contact.css';

const domainOptions = ['Healthcare', 'Fintech', 'Insurtech', 'AI infrastructure', 'Other'];
const shapeOptions = ['2-wk diligence', 'Production build', '0 → 1 team', 'Fractional platform', 'Not sure yet'];
const budgetOptions = ['$15—30k / mo', '$30—60k / mo', '$60—100k / mo', '$100k+ / mo', 'Fixed, $18k diligence'];

const Contact = () => {
  const navigate = useNavigate();
  useSEO({
    title: 'Contact | That Software House',
    description: 'Talk directly with a principal engineer at That Software House about technical diligence, production AI, and high-stakes software builds.',
    keywords: 'contact software engineering studio, production AI consultation, technical diligence intake',
    canonicalUrl: 'https://thatsoftwarehouse.com/contact',
  });

  const [domains, setDomains] = useState([]);
  const [shapes, setShapes] = useState([]);
  const [budget, setBudget] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleSelection = (value, setter, current) => {
    setter(current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.target);
    const data = new URLSearchParams(formData).toString();

    try {
      await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: data,
      });
      navigate('/thank-you');
    } catch (error) {
      console.error('Form submission error:', error);
      alert('There was an error sending your message. Please try again or email us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-page studio-page">
      <section className="contact-page__hero studio-section-shell">
        <div className="contact-page__left">
          <div className="eyebrow">
            <span className="eyebrow__bar" />
            <span className="eyebrow__tag">[ 05 / Contact ]</span>
            <span>Reply within 24 hours · written, by a principal</span>
          </div>

          <h1>Tell us what you&apos;re actually building.</h1>

          <p>
            <strong>A principal reads every inbound.</strong> Within 24 hours you&apos;ll get either a scoping call slot, a written here&apos;s why we&apos;re wrong for this reply, or a referral to someone better suited. No sales flow, no nurture sequence, no demo request.
          </p>

          <div className="contact-page__meta">
            <div>
              <span>Principal intake</span>
              <a href="mailto:contact@thatsoftwarehouse.com">contact@thatsoftwarehouse.com</a>
            </div>
            <div>
              <span>Healthcare leads</span>
              <a href="mailto:contact@thatsoftwarehouse.com">contact@thatsoftwarehouse.com</a>
            </div>
            <div>
              <span>Austin studio</span>
              <strong>1208 E 6th St, Suite 210<br />Austin, TX 78702</strong>
            </div>
            <div>
              <span>SF studio</span>
              <strong>482 Valencia St, Floor 3<br />San Francisco, CA 94103</strong>
            </div>
          </div>
        </div>

        <form
          className="contact-form-card"
          name="principal-intake"
          onSubmit={handleSubmit}
          data-netlify="true"
          data-netlify-honeypot="bot-field"
        >
          <input type="hidden" name="form-name" value="principal-intake" />
          <input type="hidden" name="domains" value={domains.join(', ')} />
          <input type="hidden" name="engagement_shape" value={shapes.join(', ')} />
          <input type="hidden" name="budget_ceiling" value={budget} />
          <p hidden>
            <label>
              Do not fill this out: <input name="bot-field" />
            </label>
          </p>

          <div className="contact-form-card__head">
            <span>/ intake form</span>
            <span className="studio-pill studio-pill--live">
              <span className="studio-pill__dot" />
              Accepting · Q3
            </span>
          </div>

          <div className="contact-form-card__grid">
            <div>
              <label>Your name *</label>
              <input type="text" name="name" placeholder="Jane Doe" required />
            </div>
            <div>
              <label>Founder email *</label>
              <input type="email" name="email" placeholder="jane@company.com" required />
            </div>
          </div>

          <div className="contact-form-card__grid">
            <div>
              <label>Company</label>
              <input type="text" name="company" placeholder="Company, Inc." />
            </div>
            <div>
              <label>Stage</label>
              <input type="text" name="stage" placeholder="Pre-seed / Seed / A / B" />
            </div>
          </div>

          <div className="contact-form-card__row">
            <label>Domain</label>
            <div className="contact-chip-group">
              {domainOptions.map((option) => {
                const selected = domains.includes(option);
                return (
                  <button
                    key={option}
                    type="button"
                    className={`contact-chip${selected ? ' contact-chip--selected' : ''}`}
                    onClick={() => toggleSelection(option, setDomains, domains)}
                  >
                    <span className="contact-chip__dot" />
                    {option}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="contact-form-card__row">
            <label>What are you trying to ship? *</label>
            <textarea
              name="ask"
              placeholder="One paragraph. What it does, who uses it, what happens if you do not ship it in the next quarter."
              required
            />
          </div>

          <div className="contact-form-card__row">
            <label>Engagement shape</label>
            <div className="contact-chip-group">
              {shapeOptions.map((option) => {
                const selected = shapes.includes(option);
                return (
                  <button
                    key={option}
                    type="button"
                    className={`contact-chip${selected ? ' contact-chip--selected' : ''}`}
                    onClick={() => toggleSelection(option, setShapes, shapes)}
                  >
                    <span className="contact-chip__dot" />
                    {option}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="contact-form-card__row">
            <label>Budget ceiling</label>
            <div className="contact-chip-group">
              {budgetOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`contact-chip${budget === option ? ' contact-chip--selected' : ''}`}
                  onClick={() => setBudget(option)}
                >
                  <span className="contact-chip__dot" />
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="contact-form-card__submit">
            <button 
              type="submit" 
              className="studio-button studio-button--primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Send to a principal'}
              {!isSubmitting && <span className="studio-button__arrow" aria-hidden="true">↗</span>}
            </button>
            <div>By sending this you agree we&apos;ll reply within 24h. No mailing list. No CRM.</div>
          </div>
        </form>
      </section>

      <section className="contact-next studio-section-shell">
        <div>
          <div className="eyebrow">
            <span className="eyebrow__bar" />
            <span className="eyebrow__tag">[ Process ]</span>
          </div>
          <h2>What happens after you hit send.</h2>
        </div>
        <div className="contact-next__list">
          <div className="contact-next__row">
            <div>T+0</div>
            <div>A principal reads it.<span>Marek, Sana, Rhea, or Jon depending on the domain. Not a router, not an SDR.</span></div>
            <strong>Within 4 hours · business day</strong>
          </div>
          <div className="contact-next__row">
            <div>T+1d</div>
            <div>You get a written reply.<span>Either a 30-minute slot, a here&apos;s why not, or a referral. The reply is written, not a calendar link.</span></div>
            <strong>Within 24 hours</strong>
          </div>
          <div className="contact-next__row">
            <div>T+1w</div>
            <div>30-minute scoping call.<span>No deck. You walk us through the actual problem. We tell you what we&apos;d do and what we would not.</span></div>
            <strong>Video · 30 min</strong>
          </div>
          <div className="contact-next__row">
            <div>T+2w</div>
            <div>Either a diligence SOW or a pass.<span>If we&apos;re in, you get a fixed-fee diligence SOW in your inbox the day after the call. If not, you get the reason.</span></div>
            <strong>Fixed fee · $18k</strong>
          </div>
        </div>
      </section>

      <div className="studio-page-meta">
        <div className="studio-page-meta__left">
          <span><span className="studio-page-meta__label">IDX</span> 05 / Contact</span>
          <span><span className="studio-page-meta__label">REV</span> 2026.04.17</span>
          <span><span className="studio-page-meta__label">SLA</span> 24h written reply</span>
        </div>
        <div>Principal intake ↗</div>
      </div>
    </div>
  );
};

export default Contact;
