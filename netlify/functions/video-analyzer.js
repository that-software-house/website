import { Agent, setOpenAIAPI, run } from '@openai/agents';
import OpenAI from 'openai';
import ffmpegPath from 'ffmpeg-static';
import ffmpeg from 'fluent-ffmpeg';
import { PassThrough, Readable } from 'stream';
import { consumeRateLimit } from './_lib/rateLimit.js';
import { extractSubpath, jsonResponse, methodNotAllowed, optionsResponse } from './_lib/http.js';

// Use Chat Completions API
setOpenAIAPI('chat_completions');
ffmpeg.setFfmpegPath(ffmpegPath);

const openai = new OpenAI();
const MAX_FRAMES = 15;
const YT_FRAME_COUNT = 8;

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

async function fetchYouTubePageData(videoId) {
  const res = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
    },
  });
  const html = await res.text();
  const playerMatch = html.match(/var ytInitialPlayerResponse\s*=\s*(\{.+?\});/s);
  if (!playerMatch) throw new Error('Could not parse YouTube page. The video may be private or unavailable.');
  const player = JSON.parse(playerMatch[1]);
  return {
    title: player.videoDetails?.title || 'YouTube Video',
    author: player.videoDetails?.author || 'Unknown',
    duration: parseInt(player.videoDetails?.lengthSeconds, 10) || 0,
    storyboardSpec: player.storyboards?.playerStoryboardSpecRenderer?.spec || null,
  };
}

function parseStoryboardSpec(spec) {
  const parts = spec.split('|');
  const baseUrl = parts[0];
  const levelIdx = parts.length - 1;
  const levelData = parts[levelIdx].split('#');
  const [tw, th, totalFrames, cols, rows, intervalMs, namePattern, sigh] = levelData;
  return {
    baseUrl,
    levelNumber: levelIdx - 1,
    frameW: parseInt(tw),
    frameH: parseInt(th),
    totalFrames: parseInt(totalFrames),
    cols: parseInt(cols),
    rows: parseInt(rows),
    framesPerSheet: parseInt(cols) * parseInt(rows),
    intervalSec: parseInt(intervalMs) / 1000,
    namePattern,
    sigh,
  };
}

function cropFrameFromSheet(sheetBuffer, frameW, frameH, x, y) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    const passthrough = new PassThrough();
    passthrough.on('data', (chunk) => chunks.push(chunk));
    passthrough.on('end', () => {
      const buffer = Buffer.concat(chunks);
      if (buffer.length === 0) return reject(new Error('Empty cropped frame'));
      resolve(buffer);
    });
    passthrough.on('error', reject);
    const input = new Readable();
    input.push(sheetBuffer);
    input.push(null);
    ffmpeg(input)
      .inputFormat('image2pipe')
      .videoFilter(`crop=${frameW}:${frameH}:${x}:${y}`)
      .frames(1)
      .format('image2')
      .outputOptions(['-vcodec', 'mjpeg'])
      .on('error', reject)
      .pipe(passthrough, { end: true });
  });
}

async function handleYouTube(youtubeUrl) {
  const videoId = extractYouTubeVideoId(youtubeUrl);
  if (!videoId) throw new Error('Could not extract YouTube video ID from URL.');

  const pageData = await fetchYouTubePageData(videoId);
  const { duration, storyboardSpec } = pageData;
  const metadata = { title: pageData.title, author: pageData.author, duration };

  if (!storyboardSpec) {
    const thumbRes = await fetch(`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`);
    if (!thumbRes.ok) throw new Error('Could not fetch YouTube thumbnail.');
    const buf = Buffer.from(await thumbRes.arrayBuffer());
    return {
      frames: [{ base64: `data:image/jpeg;base64,${buf.toString('base64')}`, timestamp: '0:00' }],
      metadata,
    };
  }

  const sb = parseStoryboardSpec(storyboardSpec);
  const desiredCount = Math.min(YT_FRAME_COUNT, Math.max(2, sb.totalFrames));
  const step = Math.floor(sb.totalFrames / (desiredCount + 1));
  const selectedIndices = Array.from({ length: desiredCount }, (_, i) => step * (i + 1));

  const sheetGroups = {};
  for (const idx of selectedIndices) {
    const sheetIdx = Math.floor(idx / sb.framesPerSheet);
    if (!sheetGroups[sheetIdx]) sheetGroups[sheetIdx] = [];
    sheetGroups[sheetIdx].push(idx);
  }

  const frames = [];
  for (const [sheetIdx, frameIndices] of Object.entries(sheetGroups)) {
    const sheetName = sb.namePattern.replace('$M', sheetIdx);
    let url = sb.baseUrl.replace('$L', String(sb.levelNumber)).replace('$N', sheetName);
    url += '&sigh=' + sb.sigh;
    const res = await fetch(url);
    if (!res.ok) continue;
    const sheetBuffer = Buffer.from(await res.arrayBuffer());
    for (const frameIdx of frameIndices) {
      try {
        const localIdx = frameIdx % sb.framesPerSheet;
        const col = localIdx % sb.cols;
        const row = Math.floor(localIdx / sb.cols);
        const x = col * sb.frameW;
        const y = row * sb.frameH;
        const timestamp = frameIdx * sb.intervalSec;
        const frameBuf = await cropFrameFromSheet(sheetBuffer, sb.frameW, sb.frameH, x, y);
        frames.push({ base64: `data:image/jpeg;base64,${frameBuf.toString('base64')}`, timestamp: formatTimestamp(timestamp) });
      } catch { /* skip */ }
    }
  }

  if (frames.length === 0) throw new Error('Could not extract any frames from the YouTube video.');

  return { frames, metadata };
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
