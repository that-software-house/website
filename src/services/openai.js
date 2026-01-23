/**
 * Content Generation API Service
 * Calls the backend API which uses OpenAI Agents SDK
 */

import { supabase } from '@/lib/supabase';

const API_BASE = '/api/content';
const DOC_API_BASE = '/api/doc-analyzer';
const TONE_API_BASE = '/api/tone';

async function parseJsonSafe(response) {
  try {
    return await response.json();
  } catch (err) {
    return null;
  }
}

async function getAuthHeaders() {
  const headers = {
    'Content-Type': 'application/json',
  };

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }
  } catch (err) {
    // Continue without auth
  }

  return headers;
}

/**
 * Generate content for multiple platforms
 * @param {string} content - The source content to transform
 * @param {string[]} formats - Array of formats: 'linkedin', 'twitter', 'carousel'
 * @param {string} sourceType - The type of source: 'text', 'url', 'youtube', 'file'
 * @returns {Promise<{results: Object, errors: Object}>}
 */
export async function generateContent(content, formats, sourceType = 'text') {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE}/generate`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ content, formats, sourceType }),
  });

  const data = await parseJsonSafe(response);
  if (!response.ok) {
    const message = data?.message || data?.error || 'Failed to generate content';
    throw new Error(message);
  }

  return data || {};
}

/**
 * Generate a LinkedIn post from content
 * @param {string} content - The source content
 * @returns {Promise<string>}
 */
export async function generateLinkedInPost(content) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE}/linkedin`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ content }),
  });

  const data = await parseJsonSafe(response);
  if (!response.ok) {
    const message = data?.message || data?.error || 'Failed to generate LinkedIn post';
    throw new Error(message);
  }

  return data?.post || '';
}

/**
 * Generate a Twitter thread from content
 * @param {string} content - The source content
 * @returns {Promise<string[]>}
 */
export async function generateTwitterThread(content) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE}/twitter`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ content }),
  });

  const data = await parseJsonSafe(response);
  if (!response.ok) {
    const message = data?.message || data?.error || 'Failed to generate Twitter thread';
    throw new Error(message);
  }

  return data?.thread || [];
}

/**
 * Generate carousel slides from content
 * @param {string} content - The source content
 * @returns {Promise<string[]>}
 */
export async function generateCarouselSlides(content) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE}/carousel`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ content }),
  });

  const data = await parseJsonSafe(response);
  if (!response.ok) {
    const message = data?.message || data?.error || 'Failed to generate carousel slides';
    throw new Error(message);
  }

  return data?.slides || [];
}

/**
 * Summarize content into key points
 * @param {string} content - The source content
 * @param {number} maxPoints - Maximum number of key points
 * @returns {Promise<string>}
 */
export async function summarizeContent(content, maxPoints = 5) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE}/summarize`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ content, maxPoints }),
  });

  const data = await parseJsonSafe(response);
  if (!response.ok) {
    const message = data?.message || data?.error || 'Failed to summarize content';
    throw new Error(message);
  }

  return data?.summary || '';
}

export async function analyzeDocument(file) {
  const formData = new FormData();
  formData.append('file', file);

  // Get auth headers but exclude Content-Type (FormData sets it automatically)
  const authHeaders = await getAuthHeaders();
  delete authHeaders['Content-Type'];

  const response = await fetch(`${DOC_API_BASE}/analyze`, {
    method: 'POST',
    headers: authHeaders,
    body: formData,
  });

  const data = await parseJsonSafe(response);
  if (!response.ok) {
    const message = data?.message || data?.error || 'Failed to analyze document';
    throw new Error(message);
  }

  return data || {};
}

/**
 * Convert text to a different tone
 * @param {string} text - The text to convert
 * @param {string} tone - The target tone
 * @returns {Promise<string>}
 */
export async function convertTone(text, tone) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${TONE_API_BASE}/convert`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ text, tone }),
  });

  const data = await parseJsonSafe(response);
  if (!response.ok) {
    const message = data?.message || data?.error || 'Failed to convert tone';
    throw new Error(message);
  }

  return data?.convertedText || '';
}

/**
 * Extract content from URL (handled by backend)
 * @param {string} url - The URL to extract content from
 * @returns {Promise<string>}
 */
export async function extractFromUrl(url) {
  // URL extraction is handled automatically by the generate endpoint
  // when sourceType is 'url'
  return url;
}

/**
 * Extract transcript from YouTube (handled by backend)
 * @param {string} url - The YouTube URL
 * @returns {Promise<string>}
 */
export async function extractFromYouTube(url) {
  // YouTube extraction is handled automatically by the generate endpoint
  // when sourceType is 'youtube'
  return url;
}

export default {
  generateContent,
  generateLinkedInPost,
  generateTwitterThread,
  generateCarouselSlides,
  summarizeContent,
  analyzeDocument,
  convertTone,
  extractFromUrl,
  extractFromYouTube,
};
