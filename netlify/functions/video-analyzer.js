import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { Buffer } from 'node:buffer';
import { Agent, setOpenAIAPI, run } from '@openai/agents';
import OpenAI from 'openai';
import ytdl from '@distube/ytdl-core';
import ffmpegPath from 'ffmpeg-static';
import ffprobeStatic from 'ffprobe-static';
import ffmpeg from 'fluent-ffmpeg';
import { PassThrough } from 'stream';
import { consumeRateLimit } from './_lib/rateLimit.js';
import { extractSubpath, jsonResponse, methodNotAllowed, optionsResponse } from './_lib/http.js';
import { parseMultipart } from './_lib/multipart.js';

setOpenAIAPI('chat_completions');
ffmpeg.setFfmpegPath(ffmpegPath);
if (ffprobeStatic.path) {
  ffmpeg.setFfprobePath(ffprobeStatic.path);
}

const openai = new OpenAI();

const MAX_FRAMES = 15;
const YT_FRAME_COUNT = 8;
const YT_STORYBOARD_TARGET = 10;
const TARGET_WIDTH = 640;
const MAX_UPLOAD_SIZE = 500 * 1024 * 1024;
const MAX_UPLOAD_DURATION_SECONDS = 180;
const UPLOAD_ACCEPTED_TYPES = new Set([
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime',
]);
const FRAME_DESCRIPTION_CONCURRENCY = 4;
const MIN_CLIP_SECONDS = 5;
const MAX_CLIP_SECONDS = 20;
const MAX_VIRAL_CLIPS = 3;

function formatTimestamp(seconds) {
  const safeSeconds = Math.max(0, Math.floor(Number(seconds) || 0));
  const mins = Math.floor(safeSeconds / 60);
  const secs = safeSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function parseTimestampSeconds(value) {
  if (Number.isFinite(value)) return Math.max(0, Math.floor(value));
  if (typeof value !== 'string') return null;

  const parts = value.trim().split(':').map((part) => Number.parseInt(part, 10));
  if (parts.some((part) => !Number.isFinite(part))) return null;
  if (parts.length === 1) return Math.max(0, parts[0]);
  if (parts.length === 2) return Math.max(0, parts[0] * 60 + parts[1]);
  return Math.max(0, parts[0] * 3600 + parts[1] * 60 + parts[2]);
}

function toDataUrl(buffer, mimeType) {
  return `data:${mimeType};base64,${buffer.toString('base64')}`;
}

function sanitizeFilename(value) {
  return String(value || 'clip')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'clip';
}

function getFileExtension(filename, mimeType) {
  const ext = path.extname(filename || '').toLowerCase();
  if (ext) return ext;

  switch (mimeType) {
    case 'video/webm':
      return '.webm';
    case 'video/ogg':
      return '.ogg';
    case 'video/quicktime':
      return '.mov';
    case 'video/mp4':
    default:
      return '.mp4';
  }
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

function extractYouTubeVideoId(url) {
  const patterns = [
    /[?&]v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function parseISODuration(iso) {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  return parseInt(match[1] || 0, 10) * 3600 + parseInt(match[2] || 0, 10) * 60 + parseInt(match[3] || 0, 10);
}

async function mapWithConcurrency(items, concurrency, mapper) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await mapper(items[currentIndex], currentIndex);
    }
  }

  const workerCount = Math.min(concurrency, items.length);
  await Promise.all(Array.from({ length: workerCount }, () => worker()));
  return results;
}

function ffprobeAsync(inputPath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(inputPath, (error, metadata) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(metadata);
    });
  });
}

function writeClipToFile(inputPath, startSecond, durationSeconds, outputPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .setStartTime(startSecond)
      .duration(durationSeconds)
      .outputOptions([
        '-map 0:v:0?',
        '-map 0:a:0?',
        '-c:v libx264',
        '-c:a aac',
        '-preset veryfast',
        '-crf 24',
        '-movflags +faststart',
      ])
      .on('end', resolve)
      .on('error', reject)
      .save(outputPath);
  });
}

async function getVideoMetadata(videoPath) {
  const metadata = await ffprobeAsync(videoPath);
  const videoStream = metadata.streams?.find((stream) => stream.codec_type === 'video');
  const duration = Number.parseFloat(metadata.format?.duration || videoStream?.duration || '0');

  return {
    duration: Number.isFinite(duration) ? duration : 0,
    width: Number(videoStream?.width) || null,
    height: Number(videoStream?.height) || null,
  };
}

