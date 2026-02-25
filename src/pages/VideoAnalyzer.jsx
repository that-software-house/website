import React from 'react';
import { motion } from 'framer-motion';
import { useSEO } from '@/hooks/useSEO';
import VideoAnalyzerApp from '../components/apps/VideoAnalyzerApp';
import './VideoAnalyzer.css';

const VideoAnalyzer = () => {
  useSEO({
    title: 'Video Analyzer | That Software House',
    description: 'Upload a video to extract keyframes, get AI-powered analysis, and generate LinkedIn, Twitter, and carousel content.',
  });

  return (
    <div className="video-analyzer-page">
      <section className="video-analyzer-hero">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="video-analyzer-hero-content"
          >
            <h1 className="video-analyzer-hero-title">
              Video Analyzer
            </h1>
            <p className="video-analyzer-hero-subtitle">
              Upload a video to extract keyframes, get AI-powered analysis, and generate ready-to-post social media content.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="video-analyzer-main">
        <div className="container">
          <VideoAnalyzerApp />
        </div>
      </section>
    </div>
  );
};

export default VideoAnalyzer;
