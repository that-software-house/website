import { Agent, tool, setOpenAIAPI } from '@openai/agents';
import { z } from 'zod';

// Use Chat Completions API instead of Responses API
setOpenAIAPI('chat_completions');

/**
 * Tool to fetch content from a URL
 */
const fetchUrlTool = tool({
  name: 'fetch_url',
  description: 'Fetches the content of a webpage given its URL and returns the text content',
  parameters: z.object({
    url: z.string().url().describe('The URL to fetch content from'),
  }),
  execute: async ({ url }) => {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; ContentExtractor/1.0)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        return { error: `Failed to fetch URL: ${response.status} ${response.statusText}` };
      }

      const html = await response.text();

      // Basic HTML to text extraction
      const text = html
        // Remove scripts and styles
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        // Remove HTML tags
        .replace(/<[^>]+>/g, ' ')
        // Decode common HTML entities
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        // Clean up whitespace
        .replace(/\s+/g, ' ')
        .trim();

      // Limit content length
      const content = text.slice(0, 8000);

      return { content, url };
    } catch (err) {
      return { error: `Failed to fetch URL: ${err.message}` };
    }
  },
});

/**
 * LinkedIn Content Agent
 * Transforms content into engaging LinkedIn posts
 */
export const linkedInAgent = new Agent({
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

/**
 * Twitter/X Thread Agent
 * Transforms content into viral Twitter threads
 */
export const twitterAgent = new Agent({
  name: 'Twitter Thread Creator',
  model: 'gpt-4o',
  instructions: `You are an expert Twitter/X thread creator. Your job is to transform any content into an engaging thread.

GUIDELINES:
- Create 4-7 tweets
- First tweet MUST be a hook that makes people want to read more (use 🧵 emoji)
- Each tweet MUST be under 280 characters
- Use line breaks within tweets for readability
- Include relevant emojis sparingly
- Last tweet should summarize and include a call-to-follow
- Make each tweet standalone valuable but connected to the narrative
- Use numbers or bullets for lists

OUTPUT FORMAT:
Separate each tweet with "---TWEET---" on its own line.

Example:
🧵 Thread: 5 lessons I learned about AI in 2024

---TWEET---

1/ The first lesson was surprising...

---TWEET---

2/ The second insight changed everything...`,
});

/**
 * Carousel Content Agent
 * Transforms content into carousel slides
 */
export const carouselAgent = new Agent({
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
Separate each slide with "---SLIDE---" on its own line.

Example:
5 Secrets Top Performers Know

---SLIDE---

Secret #1

They prioritize ruthlessly.
Every "yes" is a "no" to something else.

---SLIDE---

Secret #2

They embrace failure.
Each mistake is a data point, not a defeat.`,
});

/**
 * Content Summarizer Agent
 * Summarizes long-form content into key points
 */
export const contentSummarizerAgent = new Agent({
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

/**
 * URL Content Extractor Agent
 * Extracts and summarizes content from URLs
 */
export const urlExtractorAgent = new Agent({
  name: 'URL Content Extractor',
  model: 'gpt-4o',
  instructions: `You are a content extractor. Given a URL, use the fetch_url tool to retrieve the webpage content, then extract and return the main article content.

GUIDELINES:
- Always use the fetch_url tool to get the actual page content
- Extract the main article/body content from the fetched text
- Remove navigation, ads, footers, and other non-content elements
- Clean up and structure the content for readability
- If the fetch fails, explain the error to the user

OUTPUT FORMAT:
Return the extracted article content in a clean, readable format.`,
  tools: [fetchUrlTool],
});

/**
 * YouTube Transcript Extractor Agent
 * Simulates extracting transcripts from YouTube (for demo purposes)
 */
export const youtubeExtractorAgent = new Agent({
  name: 'YouTube Transcript Extractor',
  model: 'gpt-4o',
  instructions: `You are a YouTube transcript extractor. Given a YouTube URL, generate a realistic sample transcript that might come from that video.

GUIDELINES:
- Generate 300-500 words of realistic transcript content
- Include conversational elements (like "you know", "right?")
- Make it educational and insightful
- Include speaker personality
- Reference the video topic implied by the URL

NOTE: This is a simulation for demo purposes. In production, the YouTube API would be used.

OUTPUT FORMAT:
Return only the transcript content, as if extracted from the video.`,
});

/**
 * Document Analyzer Agent
 * Summarizes and extracts key points from documents
 */
export const docAnalyzerAgent = new Agent({
  name: 'Document Analyzer',
  model: 'gpt-4o-mini',
  instructions: `You are a precise document analyst.

Given any text, produce:
1) A concise summary (3-5 sentences)
2) 5-7 bullet key points
3) (Optional) One suggested title

Keep it factual and structured. Return in the following format:

Title: <optional title>
Summary:
- sentence 1
- sentence 2
Key Points:
- point 1
- point 2
- point 3
- point 4
- point 5`,
});

/**
 * Tone Converter Agent
 * Converts text to different tones and writing styles
 */
export const toneConverterAgent = new Agent({
  name: 'Tone Converter',
  model: 'gpt-4o-mini',
  instructions: `You are an expert writing style converter. Your job is to rewrite text in a specific tone while preserving the original meaning and key information.

GUIDELINES:
- Maintain the core message and all important details
- Adapt vocabulary, sentence structure, and phrasing to match the target tone
- Keep roughly the same length as the original (don't overly expand or condense)
- Ensure the output is natural and fluent
- Do not add new information that wasn't in the original
- Do not include any explanations or meta-commentary

OUTPUT FORMAT:
Return ONLY the rewritten text. Do not include phrases like "Here's the rewritten text:" or any other preamble.`,
});

/**
 * Master Content Agent with Tools
 * Can delegate to other agents as tools
 */
export const masterContentAgent = new Agent({
  name: 'Content Transformation Master',
  model: 'gpt-4o',
  instructions: `You are a master content strategist. You help users transform their content into various social media formats.

When asked to generate content, use the appropriate tools:
- Use 'generate_linkedin' for LinkedIn posts
- Use 'generate_twitter' for Twitter threads
- Use 'generate_carousel' for carousel slides
- Use 'summarize_content' for content summaries

Always explain what you're doing and provide context for your outputs.`,
  tools: [
    linkedInAgent.asTool({
      toolName: 'generate_linkedin',
      toolDescription: 'Transform content into an engaging LinkedIn post',
    }),
    twitterAgent.asTool({
      toolName: 'generate_twitter',
      toolDescription: 'Transform content into a viral Twitter thread',
    }),
    carouselAgent.asTool({
      toolName: 'generate_carousel',
      toolDescription: 'Transform content into carousel slides',
    }),
    contentSummarizerAgent.asTool({
      toolName: 'summarize_content',
      toolDescription: 'Summarize content into key points',
    }),
  ],
});