function buildPerSecondMarks(durationSeconds) {
  const totalWholeSeconds = Math.max(1, Math.floor(durationSeconds));
  return Array.from({ length: totalWholeSeconds }, (_, index) => index);
}

async function extractPerSecondFrames(videoPath, durationSeconds, framesDir) {
  const marks = buildPerSecondMarks(durationSeconds);
  await fs.mkdir(framesDir, { recursive: true });

  const frames = [];
  for (const rawTime of marks) {
    const buffer = await extractFrameAtTimestamp(videoPath, rawTime);
    frames.push({
      base64: toDataUrl(buffer, 'image/jpeg'),
      timestamp: formatTimestamp(rawTime),
      rawTime,
    });
  }

  return frames;
}

function clampClipWindow(startSecond, endSecond, durationSeconds) {
  const maxStart = Math.max(0, Math.floor(durationSeconds) - 1);
  let safeStart = Math.max(0, Math.min(maxStart, Math.floor(startSecond)));
  let safeEnd = Math.max(safeStart + 1, Math.min(Math.ceil(durationSeconds), Math.floor(endSecond)));
  let clipDuration = safeEnd - safeStart;

  if (clipDuration < MIN_CLIP_SECONDS && durationSeconds >= MIN_CLIP_SECONDS) {
    const needed = MIN_CLIP_SECONDS - clipDuration;
    safeStart = Math.max(0, safeStart - Math.floor(needed / 2));
    safeEnd = Math.min(Math.ceil(durationSeconds), safeEnd + Math.ceil(needed / 2));
    clipDuration = safeEnd - safeStart;

    if (clipDuration < MIN_CLIP_SECONDS) {
      safeEnd = Math.min(Math.ceil(durationSeconds), safeStart + MIN_CLIP_SECONDS);
      safeStart = Math.max(0, safeEnd - MIN_CLIP_SECONDS);
      clipDuration = safeEnd - safeStart;
    }
  }

  if (clipDuration > MAX_CLIP_SECONDS) {
    safeEnd = safeStart + MAX_CLIP_SECONDS;
    clipDuration = MAX_CLIP_SECONDS;
  }

  if (safeEnd <= safeStart) {
    safeEnd = Math.min(Math.ceil(durationSeconds), safeStart + 1);
  }

  return {
    startSecond: safeStart,
    endSecond: safeEnd,
    durationSeconds: Math.max(1, safeEnd - safeStart),
  };
}

function normalizeScoredMoments(rawMoments, frames) {
  const frameByTime = new Map(frames.map((frame) => [frame.rawTime, frame]));

  if (!Array.isArray(rawMoments)) return [];

  return rawMoments
    .map((moment) => {
      const rawTime = Number.isFinite(moment?.rawTime)
        ? Math.max(0, Math.floor(moment.rawTime))
        : parseTimestampSeconds(moment?.timestamp);
      if (!Number.isFinite(rawTime) || !frameByTime.has(rawTime)) return null;

      return {
        rawTime,
        timestamp: frameByTime.get(rawTime)?.timestamp || formatTimestamp(rawTime),
        score: Math.max(0, Math.min(100, Number(moment?.score) || 0)),
        hookStrength: Math.max(0, Math.min(100, Number(moment?.hookStrength) || 0)),
        energy: Math.max(0, Math.min(100, Number(moment?.energy) || 0)),
        emotion: Math.max(0, Math.min(100, Number(moment?.emotion) || 0)),
        novelty: Math.max(0, Math.min(100, Number(moment?.novelty) || 0)),
        clarity: Math.max(0, Math.min(100, Number(moment?.clarity) || 0)),
        shareability: Math.max(0, Math.min(100, Number(moment?.shareability) || 0)),
        explanation: typeof moment?.explanation === 'string' ? moment.explanation.trim() : '',
        viralTraits: Array.isArray(moment?.viralTraits)
          ? moment.viralTraits.filter(Boolean).slice(0, 4)
          : [],
      };
    })
    .filter(Boolean)
    .sort((left, right) => left.rawTime - right.rawTime);
}

function windowsOverlap(left, right) {
  return left.startSecond < right.endSecond && right.startSecond < left.endSecond;
}

