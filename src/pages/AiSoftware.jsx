import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './AiSoftware.css';
import SectionCta from '../components/SectionCta';

const AiSoftware = () => {
  const [activeTab, setActiveTab] = useState('healthcare');

  const aiPlatforms = [
    { name: 'OpenAI', description: 'ChatGPT & GPT-4' },
    { name: 'Anthropic', description: 'Claude' },
    { name: 'Llama', description: 'Meta AI' },
    { name: 'Mistral AI', description: 'Open Source Models' },
    { name: 'Gemini', description: 'Google AI' },
    { name: 'Amazon SageMaker', description: 'ML Platform' },
    { name: 'Azure AI', description: 'Microsoft AI' }
  ];

  const benefits = [
    {
      title: 'Improved Efficiency',
      description: 'Automate repetitive tasks and streamline workflows to boost productivity across your organization.'
    },
    {
      title: 'Enhanced Decision-Making',
      description: 'Leverage data-driven insights and predictive analytics to make informed business decisions.'
    },
    {
      title: 'Personalized Experiences',
      description: 'Deliver tailored customer experiences through intelligent recommendation systems and adaptive interfaces.'
    },
    {
      title: 'Predictive Maintenance',
      description: 'Anticipate equipment failures and optimize maintenance schedules to minimize downtime.'
    },
    {
      title: 'Cost Savings',
      description: 'Reduce operational costs through intelligent automation and resource optimization.'
    },
    {
      title: 'Risk Management',
      description: 'Identify and mitigate risks proactively with advanced pattern recognition and anomaly detection.'
    },
    {
      title: 'Innovation & Scalability',
      description: 'Stay ahead of the competition with cutting-edge AI solutions that scale with your business.'
    }
  ];

  const integrationSteps = [
    {
      phase: '01',
      title: 'Initial Assessment & Strategy',
      description: 'We analyze your business needs, identify AI opportunities, and develop a comprehensive integration roadmap tailored to your goals.'
    },
    {
      phase: '02',
      title: 'Design & Development',
      description: 'Our expert team designs and builds custom AI solutions, integrating them seamlessly with your existing systems and workflows.'
    },
    {
      phase: '03',
      title: 'Testing & Launch',
      description: 'Rigorous testing ensures reliability and performance. We deploy your solution and provide ongoing support for continuous optimization.'
    }
  ];

  const industryApplications = {
    healthcare: [
      'Medical diagnosis assistance and imaging analysis',
      'Patient data management and predictive analytics',
      'Drug discovery and clinical trial optimization',
      'Personalized treatment recommendations',
      'Healthcare chatbots for patient engagement',
      'Medical billing and claims processing automation'
    ],
    finance: [
      'Fraud detection and risk assessment',
      'Algorithmic trading and portfolio management',
      'Credit scoring and loan approval automation',
      'Customer service chatbots and virtual assistants',
      'Anti-money laundering compliance',
      'Financial forecasting and market analysis'
    ],
    technology: [
      'Code generation and developer tools',
      'Automated testing and quality assurance',
      'Cybersecurity threat detection',
      'IT infrastructure monitoring and optimization',
      'Natural language processing for documentation',
      'Intelligent search and knowledge management'
    ],
    retail: [
      'Personalized product recommendations',
      'Inventory management and demand forecasting',
      'Dynamic pricing optimization',
      'Visual search and product discovery',
      'Customer sentiment analysis',
      'Supply chain optimization'
    ],
    education: [
      'Personalized learning paths and adaptive content',
      'Automated grading and assessment',
      'Student performance prediction and intervention',
      'Intelligent tutoring systems',
      'Content generation for educational materials',
      'Administrative task automation'
    ],
    business: [
      'Sales forecasting and pipeline management',
      'Customer relationship management automation',
      'Document processing and data extraction',
      'Business intelligence and reporting',
      'HR recruitment and talent matching',
      'Process automation and optimization'
    ]
  };

  return (
    <div className="ai-software-page">
      {/* Hero Section */}
      <section className="ai-hero">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="ai-hero-content"
          >
            <h1 className="ai-hero-title">
              Empower Your Business with AI-Driven Software Solutions
            </h1>
            <p className="ai-hero-subtitle">
              Integration services with OpenAI, Llama, Anthropic, Mistral AI, Gemini, and other leading AI platforms to streamline operations, elevate customer experiences, and disrupt the market.
            </p>
            <button className="cta-button">Let's chat</button>
          </motion.div>
        </div>
      </section>

      {/* AI Platforms Section */}
      <section className="ai-platforms">
        <div className="container">
          <h2 className="section-title">AI Integration Capabilities</h2>
          <p className="section-subtitle">
            We integrate with leading AI platforms to deliver cutting-edge solutions
          </p>
          <div className="platforms-grid">
            {aiPlatforms.map((platform, index) => (
              <motion.div
                key={platform.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="platform-card"
              >
                <h3>{platform.name}</h3>
                <p>{platform.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="ai-benefits">
        <div className="container">
          <h2 className="section-title">Transform Your Business with AI</h2>
          <p className="section-subtitle">
            Unlock powerful capabilities that drive growth and innovation
          </p>
          <div className="benefits-grid">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="benefit-card"
              >
                <div className="benefit-icon">{index + 1}</div>
                <h3>{benefit.title}</h3>
                <p>{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Integration Process Section */}
      <section className="integration-process">
        <div className="container">
          <h2 className="section-title">Our Integration Process</h2>
          <p className="section-subtitle">
            A proven methodology for successful AI implementation
          </p>
          <div className="process-steps">
            {integrationSteps.map((step, index) => (
              <motion.div
                key={step.phase}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="process-step"
              >
                <div className="step-phase">{step.phase}</div>
                <div className="step-content">
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Industry Applications Section */}
      <section className="industry-applications">
        <div className="container">
          <h2 className="section-title">Industry Applications</h2>
          <p className="section-subtitle">
            Tailored AI solutions for every sector
          </p>

          <div className="industry-tabs">
            <div className="tabs-nav">
              <button
                className={`tab-button ${activeTab === 'healthcare' ? 'active' : ''}`}
                onClick={() => setActiveTab('healthcare')}
              >
                Healthcare
              </button>
              <button
                className={`tab-button ${activeTab === 'finance' ? 'active' : ''}`}
                onClick={() => setActiveTab('finance')}
              >
                Finance
              </button>
              <button
                className={`tab-button ${activeTab === 'technology' ? 'active' : ''}`}
                onClick={() => setActiveTab('technology')}
              >
                Technology
              </button>
              <button
                className={`tab-button ${activeTab === 'retail' ? 'active' : ''}`}
                onClick={() => setActiveTab('retail')}
              >
                Retail & E-commerce
              </button>
              <button
                className={`tab-button ${activeTab === 'education' ? 'active' : ''}`}
                onClick={() => setActiveTab('education')}
              >
                Education
              </button>
              <button
                className={`tab-button ${activeTab === 'business' ? 'active' : ''}`}
                onClick={() => setActiveTab('business')}
              >
                Business Services
              </button>
            </div>

            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="tab-content"
            >
              <ul className="applications-list">
                {industryApplications[activeTab].map((application, index) => (
                  <li key={index}>{application}</li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Company Overview Section */}
      <section className="company-overview">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="overview-content"
          >
            <h2>About Us</h2>
            <p className="overview-text">
              We build AI software that solves real business problems and not just demos that look impressive.
            </p>
            <p className="overview-text">
              Our senior engineers have spent decades building and scaling AI systems at Bay Area startups and enterprises. We've implemented machine learning pipelines, natural language processing tools, and intelligent automation across industries from fintech to healthcare. We know what works in production, not just in proof-of-concepts.
              When you work with us, you get a dedicated US-based team that understands both the technology and your business objectives. We've been in your shoes—we know the difference between AI that impresses investors and AI that actually moves metrics.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <SectionCta
        title="Ready to Transform Your Business with AI?"
        description="Let's discuss how our AI-driven solutions can help you achieve your goals. Schedule a free consultation today."
        buttonText="Get Started"
      />
    </div>
  );
};

export default AiSoftware;
