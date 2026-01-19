/**
 * Content Generation API Service
 * Calls the backend API which uses OpenAI Agents SDK
 */

const API_BASE = '/api/content';
const DOC_API_BASE = '/api/doc-analyzer';

async function parseJsonSafe(response) {
  try {
    return await response.json();
  } catch (err) {
    return null;
  }
}

/**
 * Generate content for multiple platforms
 * @param {string} content - The source content to transform
 * @param {string[]} formats - Array of formats: 'linkedin', 'twitter', 'carousel'
 * @param {string} sourceType - The type of source: 'text', 'url', 'youtube', 'file'
 * @returns {Promise<{results: Object, errors: Object}>}
 */
export async function generateContent(content, formats, sourceType = 'text') {
  const response = await fetch(`${API_BASE}/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
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
  const response = await fetch(`${API_BASE}/linkedin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
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
  const response = await fetch(`${API_BASE}/twitter`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
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
  const response = await fetch(`${API_BASE}/carousel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
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
  const response = await fetch(`${API_BASE}/summarize`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
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

  const response = await fetch(`${DOC_API_BASE}/analyze`, {
    method: 'POST',
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
  extractFromUrl,
  extractFromYouTube,
};
