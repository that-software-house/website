import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Video, Loader2, AlertCircle, Sparkles, Lock } from 'lucide-react';
import './VideoAnalyzerApp.css';
import { analyzeVideoFrames, fetchYouTubeFrames } from '@/services/openai';
import AuthModal from '@/components/auth/AuthModal';
import { useAuth } from '@/context/AuthContext';
import VideoInput from './videoanalyzer/VideoInput';
import FrameExtractor from './videoanalyzer/FrameExtractor';
import FrameGallery from './videoanalyzer/FrameGallery';
import VideoSummary from './videoanalyzer/VideoSummary';
import ContentOutput from './videoanalyzer/ContentOutput';

const DEFAULT_FRAME_COUNT = 15;
const MIN_FRAME_COUNT = 2;
const MAX_FRAME_COUNT = 15;
const DEFAULT_QUALITY = 'standard';

const QUALITY_OPTIONS = [
  {
    value: 'standard',
    label: 'Standard',
    description: '640px, faster extraction',
    requiresAuth: false,
  },
  {
    value: 'high',
    label: 'High',
    description: '1280px, sharper frames',
    requiresAuth: true,
  },
  {
    value: 'original',
    label: 'Original',
    description: 'Source resolution, largest files',
    requiresAuth: true,
  },
];

const VideoAnalyzerApp = () => {
  const { isAuthenticated } = useAuth();
  const [videoSource, setVideoSource] = useState(null);
  const [frameCount, setFrameCount] = useState(DEFAULT_FRAME_COUNT);
  const [frameQuality, setFrameQuality] = useState(DEFAULT_QUALITY);
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
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleVideoSelect = useCallback((source, errorMsg) => {
    setError(errorMsg || '');
    setExtractedFrames([]);
    setFrameDescriptions(null);
    setSummary(null);
    setContent(null);
    setYoutubeMetadata(null);
    setVideoSource(source);
  }, []);

  const handleFrameCountChange = useCallback((event) => {
    const nextValue = Number.parseInt(event.target.value, 10);
    if (!Number.isFinite(nextValue)) return;

    setFrameCount(Math.min(MAX_FRAME_COUNT, Math.max(MIN_FRAME_COUNT, nextValue)));
  }, []);

  const handleQualityChange = useCallback((nextQuality) => {
    const selectedOption = QUALITY_OPTIONS.find((option) => option.value === nextQuality);
    if (!selectedOption) return;

    if (selectedOption.requiresAuth && !isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    setFrameQuality(nextQuality);
  }, [isAuthenticated]);

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

  useEffect(() => {
    if (!isAuthenticated && frameQuality !== DEFAULT_QUALITY) {
      setFrameQuality(DEFAULT_QUALITY);
    }
  }, [frameQuality, isAuthenticated]);

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
          <div className="vidanalyzer-options">
            <div className="vidanalyzer-settings-grid">
              <label className="vidanalyzer-field">
                <span>Frames to extract</span>
                <input
                  type="number"
                  min={MIN_FRAME_COUNT}
                  max={MAX_FRAME_COUNT}
                  step="1"
                  value={frameCount}
                  onChange={handleFrameCountChange}
                  disabled={isBusy}
                />
                <small>Choose between {MIN_FRAME_COUNT} and {MAX_FRAME_COUNT} evenly spaced frames.</small>
              </label>

              <div className="vidanalyzer-field">
                <span>Frame quality</span>
                <div className="vidanalyzer-quality-grid" role="radiogroup" aria-label="Frame quality">
                  {QUALITY_OPTIONS.map((option) => {
                    const isLocked = option.requiresAuth && !isAuthenticated;
                    const isSelected = frameQuality === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        className={`vidanalyzer-quality-option ${isSelected ? 'selected' : ''} ${isLocked ? 'locked' : ''}`}
                        onClick={() => handleQualityChange(option.value)}
                        aria-pressed={isSelected}
                        disabled={isBusy}
                      >
                        <span className="vidanalyzer-quality-head">
                          <span>{option.label}</span>
                          {isLocked && <Lock size={14} />}
                        </span>
                        <small>{option.description}</small>
                      </button>
                    );
                  })}
                </div>
                {!isAuthenticated && (
                  <small>
                    Sign in to unlock High and Original quality extraction.
                  </small>
                )}
              </div>
            </div>
          </div>
        )}

        {videoSource && videoSource.type !== 'youtube' && (
          <FrameExtractor
            videoSource={videoSource}
            frameCount={frameCount}
            quality={frameQuality}
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

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
};

export default VideoAnalyzerApp;
