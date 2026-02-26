# Codebase Concerns

**Analysis Date:** 2026-02-25

## Tech Debt

**In-Memory Rate Limiting Implementation:**
- Issue: Using JavaScript `Map` for rate limiting instead of persistent storage (Redis). This approach loses rate limit data on server restart and doesn't work in serverless/multi-instance deployments.
- Files: `server/middleware/rateLimit.js` (lines 19-34)
- Impact: Rate limits are unreliable in production. Users can bypass limits by refreshing the server. Netlify serverless functions create new instances per request, making rate limiting non-functional.
- Fix approach: Migrate to Redis or Supabase rate limit table. Consider implementing JWT token consumption tracking in Supabase `auth.users` table for persistent user-based limits.

**Newsletter Subscription Not Implemented:**
- Issue: Empty TODO in Footer component with only console logging
- Files: `src/components/Footer.jsx` (lines 11-12)
- Impact: Subscription form doesn't work; user data is lost
- Fix approach: Implement email capture to Supabase or external service (Brevo, Mailchimp)

**Code Contains Excessive console.log Statements:**
- Issue: Multiple console.log statements left in production code for debugging
- Files: `server/routes/content.js` (lines 21, 34, 37, 41, 56), `server/utils/urlFetcher.js` (lines 10, 87, 88)
- Impact: Potentially exposes sensitive information (URLs, content, API requests) to logs. Creates noise in production logs.
- Fix approach: Replace with structured logging library (Winston, Pino). Remove user content logging.

**Duplicated Supabase Initialization:**
- Issue: Supabase client initialization code is duplicated across multiple files with inconsistent fallback handling
- Files: `server/middleware/rateLimit.js` (lines 1-17), `server/routes/invoiceChaser.js` (lines 37-44), `src/context/AuthContext.jsx`, `src/lib/supabase.js`
- Impact: Inconsistent error handling. Difficult to maintain credential fallback logic.
- Fix approach: Create centralized `server/lib/supabase.js` module. Consolidate initialization logic.

**Incomplete Error Handling in Async Operations:**
- Issue: Multiple routes use `.catch(() => {})` or silently fail without informing the client
- Files: `src/services/openai.js` (lines 20-22), `src/lib/spotify.js` (line 97)
- Impact: Client doesn't know why requests failed. Debugging is difficult.
- Fix approach: Ensure all catch blocks return meaningful error responses to the client.

---

## Known Bugs

**YouTube Frame Extraction Unreliable:**
- Symptoms: Video analyzer frequently fails with "sign in to confirm you're not a bot" error. Frame extraction returns empty or partial results.
- Files: `server/routes/videoAnalyzer.js` (lines 54-59, 115-119)
- Trigger: Extract frames from any YouTube video. Occurs more frequently when many requests are made in short time.
- Workaround: Fallback to storyboard extraction sometimes works, but is slower and less accurate.
- Root cause: `@distube/ytdl-core` package requires direct IP access and gets blocked by YouTube's bot detection. Cloud/containerized IPs are often blocked.

**Invoice Chaser Field Mapping Overly Complex:**
- Symptoms: CSV uploads with non-standard column names may not be mapped correctly, resulting in lost data or incorrect classifications.
- Files: `server/routes/invoiceChaser.js` (lines 64-100)
- Trigger: Upload CSV with custom column names that don't match common patterns
- Workaround: Rename columns to match expected patterns
- Root cause: Field alias matching is case-insensitive but doesn't handle typos, abbreviations, or regional variations

---

## Security Considerations

**Exposed API Keys in Error Messages:**
- Risk: API error responses may contain sensitive request data or partial API keys
- Files: `server/routes/videoAnalyzer.js` (line 70), `server/routes/chat.js`
- Current mitigation: Generic error messages are sometimes used
- Recommendations:
  - Sanitize all error responses before sending to client
  - Log full errors server-side only
  - Use structured error codes instead of verbose messages