function buildFallbackClipsFromMoments(scoredMoments, durationSeconds) {
  if (!scoredMoments.length) return [];

  const sortedMoments = [...scoredMoments].sort((left, right) => right.score - left.score);
  const clips = [];

  for (const moment of sortedMoments) {
    const start = Math.max(0, moment.rawTime - 2);
    const end = Math.min(Math.ceil(durationSeconds), start + 8);
    const normalized = clampClipWindow(start, end, durationSeconds);

    if (clips.some((clip) => windowsOverlap(clip, normalized))) continue;

    clips.push({
      score: moment.score,
      title: `Candidate around ${moment.timestamp}`,
      reason: moment.explanation || 'Strong visual moment based on second-by-second scoring.',
      viralTraits: moment.viralTraits,
      ...normalized,
    });

    if (clips.length >= MAX_VIRAL_CLIPS) break;
  }

  return clips;
}

function normalizeViralClips(rawClips, scoredMoments, durationSeconds) {
  const normalized = [];
  const sourceClips = Array.isArray(rawClips) ? rawClips : [];

  for (const rawClip of sourceClips) {
    const parsedStart = Number.isFinite(rawClip?.startSecond)
      ? rawClip.startSecond
      : parseTimestampSeconds(rawClip?.startTimestamp);
    const parsedEnd = Number.isFinite(rawClip?.endSecond)
      ? rawClip.endSecond
      : parseTimestampSeconds(rawClip?.endTimestamp);

    if (!Number.isFinite(parsedStart) || !Number.isFinite(parsedEnd)) continue;

    const clamped = clampClipWindow(parsedStart, parsedEnd, durationSeconds);
    if (normalized.some((clip) => windowsOverlap(clip, clamped))) continue;

    normalized.push({
      rank: normalized.length + 1,
      score: Math.max(0, Math.min(100, Number(rawClip?.score) || 0)),
      title: typeof rawClip?.title === 'string' && rawClip.title.trim()
        ? rawClip.title.trim()
        : `Clip ${normalized.length + 1}`,
      reason: typeof rawClip?.reason === 'string' && rawClip.reason.trim()
        ? rawClip.reason.trim()
        : 'High-scoring viral candidate.',
      viralTraits: Array.isArray(rawClip?.viralTraits)
        ? rawClip.viralTraits.filter(Boolean).slice(0, 5)
        : [],
      ...clamped,
    });

    if (normalized.length >= MAX_VIRAL_CLIPS) break;
  }

  if (normalized.length > 0) {
    return normalized.map((clip, index) => ({ ...clip, rank: index + 1 }));
  }

  return buildFallbackClipsFromMoments(scoredMoments, durationSeconds)
    .slice(0, MAX_VIRAL_CLIPS)
    .map((clip, index) => ({ ...clip, rank: index + 1 }));
}

