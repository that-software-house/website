import React from 'react';
import './Terms.css';

const Privacy = () => {
  return (
    <div className="terms-page">
      <div className="terms-container">
        <div className="terms-sidebar">
          <h1 className="terms-sidebar-title">Privacy Policy</h1>
        </div>

        <div className="terms-content">
          <div className="terms-header">
            <h2 className="terms-main-title">PRIVACY POLICY</h2>
            <p className="terms-updated">Effective Date: January 28, 2026</p>
          </div>

          <section className="terms-section">
            <p>
              This Privacy Policy ("Policy") describes how That Software House, Inc. ("TSH," "we," "us," "our")
              collects, uses, discloses, and protects personal data when you visit and interact with our website at
              <a href="https://thatsoftwarehouse.com" className="terms-link"> https://thatsoftwarehouse.com</a> ("Site")
              and related services. This Policy also explains your rights related to your personal data under applicable
              laws including the EU General Data Protection Regulation (GDPR) and other global privacy laws.
            </p>
            <p>
              By accessing or using our Site, you agree that your personal data will be handled as described in this Policy.
            </p>
          </section>

          <section className="terms-section">
            <h3 className="terms-section-title">1. Controller</h3>
            <p><strong>Data Controller:</strong></p>
            <p>
              That Software House, Inc.
              <br />
              Address: Austin, TX, USA (with office presence listed in San Francisco, CA, USA)
              <br />
              Email: <a href="mailto:contact@thatsoftwarehouse.com" className="terms-link">contact@thatsoftwarehouse.com</a>
            </p>
            <p>
              If you are a resident of the European Union or European Economic Area (EU/EEA), TSH acts as the controller
              of your personal data for purposes of the GDPR.
            </p>
          </section>

          <section className="terms-section">
            <h3 className="terms-section-title">2. Information We Collect</h3>
            <p>
              We collect personal data that you voluntarily provide to us and data collected automatically when you use the Site.
            </p>

            <p><strong>A. Personal Data You Provide</strong></p>
            <p>You may choose to provide personal data when you:</p>
            <ul className="terms-list">
              <li>Sign up for newsletters or mailing lists</li>
              <li>Contact us via forms, email, or chat</li>
              <li>Submit comments or feedback</li>
            </ul>

            <p>Typical personal data includes:</p>
            <ul className="terms-list">
              <li>Name</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Company name or job title</li>
              <li>Website or URL</li>
              <li>Any message you submit</li>
            </ul>

            <p><strong>B. Automatically Collected Data</strong></p>
            <p>
              We collect information automatically when you visit the Site through cookies, analytics, and tracking
              technologies. This may include:
            </p>
            <ul className="terms-list">
              <li>IP address</li>
              <li>Browser and device information</li>
              <li>Pages visited and time spent</li>
              <li>Referrer URLs and navigation paths</li>
            </ul>
            <p>This information may be aggregated or anonymized.</p>
          </section>

          <section className="terms-section">
            <h3 className="terms-section-title">3. Cookies and Tracking Technologies</h3>
            <p>
              We use cookies and similar technologies to operate and improve the Site, understand usage patterns, and
              deliver content and analytics. Some cookies are required for the Site to function, while others help with
              analytics or marketing. You will be asked to consent to non-essential cookies before they are used. You
              can change cookie preferences at any time through our cookie banner or browser settings.
            </p>
          </section>

          <section className="terms-section">
            <h3 className="terms-section-title">4. How We Use Your Information</h3>
            <p>We use personal data for the following purposes:</p>
            <ul className="terms-list">
              <li>Provide, maintain, and improve the Site</li>
              <li>Respond to inquiries and communicate with you</li>
              <li>Send newsletters or updates if you opted in</li>
              <li>Analyze usage patterns to improve user experience</li>
              <li>Comply with legal obligations</li>
            </ul>
            <p>
              We do not use your personal data for personal profiling, automated decision-making, or unrelated marketing
              without your explicit consent.
            </p>
          </section>

          <section className="terms-section">
            <h3 className="terms-section-title">5. Legal Bases for Processing (GDPR)</h3>
            <p>
              If you are located in the EU/EEA or UK, we rely on the following legal bases to process your personal data:
            </p>
            <ul className="terms-list">
              <li><strong>Consent:</strong> Where you have given clear consent (e.g., newsletter subscription)</li>
              <li><strong>Contractual Necessity:</strong> To respond to your inquiries or provide services</li>
              <li><strong>Legitimate Interests:</strong> To analyze usage data, protect the Site, or communicate administrative information (balancing test applied)</li>
            </ul>
            <p>You may withdraw consent at any time where processing is based on consent.</p>
          </section>

          <section className="terms-section">
            <h3 className="terms-section-title">6. Sharing and Disclosure</h3>
            <p>We may share personal data with:</p>
            <ul className="terms-list">
              <li>Service providers who support our Site operations (e.g., hosting, mailing platforms)</li>
              <li>Legal authorities when required by law or to protect legal rights</li>
              <li>Acquirers or successors if TSH is involved in a merger, acquisition, or sale of assets</li>
            </ul>
            <p>We do not sell your personal data to third parties.</p>
          </section>

          <section className="terms-section">
            <h3 className="terms-section-title">7. International Data Transfers</h3>
            <p>
              Your information may be transferred to and processed in countries outside your own, including the United
              States. Where required by law (for example GDPR), we put in place safeguards such as standard contractual
              clauses to protect your data when transferred internationally.
            </p>
          </section>

          <section className="terms-section">
            <h3 className="terms-section-title">8. Data Retention</h3>
            <p>
              We retain personal data only as long as necessary to fulfill the purposes outlined in this Policy, comply
              with legal obligations, resolve disputes, and enforce agreements.
            </p>
            <p>Retention may vary based on:</p>
            <ul className="terms-list">
              <li>The type of data</li>
              <li>The purpose of processing</li>
              <li>Legal or regulatory requirements</li>
            </ul>
          </section>

          <section className="terms-section">
            <h3 className="terms-section-title">9. Your Rights (GDPR and Other Laws)</h3>
            <p>Depending on your location, you may have rights regarding your personal data, including:</p>
            <ul className="terms-list">
              <li><strong>Access:</strong> Request a copy of your data</li>
              <li><strong>Correction:</strong> Fix inaccurate or incomplete data</li>
              <li><strong>Deletion:</strong> Ask to erase your data</li>
              <li><strong>Restriction:</strong> Limit how we process your data</li>
              <li><strong>Data Portability:</strong> Receive your data in a machine-readable format</li>
              <li><strong>Object:</strong> Object to processing based on legitimate interests</li>
              <li><strong>Withdraw Consent:</strong> Where processing is consent-based</li>
            </ul>
            <p>
              To exercise these rights, contact us at
              <a href="mailto:contact@thatsoftwarehouse.com" className="terms-link"> contact@thatsoftwarehouse.com</a>.
              We will respond in accordance with applicable law.
            </p>
          </section>

          <section className="terms-section">
            <h3 className="terms-section-title">10. Children's Privacy</h3>
            <p>
              Our Site is not directed to children under 16 years of age, and we do not knowingly collect personal data
              from children. If we learn personal data has been collected from a child under 16, we will take steps to
              delete it.
            </p>
          </section>

          <section className="terms-section">
            <h3 className="terms-section-title">11. Security</h3>
            <p>
              We implement reasonable technical and organizational measures to protect personal data from unauthorized
              access, loss, misuse, or alteration. These measures are reviewed periodically and updated as required.
            </p>
            <p>
              However, no method of transmission or storage is 100% secure, so absolute security cannot be guaranteed.
            </p>
          </section>

          <section className="terms-section">
            <h3 className="terms-section-title">12. Updates to This Policy</h3>
            <p>
              We may update this Policy from time to time to reflect changes in our practices or applicable laws. We
              will post the updated Policy on the Site with a revised Effective Date.
            </p>
          </section>

          <section className="terms-section">
            <h3 className="terms-section-title">13. Contact Us</h3>
            <p>
              If you have questions, requests, or concerns about this Privacy Policy or our data practices, please reach out:
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

export default Privacy;
