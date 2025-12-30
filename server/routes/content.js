import express from 'express';
import {
  linkedInAgent,
  twitterAgent,
  carouselAgent,
  contentSummarizerAgent,
} from '../agents/index.js';
import { run } from '@openai/agents';
import { fetchUrlContent } from '../utils/urlFetcher.js';

export const contentRouter = express.Router();

/**
 * Generate content for multiple platforms
 * POST /api/content/generate
 */
contentRouter.post('/generate', async (req, res) => {
  try {
    const { content, formats, sourceType } = req.body;

    console.log('Received request to generate content:', { content, formats, sourceType });

    if (!content || !formats || !Array.isArray(formats)) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Content and formats array are required',
      });
    }

    let processedContent = content;

    // Extract content from URL if needed
    if (sourceType === 'url' && content.startsWith('http')) {
      console.log('Fetching content from URL:', content);
      const urlData = await fetchUrlContent(content);
      processedContent = urlData.content;
      console.log('Extracted content preview:', processedContent.substring(0, 200) + '...');
    } else if (sourceType === 'youtube' && content.includes('youtube')) {
      // YouTube transcript extraction would require YouTube API
      // For now, treat YouTube URLs as regular URLs
      console.log('YouTube URL detected, attempting to fetch page content...');
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
            // Parse the thread from the result
            results.twitter = parseTwitterThread(result.finalOutput);
            break;
          case 'carousel':
            result = await run(carouselAgent, processedContent);
            // Parse the slides from the result
            results.carousel = parseCarouselSlides(result.finalOutput);
            break;
        }
      } catch (formatError) {
        console.error(`Error generating ${format}:`, formatError);
        errors[format] = formatError.message;
      }
    }

    res.json({ results, errors });
  } catch (error) {
    console.error('Generate error:', error);
    res.status(500).json({
      error: 'Generation failed',
      message: error.message,
    });
  }
});

/**
 * Summarize content
 * POST /api/content/summarize
 */
contentRouter.post('/summarize', async (req, res) => {
  try {
    const { content, maxPoints = 5 } = req.body;

    if (!content) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Content is required',
      });
    }

    const result = await run(
      contentSummarizerAgent,
      `Summarize the following content into ${maxPoints} key points:\n\n${content}`
    );

    res.json({ summary: result.finalOutput });
  } catch (error) {
    console.error('Summarize error:', error);
    res.status(500).json({
      error: 'Summarization failed',
      message: error.message,
    });
  }
});

/**
 * Generate LinkedIn post only
 * POST /api/content/linkedin
 */
contentRouter.post('/linkedin', async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Content is required',
      });
    }

    const result = await run(linkedInAgent, content);
    res.json({ post: result.finalOutput });
  } catch (error) {
    console.error('LinkedIn generation error:', error);
    res.status(500).json({
      error: 'LinkedIn generation failed',
      message: error.message,
    });
  }
});

/**
 * Generate Twitter thread only
 * POST /api/content/twitter
 */
contentRouter.post('/twitter', async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Content is required',
      });
    }

    const result = await run(twitterAgent, content);
    const thread = parseTwitterThread(result.finalOutput);
    res.json({ thread });
  } catch (error) {
    console.error('Twitter generation error:', error);
    res.status(500).json({
      error: 'Twitter generation failed',
      message: error.message,
    });
  }
});

/**
 * Generate carousel slides only
 * POST /api/content/carousel
 */
contentRouter.post('/carousel', async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Content is required',
      });
    }

    const result = await run(carouselAgent, content);
    const slides = parseCarouselSlides(result.finalOutput);
    res.json({ slides });
  } catch (error) {
    console.error('Carousel generation error:', error);
    res.status(500).json({
      error: 'Carousel generation failed',
      message: error.message,
    });
  }
});

// Helper functions
function parseTwitterThread(output) {
  if (Array.isArray(output)) return output;
  if (typeof output !== 'string') return [String(output)];

  // Try to parse as JSON first
  try {
    const parsed = JSON.parse(output);
    if (Array.isArray(parsed)) return parsed;
  } catch {}

  // Split by tweet separator
  return output
    .split(/---TWEET---|---tweet---|\n\n---\n\n/)
    .map((tweet) => tweet.trim())
    .filter(Boolean);
}

function parseCarouselSlides(output) {
  if (Array.isArray(output)) return output;
  if (typeof output !== 'string') return [String(output)];

  // Try to parse as JSON first
  try {
    const parsed = JSON.parse(output);
    if (Array.isArray(parsed)) return parsed;
  } catch {}

  // Split by slide separator
  return output
    .split(/---SLIDE---|---slide---|\n\n---\n\n/)
    .map((slide) => slide.trim())
    .filter(Boolean);
}
