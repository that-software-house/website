import React, { useRef, useEffect, useCallback } from 'react';

const DEFAULT_INTERVAL = 3; // seconds between frames
const MAX_FRAMES = 15;
const JPEG_QUALITY = 0.7;
const TARGET_WIDTH = 640;

const FrameExtractor = ({ videoSource, onExtractionStart, onFrameExtracted, onExtractionComplete, onError }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const extractFrames = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !videoSource) return;

    onExtractionStart?.();

    try {
      video.src = videoSource.src;
      if (videoSource.type === 'url') {
        video.crossOrigin = 'anonymous';
      }

      await new Promise((resolve, reject) => {
        video.onloadedmetadata = resolve;
        video.onerror = () => reject(new Error('Failed to load video. Check the file or URL.'));
        // timeout after 15s
        setTimeout(() => reject(new Error('Video loading timed out.')), 15000);
      });

      const duration = video.duration;
      if (!duration || !isFinite(duration)) {
        throw new Error('Could not determine video duration.');
      }

      // Calculate timestamps
      const interval = Math.max(DEFAULT_INTERVAL, duration / MAX_FRAMES);
      const timestamps = [];
      for (let t = 0; t < duration && timestamps.length < MAX_FRAMES; t += interval) {
        timestamps.push(t);
      }

      // Set canvas dimensions
      const scale = TARGET_WIDTH / video.videoWidth;
      canvas.width = TARGET_WIDTH;
      canvas.height = Math.round(video.videoHeight * scale);
      const ctx = canvas.getContext('2d');

      const frames = [];

      for (const timestamp of timestamps) {
        video.currentTime = timestamp;

        await new Promise((resolve) => {
          video.onseeked = resolve;
        });

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL('image/jpeg', JPEG_QUALITY);

        const mins = Math.floor(timestamp / 60);
        const secs = Math.floor(timestamp % 60);
        const formattedTime = `${mins}:${secs.toString().padStart(2, '0')}`;

        const frame = { base64, timestamp: formattedTime, rawTime: timestamp };
        frames.push(frame);
        onFrameExtracted?.(frame, frames.length, timestamps.length);
      }

      onExtractionComplete?.(frames);
    } catch (err) {
      onError?.(err.message || 'Failed to extract frames from video.');
    }
  }, [videoSource, onExtractionStart, onFrameExtracted, onExtractionComplete, onError]);

  useEffect(() => {
    if (videoSource) {
      extractFrames();
    }
  }, [videoSource, extractFrames]);

  return (
    <>
      <video ref={videoRef} style={{ display: 'none' }} preload="metadata" muted />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </>
  );
};

export default FrameExtractor;
