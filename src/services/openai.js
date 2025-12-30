/**
 * Content Generation API Service
 * Calls the backend API which uses OpenAI Agents SDK
 */

const API_BASE = '/api/content';

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

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to generate content');
  }

  return response.json();
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

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to generate LinkedIn post');
  }

  const data = await response.json();
  return data.post;
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

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to generate Twitter thread');
  }

  const data = await response.json();
  return data.thread;
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

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to generate carousel slides');
  }

  const data = await response.json();
  return data.slides;
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

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to summarize content');
  }

  const data = await response.json();
  return data.summary;
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
