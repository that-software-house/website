import { Agent, setOpenAIAPI, run } from '@openai/agents';
import { parseMultipart } from './_lib/multipart.js';
import { consumeRateLimit } from './_lib/rateLimit.js';
import { extractSubpath, jsonResponse, methodNotAllowed, optionsResponse } from './_lib/http.js';

// Use Chat Completions API
setOpenAIAPI('chat_completions');

// Define agents
const dataParserAgent = new Agent({
  name: 'Data Parser',
  model: 'gpt-4o-mini',
  instructions: `You are a data schema analyzer. Given a sample of data rows (up to 100 rows), analyze the structure and provide metadata.

ANALYZE:
1. Column names and their data types (number, string, date, boolean)
2. Role of each column (dimension for grouping, measure for aggregation)
3. Data quality issues (missing values, inconsistent formats, outliers)
4. Suggested columns for grouping (categorical/date columns)
5. Suggested columns for metrics (numeric columns suitable for aggregation)

OUTPUT FORMAT (JSON only, no markdown):
{
  "schema": [
    { "name": "column_name", "type": "number|string|date|boolean", "role": "dimension|measure", "sampleValues": ["val1", "val2"] }
  ],
  "rowCount": 100,
  "qualityIssues": [
    { "column": "col_name", "issue": "description", "severity": "low|medium|high" }
  ],
  "suggestedGroupBy": ["category", "date"],
  "suggestedMetrics": ["sales", "quantity"]
}

IMPORTANT: Return ONLY valid JSON. No explanations, no markdown code blocks.`,
});

const dataAnalyzerAgent = new Agent({
  name: 'Data Analyzer',
  model: 'gpt-4o',
  instructions: `You are a data analyst expert. Given a dataset schema and the full data (up to 1000 rows), perform comprehensive analysis.

ANALYZE:
1. Statistical summaries for numeric columns (min, max, mean, median, std)
2. Distribution of categorical values (value counts)
3. Time-based trends if date columns exist
4. Correlations between numeric columns
5. Key business insights and anomalies

OUTPUT FORMAT (JSON only, no markdown):
{
  "statistics": {
    "column_name": { "min": 0, "max": 100, "mean": 50, "median": 48, "std": 15, "nullCount": 2 }
  },
  "categoricalDistribution": {
    "category_column": [
      { "value": "Category A", "count": 150, "percentage": 30 }
    ]
  },
  "trends": [
    { "column": "date", "metric": "sales", "trend": "increasing|decreasing|stable", "changePercent": 15 }
  ],
  "correlations": [
    { "column1": "price", "column2": "quantity", "coefficient": -0.7, "strength": "strong|moderate|weak" }
  ],
  "insights": [
    "Sales increased 15% month-over-month",
    "Category A represents 30% of total revenue"
  ],
  "anomalies": [
    { "description": "Unusual spike in sales on 2024-03-15", "severity": "medium" }
  ]
}

IMPORTANT: Return ONLY valid JSON. No explanations, no markdown code blocks.`,
});

const visualizationAgent = new Agent({
  name: 'Visualization Recommender',
  model: 'gpt-4o',
  instructions: `You are a data visualization expert. Given a data schema and analysis results, recommend the best chart visualizations.

CHART TYPES AVAILABLE:
- bar: For categorical comparisons
- line: For time series and trends
- pie: For part-to-whole relationships (use sparingly, max 6 categories)
- scatter: For correlations between two numeric variables
- area: For cumulative trends or stacked comparisons

GUIDELINES:
1. Recommend 2-4 charts that best represent the data insights
2. Prioritize clarity and actionability
3. Consider the data types and volumes
4. Provide specific axis configurations
5. Include data transformations if needed (aggregations, grouping)

OUTPUT FORMAT (JSON only, no markdown):
{
  "recommendations": [
    {
      "chartType": "bar",
      "title": "Sales by Category",
      "description": "Compare sales performance across product categories",
      "config": {
        "xAxisKey": "category",
        "yAxisKey": "sales",
        "xAxisLabel": "Product Category",
        "yAxisLabel": "Total Sales ($)"
      },
      "rationale": "Bar chart is ideal for comparing discrete categories",
      "priority": 1
    }
  ],
  "dataTransformations": [
    {
      "chartIndex": 0,
      "aggregation": "sum",
      "groupBy": ["category"],
      "metrics": ["sales"]
    }
  ]
}

IMPORTANT: Return ONLY valid JSON. No explanations, no markdown code blocks.`,
});

