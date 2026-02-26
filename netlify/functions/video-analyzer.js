import { Agent, setOpenAIAPI, run } from '@openai/agents';
import OpenAI from 'openai';
import ytdl from '@distube/ytdl-core';
import ffmpegPath from 'ffmpeg-static';
import ffmpeg from 'fluent-ffmpeg';
import { PassThrough } from 'stream';
import { consumeRateLimit } from './_lib/rateLimit.js';
import { extractSubpath, jsonResponse, methodNotAllowed, optionsResponse } from './_lib/http.js';

// Use Chat Completions API
setOpenAIAPI('chat_completions');
ffmpeg.setFfmpegPath(ffmpegPath);

const openai = new OpenAI();
const MAX_FRAMES = 15;
const YT_FRAME_COUNT = 8;
const TARGET_WIDTH = 640;

function formatTimestamp(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function extractYouTubeVideoId(url) {
  const patterns = [
    /[?&]v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function parseISODuration(iso) {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  return parseInt(match[1] || 0) * 3600 + parseInt(match[2] || 0) * 60 + parseInt(match[3] || 0);
}

function withTimeout(promise, ms, errorMessage) {
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(errorMessage)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId));
}

function isYouTubeBotCheckError(error) {
  const message = (error?.message || String(error || '')).toLowerCase();
  return message.includes("sign in to confirm you're not a bot")
    || message.includes('sign in to confirm you are not a bot')
    || message.includes('not a bot');
}

// Step 1: Always use YouTube Data API for metadata (never blocked)
async function fetchYouTubeMetadata(videoId) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) throw new Error('YouTube API key not configured. Set YOUTUBE_API_KEY environment variable.');

  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${apiKey}`
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'YouTube API request failed.');
  if (!data.items?.length) throw new Error('Video not found or is private.');

  const item = data.items[0];
  const thumbnailUrls = Object.values(item.snippet.thumbnails || {})
    .map((thumb) => thumb?.url)
    .filter(Boolean);
  return {
    title: item.snippet.title,
    author: item.snippet.channelTitle,
    duration: parseISODuration(item.contentDetails.duration),
    thumbnail: item.snippet.thumbnails.maxres?.url
      || item.snippet.thumbnails.high?.url
      || item.snippet.thumbnails.default?.url,
    thumbnailUrls,
  };
}

function extractFrameAtTimestamp(videoUrl, timestamp) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    const passthrough = new PassThrough();

    passthrough.on('data', (chunk) => chunks.push(chunk));
    passthrough.on('end', () => {
      const buffer = Buffer.concat(chunks);
      if (buffer.length === 0) {
        reject(new Error(`Empty frame at ${timestamp}s`));
        return;
      }
      resolve(buffer);
    });
    passthrough.on('error', reject);

    ffmpeg(videoUrl)
      .seekInput(timestamp)
      .frames(1)
      .size(`${TARGET_WIDTH}x?`)
      .format('image2')
      .outputOptions(['-vcodec', 'mjpeg'])
      .on('error', reject)
      .pipe(passthrough, { end: true });
  });
}

// Step 2: Try ytdl-core for multi-frame extraction (works locally, may fail on cloud IPs)
async function extractFramesViaYtdl(youtubeUrl, duration) {
  const info = await ytdl.getInfo(youtubeUrl);
  const format = ytdl.chooseFormat(info.formats, { quality: 'lowest', filter: 'videoandaudio' });
  if (!format?.url) throw new Error('No suitable video format found.');

  const frameCount = Math.min(YT_FRAME_COUNT, Math.max(2, Math.floor(duration / 10)));
  const interval = duration / (frameCount + 1);
  const timestamps = Array.from({ length: frameCount }, (_, i) => Math.floor(interval * (i + 1)));

  const frames = [];
  for (const ts of timestamps) {
    try {
      const buffer = await extractFrameAtTimestamp(format.url, ts);
      frames.push({ base64: `data:image/jpeg;base64,${buffer.toString('base64')}`, timestamp: formatTimestamp(ts) });
    } catch (error) {
      console.warn(`Skipping frame at ${ts}s:`, error.message);
    }
  }
  if (frames.length === 0) throw new Error('Frame extraction failed.');
  return frames;
}

function uniqueUrls(urls) {
  const seen = new Set();
  const output = [];
  for (const url of urls) {
    if (!url || seen.has(url)) continue;
    seen.add(url);
    output.push(url);
  }
  return output;
}

function buildYouTubeThumbnailCandidates(videoId, duration, thumbnailUrls = []) {
  return [
    {
      bucket: 'start',
      timestamp: formatTimestamp(0),
      urls: uniqueUrls([
        `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
        `https://i.ytimg.com/vi/${videoId}/sddefault.jpg`,
        `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
        `https://i.ytimg.com/vi/${videoId}/default.jpg`,
        `https://i.ytimg.com/vi/${videoId}/0.jpg`,
        ...thumbnailUrls,
      ]),
    },
    {
      bucket: 'quarter',
      timestamp: formatTimestamp(Math.floor(duration * 0.25)),
      urls: uniqueUrls([
        `https://i.ytimg.com/vi/${videoId}/hq1.jpg`,
        `https://i.ytimg.com/vi/${videoId}/1.jpg`,
      ]),
    },
    {
      bucket: 'half',
      timestamp: formatTimestamp(Math.floor(duration * 0.5)),
      urls: uniqueUrls([
        `https://i.ytimg.com/vi/${videoId}/hq2.jpg`,
        `https://i.ytimg.com/vi/${videoId}/2.jpg`,
      ]),
    },
    {
      bucket: 'threeQuarter',
      timestamp: formatTimestamp(Math.floor(duration * 0.75)),
      urls: uniqueUrls([
        `https://i.ytimg.com/vi/${videoId}/hq3.jpg`,
        `https://i.ytimg.com/vi/${videoId}/3.jpg`,
      ]),
    },
  ];
}

