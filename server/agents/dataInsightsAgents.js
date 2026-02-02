import { Agent, setOpenAIAPI } from '@openai/agents';

// Use Chat Completions API instead of Responses API
setOpenAIAPI('chat_completions');

/**
 * Data Parser Agent
 * Analyzes data schema and provides metadata about the dataset
 */
export const dataParserAgent = new Agent({
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

/**
 * Data Analyzer Agent
 * Performs statistical analysis and finds patterns in the data
 */
export const dataAnalyzerAgent = new Agent({
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
    "Category A represents 30% of total revenue",
    "Strong negative correlation between price and quantity sold"
  ],
  "anomalies": [
    { "description": "Unusual spike in sales on 2024-03-15", "severity": "medium" }
  ]
}

IMPORTANT: Return ONLY valid JSON. No explanations, no markdown code blocks. Be precise with statistics.`,
});

/**
 * Visualization Agent
 * Recommends chart types and configurations based on data analysis
 */
export const visualizationAgent = new Agent({
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

IMPORTANT: Return ONLY valid JSON. No explanations, no markdown code blocks. Order recommendations by priority.`,
});
