import { Agent, setOpenAIAPI } from '@openai/agents';
import { run } from '@openai/agents';
import * as cheerio from 'cheerio';

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
  // Handle CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { content, formats, sourceType } = JSON.parse(event.body);

    if (!content || !formats || !Array.isArray(formats)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Content and formats array are required' }),
      };
    }

    let processedContent = content;

    // Fetch URL content if needed
    if (sourceType === 'url' && content.startsWith('http')) {
      console.log('Fetching content from URL:', content);
      const urlData = await fetchUrlContent(content);
      processedContent = urlData.content;
    } else if (sourceType === 'youtube' && content.includes('youtube')) {
      try {
        const urlData = await fetchUrlContent(content);
        processedContent = urlData.content;
      } catch {
        processedContent = `YouTube video URL: ${content}\n\nPlease provide the video transcript or description for content generation.`;
      }
    }

    // Generate content for each format
    const results = {};
    const errors = {};

    for (const format of formats) {
      try {
        console.log(`Generating ${format} content...`);
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
        }
      } catch (formatError) {
        console.error(`Error generating ${format}:`, formatError);
        errors[format] = formatError.message;
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ results, errors }),
    };
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Generation failed', message: error.message }),
    };
  }
}
