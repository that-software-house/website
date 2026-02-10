import { Agent, setOpenAIAPI } from '@openai/agents';
import { run } from '@openai/agents';
import * as cheerio from 'cheerio';
import { consumeRateLimit } from './_lib/rateLimit.js';
import { extractSubpath, jsonResponse, methodNotAllowed, optionsResponse } from './_lib/http.js';

// Use Chat Completions API
setOpenAIAPI('chat_completions');

// Define agents
const linkedInAgent = new Agent({
  name: 'LinkedIn Content Creator',
  model: 'gpt-4o',
  instructions: `You are an expert LinkedIn content creator. Your job is to transform any content into an engaging LinkedIn post.

GUIDELINES:
- Start with a hook (bold statement, question, or surprising fact)
- Use short paragraphs and strategic line breaks for mobile readability
- Include 2-3 relevant emojis (not excessive)
- End with a thought-provoking question or call-to-action
- Add 3-5 relevant hashtags at the end
- Keep the post between 150-300 words
- Sound authentic and professional, not salesy
- Use storytelling when appropriate
- Make it scannable with bullet points or numbered lists if needed

OUTPUT FORMAT:
Return ONLY the LinkedIn post content, ready to copy and paste. Do not include any explanation or meta-commentary.`,
});

const twitterAgent = new Agent({
  name: 'Twitter Thread Creator',
  model: 'gpt-4o',
  instructions: `You are an expert Twitter/X thread creator. Your job is to transform any content into an engaging thread.

GUIDELINES:
- Create 4-7 tweets
- First tweet MUST be a hook that makes people want to read more (use thread emoji)
- Each tweet MUST be under 280 characters
- Use line breaks within tweets for readability
- Include relevant emojis sparingly
- Last tweet should summarize and include a call-to-follow
- Make each tweet standalone valuable but connected to the narrative
- Use numbers or bullets for lists

OUTPUT FORMAT:
Separate each tweet with "---TWEET---" on its own line.`,
});

const carouselAgent = new Agent({
  name: 'Carousel Slide Creator',
  model: 'gpt-4o',
  instructions: `You are an expert social media carousel creator. Your job is to transform content into engaging carousel slides.

GUIDELINES:
- Create 6-8 slides total
- First slide: Attention-grabbing title (short, punchy, creates curiosity)
- Middle slides: ONE key insight per slide (keep text under 40 words per slide)
- Last slide: Call-to-action (follow, share, save, comment)
- Use simple, impactful language
- Each slide should make sense on its own
- Build a narrative flow between slides
- Use numbers or "Slide X of Y" formatting when appropriate

OUTPUT FORMAT:
Separate each slide with "---SLIDE---" on its own line.`,
});

const contentSummarizerAgent = new Agent({
  name: 'Content Summarizer',
  model: 'gpt-4o',
  instructions: `You are an expert content summarizer. Your job is to extract the most important and actionable insights from any content.

GUIDELINES:
- Focus on unique insights, not obvious points
- Prioritize actionable takeaways
- Maintain the original tone and intent
- Be concise but comprehensive
- Highlight statistics, quotes, or specific examples when present

OUTPUT FORMAT:
Return a bulleted list of key points, one insight per line. Each point should be 1-2 sentences max.`,
});

// URL Fetcher
async function fetchUrlContent(url) {
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

  // Get title
  const title =
    $('h1').first().text().trim() ||
    $('meta[property="og:title"]').attr('content') ||
    $('title').text().trim() ||
    'Untitled Article';

  // Extract content
  let content = '';
  const articleSelectors = [
    'article', '[role="main"]', '.article-content', '.article-body',
    '.post-content', '.entry-content', '.content-body', '.story-body',
    'main', '.main-content',
  ];

  for (const selector of articleSelectors) {
    const element = $(selector);
    if (element.length > 0) {
      content = element.text().trim();
      if (content.length > 200) break;
    }
  }

  // Fallback to paragraphs
  if (!content || content.length < 200) {
    const paragraphs = [];
    $('p').each((_, el) => {
      const text = $(el).text().trim();
      if (text.length > 30) paragraphs.push(text);
    });
    content = paragraphs.join('\n\n');
  }

  // Clean and limit
  content = content.replace(/\s+/g, ' ').replace(/\n\s*\n/g, '\n\n').trim();
  if (content.length > 10000) content = content.substring(0, 10000) + '...';

  console.log(`Extracted ${content.length} characters from ${url}`);

  return { title, content: `Title: ${title}\n\n${content}`, url };
}

