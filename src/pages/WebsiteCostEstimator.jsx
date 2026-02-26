import React from 'react';
import { motion } from 'framer-motion';
import { useSEO } from '@/hooks/useSEO';
import CostEstimatorApp from '@/components/apps/CostEstimatorApp';
import './WebsiteCostEstimator.css';

const WebsiteCostEstimator = () => {
  useSEO({
    title: 'Website Cost Estimator | That Software House',
    description: 'Estimate your small business website cost in minutes. Pick your scope, see a real-time range, and unlock a detailed breakdown.',
    keywords: 'website cost calculator, website cost estimator, small business website pricing, website development estimate',
    canonicalUrl: 'https://thatsoftwarehouse.com/website-cost-estimator',
    openGraph: {
      title: 'Website Cost Estimator | That Software House',
      description: 'Get a fast website budget range and project timeline tailored to your business.',
      type: 'website',
    },
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Website Cost Estimator',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web Browser',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      description: 'Interactive tool for estimating website project costs based on scope and features.',
      url: 'https://thatsoftwarehouse.com/website-cost-estimator',
      creator: {
        '@type': 'Organization',
        name: 'That Software House',
      },
    },
  });

  return (
    <div className="website-cost-estimator-page">
      <section className="website-cost-estimator-hero">
        <div className="container">
          <motion.div
            className="website-cost-estimator-hero__content"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="website-cost-estimator-hero__eyebrow">Free Tool</p>
            <h1>Website Cost Estimator</h1>
            <p>
              Pick your scope, choose your features, and get a realistic range in under 2 minutes.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="website-cost-estimator-main">
        <div className="container">
          <CostEstimatorApp />
        </div>
      </section>
    </div>
  );
};

export default WebsiteCostEstimator;
