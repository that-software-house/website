import React, { useEffect, useMemo, useState } from 'react';
import { Clock, Download, Check, Loader2 } from 'lucide-react';
import { downloadFramesZip } from './frameZip';

const FrameGallery = ({ frames, frameDescriptions }) => {
  const [selectedIndices, setSelectedIndices] = useState([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  useEffect(() => {
    if (!frames || frames.length === 0) {
      setSelectedIndices([]);
      return;
    }

    setSelectedIndices(frames.map((_, index) => index));
  }, [frames]);

  const descriptionMap = useMemo(() => {
    const map = {};

    if (frameDescriptions) {
      frameDescriptions.forEach((fd) => {
        map[fd.timestamp] = fd.description;
      });
    }

    return map;
  }, [frameDescriptions]);

  if (!frames || frames.length === 0) return null;

  const selectedCount = selectedIndices.length;
  const selectedSet = new Set(selectedIndices);

  const toggleFrameSelection = (index) => {
    setDownloadSuccess(false);
    setSelectedIndices((current) => (
      current.includes(index)
        ? current.filter((value) => value !== index)
        : [...current, index].sort((a, b) => a - b)
    ));
  };

  const handleSelectAll = () => {
    setDownloadSuccess(false);
    setSelectedIndices(frames.map((_, index) => index));
  };

  const handleClearSelection = () => {
    setDownloadSuccess(false);
    setSelectedIndices([]);
  };

  const handleDownloadSelected = async () => {
    if (selectedCount === 0 || isDownloading) return;

    setIsDownloading(true);
    setDownloadSuccess(false);

    try {
      downloadFramesZip(frames, selectedIndices);
      setDownloadSuccess(true);
      window.setTimeout(() => setDownloadSuccess(false), 2000);
    } catch (error) {
      console.error('Failed to download selected frames:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="vidanalyzer-gallery">
      <div className="vidanalyzer-gallery-header">
        <div>
          <h3 className="vidanalyzer-gallery-title">
            Extracted Frames ({frames.length})
          </h3>
          <p className="vidanalyzer-gallery-subtitle">
            {selectedCount} of {frames.length} selected
          </p>
        </div>

        <div className="vidanalyzer-gallery-actions">
          <button
            className="vidanalyzer-secondary-btn"
            onClick={handleSelectAll}
            disabled={selectedCount === frames.length}
            type="button"
          >
            Select All
          </button>
          <button
            className="vidanalyzer-secondary-btn"
            onClick={handleClearSelection}
            disabled={selectedCount === 0}
            type="button"
          >
            Clear
          </button>
          <button
            className={`vidanalyzer-download-btn ${downloadSuccess ? 'success' : ''}`}
            onClick={handleDownloadSelected}
            disabled={selectedCount === 0 || isDownloading}
            type="button"
          >
            {isDownloading ? (
              <>
                <Loader2 size={16} className="spinning" />
                <span>Preparing ZIP...</span>
              </>
            ) : downloadSuccess ? (
              <>
                <Check size={16} />
                <span>Downloaded</span>
              </>
            ) : (
              <>
                <Download size={16} />
                <span>Download Selected (.zip)</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="vidanalyzer-frames-grid">
        {frames.map((frame, idx) => {
          const isSelected = selectedSet.has(idx);

          return (
            <button
              key={`${frame.timestamp}-${idx}`}
              className={`vidanalyzer-frame-card ${isSelected ? 'selected' : 'unselected'}`}
              onClick={() => toggleFrameSelection(idx)}
              type="button"
            >
              <div className="vidanalyzer-frame-img-wrapper">
                <img src={frame.base64} alt={`Frame at ${frame.timestamp}`} />
                <span className="vidanalyzer-frame-time">
                  <Clock size={10} />
                  {frame.timestamp}
                </span>
                <span className={`vidanalyzer-frame-check ${isSelected ? 'selected' : ''}`}>
                  {isSelected && <Check size={12} />}
                </span>
              </div>
              {descriptionMap[frame.timestamp] && (
                <p className="vidanalyzer-frame-desc">
                  {descriptionMap[frame.timestamp]}
                </p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default FrameGallery;
