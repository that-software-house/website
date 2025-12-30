import React, { useEffect, useState } from 'react';
import './Stages.css';

const Stages = () => {
  const [activeStage, setActiveStage] = useState(0);

  const stages = [
    {
      name: 'Pre-seed',
      title: 'Validate your idea & attract early investors',
      services: [
        { title: 'Design prototype', description: 'Test product ideas fast with clickable prototypes that feel real.' },
        { title: 'Product discovery', description: 'Map out key features, user flows, and technical requirements before building.' },
        { title: 'Website development', description: 'Launch a fast, scalable site that communicates your vision and drives growth.' },
      ],
    },
    {
      name: 'Seed',
      title: 'Build your product & gain market traction',
      services: [
        { title: 'Branding', description: 'Develop a brand that resonates — visually, emotionally, and strategically.' },
        { title: 'Technical workshop', description: 'Validate your tech stack, architecture, and scalability path.' },
        { title: 'Custom mvp development', description: 'Expand your prototype into a fully functional, production-ready product.' },
        { title: 'Rapid mvp development', description: 'Get your MVP 50% faster with lean sprints and pre-built frameworks.' },
        { title: 'Dedicated team', description: 'Access a team of experts to fuel your product’s growth.' },
      ],
    },
    {
      name: 'Series A & beyond',
      title: 'Scale, optimize & reach more users',
      services: [
        { title: 'UX audit', description: 'Identify usability bottlenecks, improve engagement, and optimize for conversions.' },
        { title: 'Product redesign', description: 'Upgrade legacy interfaces with scalable, business-driven UX and UI.' },
        { title: 'Team extension', description: 'Instantly scale with dedicated designers and developers ready to start.' },
        { title: 'Website redesign', description: 'Modernize your site and improve UX with research-driven design.' },
      ],
    },
  ];

  useEffect(() => {
    const stageElements = document.querySelectorAll('.stage-panel');

    const observerOptions = {
      root: null,
      rootMargin: '-45% 0px -45% 0px',
      threshold: 0,
    };

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const idx = parseInt(entry.target.dataset.stageIndex, 10);
          setActiveStage(idx);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    stageElements.forEach((el) => observer.observe(el));

    return () => {
      stageElements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  const handleStageClick = (index) => {
    const el = document.querySelector(`[data-stage-index="${index}"]`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="stages-dark">
      <div className="container stages-dark__inner">
        <div className="stages-dark__nav">
          {stages.map((stage, idx) => (
            <button
              key={stage.name}
              className={`stages-dark__nav-item ${activeStage === idx ? 'active' : ''}`}
              onClick={() => handleStageClick(idx)}
            >
              {stage.name}
            </button>
          ))}
        </div>

        <div className="stages-dark__main">
          {stages.map((stage, idx) => (
            <div key={stage.name} className="stage-panel" data-stage-index={idx}>
              <h2 className="stages-dark__title">{stage.title}</h2>
              <div className="stages-dark__grid">
                {stage.services.map((svc) => (
                  <div key={svc.title} className="stages-dark__card">
                    <h4>{svc.title}</h4>
                    <p>{svc.description}</p>
                    <div className="stages-dark__link">
                      <span>Explore</span>
                      <span>→</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stages;