**Missing CORS Restrictions:**
- Risk: CORS is enabled globally with no domain restrictions
- Files: `server/index.js` (line 18)
- Current mitigation: None
- Recommendations:
  - Restrict CORS to specific domains: `cors({ origin: process.env.ALLOWED_ORIGINS?.split(',') })`
  - Add CSRF protection for state-changing operations

**Supabase Service Key Exposed on Server:**
- Risk: Using `SUPABASE_SERVICE_ROLE_KEY` in multiple locations allows full database access. If compromised, attacker can modify all user data.
- Files: `server/middleware/rateLimit.js`, `server/routes/invoiceChaser.js`
- Current mitigation: Stored in environment variables, not hardcoded
- Recommendations:
  - Use row-level security (RLS) policies in Supabase instead of service role key
  - Create limited API keys with specific table access
  - Rotate keys regularly and audit access logs

**File Upload Directory Not Validated:**
- Risk: Uploaded files could potentially write to arbitrary locations
- Files: `server/routes/docAnalyzer.js` (line 87), `server/routes/dataInsights.js`, `server/routes/invoiceChaser.js`
- Current mitigation: Using formidable's default temp directory
- Recommendations:
  - Explicitly specify upload directory: `new formidable.IncomingForm({ uploadDir: '/tmp' })`
  - Validate file paths to prevent directory traversal
  - Implement virus scanning for uploaded files

**Auth Token Validation Not Enforced:**
- Risk: Requests with invalid tokens silently proceed with `req.user = null`
- Files: `server/middleware/rateLimit.js` (lines 133-164)
- Current mitigation: None - invalid tokens are treated same as unauthenticated
- Recommendations:
  - Return 401 for invalid tokens (not null)
  - Add request signing for admin operations
  - Implement token rotation on refresh

---

## Performance Bottlenecks

**Video Frame Extraction is Extremely Slow:**
- Problem: Extracting frames from YouTube videos takes 30-60 seconds. Uses three different methods (storyboard, ytdl, ffmpeg) sequentially with long timeouts.
- Files: `server/routes/videoAnalyzer.js` (lines 369-415)
- Cause:
  - ytdl.getInfo() call blocks for 10+ seconds even on fast connections
  - FFmpeg transcoding is CPU-intensive
  - YouTube storyboard extraction requires multiple image crops
- Improvement path:
  - Cache frame extraction results (key: video ID)
  - Pre-compute storyboards on upload instead of on-demand
  - Use WebP format instead of JPEG for faster encoding
  - Implement request queuing to prevent thundering herd

**Large Components With Too Many State Updates:**
- Problem: `InvoiceChaserApp.jsx` (799 lines) re-renders entire component on minor state changes
- Files: `src/components/apps/InvoiceChaserApp.jsx`
- Cause: No memoization, all event handlers defined inline
- Improvement path:
  - Split into smaller components: InvoiceList, InvoiceDetail, InvoiceActions
  - Use `useMemo` for expensive computations
  - Move event handlers outside component with `useCallback`

**Rate Limit Cleanup Runs Every Hour:**
- Problem: `setInterval` in middleware cleans up old rate limit records once per hour, creating gaps where old records persist
- Files: `server/middleware/rateLimit.js` (lines 26-34)
- Impact: Memory gradually grows with stale records until cleanup runs
- Improvement path: Use lazy deletion on record access or implement a proper cache with TTL

**Unoptimized CSV Parsing for Large Invoices:**
- Problem: Invoice Chaser processes entire CSV into memory before validation, can crash on files > 10MB with thousands of rows
- Files: `server/routes/invoiceChaser.js` (lines 12-13, 250-350)
- Impact: Large batch uploads timeout or crash the function
- Improvement path: Stream CSV parsing using csv-parser. Process in chunks of 100 rows.

---

## Fragile Areas

**Invoice Chaser Regex Patterns Are Brittle:**
- Files: `server/routes/invoiceChaser.js` (lines 46-62)
- Why fragile: Complex regex patterns for date and money extraction can fail on:
  - Different date formats (DD/MM/YYYY vs MM/DD/YYYY)
  - Currency symbols with spaces or in different positions
  - Negative amounts with parentheses vs minus signs
