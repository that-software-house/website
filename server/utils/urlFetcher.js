import * as cheerio from 'cheerio';

/**
 * Fetches and extracts article content from a URL
 * @param {string} url - The URL to fetch content from
 * @returns {Promise<{title: string, content: string, url: string}>}
 */
export async function fetchUrlContent(url) {
  try {
    console.log(`Fetching URL: ${url}`);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Remove unwanted elements
    $('script, style, nav, header, footer, aside, .advertisement, .ad, .sidebar, .comments, .social-share, .related-articles, noscript, iframe').remove();

    // Try to find the article title
    const title =
      $('h1').first().text().trim() ||
      $('meta[property="og:title"]').attr('content') ||
      $('title').text().trim() ||
      'Untitled Article';

    // Try to extract main article content using common selectors
    let content = '';

    // Common article content selectors
    const articleSelectors = [
      'article',
      '[role="main"]',
      '.article-content',
      '.article-body',
      '.post-content',
      '.entry-content',
      '.content-body',
      '.story-body',
      'main',
      '.main-content',
    ];

    for (const selector of articleSelectors) {
      const element = $(selector);
      if (element.length > 0) {
        content = element.text().trim();
        if (content.length > 200) {
          break;
        }
      }
    }

    // Fallback: get all paragraph text
    if (!content || content.length < 200) {
      const paragraphs = [];
      $('p').each((_, el) => {
        const text = $(el).text().trim();
        if (text.length > 30) {
          paragraphs.push(text);
        }
      });
      content = paragraphs.join('\n\n');
    }

    // Clean up the content
    content = content
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n\n')
      .trim();

    // Limit content length to avoid token limits
    if (content.length > 10000) {
      content = content.substring(0, 10000) + '...';
    }

    console.log(`Extracted ${content.length} characters from ${url}`);
    console.log(`Title: ${title}`);

    if (!content || content.length < 100) {
      throw new Error('Could not extract meaningful content from the URL');
    }

    return {
      title,
      content: `Title: ${title}\n\n${content}`,
      url,
    };
  } catch (error) {
    console.error('URL fetch error:', error);
    throw new Error(`Failed to extract content from URL: ${error.message}`);
  }
}

/**
 * Extracts YouTube video ID from URL
 * @param {string} url - YouTube URL
 * @returns {string|null}
 */
export function extractYouTubeVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }
  return null;
}
