import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, Bot, FileText, BarChart3, Eraser, RefreshCw } from 'lucide-react';
import { projects } from './Projects';
import ContentForgeApp from '../components/apps/ContentForgeApp';
import DocAnalyzerApp from '../components/apps/DocAnalyzerApp';
import TextCleanerApp from '../components/apps/TextCleanerApp';
import ToneConverterApp from '../components/apps/ToneConverterApp';
import UsageBanner from '../components/auth/UsageBanner';
import './ProjectDetail.css';

function ProjectDetail() {
  const { projectId } = useParams();
  const project = projects.find((p) => p.id === projectId);
  const initialAppId = project?.apps?.[0]?.id || null;
  const [activeApp, setActiveApp] = useState(initialAppId);

  useEffect(() => {
    setActiveApp(project?.apps?.[0]?.id || null);
  }, [project?.id]);

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

  // Render the active app component
  const renderAppContent = () => {
    if (!activeApp) {
      return (
        <div className="coming-soon-app">
          <Sparkles className="w-16 h-16 text-gray-300 mb-4" />
          <h3>App coming soon</h3>
          <p>We&apos;re preparing this experience. Check back shortly.</p>
        </div>
      );
    }

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
        return <DocAnalyzerApp />;
      case 'datainsights':
        return (
          <div className="coming-soon-app">
            <BarChart3 className="w-16 h-16 text-gray-300 mb-4" />
            <h3>Data Insights</h3>
            <p>This app is coming soon. Stay tuned!</p>
          </div>
        );
      case 'textcleaner':
        return <TextCleanerApp />;
      case 'toneconverter':
        return <ToneConverterApp />;
      default:
        return null;
    }
  };

  // Check if this project uses AI features (needs usage banner)
  const usesAI = ['contentforge', 'docanalyzer', 'toneconverter'].includes(project.id);

  return (
    <div className="project-detail-page">
      {/* Back Navigation */}
      <nav className="project-detail-nav">
        <Link to="/projects" className="back-link">
          <ArrowLeft className="w-5 h-5" />
          Back to Projects
        </Link>
      </nav>

      {/* Usage Banner for AI-powered projects */}
      {usesAI && <UsageBanner />}

      {/* Active App Content */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="project-app-content-section"
      >
        <div className="project-app-content-container">
          {renderAppContent()}
        </div>
      </motion.section>
    </div>
  );
}

export default ProjectDetail;
