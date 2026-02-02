import React, { useState } from 'react';
import { toPng } from 'html-to-image';
import { Download, Loader2, Check } from 'lucide-react';

const ChartExporter = ({ chartRef, chartTitle, disabled }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const handleExport = async () => {
    if (!chartRef?.current || isExporting) return;

    setIsExporting(true);
    setExportSuccess(false);

    try {
      const dataUrl = await toPng(chartRef.current, {
        quality: 0.95,
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        style: {
          padding: '20px',
        },
      });

      // Create download link
      const link = document.createElement('a');
      const filename = chartTitle
        ? `${chartTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-chart.png`
        : 'data-insights-chart.png';

      link.download = filename;
      link.href = dataUrl;
      link.click();

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 2000);
    } catch (error) {
      console.error('Failed to export chart:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      className={`datainsights-export-btn ${exportSuccess ? 'success' : ''}`}
      onClick={handleExport}
      disabled={disabled || isExporting || !chartRef?.current}
      title="Export chart as PNG"
    >
      {isExporting ? (
        <>
          <Loader2 size={16} className="spinning" />
          <span>Exporting...</span>
        </>
      ) : exportSuccess ? (
        <>
          <Check size={16} />
          <span>Exported!</span>
        </>
      ) : (
        <>
          <Download size={16} />
          <span>Export PNG</span>
        </>
      )}
    </button>
  );
};

export default ChartExporter;
