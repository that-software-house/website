import express from 'express';
import cors from 'cors';
import { contentRouter } from './routes/content.js';
import { docAnalyzerRouter } from './routes/docAnalyzer.js';
import { toneConverterRouter } from './routes/toneConverter.js';
import { chatRouter } from './routes/chat.js';
import { dataInsightsRouter } from './routes/dataInsights.js';
import { scheduleRouter } from './routes/schedule.js';
import { invoiceChaserRouter } from './routes/invoiceChaser.js';
import { authMiddleware, rateLimitMiddleware, getUsage } from './middleware/rateLimit.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Auth middleware for all API routes
app.use('/api', authMiddleware);

// Usage endpoint (no rate limit)
app.get('/api/usage', (req, res) => {
  const usage = getUsage(req);
  res.json(usage);
});

// Apply rate limiting to AI routes
app.use('/api/content', rateLimitMiddleware, contentRouter);
app.use('/api/doc-analyzer', rateLimitMiddleware, docAnalyzerRouter);
app.use('/api/tone', rateLimitMiddleware, toneConverterRouter);
app.use('/api/data-insights', rateLimitMiddleware, dataInsightsRouter);
app.use('/api/invoice-chaser', rateLimitMiddleware, invoiceChaserRouter);
app.use('/api/schedule', scheduleRouter);

// Chat widget (no rate limit - for website visitors)
app.use('/api/chat', chatRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
  });
});

app.listen(PORT, () => {
  console.log(`Content API server running on http://localhost:${PORT}`);
});