async function fetchThumbnailCandidate({ url, timestamp }) {
  const res = await fetch(url);
  if (!res.ok) return null;

  const contentType = res.headers.get('content-type') || 'image/jpeg';
  if (!contentType.toLowerCase().startsWith('image/')) return null;

  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.length < 800) return null;

  const mime = contentType.split(';')[0] || 'image/jpeg';
  return {
    base64: `data:${mime};base64,${buffer.toString('base64')}`,
    timestamp,
  };
}

// Bot-safe fallback: fetch multiple thumbnail variants directly from YouTube image endpoints.
async function extractThumbnailFallback(videoId, duration, thumbnailUrls = []) {
  const buckets = buildYouTubeThumbnailCandidates(videoId, duration, thumbnailUrls);
  const frames = [];

  for (const bucket of buckets) {
    for (const url of bucket.urls) {
      try {
        const frame = await fetchThumbnailCandidate({ url, timestamp: bucket.timestamp });
        if (!frame) continue;
        frames.push(frame);
        break;
      } catch (error) {
        console.warn(`Thumbnail fetch failed for ${url}:`, error.message);
      }
    }
  }

  if (frames.length === 0) {
    throw new Error('Could not fetch YouTube thumbnails.');
  }
  return frames;
}

async function handleYouTube(youtubeUrl) {
  const videoId = extractYouTubeVideoId(youtubeUrl);
  if (!videoId) throw new Error('Could not extract YouTube video ID from URL.');

  // Always works — YouTube Data API is not bot-blocked
  const meta = await fetchYouTubeMetadata(videoId);
  const metadata = { title: meta.title, author: meta.author, duration: meta.duration };
  const thumbnailUrls = [meta.thumbnail, ...(meta.thumbnailUrls || [])].filter(Boolean);

  // Primary bot-safe path: collect multiple thumbnails up-front.
  let thumbnailFrames = [];
  try {
    thumbnailFrames = await extractThumbnailFallback(videoId, meta.duration, thumbnailUrls);
  } catch (e) {
    console.warn('YouTube thumbnail extraction failed:', e.message);
  }

  // Secondary path: try full frame extraction from stream URL.
  try {
    const streamFrames = await withTimeout(
      extractFramesViaYtdl(youtubeUrl, meta.duration),
      20000,
      'YouTube stream extraction timed out.'
    );
    return { frames: streamFrames, metadata };
  } catch (e) {
    if (isYouTubeBotCheckError(e)) {
      console.warn('YouTube bot-check detected; using thumbnail fallback.');
    } else {
      console.warn('ytdl-core frame extraction failed; using thumbnail fallback:', e.message);
    }
  }

  if (thumbnailFrames.length > 0) {
    return { frames: thumbnailFrames, metadata };
  }

  throw new Error('Unable to extract frames from YouTube stream or thumbnails.');
}

