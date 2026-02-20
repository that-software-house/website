import express from 'express';
import { run } from '@openai/agents';
import { leadFlowAgent } from '../agents/index.js';

export const leadFlowRouter = express.Router();

const SOURCE_LABELS = {
  email: 'email',
  dm: 'social media direct message',
  form: 'website contact form submission',
};

leadFlowRouter.post('/extract', async (req, res) => {
  try {
    const { text, sourceType } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Text is required',
      });
    }

    const source = SOURCE_LABELS[sourceType] || 'unknown source';
    const prompt = `Extract lead data from the following ${source}:\n\n${text}`;

    const result = await run(leadFlowAgent, prompt);
    const output = (result.finalOutput || '').trim();

    if (!output) {
      return res.status(500).json({
        error: 'Extraction failed',
        message: 'Failed to extract lead data. Please try again.',
      });
    }

    // Parse the JSON output
    let lead;
    try {
      lead = JSON.parse(output);
    } catch {
      // Try extracting JSON from markdown code blocks
      const jsonMatch = output.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        lead = JSON.parse(jsonMatch[0]);
      } else {
        return res.status(500).json({
          error: 'Parse failed',
          message: 'Failed to parse extracted lead data.',
        });
      }
    }

    res.json({ lead });
  } catch (err) {
    console.error('LeadFlow extract error:', err);
    res.status(500).json({
      error: 'Extraction failed',
      message: err.message || 'Something went wrong',
    });
  }
});
