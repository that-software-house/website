import React from 'react';
import { MessageCircle, Sparkles, Wand2 } from 'lucide-react';
import './ValueProps.css';

const items = [
  {
    title: 'Clear communication',
    copy: 'We build relationships based on integrity and trust, deliver on our promises, and always maintain clear communication.',
    color: '#5f4bdb',
    icon: MessageCircle,
  },
  {
    title: 'Customer-centric approach',
    copy: 'We prioritize our client’s success, understand your unique needs, and deliver tailored solutions that drive your business growth.',
    color: '#3d58d4',
    icon: Sparkles,
  },
  {
    title: 'Innovation and excellence',
    copy: 'We consistently deliver innovative, high-quality solutions as a team on the cutting edge of technology trends.',
    color: '#4c8ac8',
    icon: Wand2,
  },
];

const ValueProps = () => {
  return (
    <section className="value-props">
      <div className="container">
        <h2 className="value-props__title">How we help you deliver the best results</h2>
        <div className="value-props__grid">
          {items.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="value-card"
                style={{
                  background: item.color,
                  '--tilt': idx === 0 ? '-2deg' : idx === 1 ? '1.5deg' : '-1deg',
                }}
              >
                <div className="value-card__icon">
                  <Icon size={22} />
                </div>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ValueProps;
