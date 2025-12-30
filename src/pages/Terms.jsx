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
            <p className="terms-updated">Last updated November 12, 2025</p>
          </div>

          <section className="terms-section">
            <h3 className="terms-section-title">1. Agreement to Terms</h3>
            <p>
              These Terms of Use (the "Terms") govern your access to and use of the websites, products,
              and services provided by That Software House ("TSH," "we," "us," "our"), including
              <a href="https://www.thatsoftwarehouse.com" className="terms-link"> https://www.thatsoftwarehouse.com</a>
              and any related pages, content, or applications (collectively, the "Services"). By accessing
              or using the Services, you agree to these Terms. If you do not agree, do not use the Services.
            </p>
            <p>
              If you or your company have a signed master services agreement, statement of work, order form,
              business associate agreement, or similar document with TSH (each, an "MSA" or "SOW"), that agreement
              controls where it conflicts with these Terms.
            </p>
            <p>
              You can contact us by email at <a href="mailto:contact@thatsoftwarehouse.com" className="terms-link">contact@thatsoftwarehouse.com</a>.
            </p>
          </section>

          <section className="terms-section">
            <h3 className="terms-section-title">2. Who May Use the Services</h3>
            <p>
              You must be at least 18 years old and able to form a binding contract. You may use the Services only in
              compliance with these Terms and applicable law, including export control and sanctions laws. If you use
              the Services on behalf of a business, you represent that you have authority to bind that business, and
              "you" will refer to that business.
            </p>
          </section>

          <section className="terms-section">
            <h3 className="terms-section-title">3. Changes to the Services or These Terms</h3>
            <p>
              We may change, suspend, or discontinue any part of the Services at any time. We may update these Terms
              from time to time. If a change is material, we will provide notice by posting the new Terms on the site
              and updating the effective date above. Continued use after the effective date means you accept the changes.
            </p>
          </section>

          <section className="terms-section">
            <h3 className="terms-section-title">4. Accounts and Security</h3>
            <ul className="terms-list">
              <li>You are responsible for the confidentiality of your credentials and for all activity under your account.</li>
              <li>Notify us immediately at <a href="mailto:contact@thatsoftwarehouse.com" className="terms-link">contact@thatsoftwarehouse.com</a> if you suspect unauthorized access.</li>
              <li>We may disable or restrict accounts that violate these Terms.</li>
            </ul>
          </section>

          <section className="terms-section">
            <h3 className="terms-section-title">5. Scope of Services</h3>
            <p>
              The public site provides general information about TSH. It is not engineering, legal, medical, or financial advice.
              Professional services such as design, development, research, consulting, integrations, and AI features are provided
              under a SOW or MSA that defines scope, fees, milestones, assumptions, and deliverables. Any features labeled alpha,
              beta, preview, or experimental are provided as-is and may be rate-limited or withdrawn.
            </p>
          </section>

          <section className="terms-section">
            <h3 className="terms-section-title">6. Quotes, Fees, and Payments</h3>
            <ul className="terms-list">
              <li>Any quotes are estimates unless a SOW states otherwise.</li>
              <li>Fees, timing, and expenses are defined in the applicable SOW or order. Unless stated otherwise, invoices are due net 15 days.</li>
              <li>Late amounts may accrue a 1.5% monthly charge or the maximum allowed by law.</li>
              <li>Prices exclude taxes. You are responsible for applicable taxes except those based on TSH’s net income.</li>
              <li>No refunds except as required by law or expressly stated in a SOW.</li>
            </ul>
          </section>

          <section className="terms-section">
            <h3 className="terms-section-title">7. Client Responsibilities</h3>
            <ul className="terms-list">
              <li>Provide timely access to information, systems, and personnel, and make decisions promptly.</li>
              <li>Ensure you have and maintain rights to all data, content, and third-party tools you ask us to use.</li>
              <li>Security and compliance outcomes depend on your configurations, vendors, and internal controls. You remain the data controller and system owner.</li>
            </ul>
          </section>

          <section className="terms-section">
            <h3 className="terms-section-title">8. Intellectual Property</h3>
            <p><strong>Pre‑existing IP.</strong> Each party keeps all rights in pre‑existing materials, tools, frameworks, and know‑how.</p>
            <p><strong>Deliverables.</strong> Unless a SOW says otherwise, upon full payment TSH assigns to you all right, title, and interest in custom deliverables we create specifically for you under a SOW, excluding TSH Tools.</p>
            <p><strong>TSH Tools.</strong> “TSH Tools” means our pre‑existing or generic components, libraries, templates, scripts, and processes used across projects. We grant you a perpetual, worldwide, nonexclusive, royalty‑free license to use TSH Tools as embedded in the deliverables for your internal business. You may not sell or license TSH Tools separately.</p>
            <p><strong>Open source.</strong> Deliverables may include open source software governed by its own licenses. You agree to comply with those licenses.</p>
            <p><strong>Feedback.</strong> If you give us feedback, you grant TSH a perpetual, worldwide, irrevocable, royalty‑free license to use it without restriction.</p>
          </section>

          <section className="terms-section">
            <h3 className="terms-section-title">9. User Content and Portfolio Rights</h3>
            <p>
              You retain ownership of content you upload or provide. You grant TSH a limited license to host, copy, process, and display that content to
              provide the Services and the work under a SOW. Unless your SOW says otherwise, you grant TSH the right to reference your company name and
              logo and to showcase non‑sensitive, non‑confidential portions of the work after public launch. You may withdraw this permission by emailing
              <a href="mailto:contact@thatsoftwarehouse.com" className="terms-link"> contact@thatsoftwarehouse.com</a>.
            </p>
          </section>

          <section className="terms-section">
            <h3 className="terms-section-title">10. Confidentiality</h3>
            <p>
              "Confidential Information" means nonpublic information disclosed by one party to the other that is marked confidential or that should reasonably
              be considered confidential. The receiving party will use reasonable care to protect the disclosing party’s Confidential Information and will use
              it only to provide or receive the Services. Exclusions include information that is public, already known, independently developed, or lawfully
              obtained from someone else. If required by law, the receiving party may disclose Confidential Information after giving reasonable notice to allow
              the disclosing party to seek protection if legally permitted. Upon request, return or destroy Confidential Information, subject to archival copies
              kept for legal compliance or backup.
            </p>
          </section>

          <section className="terms-section">
            <h3 className="terms-section-title">11. Privacy and Data Protection</h3>
            <ul className="terms-list">
              <li>Our handling of personal information is described in our Privacy Policy, which is incorporated by reference.</li>
              <li>HIPAA: TSH is not a HIPAA "business associate" unless and until both parties execute a Business Associate Agreement. Do not share PHI unless a BAA is in place.</li>
              <li>Data Processing: If the Services involve processing personal data of individuals from the EEA, UK, or similar jurisdictions, a data processing agreement will apply.</li>
              <li>Security: We use reasonable administrative, technical, and physical safeguards appropriate to the nature of the data and Services. No method of transmission or storage is perfectly secure.</li>
            </ul>
          </section>

          <section className="terms-section">
            <h3 className="terms-section-title">12. Third‑Party Services and Links</h3>
            <p>
              The Services may interoperate with third‑party services or include links. TSH does not control third parties and is not responsible for their
              actions, terms, or privacy practices. Your use of third‑party services is governed by their terms.
            </p>
          </section>

          <section className="terms-section">
            <h3 className="terms-section-title">13. Acceptable Use</h3>
            <p>You will not:</p>
            <ul className="terms-list">
              <li>violate law or infringe others’ rights;</li>
              <li>upload malware, attempt to gain unauthorized access, or disrupt the Services;</li>
              <li>reverse engineer or access the Services to build a competing product;</li>
              <li>use the Services for high‑risk activities where failure could result in death, personal injury, or environmental damage;</li>
              <li>misrepresent your identity or affiliation.</li>
            </ul>
          </section>

          <section className="terms-section">
            <h3 className="terms-section-title">14. AI and Automated Features</h3>
            <ul className="terms-list">
              <li>Some Services or deliverables may use AI models provided by third parties. Outputs can be inaccurate or incomplete and should be reviewed by humans before relying on them.</li>
              <li>You are responsible for how AI outputs are used in your products, including meeting legal, regulatory, and ethical requirements and obtaining any necessary rights to training data or prompts you supply.</li>
              <li>Where we fine‑tune or connect models to your data, you authorize the required processing and warrant you have the right to do so.</li>
            </ul>
          </section>

          <section className="terms-section">
            <h3 className="terms-section-title">15. No Professional Advice</h3>
            <p>
              The Services and any materials are for general information. TSH does not provide legal, medical, accounting, or investment advice. You should
              consult qualified professionals for such advice.
            </p>
          </section>

          <section className="terms-section">
            <h3 className="terms-section-title">16. Disclaimers</h3>
            <p>
              The Services are provided "as is" and "as available." To the maximum extent permitted by law, TSH disclaims all warranties, express or implied,
              including merchantability, fitness for a particular purpose, noninfringement, and uninterrupted or error‑free operation. We do not guarantee
              specific outcomes, revenue, valuations, fundraising success, search rankings, or uptime unless expressly stated in a SOW.
            </p>
          </section>

          <section className="terms-section">
            <h3 className="terms-section-title">17. Limitation of Liability</h3>
            <p>
              To the maximum extent permitted by law: (a) TSH will not be liable for indirect, incidental, special, consequential, exemplary, or punitive damages,
              or lost profits, revenues, or data; and (b) TSH’s total liability for all claims in the aggregate will not exceed the amounts you paid to TSH for
              the Services giving rise to the claim in the 6 months before the event. These limits apply even if we were advised of the possibility of damages
              and even if a remedy fails its essential purpose. Some jurisdictions do not allow certain limits, so some of the above may not apply.
            </p>
          </section>

          <section className="terms-section">
            <h3 className="terms-section-title">18. Indemnification</h3>
            <p>
              You will defend, indemnify, and hold harmless TSH and our officers, directors, employees, and agents from and against all third‑party claims,
              losses, liabilities, damages, costs, and expenses (including reasonable attorneys’ fees) arising out of or related to your content, your use
              of the Services, your violation of these Terms, or your violation of law.
            </p>
          </section>

          <section className="terms-section">
            <h3 className="terms-section-title">19. Non‑Solicitation</h3>
            <p>
              If we provide professional services to you, you agree that during the engagement and for 12 months after it ends, you will not directly solicit
              for employment any TSH personnel who worked on your project, except through general job postings. If local law limits this clause, it will be
              enforced to the maximum permitted extent.
            </p>
          </section>

          <section className="terms-section">
            <h3 className="terms-section-title">20. Term and Termination</h3>
            <p>
              These Terms remain effective while you use the Services. We may suspend or terminate access at any time if you violate these Terms, if required
              by law, or for risk management. Upon termination, your right to use the Services ends. Sections that by their nature should survive will survive,
              including 8 through 24.
            </p>
          </section>

          <section className="terms-section">
            <h3 className="terms-section-title">21. DMCA Notice</h3>
            <p>
              If you believe your copyright has been infringed, send a notice that complies with 17 U.S.C. § 512 to:
              <br />
              DMCA Agent, That Software House, email: <a href="mailto:contact@thatsoftwarehouse.com" className="terms-link">contact@thatsoftwarehouse.com</a>.
            </p>
            <p>
              Your notice must include the information required by the DMCA. We may remove content and terminate repeat infringers in appropriate circumstances.
            </p>
          </section>

          <section className="terms-section">
            <h3 className="terms-section-title">22. Export and Sanctions Compliance</h3>
            <p>
              You may not use the Services if you are located in, or are a resident of, a country or region subject to comprehensive U.S. sanctions, or if you
              are on any U.S. government restricted list. You agree to comply with all export control and sanctions laws.
            </p>
          </section>

          <section className="terms-section">
            <h3 className="terms-section-title">23. U.S. Government End Users</h3>
            <p>
              The Services are "commercial items" as defined in 48 C.F.R. 2.101. Use, duplication, or disclosure by the U.S. Government is subject to the
              restrictions in 48 C.F.R. 12.212 or 48 C.F.R. 227.7202, as applicable.
            </p>
          </section>

          <section className="terms-section">
            <h3 className="terms-section-title">24. Governing Law and Dispute Resolution</h3>
            <p><strong>Governing law.</strong> These Terms are governed by the laws of the State of California, without regard to conflict of laws rules.</p>
            <p>
              <strong>Arbitration.</strong> Any dispute arising out of or related to these Terms or the Services will be resolved by binding arbitration
              administered by JAMS under its Streamlined Rules. The seat of arbitration will be San Francisco, California. Either party may seek provisional
              relief in court to protect rights pending arbitration.
            </p>
            <p><strong>Class action waiver.</strong> Disputes must be brought on an individual basis. No class, consolidated, or representative proceedings.</p>
            <p>
              <strong>Opt‑out.</strong> You may opt out of arbitration within 30 days after you first accept these Terms by sending written notice to
              <a href="mailto:contact@thatsoftwarehouse.com" className="terms-link"> contact@thatsoftwarehouse.com</a> with subject line "Arbitration Opt Out" and your full name and address.
            </p>
          </section>

          <section className="terms-section">
            <h3 className="terms-section-title">25. Miscellaneous</h3>
            <ul className="terms-list">
              <li><strong>Assignment.</strong> You may not assign these Terms without our prior written consent. We may assign to an affiliate or in connection with a merger, acquisition, or sale of assets.</li>
              <li><strong>Force majeure.</strong> Neither party is liable for delays or failures caused by events beyond reasonable control.</li>
              <li><strong>Notices.</strong> Notices to TSH must be sent to <a href="mailto:contact@thatsoftwarehouse.com" className="terms-link">contact@thatsoftwarehouse.com</a>.</li>
              <li><strong>Entire agreement.</strong> These Terms and any referenced policies are the entire agreement for your use of the Services.</li>
              <li><strong>Severability.</strong> If a provision is invalid, the remainder remains in effect.</li>
              <li><strong>No waiver.</strong> Failure to enforce a provision is not a waiver.</li>
              <li><strong>Headings.</strong> Headings are for convenience only.</li>
            </ul>
          </section>

          <section className="terms-section">
            <h3 className="terms-section-title">Contact</h3>
            <p>
              For questions about these Terms, email <a href="mailto:contact@thatsoftwarehouse.com" className="terms-link">contact@thatsoftwarehouse.com</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Terms;