- Safe modification: Add unit tests for each pattern before changing. Test with real invoice data.
- Test coverage: No test files found for invoice parsing logic

**Video Analyzer Timeout Handling:**
- Files: `server/routes/videoAnalyzer.js` (lines 46-51, 369-415)
- Why fragile: Custom timeout implementation using `Promise.race` can leave dangling promises. FFmpeg processes may not be cleaned up on timeout.
- Safe modification: Wrap all ffmpeg calls in AbortController. Add explicit cleanup handlers.
- Test coverage: No tests for timeout scenarios

**Supabase Queue System Relies on Polling:**
- Files: `server/routes/invoiceChaser.js` (lines 1420-1450+)
- Why fragile: Frontend polls `/queue` endpoint every 2 seconds. Can miss updates if polling stops.
- Safe modification: Implement Supabase real-time subscriptions instead of polling.
- Test coverage: Queue system not tested

**React Router Usage Assumes Client-Side Rendering:**
- Files: Multiple route components in `src/pages/*` and `src/components/*`
- Why fragile: No server-side rendering. If client-side JS fails, users see blank page.
- Safe modification: Add error boundary wrapper. Implement SSR with Vite.
- Test coverage: No error boundary tests

---

## Scaling Limits

**Rate Limiting Cannot Scale Horizontally:**
- Current capacity: Single server/function instance only
- Limit: Breaks when deployed to multiple Netlify functions or load-balanced servers
- Scaling path: Move rate limit store to Supabase or Redis. Use distributed cache.

**No Request Queuing for Expensive Operations:**
- Current capacity: Unlimited concurrent video analyzer requests
- Limit: High request volume causes timeouts or crashes. Function memory exhaustion.
- Scaling path: Implement Bull queue or AWS SQS. Process requests sequentially or with limited concurrency.

**File Uploads Have Global Size Limit:**
- Current capacity: 10MB per file
- Limit: Users cannot process large datasets or high-resolution videos
- Scaling path: Implement chunked uploads. Stream to cloud storage (S3, GCS) instead of processing in-memory.

**In-Memory Chat History in ChatWidget:**
- Current capacity: Entire conversation stored in React state
- Limit: Crashes on very long conversations. Data lost on refresh.
- Scaling path: Store conversations in Supabase. Load on component mount.

---

## Dependencies at Risk

**@distube/ytdl-core Maintenance:**
- Risk: Package is community-maintained, not official YouTube package. YouTube actively blocks scrapers.
- Impact: Feature can stop working overnight with YouTube API changes
- Migration plan: Switch to YouTube Data API v3 for metadata. Use `yt-dlp` binary wrapper for downloads (if needed).

**ffmpeg-static Requires Native Binary:**
- Risk: Binary may not be available for all deployment targets (edge functions, serverless). Adds 100MB+ to bundle size.
- Impact: Video analyzer feature may fail to deploy or start slowly
- Migration plan: Use cloud video processing service (AWS MediaConvert, Cloudinary) via API instead of local FFmpeg

**fluent-ffmpeg Has Known Memory Leaks:**
- Risk: Process doesn't always clean up after encoding completes
- Impact: Long-running processes gradually consume more memory
- Migration plan: Implement explicit process cleanup with `setTimeout`. Monitor process counts. Consider video.js or Mux instead.

**@openai/agents Beta SDK:**
- Risk: API is not stable. Breaking changes possible in minor versions.
- Impact: Agent prompts may fail with new versions
- Migration plan: Pin exact version in package.json. Test thoroughly before updating. Consider standard OpenAI SDK if agents become too fragile.

---

## Missing Critical Features

**No Error Recovery UI:**
- Problem: When API fails, users see empty state with no retry button
- Blocks: Users cannot recover from transient network errors
- Impact: Poor user experience on unstable connections

