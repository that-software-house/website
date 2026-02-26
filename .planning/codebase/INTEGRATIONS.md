# External Integrations

**Analysis Date:** 2026-02-25

## APIs & External Services

**AI & Content Generation:**
- OpenAI - Content creation, tone conversion, document analysis, video transcription, chat
  - SDK: `openai` 6.8.1
  - Agent Framework: `@openai/agents` 0.3.3 (multi-agent orchestration)
  - Auth: `OPENAI_API_KEY` env var
  - Used in: `server/routes/content.js`, `server/routes/chat.js`, `server/routes/videoAnalyzer.js`, `server/routes/toneConverter.js`, `server/routes/dataInsights.js`, `server/routes/invoiceChaser.js`

**Video & Media:**
- YouTube Data API v3 - Video metadata, captions, duration parsing
  - Auth: `YOUTUBE_API_KEY` env var
  - Endpoint: `https://www.googleapis.com/youtube/v3/videos`
  - Used in: `server/routes/videoAnalyzer.js` for frame extraction and metadata
  - Note: Uses `@distube/ytdl-core` for direct video download fallback

**Music Data:**
- Spotify API - User music history, top tracks/artists, genre analysis
  - SDK: Browser-based PKCE OAuth flow
  - Auth: `VITE_SPOTIFY_CLIENT_ID` env var
  - Endpoints: `https://accounts.spotify.com/authorize`, `https://api.spotify.com/v1`
  - Redirect URI: `https://thatsoftwarehouse.com/projects/musicstats`
  - Token storage: Supabase `spotify_connections` table
  - Implementation: `src/lib/spotify.js` with token refresh and expiry handling

## Data Storage

**Primary Database:**
- Supabase (PostgreSQL-based)
  - URL: `VITE_SUPABASE_URL` or `SUPABASE_URL` env var
  - Client: `@supabase/supabase-js` 2.81.0
  - Auth mode: Service role key for server (`SUPABASE_SERVICE_KEY`, `SUPABASE_SECRET_KEY`, or `SUPABASE_SERVICE_ROLE_KEY`)
  - Auth mode: Anon key for browser (`VITE_SUPABASE_ANON_KEY` or `VITE_SUPABASE_PUBLISHABLE_API_KEY`)
  - Tables used:
    - `spotify_connections` - Spotify OAuth tokens and user metadata
    - `invoice_chaser_documents` - Uploaded invoice files and metadata
  - Features: Built-in authentication, real-time subscriptions, row-level security

**File Storage:**
- Local filesystem for in-memory processing - Formidable for multipart uploads
  - No persistent file storage service (S3, Cloudinary, etc.) integrated
  - Processed files stored temporarily in memory or temp directories
  - Files: CSV, JSON, Excel, PDF parsed in memory via `xlsx`, `papaparse`, `formidable`

**Caching:**
- In-memory rate limit store - Demo implementation (should use Redis in production)
  - Location: `server/middleware/rateLimit.js`
  - Purpose: Track API usage per user/IP with 24-hour reset windows
  - Free tier: 10 requests/day; Premium: 1000 requests/day

## Authentication & Identity

**Auth Provider:**
- Supabase Auth (built-in)
  - Implementation: `src/lib/supabase.js` initializes Supabase client
  - Session management: Browser-side via `supabase.auth.getSession()`
  - Used for: Content generation APIs, invoice chaser, billing (optional premium features)
  - Rate limiting by: User ID or IP address depending on auth status

**OAuth Integrations:**
- Spotify OAuth 2.0 with PKCE flow
  - Implemented in: `src/lib/spotify.js`
  - Flow: Authorization code → Token exchange → Token refresh/rotation
  - State validation and CSRF protection via nonce
  - Tokens persisted in Supabase `spotify_connections` table

**API Authentication:**
- Bearer token in Authorization header
  - Source: Supabase session access token (if authenticated)
  - Fallback: No auth for public/free endpoints (chat widget)

## Monitoring & Observability

**Error Tracking:**
- Not detected - No Sentry, LogRocket, or error reporting service integrated
- Errors logged to console and response bodies

**Logs:**
- Server: Console logging to stdout
  - Uses `console.error()`, `console.log()` throughout routes and middleware
  - No structured logging (no Winston, Pino, etc.)
  - No log aggregation service

**Health Checks:**
- `GET /api/health` - Returns `{status: 'ok', timestamp: ISO string}`
  - Used in: `server/index.js` for deployment readiness checks

**Rate Limit Headers:**
- `X-RateLimit-Limit` - Maximum requests per day
- `X-RateLimit-Remaining` - Remaining requests
- `X-RateLimit-Reset` - Unix timestamp when limit resets
- `Retry-After` - Seconds to wait before retry (429 responses)

## CI/CD & Deployment

**Hosting:**
- Netlify
  - Build command: `yarn build` (Vite SPA build)
  - Publish directory: `dist/`
  - Functions: Netlify serverless functions via `netlify/functions/` directory
  - Dev: `netlify dev` with Vite dev server and function emulation
  - CLI: `netlify-cli` 23.11.1 for deployment automation

**Build Configuration:**
- `netlify.toml` - Routes all `/api/*` requests to serverless functions
- ESBuild for function bundling with external module optimization
- Timeout: Default 10s, max 26s on free tier (increased for AI operations)

**Environment Configuration:**
- `.env` file for local development (gitignored)
- `.env.example` - Template of required variables
- Netlify UI for production environment variables

## Webhooks & Callbacks

**Incoming:**
- Chat widget API: `POST /api/chat` - Visitor chat endpoint
- Content generation: `POST /api/content/generate`, `POST /api/content/linkedin`, etc.
- Data analysis: `POST /api/data-insights/analyze` - File upload analysis
- Document analysis: `POST /api/doc-analyzer/analyze` - PDF/document parsing
- Invoice processing: `POST /api/invoice-chaser/upload` - Invoice export file upload
- Video analysis: `POST /api/video-analyzer/analyze`, `POST /api/video-analyzer/youtube-frames`
- Lead extraction: `POST /api/leadflow/extract` - Email/DM/form lead parsing
- Billing: `POST /api/billing/checkout` - Stripe checkout session creation
- Usage tracking: `GET /api/usage` - Rate limit status endpoint

**Outgoing:**
- Spotify redirect: OAuth callback to `https://thatsoftwarehouse.com/projects/musicstats`
- No webhooks detected for Stripe, SendGrid, Twilio, or external service callbacks
- API-based integrations only (request-response pattern)

## Known Integrations Summary

| Service | Type | Purpose | Status |
|---------|------|---------|--------|
| OpenAI | API + SDK | AI content generation, chat, vision | Active |
| YouTube Data API | REST API | Video metadata, duration, captions | Active |
| Spotify | OAuth 2.0 | User music data, auth | Active (PKCE) |
| Supabase | Backend-as-a-Service | Auth, PostgreSQL DB, storage | Active |
| Netlify | Hosting + Functions | Deployment, serverless backend | Active |
| FFmpeg | CLI Binary | Video frame extraction | Active |
| FormData/Cheerio | Libraries | File parsing, web scraping | Active |

---

*Integration audit: 2026-02-25*
