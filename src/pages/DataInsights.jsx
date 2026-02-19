import React from 'react';
import { motion } from 'framer-motion';
import { useSEO } from '@/hooks/useSEO';
import DataInsightsApp from '../components/apps/DataInsightsApp';
import './DataInsights.css';

const DataInsights = () => {
  useSEO({
    title: 'Data Insights | That Software House',
    description: 'Upload your data and get AI-powered analysis, visualizations, and actionable insights.',
  });

  return (
    <div className="data-insights-page">
      <section className="data-insights-hero">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="data-insights-hero-content"
          >
            <h1 className="data-insights-hero-title">
              Data Insights
            </h1>
            <p className="data-insights-hero-subtitle">
              Upload your data files and get AI-powered analysis, visualizations, and actionable insights.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="data-insights-main">
        <div className="container">
          <DataInsightsApp />
        </div>
      </section>
    </div>
  );
};

export default DataInsights;
