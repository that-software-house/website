import { Agent, run, setOpenAIAPI } from '@openai/agents';
import { consumeRateLimit } from './_lib/rateLimit.js';
import { extractSubpath, jsonResponse, methodNotAllowed, optionsResponse } from './_lib/http.js';

setOpenAIAPI('chat_completions');

const toneConverterAgent = new Agent({
  name: 'Tone Converter',
  model: 'gpt-4o-mini',
  instructions: `You are an expert writing style converter. Rewrite the text in the requested tone while preserving meaning.

Rules:
- Keep core meaning and key details.
- Avoid adding facts not present in the original.
- Keep similar length unless clarity requires small adjustments.
- Return only rewritten text.`,
});

const TONE_PROMPTS = {
  professional: 'Rewrite this text in a professional, formal business tone.',
  casual: 'Rewrite this text in a casual, relaxed conversational tone.',
  friendly: 'Rewrite this text in a warm, friendly, and approachable tone.',
  persuasive: 'Rewrite this text in a persuasive and compelling tone.',
  confident: 'Rewrite this text in a confident and assertive tone.',
  empathetic: 'Rewrite this text in an empathetic and supportive tone.',
  witty: 'Rewrite this text in a witty and slightly humorous tone.',
  academic: 'Rewrite this text in an academic and scholarly tone.',
};

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return optionsResponse();
  if (event.httpMethod !== 'POST') return methodNotAllowed();

  const subpath = extractSubpath(event, '/api/tone', 'tone');
  if (subpath !== '/' && subpath !== '/convert') {
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
    const body = JSON.parse(event.body || '{}');
    const { text, tone } = body;

    if (!text || !String(text).trim()) {
      return jsonResponse(400, { error: 'Invalid request', message: 'Text is required' }, rate.headers);
    }

    if (!tone || !TONE_PROMPTS[tone]) {
      return jsonResponse(400, { error: 'Invalid request', message: 'Valid tone is required' }, rate.headers);
    }

    const prompt = `${TONE_PROMPTS[tone]}\n\nOriginal text:\n${text}\n\nRewritten text:`;
    const result = await run(toneConverterAgent, prompt);

    return jsonResponse(
      200,
      { convertedText: String(result.finalOutput || '').trim() },
      rate.headers
    );
  } catch (error) {
    return jsonResponse(
      500,
      { error: 'Conversion failed', message: error.message || 'Something went wrong' },
      rate.headers
    );
  }
}
