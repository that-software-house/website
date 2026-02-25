import { Agent, setOpenAIAPI } from '@openai/agents';

// Use Chat Completions API instead of Responses API
setOpenAIAPI('chat_completions');

/**
 * Video Summary Agent
 * Synthesizes all frame descriptions into a structured video summary
 */
export const videoSummaryAgent = new Agent({
  name: 'Video Summary Generator',
  model: 'gpt-4o',
  instructions: `You are a video analysis expert. Given a set of frame descriptions with timestamps from a video, synthesize them into a comprehensive structured summary.

ANALYZE:
1. Determine the video type (tutorial, presentation, vlog, product demo, interview, etc.)
2. Identify the main topic and key themes
3. Note key moments and transitions between scenes
4. Extract any visible text, logos, or branding
5. Identify topics suitable for social media content
6. Suggest relevant hashtags

OUTPUT FORMAT (JSON only, no markdown):
{
  "title": "A concise descriptive title for the video",
  "videoType": "tutorial|presentation|vlog|demo|interview|other",
  "summary": "A 2-4 sentence overview of the video content",
  "keyMoments": [
    { "timestamp": "0:00", "description": "What happens at this point" }
  ],
  "topics": ["topic1", "topic2"],
  "hashtags": ["#hashtag1", "#hashtag2"],
  "tone": "professional|casual|educational|entertaining|inspirational",
  "targetAudience": "Who this video is best suited for"
}

IMPORTANT: Return ONLY valid JSON. No explanations, no markdown code blocks.`,
});
