import React, { useState, useEffect } from 'react';
import './RocketAnimation.css';

const RocketAnimation = () => {
  const [progress, setProgress] = useState(0);
  const [particles, setParticles] = useState([]);

  // Auto-start on page load and loop
  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(prev => {
        if (prev >= 100) {
          setTimeout(() => {
            setProgress(0);
          }, 5000);
          return prev;
        }
        return prev + 1;
      });
    }, 125);
    return () => clearTimeout(timer);
  }, [progress]);

  // Particle effects
  useEffect(() => {
    const particleInterval = setInterval(() => {
      const rocketX = 10 + (progress * 0.9);
      const rocketY = 90 - (progress * 0.8);

      const newParticle = {
        id: Date.now() + Math.random(),
        x: rocketX + (Math.random() - 0.5) * 5,
        y: rocketY + (Math.random() - 0.5) * 5,
        duration: 0.5 + Math.random() * 0.5
      };
      setParticles(prev => [...prev, newParticle]);

      setTimeout(() => {
        setParticles(prev => prev.filter(p => p.id !== newParticle.id));
      }, 1000);
    }, 500);

    return () => clearInterval(particleInterval);
  }, [progress]);

  const rocketX = 10 + (progress * 0.8);
  const rocketY = 90 - (progress * 0.8);

  return (
    <div className="rocket-animation-container">
      {/* Stars Background */}
      <div className="stars-container">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="star"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              opacity: progress > 50 ? 0.8 : 0.2
            }}
          />
        ))}
      </div>

      {/* Launch Track */}
      <div className="launch-track">
        <svg className="track-svg">
          <line
            x1="10%"
            y1="90%"
            x2="90%"
            y2="10%"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
          <line
            x1="10%"
            y1="90%"
            x2={`${10 + progress * 0.8}%`}
            y2={`${90 - progress * 0.8}%`}
            stroke="url(#rocket-gradient)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="rocket-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>
        </svg>

        {/* Rocket */}
        <div
          className="rocket"
          style={{
            left: `${rocketX}%`,
            top: `${rocketY}%`,
          }}
        >
          <div className="rocket-emoji">🚀</div>
          <div className="rocket-trail" />
        </div>

        {/* Engine Particles */}
        {particles.map(particle => (
          <div
            key={particle.id}
            className="particle"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              animationDuration: `${particle.duration}s`,
            }}
          />
        ))}

        {/* Launch Pad */}
        <div className="launch-pad" />

        {/* Success Target */}
        <div className="success-target">
          <div className={`target-star ${progress > 95 ? 'active' : ''}`}>⭐</div>
        </div>
      </div>
    </div>
  );
};

export default RocketAnimation;
