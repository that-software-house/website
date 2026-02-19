import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Smartphone, Server, Layout, Package, Code, Globe, CreditCard, Users as UsersIcon, HeadphonesIcon, Mail, MapPin, Brain } from 'lucide-react';
import { useSEO } from '@/hooks/useSEO';
import SectionCta from '../components/SectionCta';
import Clients from '../components/Clients';
import './CustomSoftware.css';

const CustomSoftware = () => {
  useSEO({
    title: 'Custom Software Development | That Software House',
    description: 'Custom web apps, mobile apps, APIs, and backend systems built to scale. From MVP to enterprise — React, Node.js, React Native, and cloud infrastructure.',
    keywords: 'custom software development, web application, mobile app development, MVP development, React, Node.js, Austin TX',
    canonicalUrl: 'https://thatsoftwarehouse.com/custom-software',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Custom Software Development',
      provider: { '@type': 'Organization', name: 'That Software House' },
      description: 'Full-stack custom software development for web, mobile, and backend systems.',
      areaServed: 'Worldwide',
      serviceType: 'Custom Software Development',
    },
  });
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      name: 'Swati Patil',
      company: 'GoCodeMinder',
      rating: 5,
      text: 'The team at TSH helped create a brand identity for my MVP and built the web application from scratch. Highly recommend them if you want to take a product from idea to MVP and beyond.'
    },
    {
      name: 'Vahid Kowsari',
      company: 'Vox Health',
      rating: 5,
      text: 'TSH was able to get a fully production ready product design done in under 2 weeks. Great team that pays attention to detail.'
    },
  ];

  const projectApproaches = [
    {
      icon: Smartphone,
      title: 'Mobile-only',
      description: 'iOS and Android apps built for performance and scale using React Native.'
    },
    {
      icon: Server,
      title: 'Mobile + Backend',
      description: 'Complete mobile solutions with cloud infrastructure. We build the iOS/Android apps and the APIs, databases, and server architecture that power them.'
    },
    {
      icon: Layout,
      title: 'Management Panels',
      description: 'Custom admin dashboards and CMS platforms. Real-time analytics, user management, and content control built specifically for your team.'
    },
    {
      icon: Package,
      title: 'SDKs',
      description: 'Developer tools and libraries that integrate into existing products. We build the SDKs, handle documentation, and support your developers.'
    },
    {
      icon: Code,
      title: 'Backend-only',
      description: 'Scalable server infrastructure without the frontend. RESTful APIs, microservices architecture, database design, and third-party integrations that handle millions of requests.'
    },
    {
      icon: Globe,
      title: 'Web Applications',
      description: 'Full-stack web platforms built with React, Next.js, and Node.js. From customer-facing portals to internal tools that streamline your business operations.'
    }
  ];

  const integrations = [
    {
      category: 'Payment Systems',
      icon: CreditCard,
      platforms: ['PayPal', 'Stripe', 'Square', 'Authorize.net']
    },
    {
      category: 'CRM Platforms',
      icon: UsersIcon,
      platforms: ['Salesforce', 'HubSpot', 'Pipedrive', 'Zoho']
    },
    {
      category: 'Help Desk',
      icon: HeadphonesIcon,
      platforms: ['Zendesk', 'Freshdesk', 'Intercom']
    },
    {
      category: 'Communication',
      icon: Mail,
      platforms: ['Twilio', 'SendGrid', 'Mailchimp']
    },
    {
      category: 'Maps & AI',
      icon: Brain,
      platforms: ['Google Maps', 'Apple Maps', 'OpenAI', 'Anthropic']
    }
  ];

  const projectStages = [
    {
      phase: '01',
      title: 'Initial Stage',
      subtitle: 'Discovery & Planning',
      activities: ['PRD Documentation', 'Wireframes & Prototypes', 'Research & Development', 'Product Strategy'],
      description: 'We start with a comprehensive discovery phase to understand your business goals, technical requirements, and user needs. This foundation ensures we build the right solution.'
    },
    {
      phase: '02',
      title: 'Design Stage',
      subtitle: 'UI/UX Development',
      activities: ['Visual Design', 'User Interface', 'Design Systems', 'Interactive Prototypes'],
      description: 'Our design team creates intuitive, beautiful interfaces that align with your brand and provide exceptional user experiences.'
    },
    {
      phase: '03',
      title: 'Development Stage',
      subtitle: 'Agile Development',
      activities: ['Sprint Planning', 'MVP Development', 'Quality Assurance', 'Performance Optimization'],
      description: 'Using Agile methodology, we develop your product in 2-week sprints with continuous feedback. Most MVPs are ready within 2-3 months.'
    },
    {
      phase: '04',
      title: 'Ongoing Support',
      subtitle: 'Maintenance & Growth',
      activities: ['Bug Fixes', 'Feature Enhancements', 'Performance Monitoring', 'Security Updates'],
      description: 'Post-launch, we provide continuous support to ensure your application runs smoothly and evolves with your business needs.'
    }
  ];

  const developmentFormats = [
    {
      title: 'Time & Materials',
      description: 'Flexible approach that accommodates scope changes and evolving requirements. You pay for actual time spent, with complete transparency on progress.',
      benefits: ['Flexible scope', 'Transparent billing', 'Easy to scale', 'Adapt to changes']
    },
    {
      title: 'Agile Methodology',
      description: 'Short development sprints with continuous client feedback and transparent progress tracking. Enables rapid iteration and ensures alignment with your vision.',
      benefits: ['2-week sprints', 'Regular demos', 'Client feedback loops', 'Incremental delivery']
    }
  ];

  const benefits = [
    {
      title: 'Dedicated Expert Teams',
      description: 'Work with experienced developers, designers, and project managers who are committed to your success.',
      highlight: 'Senior-level expertise'
    },
    {
      title: 'Streamlined Agile Process',
      description: 'Our proven development process ensures efficient delivery without compromising quality.',
      highlight: 'Proven methodology'
    },
    {
      title: 'Transparent Billing',
      description: 'Clear pricing with detailed breakdowns. No hidden costs or surprises.',
      highlight: 'Full transparency'
    },
    {
      title: 'Clear Communication',
      description: 'Regular updates, detailed reporting, and open channels for feedback throughout the project.',
      highlight: 'Always in sync'
    }
  ];

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <div className="custom-software-page">
      {/* Hero Section */}
      <section className="custom-hero">
        <video
          className="custom-hero-video"
          autoPlay
          muted
          loop
          playsInline
          src="/video/hero-custom-software.mp4"
        />
        <div className="custom-hero-overlay" />
        <div className="container custom-hero-content">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="custom-hero-text"
          >
            <h1 className="custom-hero-title">
              Custom Web, Mobile & Enterprise Development
            </h1>
            <p className="custom-hero-subtitle">
              Build and scale enterprise applications with our experienced team. From concept to deployment, we deliver robust software solutions tailored to your business needs.
            </p>
            <Link to="/contact" className="custom-hero-cta">
              Let's chat
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="container">
          <motion.div
            key={currentTestimonial}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
            className="testimonial-card-large"
          >
            <div className="stars">
              {'★'.repeat(testimonials[currentTestimonial].rating)}
            </div>
            <p className="testimonial-text">{testimonials[currentTestimonial].text}</p>
            <div className="testimonial-author">
              <div className="author-avatar">
                {testimonials[currentTestimonial].name.charAt(0)}
              </div>
              <div>
                <div className="author-name">{testimonials[currentTestimonial].name}</div>
                <div className="author-company">{testimonials[currentTestimonial].company}</div>
              </div>
            </div>
          </motion.div>
          <div className="testimonial-nav">
            <button onClick={prevTestimonial} className="nav-btn" aria-label="Previous testimonial">←</button>
            <span className="testimonial-counter">
              {currentTestimonial + 1} / {testimonials.length}
            </span>
            <button onClick={nextTestimonial} className="nav-btn" aria-label="Next testimonial">→</button>
          </div>
        </div>
      </section>

      {/* Project Approaches Section */}
      <section className="project-approaches">
        <div className="container">
          <h2 className="section-title">Our Project Approaches</h2>
          <p className="section-subtitle">
            We adapt our development approach to match your specific needs and goals
          </p>
          <div className="approaches-grid">
            {projectApproaches.map((approach, index) => {
              const Icon = approach.icon;
              return (
                <motion.div
                  key={approach.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="approach-card"
                >
                  <div className="approach-icon">
                    <Icon size={32} />
                  </div>
                  <h3>{approach.title}</h3>
                  <p>{approach.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section className="integrations-section">
        <div className="container">
          <h2 className="section-title">Seamless Integrations</h2>
          <p className="section-subtitle">
            We integrate with the platforms and tools that power your business
          </p>
          <div className="integrations-grid">
            {integrations.map((integration, index) => {
              const Icon = integration.icon;
              return (
                <motion.div
                  key={integration.category}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="integration-card"
                >
                  <div className="integration-header">
                    <Icon size={24} />
                    <h3>{integration.category}</h3>
                  </div>
                  <div className="integration-platforms">
                    {integration.platforms.map((platform) => (
                      <span key={platform} className="platform-tag">{platform}</span>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Project Stages Section */}
      <section className="project-stages">
        <div className="container">
          <h2 className="section-title">Our Development Process</h2>
          <p className="section-subtitle">
            A proven 4-stage methodology that delivers results
          </p>
          <div className="stages-timeline">
            {projectStages.map((stage, index) => (
              <motion.div
                key={stage.phase}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                viewport={{ once: true }}
                className="stage-item"
              >
                <div className="stage-number">{stage.phase}</div>
                <div className="stage-content">
                  <h3>{stage.title}</h3>
                  <p className="stage-subtitle">{stage.subtitle}</p>
                  <p className="stage-description">{stage.description}</p>
                  <div className="stage-activities">
                    {stage.activities.map((activity) => (
                      <span key={activity} className="activity-tag">{activity}</span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Development Formats Section */}
      <section className="development-formats">
        <div className="container">
          <h2 className="section-title">Flexible Development Formats</h2>
          <p className="section-subtitle">
            Choose the engagement model that works best for your project
          </p>
          <div className="formats-grid">
            {developmentFormats.map((format, index) => (
              <motion.div
                key={format.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="format-card"
              >
                <h3>{format.title}</h3>
                <p>{format.description}</p>
                <ul className="benefits-list">
                  {format.benefits.map((benefit) => (
                    <li key={benefit}>{benefit}</li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section">
        <div className="container">
          <h2 className="section-title">Why Choose Us</h2>
          <p className="section-subtitle">
            The advantages of working with our team
          </p>
          <div className="benefits-grid">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="benefit-card"
              >
                <span className="benefit-highlight">{benefit.highlight}</span>
                <h3>{benefit.title}</h3>
                <p>{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Clients Section */}
      <Clients />

      {/* CTA Section */}
      <SectionCta
        title="Let's Build Something Great Together"
        description="Ready to bring your custom software vision to life? Schedule a free consultation to discuss your project."
        buttonText="Start Your Project"
      />
    </div>
  );
};

export default CustomSoftware;
