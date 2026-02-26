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
const YT_STORYBOARD_TARGET = 10;
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
  return extractFramesFromYtdlInfo(info, duration);
}

async function extractFramesFromYtdlInfo(info, duration) {
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

function chooseStoryboard(info) {
  const storyboards = info?.videoDetails?.storyboards || info?.storyboards || [];
  if (!Array.isArray(storyboards) || storyboards.length === 0) return null;

  return [...storyboards]
    .filter((sb) => sb?.templateUrl && sb.thumbnailCount > 0 && sb.columns > 0 && sb.rows > 0)
    .sort((a, b) => {
      if (b.thumbnailCount !== a.thumbnailCount) return b.thumbnailCount - a.thumbnailCount;
      return (b.thumbnailWidth * b.thumbnailHeight) - (a.thumbnailWidth * a.thumbnailHeight);
    })[0] || null;
}

function getEvenlySpacedIndices(total, desired) {
  if (!Number.isFinite(total) || total <= 0 || desired <= 0) return [];
  if (total === 1) return [0];

  const count = Math.min(total, desired);
  const step = (total - 1) / Math.max(1, count - 1);
  const indices = new Set();

  for (let i = 0; i < count; i += 1) {
    indices.add(Math.min(total - 1, Math.round(i * step)));
  }

  return [...indices].sort((a, b) => a - b);
}

function resolveStoryboardPageUrl(templateUrl, pageIndex) {
  if (templateUrl.includes('$M')) {
    return templateUrl.replace('$M', String(pageIndex));
  }
  const replaced = templateUrl.replace(/M\d+(?=\.jpg|\.jpeg|\.webp)/i, `M${pageIndex}`);
  return replaced;
}

function storyboardIntervalSeconds(interval) {
  if (!Number.isFinite(interval) || interval <= 0) return 1;
  return interval > 1000 ? interval / 1000 : interval;
}

function extractStoryboardTile(pageUrl, crop, timestamp) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    const passthrough = new PassThrough();

    passthrough.on('data', (chunk) => chunks.push(chunk));
    passthrough.on('end', () => {
      const buffer = Buffer.concat(chunks);
      if (buffer.length === 0) {
        reject(new Error(`Empty storyboard tile from ${pageUrl}`));
        return;
      }
      resolve({
        base64: `data:image/jpeg;base64,${buffer.toString('base64')}`,
        timestamp,
      });
    });
    passthrough.on('error', reject);

    ffmpeg(pageUrl)
      .frames(1)
      .videoFilters(`crop=${crop.width}:${crop.height}:${crop.x}:${crop.y}`)
      .format('image2')
      .outputOptions(['-vcodec', 'mjpeg'])
      .on('error', reject)
      .pipe(passthrough, { end: true });
  });
}

async function extractFramesViaStoryboard(info, duration) {
  const storyboard = chooseStoryboard(info);
  if (!storyboard) throw new Error('No storyboard data available.');

  const thumbnailCount = Math.max(1, storyboard.thumbnailCount);
  const indices = getEvenlySpacedIndices(thumbnailCount, YT_STORYBOARD_TARGET);
  if (indices.length === 0) throw new Error('No storyboard frames available.');

  const frames = [];
  const tilesPerPage = storyboard.columns * storyboard.rows;
  const intervalSeconds = storyboardIntervalSeconds(storyboard.interval);

  for (const index of indices) {
    const pageIndex = Math.floor(index / tilesPerPage);
    if (pageIndex >= storyboard.storyboardCount) continue;

    const withinPage = index % tilesPerPage;
    const row = Math.floor(withinPage / storyboard.columns);
    const col = withinPage % storyboard.columns;
    const pageUrl = resolveStoryboardPageUrl(storyboard.templateUrl, pageIndex);
    const seconds = Math.min(duration, Math.max(0, Math.floor(index * intervalSeconds)));
    const timestamp = formatTimestamp(seconds);

    try {
      const frame = await extractStoryboardTile(
        pageUrl,
        {
          width: storyboard.thumbnailWidth,
          height: storyboard.thumbnailHeight,
          x: col * storyboard.thumbnailWidth,
          y: row * storyboard.thumbnailHeight,
        },
        timestamp
      );
      frames.push(frame);
    } catch (error) {
      console.warn(`Storyboard frame ${index} extraction failed:`, error.message);
    }
  }

  if (frames.length === 0) throw new Error('Storyboard extraction produced no frames.');
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

  // Pre-fetch info once so we can reuse it for stream + storyboard extraction.
  let ytdlInfo = null;
  try {
    ytdlInfo = await withTimeout(
      ytdl.getInfo(youtubeUrl),
      20000,
      'YouTube info extraction timed out.'
    );
  } catch (e) {
    if (isYouTubeBotCheckError(e)) {
      console.warn('YouTube bot-check detected while fetching video info.');
    } else {
      console.warn('Could not fetch YouTube info:', e.message);
    }
  }

  // Secondary path: try full frame extraction from stream URL.
  if (ytdlInfo) {
    try {
      const streamFrames = await withTimeout(
        extractFramesFromYtdlInfo(ytdlInfo, meta.duration),
        20000,
        'YouTube stream extraction timed out.'
      );
      return { frames: streamFrames, metadata };
    } catch (e) {
      if (isYouTubeBotCheckError(e)) {
        console.warn('YouTube bot-check detected during stream extraction; trying storyboard fallback.');
      } else {
        console.warn('ytdl-core stream frame extraction failed; trying storyboard fallback:', e.message);
      }
    }

    try {
      const storyboardFrames = await withTimeout(
        extractFramesViaStoryboard(ytdlInfo, meta.duration),
        20000,
        'YouTube storyboard extraction timed out.'
      );
      if (storyboardFrames.length >= YT_FRAME_COUNT) {
        return { frames: storyboardFrames, metadata };
      }

      const mergedFrames = [...storyboardFrames];
      for (const frame of thumbnailFrames) {
        if (mergedFrames.length >= YT_FRAME_COUNT) break;
        mergedFrames.push(frame);
      }
      if (mergedFrames.length > 0) {
        return { frames: mergedFrames, metadata };
      }
    } catch (e) {
      console.warn('Storyboard extraction failed; using thumbnail fallback:', e.message);
    }
  }

  if (thumbnailFrames.length > 0) {
    return { frames: thumbnailFrames, metadata };
  }

  throw new Error('Unable to extract frames from YouTube stream, storyboard, or thumbnails.');
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
