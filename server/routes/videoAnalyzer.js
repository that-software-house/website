import express from 'express';
import { run } from '@openai/agents';
import OpenAI from 'openai';
import ffmpegPath from 'ffmpeg-static';
import ffmpeg from 'fluent-ffmpeg';
import { PassThrough, Readable } from 'stream';
import { videoSummaryAgent } from '../agents/videoAnalyzerAgents.js';
import { linkedInAgent, twitterAgent, carouselAgent } from '../agents/index.js';

ffmpeg.setFfmpegPath(ffmpegPath);

const router = express.Router();
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

// Fetch YouTube page HTML and extract playerResponse data (no API key, no ytdl-core)
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

// Parse storyboard spec and extract the highest-quality level info
function parseStoryboardSpec(spec) {
  const parts = spec.split('|');
  const baseUrl = parts[0];
  // Last entry is the highest quality level
  const levelIdx = parts.length - 1;
  const levelData = parts[levelIdx].split('#');
  const [tw, th, totalFrames, cols, rows, intervalMs, namePattern, sigh] = levelData;
  return {
    baseUrl,
    levelNumber: levelIdx - 1, // 0-indexed level for URL
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

// Crop a single frame from a sprite sheet buffer using ffmpeg
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

  const metadata = {
    title: pageData.title,
    author: pageData.author,
    duration,
  };

  if (!storyboardSpec) {
    // Fallback: return single thumbnail if no storyboard available
    const thumbRes = await fetch(`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`);
    if (!thumbRes.ok) throw new Error('Could not fetch YouTube thumbnail.');
    const buf = Buffer.from(await thumbRes.arrayBuffer());
    return {
      frames: [{ base64: `data:image/jpeg;base64,${buf.toString('base64')}`, timestamp: '0:00' }],
      metadata,
    };
  }

  const sb = parseStoryboardSpec(storyboardSpec);

  // Pick evenly-spaced frame indices across the video
  const desiredCount = Math.min(YT_FRAME_COUNT, Math.max(2, sb.totalFrames));
  const step = Math.floor(sb.totalFrames / (desiredCount + 1));
  const selectedIndices = Array.from({ length: desiredCount }, (_, i) => step * (i + 1));

  // Group frame indices by sprite sheet
  const sheetGroups = {};
  for (const idx of selectedIndices) {
    const sheetIdx = Math.floor(idx / sb.framesPerSheet);
    if (!sheetGroups[sheetIdx]) sheetGroups[sheetIdx] = [];
    sheetGroups[sheetIdx].push(idx);
  }

  // Fetch sprite sheets and crop individual frames
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
        frames.push({
          base64: `data:image/jpeg;base64,${frameBuf.toString('base64')}`,
          timestamp: formatTimestamp(timestamp),
        });
      } catch {
        // Skip failed frames
      }
    }
  }

  if (frames.length === 0) throw new Error('Could not extract any frames from the YouTube video.');

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
