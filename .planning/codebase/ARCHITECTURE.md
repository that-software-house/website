# Architecture

**Analysis Date:** 2025-02-25

## Pattern Overview

**Overall:** Full-stack SPA with decoupled backend API and frontend, using agent-driven AI generation

**Key Characteristics:**
- React SPA with React Router for client-side navigation
- Express backend with rate-limited API routes
- OpenAI Agents SDK for AI content generation
- Supabase authentication and user management
- Client-side context (React Context) for auth state and usage tracking
- Server-side rate limiting with in-memory store
- Multiple specialized AI agents (LinkedIn, Twitter, Carousel, Document Analysis, etc.)

## Layers

**Frontend (React SPA):**
- Purpose: User interface and interaction layer
- Location: `src/`
- Contains: Pages, components, services, context, hooks
- Depends on: Supabase auth client, Express backend APIs
- Used by: End users accessing website in browser

**Page Layer:**
- Purpose: Route-level page components that compose features
- Location: `src/pages/`
- Contains: Home.jsx, DataInsights.jsx, VideoAnalyzer.jsx, AiSoftware.jsx, CustomSoftware.jsx, ServicePage.jsx, etc.
- Depends on: UI components, app components, hooks (useSEO)
- Used by: React Router in App.jsx

**Component Layer:**
- Purpose: Reusable UI components organized by feature
- Location: `src/components/`
- Contains: Structural components (Header, Footer), feature apps (ContentForgeApp, DataInsightsApp, VideoAnalyzerApp), UI primitives (button, card, input, textarea, tabs, label)
- Depends on: Services, hooks, Lucide icons, Framer Motion for animations
- Used by: Pages and other components

**Feature App Components:**
- Location: `src/components/apps/`
- Contains: ContentForgeApp, DataInsightsApp, VideoAnalyzerApp, InvoiceChaserApp, LeadFlowApp, ToneConverterApp, TextCleanerApp, DocAnalyzerApp, MusicStatsApp
- Each app has sub-components in its own directory (e.g., contentforge/, videoanalyzer/, datainsights/)
- Pattern: Stateful parent manages generation logic, sub-components handle input/output/preview

**Context Layer:**
- Purpose: Global state management for authentication and usage tracking
- Location: `src/context/AuthContext.jsx`
- Contains: User state, usage limits, auth methods (signUp, signIn, signOut, Google OAuth)
- Provides: `useAuth()` hook for accessing auth state anywhere
- Triggers: Custom events (usage:updated) for cross-component communication

**Service Layer:**
- Purpose: API client functions and utility services
- Location: `src/services/`
- Contains: openai.js (API wrappers), chatService.js (chat widget), spotify.js (music integration)
- Pattern: Async functions returning promises, automatic auth header injection, usage tracking via custom events
- Exports: generateContent, analyzeDocument, analyzeData, convertTone, analyzeInvoiceExport, generateInvoiceDrafts, logInvoiceAction, fetchInvoiceQueue, analyzeVideoFrames, fetchYouTubeFrames, extractLead, etc.

**Library Layer:**
- Purpose: Shared utilities and external client initialization
- Location: `src/lib/`
- Contains: supabase.js (Supabase client), utils.js (helper functions), spotify.js (Spotify API client)
- Used by: Services, context, components

**Hooks Layer:**
- Purpose: Custom React hooks for reusable logic
- Location: `src/hooks/`
- Contains: useSEO (Manages page meta tags, Open Graph, structured data)
- Used by: Pages for SEO configuration

