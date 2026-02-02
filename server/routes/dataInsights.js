import fs from 'fs';
import express from 'express';
import formidable from 'formidable';
import { run } from '@openai/agents';
import { dataParserAgent, dataAnalyzerAgent, visualizationAgent } from '../agents/dataInsightsAgents.js';

export const dataInsightsRouter = express.Router();

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_ROWS = 1000;
const SAMPLE_ROWS = 100;

const SUPPORTED_TYPES = [
  'text/csv',
  'application/json',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'application/octet-stream',
];

const SUPPORTED_EXTS = ['.csv', '.json', '.xlsx', '.xls'];

/**
 * Parse CSV content into rows
 */
function parseCSV(content) {
  const lines = content.trim().split(/\r?\n/);
  if (lines.length === 0) return { headers: [], rows: [] };

  // Simple CSV parsing (handles basic cases)
  const parseRow = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseRow(lines[0]);
  const rows = lines.slice(1).map((line) => {
    const values = parseRow(line);
    const row = {};
    headers.forEach((h, i) => {
      row[h] = values[i] ?? '';
    });
    return row;
  });

  return { headers, rows };
}

/**
 * Parse JSON content into rows
 */
function parseJSON(content) {
  const data = JSON.parse(content);
  const rows = Array.isArray(data) ? data : data.data || data.rows || [data];

  if (rows.length === 0) return { headers: [], rows: [] };

  const headers = Object.keys(rows[0]);
  return { headers, rows };
}

/**
 * Parse Excel content using xlsx library
 */
async function parseExcel(buffer) {
  // Dynamic import for xlsx
  const XLSX = await import('xlsx');
  const workbook = XLSX.read(buffer, { type: 'buffer' });

  // Get the first sheet
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  // Convert to JSON
  const rows = XLSX.utils.sheet_to_json(sheet);

  if (rows.length === 0) return { headers: [], rows: [] };

  const headers = Object.keys(rows[0]);
  return { headers, rows };
}

/**
 * Safely parse JSON from agent output
 */
function safeParseJSON(text) {
  try {
    // Remove markdown code blocks if present
    let cleaned = text.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.slice(7);
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.slice(3);
    }
    if (cleaned.endsWith('```')) {
      cleaned = cleaned.slice(0, -3);
    }
    return JSON.parse(cleaned.trim());
  } catch (e) {
    console.error('Failed to parse agent output:', e.message);
    return null;
  }
}

/**
 * Run the data insights pipeline
 */
async function runPipeline(headers, rows) {
  const sampleRows = rows.slice(0, SAMPLE_ROWS);
  const allRows = rows.slice(0, MAX_ROWS);

  // Step 1: Parse schema
  const parserPrompt = `Analyze this dataset schema and structure.

Headers: ${JSON.stringify(headers)}

Sample data (first ${sampleRows.length} rows):
${JSON.stringify(sampleRows, null, 2)}

Total rows in dataset: ${rows.length}`;

  const parserResult = await run(dataParserAgent, parserPrompt);
  const schema = safeParseJSON(parserResult.finalOutput) || {
    schema: headers.map((h) => ({ name: h, type: 'string', role: 'dimension' })),
    rowCount: rows.length,
    qualityIssues: [],
    suggestedGroupBy: [],
    suggestedMetrics: [],
  };

  // Step 2: Analyze data
  const analyzerPrompt = `Analyze this dataset comprehensively.

Schema: ${JSON.stringify(schema)}

Full data (${allRows.length} rows):
${JSON.stringify(allRows, null, 2)}`;

  const analyzerResult = await run(dataAnalyzerAgent, analyzerPrompt);
  const analysis = safeParseJSON(analyzerResult.finalOutput) || {
    statistics: {},
    categoricalDistribution: {},
    trends: [],
    correlations: [],
    insights: ['Unable to generate detailed insights'],
    anomalies: [],
  };

  // Step 3: Generate visualization recommendations
  const vizPrompt = `Recommend visualizations for this analyzed dataset.

Schema: ${JSON.stringify(schema)}

Analysis results: ${JSON.stringify(analysis)}

Available data columns: ${JSON.stringify(headers)}`;

  const vizResult = await run(visualizationAgent, vizPrompt);
  const visualizations = safeParseJSON(vizResult.finalOutput) || {
    recommendations: [],
    dataTransformations: [],
  };

  return { schema, analysis, visualizations };
}

/**
 * Apply data transformation for a chart
 */