async function generateClipDownloads(videoPath, clips, clipsDir) {
  await fs.mkdir(clipsDir, { recursive: true });

  return Promise.all(clips.map(async (clip) => {
    const safeLabel = sanitizeFilename(clip.title || `viral-clip-${clip.rank}`);
    const filename = `${String(clip.rank).padStart(2, '0')}-${safeLabel}.mp4`;
    const outputPath = path.join(clipsDir, filename);

    try {
      await writeClipToFile(videoPath, clip.startSecond, clip.durationSeconds, outputPath);
      const buffer = await fs.readFile(outputPath);

      return {
        ...clip,
        download: {
          filename,
          mimeType: 'video/mp4',
          base64: toDataUrl(buffer, 'video/mp4'),
        },
      };
    } catch (error) {
      console.error(`Clip generation failed for rank ${clip.rank}:`, error.message);
      return {
        ...clip,
        download: null,
        downloadError: 'Clip trimming failed for this candidate.',
      };
    }
  }));
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

function chooseStoryboard(info) {
  const storyboards = info?.videoDetails?.storyboards || info?.storyboards || [];
  if (!Array.isArray(storyboards) || storyboards.length === 0) return null;

  return [...storyboards]
    .filter((storyboard) => storyboard?.templateUrl && storyboard.thumbnailCount > 0 && storyboard.columns > 0 && storyboard.rows > 0)
    .sort((left, right) => {
      if (right.thumbnailCount !== left.thumbnailCount) return right.thumbnailCount - left.thumbnailCount;
      return (right.thumbnailWidth * right.thumbnailHeight) - (left.thumbnailWidth * left.thumbnailHeight);
    })[0] || null;
}

function getEvenlySpacedIndices(total, desired) {
  if (!Number.isFinite(total) || total <= 0 || desired <= 0) return [];
  if (total === 1) return [0];

  const count = Math.min(total, desired);
  const step = (total - 1) / Math.max(1, count - 1);
  const indices = new Set();

  for (let index = 0; index < count; index += 1) {
    indices.add(Math.min(total - 1, Math.round(index * step)));
  }

  return [...indices].sort((left, right) => left - right);
}

function resolveStoryboardPageUrl(templateUrl, pageIndex) {
  if (templateUrl.includes('$M')) {
    return templateUrl.replace('$M', String(pageIndex));
  }
  return templateUrl.replace(/M\d+(?=\.jpg|\.jpeg|\.webp)/i, `M${pageIndex}`);
}

function storyboardIntervalSeconds(interval) {
  if (!Number.isFinite(interval) || interval <= 0) return 1;
  return interval > 1000 ? interval / 1000 : interval;
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
        base64: toDataUrl(buffer, 'image/jpeg'),
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

async function fetchYouTubeMetadata(videoId) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) throw new Error('YouTube API key not configured. Set YOUTUBE_API_KEY environment variable.');

  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${apiKey}`
  );
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || 'YouTube API request failed.');
  if (!data.items?.length) throw new Error('Video not found or is private.');

  const item = data.items[0];
  const thumbnailUrls = Object.values(item.snippet.thumbnails || {})
    .map((thumbnail) => thumbnail?.url)
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

async function extractFramesFromYtdlInfo(info, duration) {
  const format = ytdl.chooseFormat(info.formats, { quality: 'lowest', filter: 'videoandaudio' });
  if (!format?.url) throw new Error('No suitable video format found.');

  const frameCount = Math.min(YT_FRAME_COUNT, Math.max(2, Math.floor(duration / 10)));
  const interval = duration / (frameCount + 1);
  const timestamps = Array.from({ length: frameCount }, (_, index) => Math.floor(interval * (index + 1)));

  const frames = [];
  for (const timestamp of timestamps) {
    try {
      const buffer = await extractFrameAtTimestamp(format.url, timestamp);
      frames.push({
        base64: toDataUrl(buffer, 'image/jpeg'),
        timestamp: formatTimestamp(timestamp),
      });
    } catch (error) {
      console.warn(`Skipping frame at ${timestamp}s:`, error.message);
    }
  }

  if (frames.length === 0) throw new Error('Frame extraction failed.');
  return frames;
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

function buildYouTubeThumbnailCandidates(videoId, duration, thumbnailUrls = []) {
  return [
    {
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
      timestamp: formatTimestamp(Math.floor(duration * 0.25)),
      urls: uniqueUrls([
        `https://i.ytimg.com/vi/${videoId}/hq1.jpg`,
        `https://i.ytimg.com/vi/${videoId}/1.jpg`,
      ]),
    },
    {
      timestamp: formatTimestamp(Math.floor(duration * 0.5)),
      urls: uniqueUrls([
        `https://i.ytimg.com/vi/${videoId}/hq2.jpg`,
        `https://i.ytimg.com/vi/${videoId}/2.jpg`,
      ]),
    },
    {
      timestamp: formatTimestamp(Math.floor(duration * 0.75)),
      urls: uniqueUrls([
        `https://i.ytimg.com/vi/${videoId}/hq3.jpg`,
        `https://i.ytimg.com/vi/${videoId}/3.jpg`,
      ]),
    },
  ];
}

