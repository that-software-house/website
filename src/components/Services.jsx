import React from 'react';
import { Brain, Globe2, MonitorSmartphone, Server, Smartphone, Users } from 'lucide-react';
import './Services.css';

const services = [
  {
    title: 'Staff Augmentation',
    description:
      'We provide skilled engineers or dedicated teams tailored to your project, seamlessly aligning with your goals and company culture. Our experts work closely with you, becoming an integral part of your team’s success.',
    tags: ['Cultural fit', 'Top 1%', 'Instant hire'],
    icon: Users,
  },
  {
    title: 'AI Development',
    description:
      'Our team specializes in AI, data analysis, and machine learning. We integrate your products with leading AI models like OpenAI GPT, Anthropic, Azure AI, AutoGPT, LLAMA, Gemini, and more to streamline operations, enhance customer experiences, and drive market innovation.',
    tags: ['LLM', 'Tensorflow', 'Python', 'Computer Vision'],
    icon: Brain,
  },
  {
    title: 'Front-end development',
    description:
      'We are experienced in building modular, high-performance web applications for corporate clients and startups. We utilize modern and robust technology stacks.',
    tags: ['React', 'Angular', 'Electron', 'Next.js'],
    icon: MonitorSmartphone,
  },
  {
    title: 'Mobile Development',
    description:
      'We specialize in developing native and cross-platform mobile applications for iOS and Android.',
    tags: ['Swift', 'React Native', 'Flutter', 'Java', 'Kotlin'],
    icon: Smartphone,
  },
  {
    title: 'Back-end Development',
    description:
      'We are experienced in high-load and complex backend infrastructure development for mobile or web apps and enterprise services.',
    tags: ['Node.js', 'Go', 'Python', 'C#', 'Java'],
    icon: Server,
  },
  {
    title: 'Web Development',
    description:
      'Our developers can create web solutions that are tailored to your needs, easy to manage with popular CMS, and which can be seamlessly integrated with your existing internal systems.',
    tags: ['Contentful', 'Magento', 'WP', 'Shopify'],
    icon: Globe2,
  },
];

const Services = () => {
  return (
    <section className="services-grid-section">
      <div className="container">
        <h2 className="services-grid-heading">Services we provide</h2>
        <div className="services-grid-cards">
          {services.map((service, idx) => {
            const Icon = service.icon;
            return (
              <div key={service.title} className="service-tile">
                <div className="service-tile__body">
                  <div>
                    <h3>{service.title}</h3>
                    <p>{service.description}</p>
                    <div className="service-tags">
                      {service.tags.map((tag) => (
                        <span key={tag} className="service-tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="service-illus">
                    <div className="illus-bg" />
                    <Icon size={44} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;