**No Request Cancellation:**
- Problem: Long-running video analyzer has no cancel button
- Blocks: Users trapped waiting for 60-second timeout if they change mind
- Impact: Frustration, wasted resources

**No Offline Fallback:**
- Problem: App completely non-functional without server
- Blocks: Can't draft content, analyze invoices, etc. offline
- Impact: Reduced reliability and user trust

**No Admin Dashboard:**
- Problem: No visibility into API usage, error rates, user issues
- Blocks: Can't debug production problems or see what's breaking
- Impact: Slow incident response, difficult scaling decisions

---

## Test Coverage Gaps

**No API Tests:**
- What's not tested: All server routes in `/server/routes/*`
- Files: No test files found
- Risk: Breaking changes go undetected. Regressions deployed to production.
- Priority: High - API is critical path for all features

**No Invoice Parsing Tests:**
- What's not tested: CSV/XLSX parsing, field mapping, data validation
- Files: `server/routes/invoiceChaser.js` (entire file)
- Risk: Field mapping bugs cause lost data. Users don't realize their invoices are parsed incorrectly.
- Priority: High - financial data integrity

**No YouTube Extraction Tests:**
- What's not tested: Frame extraction, storyboard processing, timeout handling
- Files: `server/routes/videoAnalyzer.js` (entire file)
- Risk: Changes break video analyzer silently. YouTube API changes not caught.
- Priority: High - feature-critical

**No Component Integration Tests:**
- What's not tested: Form submissions, error states, loading states
- Files: All components in `src/components/apps/*`
- Risk: UI bugs go to production. Users see broken forms.
- Priority: Medium - UX critical but less data impact

**No Rate Limit Tests:**
- What's not tested: Rate limit enforcements, multi-user scenarios, reset logic
- Files: `server/middleware/rateLimit.js`
- Risk: Rate limiting doesn't work as intended. Free tier not protected.
- Priority: High - business logic and revenue protection

**No Authentication Tests:**
- What's not tested: Login, signup, token refresh, permission checks
- Files: `src/context/AuthContext.jsx`, `server/middleware/rateLimit.js`
- Risk: Security vulnerability. Users can access features without payment.
- Priority: Critical - security and monetization

---

## Deployment Concerns

**Netlify Function Timeout Hard Limit:**
- Issue: Default 10-second timeout, max 26 seconds on free tier. Video analyzer needs 30-60 seconds.
- Files: `netlify.toml` (no timeout configured)
- Impact: Video analyzer consistently times out on production
- Fix approach: Configure timeout in netlify.toml: `timeout = 26` (max for free) or migrate to self-hosted

**Missing Environment Variable Documentation:**
- Issue: No clear list of required env vars. Wrong fallback logic for Supabase credentials.
- Files: `server/middleware/rateLimit.js` (lines 37-44)
- Impact: Production deployments may have missing credentials
- Fix approach: Create `.env.example` with all variables. Add validation on startup.

**Build Size Could Exceed Limits:**
- Issue: ffmpeg-static, @openai/agents, and dependencies add significant size
- Impact: Cold start times, potential function size limits
- Fix approach: Tree-shake unused imports. Consider moving video analyzer to separate function.

---

## Monitoring Gaps

**No Error Tracking Integration:**
- Issue: Errors logged to console only. No centralized error dashboard.
- Files: All route files log errors with `console.error`
- Impact: Can't see patterns in failures. Can't prioritize fixes.
- Fix approach: Add Sentry or Datadog integration

**No Performance Monitoring:**
- Issue: No visibility into API response times, error rates, or user experience
- Impact: Can't optimize slow features or catch degradation
- Fix approach: Add APM monitoring (New Relic, DataDog, Sentry Performance)

**No Usage Analytics:**
- Issue: Can't see which features users actually use or what fails most often
- Impact: Blind to product issues
- Fix approach: Add analytics library (PostHog, Mixpanel, Segment)

---

*Concerns audit: 2026-02-25*