// Helper functions
function parseTwitterThread(output) {
  if (Array.isArray(output)) return output;
  if (typeof output !== 'string') return [String(output)];
  try {
    const parsed = JSON.parse(output);
    if (Array.isArray(parsed)) return parsed;
  } catch {}
  return output.split(/---TWEET---|---tweet---|\n\n---\n\n/).map(t => t.trim()).filter(Boolean);
}

function parseCarouselSlides(output) {
  if (Array.isArray(output)) return output;
  if (typeof output !== 'string') return [String(output)];
  try {
    const parsed = JSON.parse(output);
    if (Array.isArray(parsed)) return parsed;
  } catch {}
  return output.split(/---SLIDE---|---slide---|\n\n---\n\n/).map(s => s.trim()).filter(Boolean);
}

// Main handler
export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return optionsResponse();
  if (event.httpMethod !== 'POST') return methodNotAllowed();

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
    const subpath = extractSubpath(event, '/api/content', 'content');
    const { content, sourceType, maxPoints = 5 } = body;

    if (!content || !String(content).trim()) {
      return jsonResponse(400, { error: 'Content is required' }, rate.headers);
    }

    let processedContent = String(content);

    if (sourceType === 'url' && processedContent.startsWith('http')) {
      const urlData = await fetchUrlContent(processedContent);
      processedContent = urlData.content;
    } else if (sourceType === 'youtube' && processedContent.includes('youtube')) {
      try {
        const urlData = await fetchUrlContent(processedContent);
        processedContent = urlData.content;
      } catch {
        processedContent = `YouTube video URL: ${processedContent}\n\nPlease provide the video transcript or description for content generation.`;
      }
    }

    if (subpath === '/linkedin') {
      const result = await run(linkedInAgent, processedContent);
      return jsonResponse(200, { post: result.finalOutput }, rate.headers);
    }

    if (subpath === '/twitter') {
      const result = await run(twitterAgent, processedContent);
      return jsonResponse(200, { thread: parseTwitterThread(result.finalOutput) }, rate.headers);
    }

    if (subpath === '/carousel') {
      const result = await run(carouselAgent, processedContent);
      return jsonResponse(200, { slides: parseCarouselSlides(result.finalOutput) }, rate.headers);
    }

    if (subpath === '/summarize') {
      const result = await run(
        contentSummarizerAgent,
        `Summarize the following content into ${maxPoints} key points:\n\n${processedContent}`
      );
      return jsonResponse(200, { summary: result.finalOutput }, rate.headers);
    }

    // Default to /generate behavior (also handles root path used by explicit redirect)
    const formats = Array.isArray(body.formats) ? body.formats : [];
    if (formats.length === 0) {
      return jsonResponse(400, { error: 'Formats array is required' }, rate.headers);
    }

    const results = {};
    const errors = {};

    for (const format of formats) {
      try {
        let result;
        switch (format) {
          case 'linkedin':
            result = await run(linkedInAgent, processedContent);
            results.linkedin = result.finalOutput;
            break;
          case 'twitter':
            result = await run(twitterAgent, processedContent);
            results.twitter = parseTwitterThread(result.finalOutput);
            break;
          case 'carousel':
            result = await run(carouselAgent, processedContent);
            results.carousel = parseCarouselSlides(result.finalOutput);
            break;
          default:
            errors[format] = 'Unsupported format';
            break;
        }
      } catch (formatError) {
        errors[format] = formatError.message;
      }
    }

    return jsonResponse(200, { results, errors }, rate.headers);
  } catch (error) {
    return jsonResponse(
      500,
      { error: 'Generation failed', message: error.message },
      rate.headers
    );
  }
}