async function fetchThumbnailCandidate({ url, timestamp }) {
  const response = await fetch(url);
  if (!response.ok) return null;

  const contentType = response.headers.get('content-type') || 'image/jpeg';
  if (!contentType.toLowerCase().startsWith('image/')) return null;

  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length < 800) return null;

  const mimeType = contentType.split(';')[0] || 'image/jpeg';
  return {
    base64: toDataUrl(buffer, mimeType),
    timestamp,
  };
}

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

  const meta = await fetchYouTubeMetadata(videoId);
  const metadata = { title: meta.title, author: meta.author, duration: meta.duration };
  const thumbnailUrls = [meta.thumbnail, ...(meta.thumbnailUrls || [])].filter(Boolean);

  let thumbnailFrames = [];
  try {
    thumbnailFrames = await extractThumbnailFallback(videoId, meta.duration, thumbnailUrls);
  } catch (error) {
    console.warn('YouTube thumbnail extraction failed:', error.message);
  }

  let ytdlInfo = null;
  try {
    ytdlInfo = await withTimeout(
      ytdl.getInfo(youtubeUrl),
      20000,
      'YouTube info extraction timed out.'
    );
  } catch (error) {
    if (isYouTubeBotCheckError(error)) {
      console.warn('YouTube bot-check detected while fetching video info.');
    } else {
      console.warn('Could not fetch YouTube info:', error.message);
    }
  }

  if (ytdlInfo) {
    try {
      const streamFrames = await withTimeout(
        extractFramesFromYtdlInfo(ytdlInfo, meta.duration),
        20000,
        'YouTube stream extraction timed out.'
      );
      return { frames: streamFrames, metadata };
    } catch (error) {
      if (isYouTubeBotCheckError(error)) {
        console.warn('YouTube bot-check detected during stream extraction; trying storyboard fallback.');
      } else {
        console.warn('ytdl-core stream frame extraction failed; trying storyboard fallback:', error.message);
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
    } catch (error) {
      console.warn('Storyboard extraction failed; using thumbnail fallback:', error.message);
    }
  }

  if (thumbnailFrames.length > 0) {
    return { frames: thumbnailFrames, metadata };
  }

  throw new Error('Unable to extract frames from YouTube stream, storyboard, or thumbnails.');
}

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

const viralClipAnalysisAgent = new Agent({
  name: 'Viral Clip Analyzer',
  model: 'gpt-4o',
  instructions: `You are a short-form video strategist. Given chronological one-frame-per-second descriptions from an uploaded video, identify the strongest viral-worthy segments.

Focus on moments that feel:
- energetic
- motivating
- emotionally resonant
- surprising
- highly clear in a single glance
- likely to get rewatched or shared

Rules:
- Work only from the supplied timestamps.
- Recommend up to 3 non-overlapping clip windows.
- Prefer clips between 5 and 20 seconds.
- Each clip must be a contiguous time range.
- Rank best first.
- Score all values from 0 to 100.

OUTPUT FORMAT (JSON only, no markdown):
{
  "title": "Concise descriptive title",
  "videoType": "tutorial|presentation|vlog|demo|interview|other",
  "summary": "2-4 sentence overview",
  "keyMoments": [
    { "timestamp": "0:05", "description": "What happens" }
  ],
  "topics": ["topic1", "topic2"],
  "hashtags": ["#tag1", "#tag2"],
  "tone": "professional|casual|educational|entertaining|inspirational",
  "targetAudience": "Audience description",
  "scoredMoments": [
    {
      "rawTime": 5,
      "timestamp": "0:05",
      "score": 88,
      "hookStrength": 84,
      "energy": 90,
      "emotion": 76,
      "novelty": 71,
      "clarity": 85,
      "shareability": 87,
      "explanation": "Why this second stands out",
      "viralTraits": ["energetic", "motivating"]
    }
  ],
  "viralClips": [
    {
      "startSecond": 5,
      "endSecond": 12,
      "score": 91,
      "title": "Short clip title",
      "reason": "Why this segment is viral-worthy",
      "viralTraits": ["energetic", "motivating"]
    }
  ]
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
  } catch (error) {
    console.error('Failed to parse agent output:', error.message);
    return null;
  }
}

function buildFallbackSummary() {
  return {
    title: 'Video Analysis',
    videoType: 'other',
    summary: 'Unable to generate a detailed summary.',
    keyMoments: [],
    topics: [],
    hashtags: [],
    tone: 'professional',
    targetAudience: 'General audience',
  };
}

async function describeFrame(base64Data, timestamp) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Describe this video frame captured at timestamp ${timestamp}. Include: what's visible, any text on screen, people or objects, actions happening, and the overall scene. Be concise but specific in 2-3 sentences.`,
          },
          {
            type: 'image_url',
            image_url: {
              url: base64Data.startsWith('data:') ? base64Data : toDataUrl(Buffer.from(base64Data, 'base64'), 'image/jpeg'),
              detail: 'low',
            },
          },
        ],
      },
    ],
    max_tokens: 220,
  });

  return response.choices[0]?.message?.content || 'Unable to describe frame.';
}

