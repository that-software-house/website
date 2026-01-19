import express from 'express';
import cors from 'cors';
import { contentRouter } from './routes/content.js';
import { docAnalyzerRouter } from './routes/docAnalyzer.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/content', contentRouter);
app.use('/api/doc-analyzer', docAnalyzerRouter);

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
