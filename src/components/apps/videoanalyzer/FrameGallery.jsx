import React from 'react';
import { Clock } from 'lucide-react';

const FrameGallery = ({ frames, frameDescriptions }) => {
  if (!frames || frames.length === 0) return null;

  const descriptionMap = {};
  if (frameDescriptions) {
    frameDescriptions.forEach((fd) => {
      descriptionMap[fd.timestamp] = fd.description;
    });
  }

  return (
    <div className="vidanalyzer-gallery">
      <h3 className="vidanalyzer-gallery-title">
        Extracted Frames ({frames.length})
      </h3>
      <div className="vidanalyzer-frames-grid">
        {frames.map((frame, idx) => (
          <div key={idx} className="vidanalyzer-frame-card">
            <div className="vidanalyzer-frame-img-wrapper">
              <img src={frame.base64} alt={`Frame at ${frame.timestamp}`} />
              <span className="vidanalyzer-frame-time">
                <Clock size={10} />
                {frame.timestamp}
              </span>
            </div>
            {descriptionMap[frame.timestamp] && (
              <p className="vidanalyzer-frame-desc">
                {descriptionMap[frame.timestamp]}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FrameGallery;
