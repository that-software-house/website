import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Zap, Bot, FileText, BarChart3, Eraser, RefreshCw, CircleDollarSign } from 'lucide-react';
import { useSEO } from '@/hooks/useSEO';
import './Projects.css';
import SectionCta from '@/components/SectionCta';

// Project data - in a real app this would come from an API/database
const projects = [
  {
    id: 'contentforge',
    title: 'Content Extractor',
    subtitle: 'AI Content Transformation',
    description: 'Transform long-form content into engaging social media posts. Generate LinkedIn posts, Twitter threads, and carousel slides instantly.',
    icon: Sparkles,
    gradient: 'from-blue-500 to-purple-600',
    tags: ['AI', 'Content', 'Social Media'],
    apps: [
      { id: 'content-transformer', name: 'Content Transformer', description: 'Convert articles to social posts' }
    ]
  },
  {
    id: 'aiassistant',
    title: 'AI Assistant',
    subtitle: 'Intelligent Chat Support',
    description: 'An intelligent conversational AI that helps answer questions, provide support, and assist with various tasks using natural language.',
    icon: Bot,
    gradient: 'from-emerald-500 to-teal-600',
    tags: ['AI', 'Chat', 'Support'],
    apps: [
      { id: 'chat-assistant', name: 'Chat Assistant', description: 'AI-powered conversation' }
    ]
  },
  {
    id: 'docanalyzer',
    title: 'Document Analyzer',
    subtitle: 'Document Intelligence',
    description: 'Extract insights, summaries, and key information from documents using advanced AI analysis capabilities.',
    icon: FileText,
    gradient: 'from-orange-500 to-red-600',
    tags: ['AI', 'Documents', 'Analysis'],
    apps: [
      { id: 'doc-summary', name: 'Document Summarizer', description: 'Summarize long documents' }
    ]
  },
  {
    id: 'datainsights',
    title: 'Data Insights',
    subtitle: 'Business Analytics',
    description: 'Turn raw data into actionable insights with AI-powered analytics and visualization tools.',
    icon: BarChart3,
    gradient: 'from-violet-500 to-pink-600',
    tags: ['AI', 'Analytics', 'Data'],
    apps: [
      { id: 'data-viz', name: 'Data Visualizer', description: 'Create charts from data' }
    ]
  },
  {
    id: 'textcleaner',
    title: 'Text Cleaner',
    subtitle: 'AI Text Standardization',
    description: 'Free AI text cleaner to remove hidden characters, normalize quotes, and fix formatting from ChatGPT, Claude, and LLM outputs.',
    icon: Eraser,
    gradient: 'from-yellow-500 to-amber-600',
    tags: ['AI', 'Text', 'ChatGPT', 'LLM'],
    apps: [
      { id: 'text-cleaner', name: 'Text Cleaner', description: 'Clean ChatGPT and AI text' }
    ]
  },
  {
    id: 'toneconverter',
    title: 'Tone Converter',
    subtitle: 'AI Writing Style',
    description: 'Transform your text into any tone - professional, casual, friendly, persuasive, or more. Perfect for emails, social posts, and business communication.',
    icon: RefreshCw,
    gradient: 'from-cyan-500 to-blue-600',
    tags: ['AI', 'Writing', 'Tone', 'Style'],
    apps: [
      { id: 'tone-converter', name: 'Tone Converter', description: 'Change text tone instantly' }
    ]
  },
  {
    id: 'invoicechaser',
    title: 'Invoice Chaser',
    subtitle: 'Collections Copilot',
    description: 'Upload invoice exports, prioritize overdue accounts by risk, and generate friendly, firm, and final follow-up drafts in seconds.',
    icon: CircleDollarSign,
    gradient: 'from-rose-500 to-orange-600',
    tags: ['AI', 'Finance', 'Collections', 'SMB'],
    apps: [
      { id: 'invoice-chaser', name: 'Invoice Chaser', description: 'Prioritize and chase overdue invoices' }
    ]
  }
];

function ProjectCard({ project, index }) {
  const Icon = project.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link to={`/projects/${project.id}`} className="project-card-link">
        <div className="project-card">
          <div className={`project-card-icon bg-gradient-to-br ${project.gradient}`}>
            <Icon className="w-8 h-8 text-white" />
          </div>

          <div className="project-card-content">
            <div className="project-card-header">
              <h3 className="project-card-title">{project.title}</h3>
              <span className="project-card-subtitle">{project.subtitle}</span>
            </div>

            <p className="project-card-description">{project.description}</p>

            <div className="project-card-tags">
              {project.tags.map((tag) => (
                <span key={tag} className="project-tag">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function Projects() {
  useSEO({
    title: 'AI Projects | That Software House',
    description: 'Explore AI-powered projects from That Software House, including Content Extractor, Document Analyzer, Data Insights, Tone Converter, and Invoice Chaser.',
    keywords: 'AI projects, SaaS tools, content generator, document analyzer, data insights, invoice chaser',
    canonicalUrl: 'https://thatsoftwarehouse.com/projects',
    openGraph: {
      title: 'AI Projects | That Software House',
      description: 'Explore our AI-powered projects and tools built to solve real business problems.',
      type: 'website',
      url: 'https://thatsoftwarehouse.com/projects',
    },
  });

  return (
    <div className="projects-page">
      {/* Hero Section */}
      <section className="projects-hero">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="projects-hero-content"
        >
          <div className="projects-hero-badge">
            <Zap className="w-4 h-4" />
            <span>AI-Powered Solutions</span>
          </div>

          <h1 className="projects-hero-title">Our Projects</h1>

          <p className="projects-hero-subtitle">
            Explore our collection of AI-powered applications and tools. Each project showcases
            innovative solutions built with cutting-edge technology.
          </p>
        </motion.div>
      </section>

      {/* Projects Grid */}
      <section className="projects-grid-section">
        <div className="projects-grid">
          {projects.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>
      </section>

      <SectionCta />
    </div>
  );
}

export { projects };
export default Projects;
