import React, { useState } from 'react';
import { Sparkles, Zap, ArrowRight, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ContentInput from './contentforge/ContentInput';
import OutputFormatSelector from './contentforge/OutputFormatSelector';
import GeneratedContent from './contentforge/GeneratedContent';
import { generateContent } from '@/services/openai';
import './ContentForgeApp.css';

function ContentForgeApp() {
  const [sourceType, setSourceType] = useState('text');
  const [outputFormats, setOutputFormats] = useState(['linkedin']);
  const [generatedOutputs, setGeneratedOutputs] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [generationProgress, setGenerationProgress] = useState('');

  const handleGenerate = async (content, fileName, contentSourceType) => {
    setIsGenerating(true);
    setError(null);
    setGeneratedOutputs([]);

    try {
      setGenerationProgress('Sending to AI agents...');

      // Call the backend API with all formats at once
      const { results, errors } = await generateContent(content, outputFormats, contentSourceType);

      // Convert results to output format
      const outputs = [];

      for (const format of outputFormats) {
        if (results[format]) {
          outputs.push({
            format,
            content: results[format],
            timestamp: new Date(),
          });
        } else if (errors[format]) {
          outputs.push({
            format,
            content: `Error: ${errors[format]}`,
            timestamp: new Date(),
            error: true,
          });
        }
      }

      setGeneratedOutputs(outputs);
      setGenerationProgress('');

      // Show error if all formats failed
      if (Object.keys(errors).length === outputFormats.length) {
        setError('All content generation failed. Please check your input and try again.');
      }
    } catch (err) {
      console.error('Generation error:', err);
      setError(err.message || 'An error occurred while generating content. Please try again.');
    } finally {
      setIsGenerating(false);
      setGenerationProgress('');
    }
  };

  return (
    <div className="contentforge-app">
      {/* Header */}
      <header className="contentforge-header">
        <div className="contentforge-header-content">
          <div className="contentforge-logo">
            <div className="contentforge-logo-icon">
              <Sparkles className="h-7 w-7 text-blue-600" />
              <Zap className="h-3 w-3 text-yellow-500 absolute -top-1 -right-1" />
            </div>
            <h2 className="contentforge-title">ContentForge</h2>
          </div>
          <p className="contentforge-subtitle">
            Transform long-form content into engaging social posts
          </p>
        </div>
      </header>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="contentforge-hero"
      >
        <div className="contentforge-badge">
          <Sparkles className="h-4 w-4" />
          <span>AI-Powered Content Transformation</span>
        </div>
        <h3 className="contentforge-hero-title">Turn Articles into Viral Social Content</h3>
        <p className="contentforge-hero-subtitle">
          Upload your content and watch it transform into optimized LinkedIn posts, Twitter
          threads, and carousel slides in seconds.
        </p>
      </motion.div>

      {/* Error Alert */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="contentforge-error"
          >
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="contentforge-error-close">
              &times;
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="contentforge-main">
        {/* Left Column - Input */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="contentforge-input-column"
        >
          <div className="contentforge-card">
            <div className="contentforge-card-header">
              <div className="contentforge-card-icon blue">
                <ArrowRight className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="contentforge-card-title">Input Content</h4>
                <p className="contentforge-card-subtitle">Choose your content source</p>
              </div>
            </div>
            <ContentInput
              sourceType={sourceType}
              setSourceType={setSourceType}
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
            />
          </div>

          <div className="contentforge-card">
            <div className="contentforge-card-header">
              <div className="contentforge-card-icon purple">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="contentforge-card-title">Output Formats</h4>
                <p className="contentforge-card-subtitle">Select your platforms</p>
              </div>
            </div>
            <OutputFormatSelector
              selectedFormats={outputFormats}
              setSelectedFormats={setOutputFormats}
            />
          </div>
        </motion.div>

        {/* Right Column - Output */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="contentforge-output-column"
        >
          <GeneratedContent
            outputs={generatedOutputs}
            isGenerating={isGenerating}
            progress={generationProgress}
          />
        </motion.div>
      </div>
    </div>
  );
}

export default ContentForgeApp;