async function buildFrameDescriptions(frames) {
  return mapWithConcurrency(frames, FRAME_DESCRIPTION_CONCURRENCY, async (frame) => {
    const description = await describeFrame(frame.base64, frame.timestamp);
    return {
      timestamp: frame.timestamp,
      rawTime: frame.rawTime,
      description,
    };
  });
}

async function summarizeFrameDescriptions(frameDescriptions, youtubeMetadata = null) {
  const metaContext = youtubeMetadata
    ? `\nYouTube Video Title: ${youtubeMetadata.title}\nAuthor: ${youtubeMetadata.author}\n`
    : '';
  const summaryPrompt = `Analyze these video frame descriptions and create a comprehensive video summary.
${metaContext}
Frame descriptions (in chronological order):
${frameDescriptions.map((frame) => `[${frame.timestamp}] ${frame.description}`).join('\n\n')}

Total frames analyzed: ${frameDescriptions.length}`;

  const summaryResult = await run(videoSummaryAgent, summaryPrompt);
  return safeParseJSON(summaryResult.finalOutput) || buildFallbackSummary();
}

async function analyzeViralClipCandidates(frameDescriptions, durationSeconds) {
  const prompt = `Analyze this uploaded video represented as one frame per second.

Duration in seconds: ${Math.floor(durationSeconds)}

Frame descriptions:
${frameDescriptions.map((frame) => `[${frame.timestamp} | rawTime=${frame.rawTime}] ${frame.description}`).join('\n\n')}`;

  const result = await run(viralClipAnalysisAgent, prompt);
  return safeParseJSON(result.finalOutput);
}

async function generateContentFromSummary(summary) {
  const contentSource = `Video Title: ${summary.title}

Summary: ${summary.summary}

Key Topics: ${(summary.topics || []).join(', ')}

Key Moments:
${(summary.keyMoments || []).map((moment) => `- [${moment.timestamp}] ${moment.description}`).join('\n')}

Target Audience: ${summary.targetAudience}
Tone: ${summary.tone}`;

  const [linkedInResult, twitterResult, carouselResult] = await Promise.all([
    run(linkedInAgent, `Create a LinkedIn post about this video content:\n\n${contentSource}`),
    run(twitterAgent, `Create a Twitter thread about this video content:\n\n${contentSource}`),
    run(carouselAgent, `Create carousel slides about this video content:\n\n${contentSource}`),
  ]);

  return {
    linkedin: linkedInResult.finalOutput,
    twitter: twitterResult.finalOutput.split('---TWEET---').map((tweet) => tweet.trim()).filter(Boolean),
    carousel: carouselResult.finalOutput.split('---SLIDE---').map((slide) => slide.trim()).filter(Boolean),
  };
}

function validateUploadedVideo(file) {
  if (!file) {
    throw new Error('No video file provided.');
  }

  const fileSize = file.buffer?.length || 0;
  if (fileSize <= 0) {
    throw new Error('Uploaded file is empty.');
  }

  if (fileSize > MAX_UPLOAD_SIZE) {
    throw new Error('File too large. Maximum size is 500MB.');
  }

  const mimeType = file.mimeType || '';
  const filename = file.filename || '';
  const ext = path.extname(filename).toLowerCase();
  const allowedByExtension = ['.mp4', '.webm', '.ogg', '.mov'].includes(ext);

  if (!UPLOAD_ACCEPTED_TYPES.has(mimeType) && !allowedByExtension) {
    throw new Error('Unsupported file type. Please upload MP4, WebM, OGG, or MOV.');
  }
}

