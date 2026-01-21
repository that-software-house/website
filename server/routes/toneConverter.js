import express from 'express';
import { run } from '@openai/agents';
import { toneConverterAgent } from '../agents/index.js';

export const toneConverterRouter = express.Router();

const TONE_PROMPTS = {
  professional: 'Rewrite this text in a professional, formal business tone. Use proper grammar, avoid contractions, and maintain a respectful, authoritative voice suitable for corporate communication.',
  casual: 'Rewrite this text in a casual, relaxed tone. Use conversational language, contractions, and a friendly approach as if talking to a friend.',
  friendly: 'Rewrite this text in a warm, friendly, and approachable tone. Be personable, use inclusive language, and make the reader feel welcomed and valued.',
  persuasive: 'Rewrite this text in a persuasive, compelling tone. Use strong action words, emphasize benefits, create urgency, and motivate the reader to take action.',
  confident: 'Rewrite this text in a confident, bold, and assertive tone. Use direct language, strong statements, and project authority and expertise.',
  empathetic: 'Rewrite this text in an empathetic, understanding, and supportive tone. Acknowledge feelings, show compassion, and use language that validates the reader\'s perspective.',
  witty: 'Rewrite this text in a witty, clever, and slightly humorous tone. Add clever wordplay or light humor while keeping the core message intact and professional.',
  academic: 'Rewrite this text in an academic, scholarly tone. Use formal language, precise terminology, objective voice, and structure suitable for academic or research contexts.',
};

toneConverterRouter.post('/convert', async (req, res) => {
  try {
    const { text, tone } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Text is required',
      });
    }

    if (!tone || !TONE_PROMPTS[tone]) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Valid tone is required',
      });
    }

    const toneInstruction = TONE_PROMPTS[tone];
    const prompt = `${toneInstruction}\n\nOriginal text:\n${text}\n\nRewritten text:`;

    const result = await run(toneConverterAgent, prompt);
    const convertedText = (result.finalOutput || '').trim();

    if (!convertedText) {
      return res.status(500).json({
        error: 'Conversion failed',
        message: 'Failed to convert text. Please try again.',
      });
    }

    res.json({ convertedText });
  } catch (err) {
    console.error('Tone converter error:', err);
    res.status(500).json({
      error: 'Conversion failed',
      message: err.message || 'Something went wrong',
    });
  }
});
