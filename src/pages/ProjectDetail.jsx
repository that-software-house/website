import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Sparkles, Bot, FileText, BarChart3 } from 'lucide-react';
import { projects } from './Projects';
import ContentForgeApp from '../components/apps/ContentForgeApp';
import './ProjectDetail.css';

// Map project IDs to their icons
const projectIcons = {
  contentforge: Sparkles,
  aiassistant: Bot,
  docanalyzer: FileText,
  datainsights: BarChart3,
};

function ProjectDetail() {
  const { projectId } = useParams();
  const [activeApp, setActiveApp] = useState(null);

  const project = projects.find((p) => p.id === projectId);

  if (!project) {
    return (
      <div className="project-detail-page">
        <div className="project-not-found">
          <h2>Project Not Found</h2>
          <p>The project you're looking for doesn't exist.</p>
          <Link to="/projects" className="back-link">
            <ArrowLeft className="w-5 h-5" />
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  const Icon = projectIcons[project.id] || Sparkles;

  // Render the active app component
  const renderAppContent = () => {
    if (!activeApp) return null;

    switch (project.id) {
      case 'contentforge':
        return <ContentForgeApp />;
      case 'aiassistant':
        return (
          <div className="coming-soon-app">
            <Bot className="w-16 h-16 text-gray-300 mb-4" />
            <h3>AI Assistant</h3>
            <p>This app is coming soon. Stay tuned!</p>
          </div>
        );
      case 'docanalyzer':
        return (
          <div className="coming-soon-app">
            <FileText className="w-16 h-16 text-gray-300 mb-4" />
            <h3>Document Analyzer</h3>
            <p>This app is coming soon. Stay tuned!</p>
          </div>
        );
      case 'datainsights':
        return (
          <div className="coming-soon-app">
            <BarChart3 className="w-16 h-16 text-gray-300 mb-4" />
            <h3>Data Insights</h3>
            <p>This app is coming soon. Stay tuned!</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="project-detail-page">
      {/* Header */}
      <header className="project-detail-header">
        <div className="project-detail-header-content">
          <Link to="/projects" className="back-link">
            <ArrowLeft className="w-5 h-5" />
            Back to Projects
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="project-detail-info"
          >
            <div className={`project-detail-icon bg-gradient-to-br ${project.gradient}`}>
              <Icon className="w-10 h-10 text-white" />
            </div>

            <div className="project-detail-meta">
              <h1 className="project-detail-title">{project.title}</h1>
              <p className="project-detail-subtitle">{project.subtitle}</p>
            </div>
          </motion.div>

          <p className="project-detail-description">{project.description}</p>

          <div className="project-detail-tags">
            {project.tags.map((tag) => (
              <span key={tag} className="project-detail-tag">{tag}</span>
            ))}
          </div>
        </div>
      </header>

      {/* Apps Section */}
      <section className="project-apps-section">
        <div className="project-apps-container">
          <h2 className="project-apps-title">Available Apps</h2>

          <div className="project-apps-grid">
            {project.apps.map((app, index) => (
              <motion.button
                key={app.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className={`project-app-card ${activeApp === app.id ? 'active' : ''}`}
                onClick={() => setActiveApp(activeApp === app.id ? null : app.id)}
              >
                <div className="project-app-card-icon">
                  <Play className="w-6 h-6" />
                </div>
                <div className="project-app-card-content">
                  <h3>{app.name}</h3>
                  <p>{app.description}</p>
                </div>
                <span className="project-app-card-action">
                  {activeApp === app.id ? 'Close' : 'Launch'}
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Active App Content */}
      {activeApp && (
        <motion.section
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.4 }}
          className="project-app-content-section"
        >
          <div className="project-app-content-container">
            {renderAppContent()}
          </div>
        </motion.section>
      )}
    </div>
  );
}

export default ProjectDetail;