async function handleUploadedVideoAnalysis(event) {
  const { fields, files } = await parseMultipart(event);
  const file = files.find((candidate) => candidate.fieldName === 'file') || files[0];
  validateUploadedVideo(file);

  const generateContent = String(fields.generateContent || 'true') === 'true';
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'video-analyzer-'));
  const ext = getFileExtension(file.filename, file.mimeType);
  const videoPath = path.join(tempDir, `upload${ext}`);
  const framesDir = path.join(tempDir, 'frames');
  const clipsDir = path.join(tempDir, 'clips');

  try {
    await fs.writeFile(videoPath, file.buffer);
    const metadata = await getVideoMetadata(videoPath);

    if (!metadata.duration || !Number.isFinite(metadata.duration)) {
      throw new Error('Could not determine video duration.');
    }

    if (metadata.duration > MAX_UPLOAD_DURATION_SECONDS) {
      throw new Error('Uploaded video is too long for viral clip analysis. Limit is 3 minutes.');
    }

    const frames = await extractPerSecondFrames(videoPath, metadata.duration, framesDir);
    const frameDescriptions = await buildFrameDescriptions(frames);

    let analysis = null;
    let summary = buildFallbackSummary();
    let scoredMoments = [];
    let viralClips = [];
    let clipGenerationWarning = null;

    try {
      analysis = await analyzeViralClipCandidates(frameDescriptions, metadata.duration);
    } catch (error) {
      console.error('Viral clip analysis failed:', error.message);
    }

    if (analysis) {
      summary = {
        title: analysis.title || summary.title,
        videoType: analysis.videoType || summary.videoType,
        summary: analysis.summary || summary.summary,
        keyMoments: Array.isArray(analysis.keyMoments) ? analysis.keyMoments : [],
        topics: Array.isArray(analysis.topics) ? analysis.topics : [],
        hashtags: Array.isArray(analysis.hashtags) ? analysis.hashtags : [],
        tone: analysis.tone || summary.tone,
        targetAudience: analysis.targetAudience || summary.targetAudience,
      };
      scoredMoments = normalizeScoredMoments(analysis.scoredMoments, frames);
      viralClips = normalizeViralClips(analysis.viralClips, scoredMoments, metadata.duration);
    } else {
      clipGenerationWarning = 'AI ranking failed. Returning extracted frames without generated clips.';
    }

    if (viralClips.length > 0) {
      viralClips = await generateClipDownloads(videoPath, viralClips, clipsDir);
      if (viralClips.every((clip) => !clip.download)) {
        clipGenerationWarning = 'Clip trimming failed for the detected candidates.';
      }
    }

    let content = null;
    if (generateContent) {
      try {
        content = await generateContentFromSummary(summary);
      } catch (error) {
        console.error('Content generation failed:', error.message);
      }
    }

    return {
      frames,
      frameDescriptions,
      summary,
      content,
      scoredMoments,
      viralClips,
      videoMetadata: {
        duration: metadata.duration,
        width: metadata.width,
        height: metadata.height,
      },
      warnings: clipGenerationWarning ? [clipGenerationWarning] : [],
    };
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return optionsResponse();
  if (event.httpMethod !== 'POST') return methodNotAllowed();

  const subpath = extractSubpath(event, '/api/video-analyzer', 'video-analyzer');
  if (subpath !== '/' && subpath !== '/analyze' && subpath !== '/youtube-frames' && subpath !== '/analyze-upload') {
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
    if (subpath === '/analyze-upload') {
      const result = await handleUploadedVideoAnalysis(event);
      return jsonResponse(200, result, rate.headers);
    }

    const body = JSON.parse(event.body || '{}');

    if (subpath === '/youtube-frames') {
      const { youtubeUrl } = body;
      if (!youtubeUrl) {
        return jsonResponse(400, { error: 'No YouTube URL provided' }, rate.headers);
      }

      const result = await handleYouTube(youtubeUrl);
      return jsonResponse(200, result, rate.headers);
    }

    const { frames, generateContent, youtubeMetadata } = body;

    if (!frames || !Array.isArray(frames) || frames.length === 0) {
      return jsonResponse(
        400,
        { error: 'No frames provided', message: 'Please provide at least one video frame.' },
        rate.headers
      );
    }

    const cappedFrames = frames.slice(0, MAX_FRAMES);
    const frameDescriptions = await Promise.all(
      cappedFrames.map(async (frame) => {
        const description = await describeFrame(frame.base64, frame.timestamp);
        return {
          timestamp: frame.timestamp,
          description,
        };
      })
    );

    const summary = await summarizeFrameDescriptions(frameDescriptions, youtubeMetadata);

    let content = null;
    if (generateContent) {
      content = await generateContentFromSummary(summary);
    }

    return jsonResponse(200, { frameDescriptions, summary, content }, rate.headers);
  } catch (error) {
    console.error('Video analyzer error:', error);
    return jsonResponse(
      500,
      {
        error: 'Video analysis failed',
        message: error.message || 'Something went wrong while analyzing the video.',
      },
      rate.headers
    );
  }
}