function applyTransformation(rows, transformation) {
  if (!transformation) return rows;

  const { aggregation, groupBy, metrics } = transformation;

  if (!groupBy || groupBy.length === 0) return rows;

  // Group data
  const groups = {};
  rows.forEach((row) => {
    const key = groupBy.map((g) => row[g]).join('|||');
    if (!groups[key]) {
      groups[key] = {
        _groupKey: key,
        _count: 0,
        ...Object.fromEntries(groupBy.map((g) => [g, row[g]])),
      };
      metrics?.forEach((m) => {
        groups[key][m] = [];
      });
    }
    groups[key]._count++;
    metrics?.forEach((m) => {
      const val = parseFloat(row[m]);
      if (!isNaN(val)) {
        groups[key][m].push(val);
      }
    });
  });

  // Apply aggregation
  return Object.values(groups).map((group) => {
    const result = { ...group };
    delete result._groupKey;

    metrics?.forEach((m) => {
      const values = group[m];
      if (Array.isArray(values) && values.length > 0) {
        switch (aggregation) {
          case 'sum':
            result[m] = values.reduce((a, b) => a + b, 0);
            break;
          case 'avg':
          case 'mean':
            result[m] = values.reduce((a, b) => a + b, 0) / values.length;
            break;
          case 'min':
            result[m] = Math.min(...values);
            break;
          case 'max':
            result[m] = Math.max(...values);
            break;
          case 'count':
            result[m] = values.length;
            break;
          default:
            result[m] = values.reduce((a, b) => a + b, 0);
        }
      } else {
        result[m] = 0;
      }
    });

    delete result._count;
    return result;
  });
}

dataInsightsRouter.post('/analyze', async (req, res) => {
  const form = formidable({ multiples: false, maxFileSize: MAX_FILE_SIZE });

  form.parse(req, async (err, fields, files) => {
    try {
      if (err) {
        return res.status(400).json({ error: 'Upload failed', message: err.message });
      }

      const fileData = files.file;
      const file = Array.isArray(fileData) ? fileData[0] : fileData;
      if (!file) {
        return res.status(400).json({ error: 'Invalid request', message: 'File is required' });
      }

      const mimetype = (file.mimetype || '').toLowerCase();
      const filename = (file.originalFilename || '').toLowerCase();
      const hasSupportedExt = SUPPORTED_EXTS.some((ext) => filename.endsWith(ext));
      const typeAllowed = SUPPORTED_TYPES.includes(mimetype);

      if (!typeAllowed && !hasSupportedExt) {
        return res.status(400).json({
          error: 'Unsupported file',
          message: 'Please upload a CSV, JSON, or Excel file',
        });
      }

      const buffer = await fs.promises.readFile(file.filepath);
      let headers = [];
      let rows = [];

      // Parse based on file type
      if (filename.endsWith('.csv') || mimetype === 'text/csv') {
        const content = buffer.toString('utf-8');
        const parsed = parseCSV(content);
        headers = parsed.headers;
        rows = parsed.rows;
      } else if (filename.endsWith('.json') || mimetype === 'application/json') {
        const content = buffer.toString('utf-8');
        const parsed = parseJSON(content);
        headers = parsed.headers;
        rows = parsed.rows;
      } else if (
        filename.endsWith('.xlsx') ||
        filename.endsWith('.xls') ||
        mimetype.includes('spreadsheet') ||
        mimetype.includes('excel')
      ) {
        const parsed = await parseExcel(buffer);
        headers = parsed.headers;
        rows = parsed.rows;
      } else {
        // Try CSV as fallback
        try {
          const content = buffer.toString('utf-8');
          const parsed = parseCSV(content);
          headers = parsed.headers;
          rows = parsed.rows;
        } catch {
          return res.status(400).json({
            error: 'Parse failed',
            message: 'Unable to parse the uploaded file',
          });
        }
      }

      if (headers.length === 0 || rows.length === 0) {
        return res.status(400).json({
          error: 'Empty file',
          message: 'The uploaded file contains no data',
        });
      }

      // Run the AI pipeline
      const { schema, analysis, visualizations } = await runPipeline(headers, rows);

      // Prepare chart data with transformations
      const chartData = visualizations.recommendations.map((rec, idx) => {
        const transformation = visualizations.dataTransformations?.find(
          (t) => t.chartIndex === idx
        );
        const transformedData = transformation
          ? applyTransformation(rows.slice(0, MAX_ROWS), transformation)
          : rows.slice(0, 100);

        return {
          ...rec,
          data: transformedData,
        };
      });

      res.json({
        parsedData: {
          headers,
          rows: rows.slice(0, MAX_ROWS),
          rowCount: rows.length,
          preview: rows.slice(0, 10),
        },
        schema,
        analysis,
        visualizations: {
          ...visualizations,
          recommendations: chartData,
        },
      });
    } catch (e) {
      console.error('Data insights error:', e);
      res.status(500).json({ error: 'Analysis failed', message: e.message });
    }
  });
});