// Define agents inline (Netlify functions can't share imports with server/)
const videoSummaryAgent = new Agent({
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
- First tweet MUST be a hook that makes people want to read more (use 🧵 emoji)
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

OUTPUT FORMAT:
Separate each slide with "---SLIDE---" on its own line.`,
});

function safeParseJSON(text) {
  try {
    let cleaned = text.trim();
    if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
    else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
    if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
    return JSON.parse(cleaned.trim());
  } catch (e) {
    console.error('Failed to parse agent output:', e.message);
    return null;
  }
}

async function describeFrame(base64Data, timestamp) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Describe this video frame captured at timestamp ${timestamp}. Include: what's visible, any text on screen, people/objects, actions happening, and the overall scene. Be concise but thorough (2-3 sentences).`,
          },
          {
            type: 'image_url',
            image_url: {
              url: base64Data.startsWith('data:') ? base64Data : `data:image/jpeg;base64,${base64Data}`,
              detail: 'low',
            },
          },
        ],
      },
    ],
    max_tokens: 300,
  });

  return response.choices[0]?.message?.content || 'Unable to describe frame.';
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return optionsResponse();
  if (event.httpMethod !== 'POST') return methodNotAllowed();

  const subpath = extractSubpath(event, '/api/video-analyzer', 'video-analyzer');
  if (subpath !== '/' && subpath !== '/analyze' && subpath !== '/youtube-frames') {
    return jsonResponse(404, { error: 'Route not found' });
  }

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

    // YouTube frames-only endpoint (no AI)
    if (subpath === '/youtube-frames') {
      const { youtubeUrl } = body;
      if (!youtubeUrl) {
        return jsonResponse(400, { error: 'No YouTube URL provided' }, rate.headers);
      }
      const result = await handleYouTube(youtubeUrl);
      return jsonResponse(200, result, rate.headers);
    }

    // Analyze endpoint
    const { frames, generateContent, youtubeMetadata } = body;

    if (!frames || !Array.isArray(frames) || frames.length === 0) {
      return jsonResponse(400, { error: 'No frames provided', message: 'Please provide at least one video frame.' }, rate.headers);
    }

    const cappedFrames = frames.slice(0, MAX_FRAMES);

    // Step 1: Describe each frame in parallel
    const frameDescriptions = await Promise.all(
      cappedFrames.map(async (frame) => {
        const description = await describeFrame(frame.base64, frame.timestamp);
        return { timestamp: frame.timestamp, description };
      })
    );

    // Step 2: Synthesize into structured summary
    const metaContext = youtubeMetadata
      ? `\nYouTube Video Title: ${youtubeMetadata.title}\nAuthor: ${youtubeMetadata.author}\n`
      : '';
    const summaryPrompt = `Analyze these video frame descriptions and create a comprehensive video summary.
${metaContext}
Frame descriptions (in chronological order):
${frameDescriptions.map((f) => `[${f.timestamp}] ${f.description}`).join('\n\n')}

Total frames analyzed: ${frameDescriptions.length}`;

    const summaryResult = await run(videoSummaryAgent, summaryPrompt);
    const summary = safeParseJSON(summaryResult.finalOutput) || {
      title: 'Video Analysis',
      videoType: 'other',
      summary: 'Unable to generate a detailed summary.',
      keyMoments: [],
      topics: [],
      hashtags: [],
      tone: 'professional',
      targetAudience: 'General audience',
    };

    // Step 3: Optionally generate social content
    let content = null;
    if (generateContent) {
      const contentSource = `Video Title: ${summary.title}\n\nSummary: ${summary.summary}\n\nKey Topics: ${summary.topics.join(', ')}\n\nKey Moments:\n${summary.keyMoments.map((m) => `- [${m.timestamp}] ${m.description}`).join('\n')}\n\nTarget Audience: ${summary.targetAudience}\nTone: ${summary.tone}`;

      const [linkedInResult, twitterResult, carouselResult] = await Promise.all([
        run(linkedInAgent, `Create a LinkedIn post about this video content:\n\n${contentSource}`),
        run(twitterAgent, `Create a Twitter thread about this video content:\n\n${contentSource}`),
        run(carouselAgent, `Create carousel slides about this video content:\n\n${contentSource}`),
      ]);

      content = {
        linkedin: linkedInResult.finalOutput,
        twitter: twitterResult.finalOutput.split('---TWEET---').map((t) => t.trim()).filter(Boolean),
        carousel: carouselResult.finalOutput.split('---SLIDE---').map((s) => s.trim()).filter(Boolean),
      };
    }

    return jsonResponse(200, { frameDescriptions, summary, content }, rate.headers);
  } catch (error) {
    console.error('Video analyzer error:', error);
    return jsonResponse(500, { error: 'Analysis failed', message: error.message }, rate.headers);
  }
}