**Backend (Express Server):**
- Purpose: AI API gateway and rate-limited request processing
- Location: `server/index.js`
- Contains: Express app setup, middleware registration, route mounting
- Depends on: Express, CORS, Busboy (form parsing), OpenAI Agents SDK
- Used by: Frontend making /api/* requests

**Middleware Layer:**
- Purpose: Cross-cutting concerns for requests
- Location: `server/middleware/rateLimit.js`
- Contains: authMiddleware (JWT verification), rateLimitMiddleware (10 req/day free, 1000 req/day premium)
- Applied to: All /api routes (auth), specific routes like /api/content, /api/doc-analyzer, etc. (rate limiting)
- Rate Limit Store: In-memory Map (not production-ready; Redis recommended)

**Route Layer:**
- Purpose: API endpoint handlers grouped by feature
- Location: `server/routes/`
- Contains: content.js, docAnalyzer.js, toneConverter.js, dataInsights.js, invoiceChaser.js, leadFlow.js, videoAnalyzer.js, chat.js, schedule.js
- Pattern: Express Router for each feature, async handlers that validate input, call agents, return results
- Error handling: Try-catch with 400/500 responses

**Agent Layer:**
- Purpose: OpenAI Agents SDK integration for specialized AI generation
- Location: `server/agents/`
- Contains: index.js (exports agents), invoiceChaserAgents.js, videoAnalyzerAgents.js, dataInsightsAgents.js
- Pattern: Each agent is configured with specific system prompts and instructions, called via `run(agent, input)`
- Agents: linkedInAgent, twitterAgent, carouselAgent, contentSummarizerAgent, documentAnalyzerAgent, invoiceAnalyzerAgent, invoiceDraftAgent, videoAnalyzerAgent, etc.

**Utilities Layer:**
- Purpose: Backend helper functions
- Location: `server/utils/`
- Contains: urlFetcher.js (extracts content from URLs using Cheerio)
- Used by: Route handlers for preprocessing user input

## Data Flow

**Content Generation Flow:**

1. User submits content + desired formats (LinkedIn, Twitter, Carousel) in ContentForgeApp.jsx
2. Frontend calls `generateContent(content, formats, sourceType)` from `src/services/openai.js`
3. Service retrieves auth token from Supabase session
4. HTTP POST to `/api/content/generate` with auth header
5. Backend authMiddleware verifies JWT, attaches user object to req
6. Backend rateLimitMiddleware checks daily limit, increments counter
7. Route handler `/api/content/generate` receives request
8. If sourceType is 'url' or 'youtube', backend fetches page content via `fetchUrlContent()`
9. For each requested format, backend calls corresponding agent via `run(agent, content)`
10. Agents return AI-generated output (strings or arrays)
11. Route parses output using helper functions (parseTwitterThread, parseCarouselSlides)
12. Response includes results object with format as keys, errors object for any failures
13. Frontend receives response, extracts X-RateLimit-* headers, dispatches usage:updated event
14. AuthContext listens for event, updates usage state in UI

**Authentication Flow:**

1. Page loads, AuthProvider initializes in `src/context/AuthContext.jsx`
2. Calls `supabase.auth.getSession()` to check for existing session
3. Sets up listener via `onAuthStateChange()` for auth events
4. User clicks Sign Up/Sign In, AuthModal.jsx opens
5. User submits email/password or clicks "Sign in with Google"
6. AuthContext calls appropriate Supabase auth method
7. On success, Supabase updates session and triggers onAuthStateChange
8. AuthContext updates user state, calls `fetchUsage()` with new access token
9. Frontend requests `/api/usage` with Bearer token
10. Backend authMiddleware extracts token, calls `supabase.auth.getUser(token)` to verify
11. Backend rateLimitMiddleware identifies user by user ID, applies premium limit if user has is_premium metadata
12. Usage info returned with X-RateLimit-* headers
13. Frontend updates usage state and usage banner

**Chat Widget Flow:**

1. Chat widget receives message from user
2. Calls `sendChatMessage(message, conversationHistory)` from `src/services/chatService.js`
3. POST to `/api/chat` with message and history (no auth required)
4. Backend route processes with OpenAI or Claude (handler details in chat.js)
5. Response includes structuredData object with message, links array
6. Service formats markdown links (email, phone, url types)
7. Marked.js converts to HTML, adds chat-link class to anchors
8. Frontend renders formatted HTML in chat bubble

**Rate Limiting State Management:**

- In-memory `rateLimitStore` Map in middleware, keyed by "user:UUID" or "ip:IP"
- Each entry: { count: number, resetAt: timestamp }
- Resets daily at 00:00 UTC
- Cleanup interval every hour removes expired entries
- Premium users get 1000 req/day, free users get 10 req/day
- Invoice Chaser uploads don't count against limit if user has invoice_chaser_unlimited

## Key Abstractions

**AuthContext:**
- Purpose: Provides global authentication state (user, loading, usage, isPremium, hasInvoiceChaserUnlimited)
- Location: `src/context/AuthContext.jsx`
- Pattern: React Context + useContext hook, provides methods like signUp, signIn, signOut, requestPasswordReset
- Lifecycle: Initializes on app mount, listens for Supabase auth changes, syncs usage via events

**generateContent() Service:**
- Purpose: Abstract backend complexity of multi-format generation
- Location: `src/services/openai.js`
- Pattern: Takes content, formats array, sourceType; returns {results, errors} object
- Handles: URL/YouTube preprocessing, agent orchestration, output parsing
- Error handling: Throws with message, doesn't break on per-format failures

**Custom Event System (usage:updated):**
- Purpose: Allow non-context consumers to update usage state
- Pattern: Components dispatch window.dispatchEvent with detail payload
- Used by: openai.js service after API responses, AuthContext listens
- Alternative to prop drilling: Loose coupling between service layer and context

**Rate Limit Store:**
- Purpose: Track user/IP request counts daily
- Pattern: In-memory Map with auto-cleanup
- Key: "user:{UUID}" or "ip:{IP}"
- Limitation: Not shared across server instances; use Redis in production

**App Component Composition:**
- Purpose: Each feature app (ContentForge, DataInsights, etc.) is self-contained
- Pattern: Stateful parent component with stateless/semi-stateful sub-components
- Benefits: Easy to embed in pages, independent styling, isolated state management

## Entry Points

**Frontend Entry Point:**
- Location: `src/main.jsx`
- Triggers: Browser loads HTML, script tag points to main.jsx
- Responsibilities: Mounts React app to #root DOM element, wraps in AuthProvider, StrictMode

**App Routing Entry Point:**
- Location: `src/App.jsx`
- Triggers: AuthProvider mounts App component
- Responsibilities: Sets up React Router with all routes, wraps pages with Header/Footer, mounts ChatWidget

**Backend Entry Point:**
- Location: `server/index.js`
- Triggers: `npm run server` or `npm run dev:all`
- Responsibilities: Creates Express app, registers middleware, mounts route handlers, listens on PORT (default 3001)

**API Route Entry Point:**
- Location: `server/routes/{feature}.js` (e.g., content.js)
- Triggers: Frontend POST/GET to `/api/{feature}/{endpoint}`
- Responsibilities: Validates request, calls agents or utilities, returns JSON response

## Error Handling

**Strategy:** Defensive, graceful degradation with user-facing messages

**Frontend Patterns:**

- Try-catch in service functions, re-throw with descriptive message
- Components catch errors, set error state, display UI message
- Missing required fields: Set error state, show alert (not thrown)
- 429 Rate Limit: Handled in middleware, parsed in service, usage banner updates
- Markdown parsing errors: caught silently, returns original markdown

**Backend Patterns:**

- Try-catch in route handlers
- Invalid input (missing fields, wrong types): 400 response with message
- Runtime errors (API failure, agent failure): 500 response with error object
- Auth errors: Logged but continue (optional auth for some endpoints)
- Rate limit errors: 429 with retry-after header and usage stats in response
- JSON parse errors: Handled in parseJsonSafe() utility

**Error Response Format:**

```json
{
  "error": "Category",
  "message": "Human-readable description"
}
```

Or with usage context:

```json
{
  "error": "Rate limit exceeded",
  "message": "You've used all 10 free requests today. Sign up for premium to get more requests.",
  "usage": {
    "used": 10,
    "limit": 10,
    "remaining": 0,
    "resetsAt": "2025-02-26T00:00:00Z"
  }
}
```

## Cross-Cutting Concerns

**Logging:**
- Frontend: console.error() for exceptions, console.log() for progress
- Backend: console.log() for request info, console.error() for errors
- No structured logging library; suitable for small app

**Validation:**
- Frontend: Input validation in components (required fields, type checks)
- Backend: Input validation in route handlers before processing
- Library: Zod (installed but not currently used for schema validation)

**Authentication:**
- Provider: Supabase Auth (JWT-based)
- Client-side: Session stored in Supabase SDK, passed via Authorization header
- Server-side: Middleware verifies token against Supabase, attaches user to req

**Rate Limiting:**
- Strategy: Per-user (authenticated) or per-IP (anonymous)
- Scope: Daily quota (resets at 00:00 UTC)
- Tiers: Free (10), Premium (1000)
- Exceptions: Invoice Chaser uploads unlimited for invoice_chaser_unlimited users
- Response: 429 with X-RateLimit-* headers and usage stats

**CORS:**
- Configured in `server/index.js` with default options (allow all origins)
- Suitable for development; restrict in production

---

*Architecture analysis: 2025-02-25*
