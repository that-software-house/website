# Video Analyzer Viral Clips Design

Date: 2026-04-14

## Goal

Extend the existing `VideoAnalyzer` project so uploaded video files can be:

1. broken into one frame per second,
2. analyzed for viral-worthy sections, and
3. trimmed into up to three ranked clip candidates returned to the user.

Scope for v1 is limited to uploaded files. Remote URLs and YouTube links remain outside the viral clip generation path.

## Chosen Approach

Use a server-first pipeline for uploaded files.

The browser uploads the original video file to a Netlify function using `multipart/form-data`. The server then:

1. writes the upload to a temporary file,
2. extracts exactly one frame per second,
3. describes frames and scores second-by-second moments,
4. groups strong adjacent seconds into ranked clip windows,
5. trims up to three non-overlapping clips from the original source video, and
6. returns frames, ranked clip candidates, summary data, and optional social content.

## Why This Approach

- The server has direct access to the original file, so trimming is reliable.
- The same source asset is used for frame extraction and clip generation.
- The frontend becomes simpler for uploaded files: one action, one response payload.
- This avoids trying to reconstruct clips from browser-only frame analysis.

## Analysis Model

Each second of video is treated as one analysis unit.

The server extracts one frame per second and produces:

- `frameDescriptions`: short visual summaries per timestamp
- `summary`: overall summary of the source video
- `viralClips`: ranked viral candidates

The model should evaluate moments using criteria such as:

- hook strength
- energy
- emotion
- novelty
- clarity
- shareability

Candidate windows should be built from contiguous strong seconds, then padded slightly at the edges so clips do not feel abrupt.

## Viral Clip Constraints

- Return up to 3 candidates.
- Candidates should be ranked best-first.
- Candidates should not overlap.
- Clip length should stay within a predictable range, targeting roughly 5-20 seconds.
- Each candidate should include:
  - `rank`
  - `startSecond`
  - `endSecond`
  - `durationSeconds`
  - `score`
  - `title`
  - `reason`
  - `viralTraits`
  - downloadable clip payload

## API Shape

Add a new uploaded-video analysis endpoint under the existing `video-analyzer` function.

Expected response shape:

```json
{
  "frames": [
    {
      "base64": "data:image/jpeg;base64,...",
      "timestamp": "0:05",
      "rawTime": 5
    }
  ],
  "frameDescriptions": [
    {
      "timestamp": "0:05",
      "rawTime": 5,
      "description": "..."
    }
  ],
  "viralClips": [
    {
      "rank": 1,
      "startSecond": 5,
      "endSecond": 10,
      "durationSeconds": 5,
      "score": 92,
      "title": "...",
      "reason": "...",
      "viralTraits": ["energetic", "motivating"],
      "download": {
        "filename": "viral-clip-1.mp4",
        "mimeType": "video/mp4",
        "base64": "data:video/mp4;base64,..."
      }
    }
  ],
  "summary": {},
  "content": {}
}
```

## Frontend Changes

For uploaded files:

- stop using browser-side frame extraction as the primary pipeline,
- send the original file directly to the backend,
- show one unified analyze action,
- render the returned per-second frame gallery,
- render a new ranked viral clips section with download actions.

Existing URL and YouTube behavior can remain unchanged for now.

## Failure Handling

- If extraction succeeds but trimming fails, still return frames and ranking metadata.
- If ranking fails, still return extracted frames and a fallback summary/error.
- Reject unsupported types and oversized uploads early.
- Always clean up temp files in `finally` blocks.

## Verification

Verify:

- one-frame-per-second extraction,
- ranked clip candidate generation,
- trimmed clip download behavior,
- degradation when part of the pipeline fails,
- frontend rendering for frames, summary, and viral clip cards.
