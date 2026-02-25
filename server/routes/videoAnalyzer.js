import express from 'express';
import { run } from '@openai/agents';
import OpenAI from 'openai';
import ytdl from '@distube/ytdl-core';
import ffmpegPath from 'ffmpeg-static';
import ffmpeg from 'fluent-ffmpeg';
import { PassThrough } from 'stream';
import { videoSummaryAgent } from '../agents/videoAnalyzerAgents.js';
import { linkedInAgent, twitterAgent, carouselAgent } from '../agents/index.js';

ffmpeg.setFfmpegPath(ffmpegPath);

const router = express.Router();
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
  return {
    title: item.snippet.title,
    author: item.snippet.channelTitle,
    duration: parseISODuration(item.contentDetails.duration),
    thumbnail: item.snippet.thumbnails.maxres?.url
      || item.snippet.thumbnails.high?.url
      || item.snippet.thumbnails.default?.url,
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
  const results = await Promise.allSettled(
    timestamps.map(async (ts) => {
      const buffer = await extractFrameAtTimestamp(format.url, ts);
      return { base64: `data:image/jpeg;base64,${buffer.toString('base64')}`, timestamp: formatTimestamp(ts) };
    })
  );
  for (const r of results) {
    if (r.status === 'fulfilled') frames.push(r.value);
  }
  if (frames.length === 0) throw new Error('Frame extraction failed.');
  return frames;
}

// Step 3: Fallback — use the single best thumbnail from YouTube Data API
async function extractThumbnailFallback(thumbnailUrl) {
  const res = await fetch(thumbnailUrl);
  if (!res.ok) throw new Error('Could not fetch YouTube thumbnail.');
  const buffer = Buffer.from(await res.arrayBuffer());
  return [{ base64: `data:image/jpeg;base64,${buffer.toString('base64')}`, timestamp: '0:00' }];
}

async function handleYouTube(youtubeUrl) {
  const videoId = extractYouTubeVideoId(youtubeUrl);
  if (!videoId) throw new Error('Could not extract YouTube video ID from URL.');

  // Always works — YouTube Data API is not bot-blocked
  const meta = await fetchYouTubeMetadata(videoId);
  const metadata = { title: meta.title, author: meta.author, duration: meta.duration };

  // Try full frame extraction, fall back to thumbnail
  let frames;
  try {
    frames = await extractFramesViaYtdl(youtubeUrl, meta.duration);
  } catch (e) {
    console.warn('ytdl-core frame extraction failed, falling back to thumbnail:', e.message);
    frames = await extractThumbnailFallback(meta.thumbnail);
  }

  return { frames, metadata };
}

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

// Step 1 for YouTube: just fetch thumbnails + metadata (no AI)
router.post('/youtube-frames', async (req, res) => {
  try {
    const { youtubeUrl } = req.body;
    if (!youtubeUrl) {
      return res.status(400).json({ error: 'No YouTube URL provided' });
    }
    const result = await handleYouTube(youtubeUrl);
    res.json(result);
  } catch (error) {
    console.error('YouTube frames error:', error);
    res.status(500).json({ error: 'Failed to fetch YouTube frames', message: error.message });
  }
});

router.post('/analyze', async (req, res) => {
  try {
    const { frames, generateContent, youtubeMetadata } = req.body;

    if (!frames || !Array.isArray(frames) || frames.length === 0) {
      return res.status(400).json({ error: 'No frames provided', message: 'Please provide at least one video frame.' });
    }

    const cappedFrames = frames.slice(0, MAX_FRAMES);

    // Step 1: Describe each frame in parallel using GPT-4o vision
    const frameDescriptions = await Promise.all(
      cappedFrames.map(async (frame) => {
        const description = await describeFrame(frame.base64, frame.timestamp);
        return { timestamp: frame.timestamp, description };
      })
    );

    // Step 2: Synthesize all descriptions into a structured summary
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

    // Step 3: Optionally generate social media content
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

    res.json({ frameDescriptions, summary, content });
  } catch (error) {
    console.error('Video analyzer error:', error);
    res.status(500).json({ error: 'Analysis failed', message: error.message });
  }
});

export const videoAnalyzerRouter = router;
