import fs from 'fs';
import express from 'express';
import formidable from 'formidable';
import { run } from '@openai/agents';
import { docAnalyzerAgent } from '../agents/index.js';

export const docAnalyzerRouter = express.Router();

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const SUPPORTED_TYPES = [
  'text/plain',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'text/markdown',
  'application/octet-stream', // fallback some browsers send for binary uploads
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
  // Note: Without full PDF/DOCX parsing libs, we limit extraction for binary files.
  if (!buffer) return '';
  if (mimetype === 'text/plain' || mimetype === 'text/markdown') {
    return buffer.toString('utf-8');
  }
  // Fallback: try to decode as utf-8 for other types.
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
      .map((l) => l.replace(/^[\-\*\d\.\s]+/, '').trim())
      .filter(Boolean);
  }

  // If summary block has multiple lines, take first 4 sentences
  const sentences = summary.split(/(?<=[.?!])\s+/).filter(Boolean);
  summary = sentences.slice(0, 4).join(' ');

  return { summary, keyPoints };
}

docAnalyzerRouter.post('/analyze', async (req, res) => {
  const form = formidable({ multiples: false, maxFileSize: MAX_FILE_SIZE });

  form.parse(req, async (err, fields, files) => {
    try {
      if (err) {
        return res.status(400).json({ error: 'Upload failed', message: err.message });
      }

      const fileData = files.file;
      // formidable v3+ returns files as arrays even with multiples: false
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
          message: 'Please upload a PDF, DOCX, TXT, markdown, or image file',
        });
      }

      const buffer = await fs.promises.readFile(file.filepath);

      // Check if file is an image
      const isImage = IMAGE_TYPES.includes(mimetype) || IMAGE_EXTS.some((ext) => filename.endsWith(ext));

      let prompt;
      let textPreview = '';

      if (isImage) {
        // Handle image files - convert to base64 for vision analysis
        const base64 = buffer.toString('base64');
        const dataUrl = `data:${mimetype || 'image/png'};base64,${base64}`;
        textPreview = '[Image uploaded for analysis]';
        prompt = `You are an expert image analyst. Analyze the following image and provide a concise summary (3-5 sentences) describing what you see, and 5-7 key points about the image content. If there is text in the image, extract and include it. If relevant, suggest a short title.\n\nImage: ${dataUrl}`;
      } else {
        // Handle text-based documents
        const text = parseTextBuffer(buffer, mimetype);

        if (!text || text.trim().length === 0) {
          return res.status(400).json({
            error: 'Extraction failed',
            message: 'Unable to extract text from the uploaded file. Please try a TXT/DOCX/PDF with text content.',
          });
        }

        textPreview = text.slice(0, 2000);
        prompt = `You are an expert document analyst. Provide a concise summary (3-5 sentences) and 5-7 key points of the following document. If relevant, suggest a short title and any potential follow-up actions. Document:\n\n${text}`;
      }

      const result = await run(docAnalyzerAgent, prompt);
      const output = result.finalOutput || '';
      const parsed = parseAnalysisOutput(output);

      res.json({
        summary: parsed.summary || output,
        keyPoints: parsed.keyPoints || [],
        title: fields.title || file.originalFilename || 'Document',
        textPreview,
      });
    } catch (e) {
      console.error('Doc analyzer error:', e);
      res.status(500).json({ error: 'Analysis failed', message: e.message });
    }
  });
});