const MAX_ROWS = 1000;
const SAMPLE_ROWS = 100;

// Parse CSV content
function parseCSV(content) {
  const lines = content.trim().split(/\r?\n/);
  if (lines.length === 0) return { headers: [], rows: [] };

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
  const rows = lines.slice(1).filter(line => line.trim()).map((line) => {
    const values = parseRow(line);
    const row = {};
    headers.forEach((h, i) => {
      row[h] = values[i] ?? '';
    });
    return row;
  });

  return { headers, rows };
}

// Parse JSON content
function parseJSON(content) {
  const data = JSON.parse(content);
  const rows = Array.isArray(data) ? data : data.data || data.rows || [data];
  if (rows.length === 0) return { headers: [], rows: [] };
  const headers = Object.keys(rows[0]);
  return { headers, rows };
}

async function parseExcel(buffer) {
  const XLSX = await import('xlsx');
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const firstSheetName = workbook.SheetNames[0];
  const firstSheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json(firstSheet);

  if (!rows || rows.length === 0) return { headers: [], rows: [] };
  return { headers: Object.keys(rows[0]), rows };
}

// Safely parse JSON from agent output
function safeParseJSON(text) {
  try {
    let cleaned = text.trim();
    if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
    else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
    if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
    return JSON.parse(cleaned.trim());
  } catch (e) {
    console.error('Failed to parse agent output:', e.message);
    return null;
  }
}

// Apply data transformation
function applyTransformation(rows, transformation) {
  if (!transformation) return rows;

  const { aggregation, groupBy, metrics } = transformation;
  if (!groupBy || groupBy.length === 0) return rows;

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

// Run the AI pipeline
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

// Main handler
export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return optionsResponse();
  if (event.httpMethod !== 'POST') return methodNotAllowed();

  const subpath = extractSubpath(event, '/api/data-insights', 'data-insights');
  if (subpath !== '/' && subpath !== '/analyze') {
    return jsonResponse(404, { error: 'Route not found' });
  }

  const rate = await consumeRateLimit(event);
  if (!rate.allowed) {
    return jsonResponse(
      429,
      {
        error: 'Rate limit exceeded',
        message: `You've used all ${rate.usage.limit} free requests today.`,
        usage: rate.usage,
      },
      rate.headers
    );
  }

  try {
    // Parse the uploaded file
    const parsedMultipart = await parseMultipart(event);
    const files = parsedMultipart.files || [];

    if (!files || files.length === 0) {
      return jsonResponse(400, { error: 'No file uploaded' }, rate.headers);
    }

    const file = files[0];
    const filename = file.filename.toLowerCase();
    const content = file.buffer.toString('utf-8');

    let parsedHeaders = [];
    let rows = [];

    // Parse based on file type
    if (filename.endsWith('.csv')) {
      const parsed = parseCSV(content);
      parsedHeaders = parsed.headers;
      rows = parsed.rows;
    } else if (filename.endsWith('.json')) {
      const parsed = parseJSON(content);
      parsedHeaders = parsed.headers;
      rows = parsed.rows;
    } else if (filename.endsWith('.xlsx') || filename.endsWith('.xls')) {
      const parsed = await parseExcel(file.buffer);
      parsedHeaders = parsed.headers;
      rows = parsed.rows;
    } else {
      // Try CSV as fallback
      try {
        const parsed = parseCSV(content);
        parsedHeaders = parsed.headers;
        rows = parsed.rows;
      } catch {
        return jsonResponse(400, { error: 'Unable to parse file' }, rate.headers);
      }
    }

    if (parsedHeaders.length === 0 || rows.length === 0) {
      return jsonResponse(400, { error: 'File contains no data' }, rate.headers);
    }

    // Run the AI pipeline
    const { schema, analysis, visualizations } = await runPipeline(parsedHeaders, rows);

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

    return jsonResponse(
      200,
      {
        parsedData: {
          headers: parsedHeaders,
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
      },
      rate.headers
    );
  } catch (error) {
    console.error('Data insights error:', error);
    return jsonResponse(
      500,
      { error: 'Analysis failed', message: error.message },
      rate.headers
    );
  }
}
