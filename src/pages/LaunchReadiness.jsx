import React from 'react';
import { motion } from 'framer-motion';
import { useSEO } from '@/hooks/useSEO';
import LaunchCheckerApp from '@/components/apps/LaunchCheckerApp';
import './LaunchReadiness.css';

const LaunchReadiness = () => {
  useSEO({
    title: 'Launch Readiness Checker | That Software House',
    description: 'Run a fast launch-readiness checklist for your product or website, score your gaps, and get a personalized action plan.',
    keywords: 'launch readiness checklist, product launch checklist, website launch checklist, launch score, launch readiness checker',
    canonicalUrl: 'https://thatsoftwarehouse.com/launch-readiness-checker',
    openGraph: {
      title: 'Launch Readiness Checker | That Software House',
      description: 'Check how ready you are to launch, see your score, and close the most critical gaps.',
      type: 'website',
    },
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Launch Readiness Checker',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web Browser',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      description: 'Interactive checklist for scoring launch readiness across product and website launches.',
      url: 'https://thatsoftwarehouse.com/launch-readiness-checker',
      creator: {
        '@type': 'Organization',
        name: 'That Software House',
      },
    },
  });

  return (
    <div className="launch-readiness-page">
      <section className="launch-readiness-hero">
        <div className="container">
          <motion.div
            className="launch-readiness-hero__content"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="launch-readiness-hero__eyebrow">Free Tool</p>
            <h1>Launch Readiness Checker</h1>
            <p>
              Pick your launch track, answer the checklist, and see exactly what to fix before go-live.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="launch-readiness-main">
        <div className="container">
          <LaunchCheckerApp />
        </div>
      </section>
    </div>
  );
};

export default LaunchReadiness;
