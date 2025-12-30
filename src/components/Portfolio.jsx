import React from 'react';
import './Portfolio.css';

const Portfolio = () => {
  const projects = [
    {
      title: 'Traba',
      description: 'Worker-to-shift platform',
      tag: 'Startup'
    },
    {
      title: 'Virtual Event Platform',
      description: 'Interactive virtual event solution',
      tag: 'Startup'
    },
    {
      title: 'Traba',
      description: 'Worker-to-shift platform',
      tag: 'Startup'
    },
    {
      title: 'Virtual Event Platform',
      description: 'Interactive virtual event solution',
      tag: 'Startup'
    }
  ];

  return (
    <section className="portfolio">
      <div className="portfolio-container">
        <h2 className="portfolio-heading">Works</h2>
        <div className="portfolio-grid">
          {projects.map((project, index) => (
            <div key={index} className="portfolio-card">
              <div className="portfolio-image">
                <div className="portfolio-placeholder"></div>
              </div>
              <span className="portfolio-tag">{project.tag}</span>
              <h3 className="portfolio-title">{project.title}</h3>
              <p className="portfolio-description">{project.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Portfolio;
