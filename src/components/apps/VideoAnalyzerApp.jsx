import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Video, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import './VideoAnalyzerApp.css';
import { analyzeVideoFrames, fetchYouTubeFrames } from '@/services/openai';
import VideoInput from './videoanalyzer/VideoInput';
import FrameExtractor from './videoanalyzer/FrameExtractor';
import FrameGallery from './videoanalyzer/FrameGallery';
import VideoSummary from './videoanalyzer/VideoSummary';
import ContentOutput from './videoanalyzer/ContentOutput';

const VideoAnalyzerApp = () => {
  const [videoSource, setVideoSource] = useState(null);
  const [extractedFrames, setExtractedFrames] = useState([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [frameDescriptions, setFrameDescriptions] = useState(null);
  const [summary, setSummary] = useState(null);
  const [content, setContent] = useState(null);
  const [generateContent, setGenerateContent] = useState(true);
  const [error, setError] = useState('');
  const [youtubeMetadata, setYoutubeMetadata] = useState(null);

  const handleVideoSelect = useCallback((source, errorMsg) => {
    setError(errorMsg || '');
    setExtractedFrames([]);
    setFrameDescriptions(null);
    setSummary(null);
    setContent(null);
    setYoutubeMetadata(null);
    setVideoSource(source);
  }, []);

  const handleExtractionStart = useCallback(() => {
    setIsExtracting(true);
    setExtractedFrames([]);
    setExtractionProgress('Loading video...');
    setError('');
  }, []);

  const handleFrameExtracted = useCallback((frame, current, total) => {
    setExtractionProgress(`Extracting frame ${current} of ${total}...`);
  }, []);

  const handleExtractionComplete = useCallback((frames) => {
    setExtractedFrames(frames);
    setIsExtracting(false);
    setExtractionProgress('');
  }, []);

  const handleExtractionError = useCallback((msg) => {
    setError(msg);
    setIsExtracting(false);
    setExtractionProgress('');
  }, []);

  // Auto-fetch YouTube thumbnails when a YouTube source is selected
  useEffect(() => {
    if (videoSource?.type !== 'youtube') {
      setYoutubeMetadata(null);
      return;
    }

    let cancelled = false;
    const fetchFrames = async () => {
      setIsExtracting(true);
      setExtractedFrames([]);
      setExtractionProgress('Fetching YouTube thumbnails...');
      setError('');

      try {
        const result = await fetchYouTubeFrames(videoSource.src);
        if (cancelled) return;

        const frames = (result.frames || []).map((f, i) => ({
          base64: f.base64,
          timestamp: f.timestamp || `thumb-${i + 1}`,
        }));
        setExtractedFrames(frames);
        setYoutubeMetadata(result.metadata || null);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to fetch YouTube thumbnails.');
      } finally {
        if (!cancelled) {
          setIsExtracting(false);
          setExtractionProgress('');
        }
      }
    };

    fetchFrames();
    return () => { cancelled = true; };
  }, [videoSource]);

  const handleAnalyze = async () => {
    if (extractedFrames.length === 0) {
      setError('No frames to analyze. Please upload a video first.');
      return;
    }

    setIsAnalyzing(true);
    setError('');
    setFrameDescriptions(null);
    setSummary(null);
    setContent(null);

    try {
      const result = await analyzeVideoFrames(extractedFrames, generateContent, youtubeMetadata);

      if (result.frameDescriptions) {
        setFrameDescriptions(result.frameDescriptions);
      }
      if (result.summary) {
        setSummary(result.summary);
      }
      if (result.content) {
        setContent(result.content);
      }
    } catch (err) {
      setError(err.message || 'Unable to analyze video right now.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const hasResults = summary || frameDescriptions || content;
  const isBusy = isExtracting || isAnalyzing;

  return (
    <div className="vidanalyzer-app">
      <div className="vidanalyzer-card">
        <div className="vidanalyzer-header">
          <div className="vidanalyzer-icon">
            <Video size={20} />
          </div>
          <div>
            <h2>Video Analyzer</h2>
            <p>Upload a video to extract frames, get AI analysis, and generate social content.</p>
          </div>
        </div>

        <VideoInput onVideoSelect={handleVideoSelect} disabled={isBusy} />

        {videoSource && videoSource.type !== 'youtube' && (
          <FrameExtractor
            videoSource={videoSource}
            onExtractionStart={handleExtractionStart}
            onFrameExtracted={handleFrameExtracted}
            onExtractionComplete={handleExtractionComplete}
            onError={handleExtractionError}
          />
        )}

        {error && (
          <div className="vidanalyzer-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {isExtracting && (
          <div className="vidanalyzer-progress">
            <div className="vidanalyzer-progress-bar">
              <div className="vidanalyzer-progress-fill" />
            </div>
            <p>{extractionProgress}</p>
          </div>
        )}

        {extractedFrames.length > 0 && !isExtracting && (
          <>
            <div className="vidanalyzer-options">
              <label className="vidanalyzer-checkbox">
                <input
                  type="checkbox"
                  checked={generateContent}
                  onChange={(e) => setGenerateContent(e.target.checked)}
                  disabled={isAnalyzing}
                />
                <span>Also generate LinkedIn, Twitter & Carousel content</span>
              </label>
            </div>

            <div className="vidanalyzer-actions">
              <button
                className="vidanalyzer-primary"
                onClick={handleAnalyze}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 size={18} className="spinning" />
                    <span>Analyzing video...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    <span>Analyze Video</span>
                  </>
                )}
              </button>
            </div>
          </>
        )}

        {isAnalyzing && (
          <div className="vidanalyzer-progress">
            <div className="vidanalyzer-progress-bar">
              <div className="vidanalyzer-progress-fill" />
            </div>
            <p>{extractionProgress || 'Sending frames to AI for analysis...'}</p>
          </div>
        )}
      </div>

      {/* Frame Gallery */}
      {extractedFrames.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <FrameGallery frames={extractedFrames} frameDescriptions={frameDescriptions} />
        </motion.div>
      )}

      {/* Video Summary */}
      {summary && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
        >
          <VideoSummary summary={summary} />
        </motion.div>
      )}

      {/* Generated Content */}
      {content && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2 }}
        >
          <ContentOutput content={content} />
        </motion.div>
      )}
    </div>
  );
};

export default VideoAnalyzerApp;
