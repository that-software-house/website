import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSEO } from '@/hooks/useSEO';
import './AiLab.css';

const personas = {
  cpa: {
    name: 'CPA Receptionist',
    firm: 'Miller & Associates',
    context: 'Tax advisory, S-Corp filings, and general financial planning.',
    questions: [
      'What is the deadline for S-Corp filings?',
      'How much do you charge for a consultation?',
      'Can you help me with a back-tax audit?'
    ],
    responses: {
      'What is the deadline for S-Corp filings?': 'For 2024, the deadline for S-Corp (Form 1120-S) filings is March 15th. However, if you need an extension, we can file Form 7004 to push that to September 15th. Would you like me to schedule a 15-min call with Rohit to discuss your specific filing?',
      'How much do you charge for a consultation?': 'Miller & Associates offers a complimentary 20-minute initial discovery call. After that, our standard hourly rate for tax advisory is $275. Shall I book you for a discovery call this week?',
      'Can you help me with a back-tax audit?': 'Yes, we specialize in IRS audit representation for back-taxes. I can pull our "Audit Readiness" checklist for you right now, or I can notify Ash (our lead CPA) to reach out to you directly. Which do you prefer?'
    }
  },
  law: {
    name: 'Legal Intake Assistant',
    firm: 'Sterling Legal Group',
    context: 'Family law, estate planning, and civil litigation.',
    questions: [
      'Do you offer free consultations for divorce cases?',
      'What documents do I need for my estate plan?',
      'Can you represent me in a small claims court?'
    ],
    responses: {
      'Do you offer free consultations for divorce cases?': 'Sterling Legal Group offers a flat-fee initial consultation of $150 for family law matters. This ensures you get dedicated time with a senior attorney. We have availability on Tuesday at 2 PM. Does that work for you?',
      'What documents do I need for my estate plan?': 'Typically, we recommend gathering your current asset list, life insurance policies, and any previous wills. I can email you our "Estate Planning Intake PDF" right now. Should I send it to the email on file?',
      'Can you represent me in a small claims court?': 'While we primarily handle larger civil litigation and estate matters, we can provide a "Small Claims Coaching" session for a fixed fee of $500. This helps you prepare your evidence for the judge. Would you like to learn more?'
    }
  }
};

const AiLab = () => {
  const [activePersona, setActivePersona] = useState('cpa');
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  useSEO({
    title: 'AI Lab | That Software House',
    description: 'Interactive demo of TSH AI Receptionists for CPAs, Lawyers, and SMBs.',
    keywords: 'AI receptionist demo, legal intake AI, CPA chatbot, RAG demo, business automation',
    canonicalUrl: 'https://thatsoftwarehouse.com/ai-lab',
  });

  const handleQuestion = (q) => {
    setCurrentQuestion(q);
    setIsTyping(true);
    
    // Add user question to chat
    const newChat = [...chatHistory, { type: 'user', text: q }];
    setChatHistory(newChat);

    // Simulate AI response delay
    setTimeout(() => {
      const response = personas[activePersona].responses[q] || "I'm sorry, I don't have that specific info in my knowledge vault yet, but I can notify the team to get back to you!";
      setChatHistory([...newChat, { type: 'ai', text: response }]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="studio-page ai-lab-page">
      <section className="studio-page-hero studio-section-shell">
        <div className="ai-lab-hero">
          <div className="eyebrow">
            <span className="eyebrow__bar" />
            <span className="eyebrow__tag">[ 00 / The Lab ]</span>
            <span>Interactive AI Receptionist Demo</span>
          </div>
          <h1>Experience the <em>RAG-driven</em> difference.</h1>
          <p className="hero-sub">
            Our AI receptionists don't just "chat." They pull from your firm's private knowledge vault to provide accurate, high-stakes answers 24/7.
          </p>
        </div>
      </section>

      <section className="ai-lab-interactive studio-section-shell">
        <div className="lab-grid">
          {/* Left: Configuration */}
          <div className="lab-config">
            <div className="section-label">Select Persona</div>
            <div className="persona-switcher">
              <button 
                className={activePersona === 'cpa' ? 'active' : ''} 
                onClick={() => { setActivePersona('cpa'); setChatHistory([]); }}
              >
                CPA / Accounting
              </button>
              <button 
                className={activePersona === 'law' ? 'active' : ''} 
                onClick={() => { setActivePersona('law'); setChatHistory([]); }}
              >
                Law Firm / Legal
              </button>
            </div>

            <div className="section-label">Knowledge Context</div>
            <div className="context-card">
              <h3>{personas[activePersona].firm}</h3>
              <p>{personas[activePersona].context}</p>
              <div className="rag-status">
                <span className="status-dot"></span> 
                RAG Vault Loaded: 1,400+ Documents
              </div>
            </div>

            <div className="section-label">Ask a Sample Question</div>
            <div className="sample-questions">
              {personas[activePersona].questions.map((q) => (
                <button key={q} onClick={() => handleQuestion(q)} disabled={isTyping}>
                  {q} ↗
                </button>
              ))}
            </div>
          </div>

          {/* Right: The Chat Window */}
          <div className="lab-demo">
            <div className="chat-window">
              <div className="chat-header">
                <div className="header-info">
                  <span className="online-dot"></span>
                  <strong>{personas[activePersona].name}</strong>
                </div>
                <span>// Active</span>
              </div>
              <div className="chat-body">
                {chatHistory.length === 0 && (
                  <div className="chat-empty">
                    Select a question on the left to start the demo.
                  </div>
                )}
                {chatHistory.map((msg, i) => (
                  <div key={i} className={`chat-message ${msg.type}`}>
                    <div className="message-text">{msg.text}</div>
                    <div className="message-meta">{msg.type === 'ai' ? 'Source: Knowledge Vault' : 'You'}</div>
                  </div>
                ))}
                {isTyping && <div className="chat-message ai typing">Typing...</div>}
              </div>
              <div className="chat-footer">
                <input type="text" placeholder="Type a custom message..." disabled />
                <button disabled>Send</button>
              </div>
            </div>

            <div className="lab-log">
              <div className="section-label">Backend Log (The "Brain")</div>
              <div className="log-window">
                <div className="log-entry">
                  [System] Initializing RAG pipeline...
                </div>
                {isTyping && (
                  <div className="log-entry processing">
                    [Vector Search] Querying Knowledge Vault for "{currentQuestion}"...
                  </div>
                )}
                {!isTyping && chatHistory.length > 0 && (
                  <>
                    <div className="log-entry success">
                      [Vector Search] 3 Relevant chunks found in "Firm_Policies.pdf"
                    </div>
                    <div className="log-entry success">
                      [LLM] Response generated with 98.4% confidence score.
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="studio-big-cta">
        <div>
          <div className="studio-big-cta__meta">01 / Build your own lab</div>
          <h2 className="studio-big-cta__title">
            Put your firm's <em>Knowledge</em> to work.
          </h2>
          <div className="studio-big-cta__meta studio-big-cta__fine">
            We can train a receptionist on your documents in less than 48 hours.
          </div>
        </div>
        <div className="studio-big-cta__actions">
          <Link to="/contact" className="studio-button studio-button--primary">
            Scope your AI
            <span className="studio-button__arrow" aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default AiLab;
