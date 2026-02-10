import { Agent, run, setOpenAIAPI } from '@openai/agents';
import { parseMultipart } from './_lib/multipart.js';
import { consumeRateLimit } from './_lib/rateLimit.js';
import { extractSubpath, jsonResponse, methodNotAllowed, optionsResponse } from './_lib/http.js';

setOpenAIAPI('chat_completions');

const docAnalyzerAgent = new Agent({
  name: 'Document Analyzer',
  model: 'gpt-4o-mini',
  instructions: `You are a precise document analyst.

Given any text, produce:
1) A concise summary (3-5 sentences)
2) 5-7 bullet key points
3) (Optional) One suggested title

Format:
Title: <optional title>
Summary:
- sentence 1
- sentence 2
Key Points:
- point 1
- point 2`,
});

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const SUPPORTED_TYPES = [
  'text/plain',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'text/markdown',
  'application/octet-stream',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/gif',
  'image/webp',
];
const SUPPORTED_EXTS = ['.pdf', '.doc', '.docx', '.txt', '.md', '.markdown', '.png', '.jpg', '.jpeg', '.gif', '.webp'];
const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
const IMAGE_EXTS = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];

function parseTextBuffer(buffer, mimetype = '') {
  if (!buffer) return '';
  if (mimetype === 'text/plain' || mimetype === 'text/markdown') {
    return buffer.toString('utf-8');
  }
  return buffer.toString('utf-8');
}

function parseAnalysisOutput(text = '') {
  let summary = text.trim();
  let keyPoints = [];

  const parts = text.split(/Key Points:/i);
  if (parts.length > 1) {
    summary = parts[0].trim();
    keyPoints = parts[1]
      .split(/\r?\n/)
      .map((line) => line.replace(/^[\-\*\d\.\s]+/, '').trim())
      .filter(Boolean);
  }

  const sentences = summary.split(/(?<=[.?!])\s+/).filter(Boolean);
  summary = sentences.slice(0, 4).join(' ');

  return { summary, keyPoints };
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return optionsResponse();
  if (event.httpMethod !== 'POST') return methodNotAllowed();

  const subpath = extractSubpath(event, '/api/doc-analyzer', 'doc-analyzer');
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
    const { fields, files } = await parseMultipart(event);
    const file = Array.isArray(files) ? files[0] : null;

    if (!file) {
      return jsonResponse(400, { error: 'Invalid request', message: 'File is required' }, rate.headers);
    }

    if (file.buffer.length > MAX_FILE_SIZE) {
      return jsonResponse(400, { error: 'File too large', message: 'Max size is 10MB' }, rate.headers);
    }

    const mimetype = String(file.mimeType || '').toLowerCase();
    const filename = String(file.filename || '').toLowerCase();
    const hasSupportedExt = SUPPORTED_EXTS.some((ext) => filename.endsWith(ext));
    const typeAllowed = SUPPORTED_TYPES.includes(mimetype);

    if (!typeAllowed && !hasSupportedExt) {
      return jsonResponse(
        400,
        { error: 'Unsupported file', message: 'Please upload a PDF, DOCX, TXT, markdown, or image file' },
        rate.headers
      );
    }

    const isImage = IMAGE_TYPES.includes(mimetype) || IMAGE_EXTS.some((ext) => filename.endsWith(ext));

    let prompt;
    let textPreview = '';

    if (isImage) {
      const base64 = file.buffer.toString('base64');
      const dataUrl = `data:${mimetype || 'image/png'};base64,${base64}`;
      textPreview = '[Image uploaded for analysis]';
      prompt = `Analyze the following image and provide a concise summary (3-5 sentences) and 5-7 key points. Include extracted text if present.\n\nImage: ${dataUrl}`;
    } else {
      const text = parseTextBuffer(file.buffer, mimetype);
      if (!text || !text.trim()) {
        return jsonResponse(
          400,
          { error: 'Extraction failed', message: 'Unable to extract text from the uploaded file' },
          rate.headers
        );
      }

      textPreview = text.slice(0, 2000);
      prompt = `Analyze this document and provide a concise summary (3-5 sentences), 5-7 key points, and optionally a short title.\n\nDocument:\n${text}`;
    }

    const result = await run(docAnalyzerAgent, prompt);
    const output = String(result.finalOutput || '');
    const parsed = parseAnalysisOutput(output);

    return jsonResponse(
      200,
      {
        summary: parsed.summary || output,
        keyPoints: parsed.keyPoints || [],
        title: fields?.title || file.filename || 'Document',
        textPreview,
      },
      rate.headers
    );
  } catch (error) {
    return jsonResponse(500, { error: 'Analysis failed', message: error.message }, rate.headers);
  }
}
