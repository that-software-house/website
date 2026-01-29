import React from 'react';
import './Terms.css';

const Terms = () => {
  return (
    <div className="terms-page">
      <div className="terms-container">
        <div className="terms-sidebar">
          <h1 className="terms-sidebar-title">Terms of Use</h1>
        </div>

        <div className="terms-content">
          <div className="terms-header">
            <h2 className="terms-main-title">TERMS OF USE</h2>
            <p className="terms-updated">Last Updated: January 28, 2026</p>
            <p className="terms-updated">Effective Date: January 28, 2026</p>
          </div>

          <section className="terms-section">
            <p>
              These Terms of Use ("Terms") govern your access to and use of the website
              <a href="https://thatsoftwarehouse.com" className="terms-link"> https://thatsoftwarehouse.com</a> ("Site"),
              operated by That Software House, Inc. ("TSH," "we," "us," "our"). By accessing or using the Site, you agree
              to be bound by these Terms. If you don't agree with these Terms, do not use this Site.
            </p>
          </section>

          <section className="terms-section">
            <h3 className="terms-section-title">1. Eligibility</h3>
            <p>
              You must be at least 18 years old and capable of forming a binding legal agreement to use the Site.
            </p>
          </section>

          <section className="terms-section">
            <h3 className="terms-section-title">2. Acceptance of Terms</h3>
            <p>
              Your access and use of the Site means you accept these Terms. We may modify these Terms at any time,
              with changes effective upon posting. Continued use constitutes acceptance of updated Terms.
            </p>
          </section>

          <section className="terms-section">
            <h3 className="terms-section-title">3. Use of the Site</h3>
            <p>You agree to use the Site for lawful purposes only. You may not:</p>
            <ul className="terms-list">
              <li>Interfere with the Site's operation or security.</li>
              <li>Use automation (bots, scrapers, etc.) without our written permission.</li>
              <li>Misrepresent your identity or affiliation.</li>
            </ul>
          </section>

          <section className="terms-section">
            <h3 className="terms-section-title">4. Ownership / Intellectual Property</h3>
            <p>
              All Site content, including text, images, audio, video, code, design, and trademarks, remain the property
              of TSH or our licensors. You may access and view content for personal, non-commercial use only. Any other
              reuse (including reproduction, distribution, modification, or commercial use) is prohibited without our
              express written permission.
            </p>
          </section>

          <section className="terms-section">
            <h3 className="terms-section-title">5. User Content</h3>
            <p>
              If you submit content (feedback, comments, questions), you grant TSH a worldwide, royalty-free, perpetual,
              irrevocable license to use, store, and display that content. You represent that such content doesn't violate
              third-party rights or laws.
            </p>
          </section>

          <section className="terms-section">
            <h3 className="terms-section-title">6. Links to Third-Party Sites</h3>
            <p>
              The Site may include links to third-party websites. These links are for convenience only and do not imply
              endorsement. TSH is not responsible for third-party content, privacy practices, or terms.
            </p>
          </section>

          <section className="terms-section">
            <h3 className="terms-section-title">7. Cookies and Tracking Technologies</h3>
            <p>
              We use cookies and similar technologies to operate the Site and to collect certain information about you.
            </p>
            <p>
              Under EU law, cookies that are not "strictly necessary" require your prior consent, and you must be provided
              with clear information about what data they collect before they are placed on your device.
            </p>
            <p>
              Your continued use of the Site after cookie settings are made available to you constitutes consent to our
              use of cookies as outlined.
            </p>
          </section>

          <section className="terms-section">
            <h3 className="terms-section-title">8. EU/GDPR-Relevant Data Processing Acknowledgment</h3>
            <p>
              If you are located in the European Union, European Economic Area, or UK, the General Data Protection
              Regulation ("GDPR") may apply to certain personal data processing activities undertaken by TSH in
              connection with your use of this Site.
            </p>
            <p>
              We will process personal data in accordance with our Privacy Policy (linked below), which includes:
            </p>
            <ul className="terms-list">
              <li>The identity and contact details of the controller and, where applicable, TSH's representative in the EU.</li>
              <li>A description of categories of personal data collected.</li>
              <li>The legal basis for processing (e.g., consent, legitimate interest, contractual necessity).</li>
              <li>Recipients of personal data (if any).</li>
              <li>The retention period or criteria used to determine that period.</li>
              <li>Information on data subject rights, including access, correction, erasure, restriction, objection, and portability.</li>
              <li>Contact details for complaints and supervisory authorities.</li>
            </ul>
            <p>
              <strong>Important:</strong> These Terms must be read together with our Privacy Policy, which explains how
              personal data are collected, used, shared, and safeguarded. The Privacy Policy also identifies how you may
              exercise data subject rights under the GDPR.
            </p>
          </section>

          <section className="terms-section">
            <h3 className="terms-section-title">9. Privacy Policy</h3>
            <p>
              Your use of the Site is also governed by our Privacy Policy, which you can find here:
              <a href="/privacy-policy" className="terms-link"> https://thatsoftwarehouse.com/privacy-policy</a>
            </p>
            <p>
              This Privacy Policy explains how TSH collects, uses, retains, discloses, and protects personal data.
            </p>
          </section>

          <section className="terms-section">
            <h3 className="terms-section-title">10. Disclaimers</h3>
            <p>
              The Site and all content are provided "as is," without warranties, express or implied, including accuracy,
              completeness, or fitness for a particular purpose.
            </p>
          </section>

          <section className="terms-section">
            <h3 className="terms-section-title">11. Limitation of Liability</h3>
            <p>
              To the fullest extent permitted by law, TSH and its affiliates will not be liable for any direct, indirect,
              incidental, consequential, or punitive damages arising from your use of the Site.
            </p>
          </section>

          <section className="terms-section">
            <h3 className="terms-section-title">12. Indemnity</h3>
            <p>
              You agree to indemnify and hold TSH and its officers, directors, employees, and agents harmless from any
              claims, damages, losses, or expenses arising from your use of the Site or violation of these Terms.
            </p>
          </section>

          <section className="terms-section">
            <h3 className="terms-section-title">13. Governing Law and Jurisdiction</h3>
            <p>
              These Terms are governed by the laws of the State of California (USA). Any dispute arising from these Terms
              will be resolved exclusively in courts located in San Francisco County, California.
            </p>
          </section>

          <section className="terms-section">
            <h3 className="terms-section-title">14. Termination</h3>
            <p>
              We may suspend or terminate your access to the Site at any time for any reason, without notice or liability.
            </p>
          </section>

          <section className="terms-section">
            <h3 className="terms-section-title">15. Contact</h3>
            <p>
              If you have questions about these Terms or your personal data, contact:
            </p>
            <p>
              <strong>That Software House, Inc.</strong>
              <br />
              Email: <a href="mailto:contact@thatsoftwarehouse.com" className="terms-link">contact@thatsoftwarehouse.com</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Terms;
