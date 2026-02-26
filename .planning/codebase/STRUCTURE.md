# Codebase Structure

**Analysis Date:** 2025-02-25

## Directory Layout

```
project-root/
├── src/                          # Frontend React application
│   ├── main.jsx                  # Entry point, mounts React app
│   ├── App.jsx                   # Router setup, page routes
│   ├── App.css                   # App-level styles
│   ├── index.css                 # Global styles, Tailwind imports
│   ├── assets/                   # Static assets (images, fonts)
│   │   └── clients/              # Client logos
│   ├── components/               # Reusable UI components
│   │   ├── ui/                   # Primitive UI components (Button, Card, Input, etc.)
│   │   ├── auth/                 # Auth-related components (AuthModal, UsageBanner)
│   │   ├── apps/                 # Feature application components
│   │   │   ├── contentforge/     # ContentForge subcomponents
│   │   │   ├── videoanalyzer/    # VideoAnalyzer subcomponents
│   │   │   ├── datainsights/     # DataInsights subcomponents
│   │   │   ├── insightcard/      # Insight card components
│   │   │   ├── ContentForgeApp.jsx
│   │   │   ├── DataInsightsApp.jsx
│   │   │   ├── VideoAnalyzerApp.jsx
│   │   │   ├── InvoiceChaserApp.jsx
│   │   │   ├── LeadFlowApp.jsx
│   │   │   ├── ToneConverterApp.jsx
│   │   │   ├── TextCleanerApp.jsx
│   │   │   ├── DocAnalyzerApp.jsx
│   │   │   └── MusicStatsApp.jsx
│   │   ├── Header.jsx            # Site header with navigation
│   │   ├── Footer.jsx            # Site footer
│   │   ├── ChatWidget.jsx        # Floating chat widget
│   │   ├── Hero.jsx              # Hero section
│   │   ├── Services.jsx          # Services showcase
│   │   ├── Portfolio.jsx         # Project portfolio
│   │   ├── Clients.jsx           # Client logos section
│   │   ├── ValueProps.jsx        # Value propositions section
│   │   ├── Stages.jsx            # Project stages/workflow
│   │   ├── ContactFormSection.jsx # Contact form
│   │   ├── SMBPackage.jsx        # SMB pricing package
│   │   ├── SectionCta.jsx        # Call-to-action sections
│   │   ├── RocketAnimation.jsx   # Animated rocket element
│   │   └── ScrollToTop.jsx       # Scroll-to-top button
│   ├── pages/                    # Route-level pages
│   │   ├── Home.jsx              # Homepage
│   │   ├── About.jsx             # About page
│   │   ├── Contact.jsx           # Contact page
│   │   ├── ServicesPage.jsx      # Services overview
│   │   ├── SeoPage.jsx           # SEO services page
│   │   ├── MarketingPage.jsx     # Marketing services page
│   │   ├── Projects.jsx          # Project portfolio page
│   │   ├── ProjectDetail.jsx     # Individual project detail
│   │   ├── AiSoftware.jsx        # AI software offering
│   │   ├── CustomSoftware.jsx    # Custom software offering
│   │   ├── ValidateIdea.jsx      # Validate Idea phase page
│   │   ├── BuildProduct.jsx      # Build Product phase page
│   │   ├── ScaleProduct.jsx      # Scale Product phase page
│   │   ├── DataInsights.jsx      # Data Insights app page
│   │   ├── VideoAnalyzer.jsx     # Video Analyzer app page
│   │   ├── ResetPassword.jsx     # Password reset page
│   │   ├── ThankYou.jsx          # Thank you page
│   │   ├── Terms.jsx             # Terms of service
│   │   ├── Privacy.jsx           # Privacy policy
│   │   ├── NotFound.jsx          # 404 page
│   │   └── *.css                 # Page-specific styles
│   ├── services/                 # API client functions
│   │   ├── openai.js             # Main API wrapper (content, docs, data, invoices, video, etc.)
│   │   ├── chatService.js        # Chat widget API
│   │   └── spotify.js            # Spotify API integration
│   ├── context/                  # React Context for global state
│   │   └── AuthContext.jsx       # Auth state, user, usage tracking
│   ├── hooks/                    # Custom React hooks
│   │   └── useSEO.js             # SEO meta tag management
│   └── lib/                      # Utilities and external client setup
│       ├── supabase.js           # Supabase client initialization
│       ├── utils.js              # Shared utility functions
│       └── spotify.js            # Spotify API client
├── server/                       # Backend Node.js/Express application
│   ├── index.js                  # Express app setup, middleware registration
│   ├── middleware/               # Express middleware
│   │   └── rateLimit.js          # Auth and rate limiting middleware
│   ├── routes/                   # API endpoint handlers
│   │   ├── content.js            # /api/content/* endpoints (LinkedIn, Twitter, Carousel)
│   │   ├── docAnalyzer.js        # /api/doc-analyzer/* endpoints
│   │   ├── toneConverter.js      # /api/tone/* endpoints
│   │   ├── dataInsights.js       # /api/data-insights/* endpoints
│   │   ├── invoiceChaser.js      # /api/invoice-chaser/* endpoints
│   │   ├── leadFlow.js           # /api/leadflow/* endpoints
│   │   ├── videoAnalyzer.js      # /api/video-analyzer/* endpoints
│   │   ├── chat.js               # /api/chat endpoint (public, no rate limit)
│   │   └── schedule.js           # /api/schedule/* endpoints
│   ├── agents/                   # OpenAI Agents SDK configuration
│   │   ├── index.js              # Agent exports
│   │   ├── invoiceChaserAgents.js # Invoice analysis agents
│   │   ├── videoAnalyzerAgents.js # Video analysis agents
│   │   └── dataInsightsAgents.js  # Data analysis agents
│   └── utils/                    # Backend utilities
│       └── urlFetcher.js         # URL content extraction with Cheerio
├── public/                       # Static assets served directly
│   ├── favicon.svg               # Site favicon
│   ├── favicon.ico               # Favicon fallback
│   ├── apple-touch-icon.png      # iOS home screen icon
│   ├── og-image.png              # Open Graph image
│   └── video/                    # Video assets
├── netlify/                      # Netlify Functions (if deployed to Netlify)
│   └── functions/                # Serverless functions
├── supabase/                     # Supabase configuration
│   └── migrations/               # Database migrations
├── docs/                         # Documentation
│   └── plans/                    # Planning documents
├── .planning/                    # GSD planning documents
│   └── codebase/                 # Architecture/stack docs
├── index.html                    # HTML entry point
├── vite.config.js                # Vite build config
├── eslint.config.js              # ESLint rules
├── postcss.config.js             # PostCSS config for Tailwind
├── tailwind.config.js            # Tailwind CSS config
├── package.json                  # Dependencies and scripts
├── netlify.toml                  # Netlify deployment config
├── .env                          # Environment variables (not committed)
└── .env.example                  # Environment variables template
```

## Directory Purposes

**src/ (Frontend Application):**
- Purpose: React SPA source code
- Contains: Components, pages, services, context, hooks, styling
- Entry point: main.jsx → App.jsx → pages/routes

**src/components/ (UI Components):**
- Purpose: Reusable React components for building pages
- Contains: Structural (Header, Footer), layout (Hero, Services, Portfolio), feature apps (ContentForge, DataInsights, etc.), utilities (ChatWidget, ScrollToTop, RocketAnimation), primitives (Button, Card, Input, etc.)
- Organizational pattern: Components grouped by feature (apps/ subdirectory), UI primitives in ui/ subdirectory, auth components in auth/ subdirectory
- Each component typically has .jsx and .css pair

**src/pages/ (Route-level Pages):**
- Purpose: Full pages corresponding to URL routes
- Contains: Home, service pages (AiSoftware, CustomSoftware, ServicesPage, MarketingPage, SeoPage), journey pages (ValidateIdea, BuildProduct, ScaleProduct), app pages (DataInsights, VideoAnalyzer), static pages (About, Contact, Privacy, Terms), and special pages (ThankYou, ResetPassword, NotFound)
- Each page file includes styling and composition of reusable components
- Pages use useSEO hook to configure meta tags

**src/services/ (API Clients):**
- Purpose: Abstract API calls into reusable functions
- Contains: openai.js (main API wrapper for all backend endpoints), chatService.js (chat widget), spotify.js (music integration)
- Pattern: Async functions that handle auth headers, error handling, usage tracking
- Used by: Components and other services

**src/context/ (Global State):**
- Purpose: Share state across component tree without prop drilling
- Contains: AuthContext (user, loading, usage, auth methods)
- Pattern: React Context + useContext hook; provides `useAuth()` for easy access
- Lifecycle: Mounts at root level in main.jsx, initializes on app load

**src/hooks/ (Custom React Hooks):**
- Purpose: Encapsulate reusable React logic
- Contains: useSEO (manages page meta tags and structured data)
- Pattern: Returns nothing (side effects only) or state/functions
- Used by: Pages for SEO management

**src/lib/ (Utilities):**
- Purpose: Shared configuration and helper functions
- Contains: supabase.js (Supabase client), utils.js (utility functions), spotify.js (Spotify integration)
- Pattern: Initialization and export of configured clients/utilities
- Used by: Services, context, components

**server/ (Backend Application):**
- Purpose: Express API server for AI agent orchestration and user management
- Contains: Route handlers, middleware, agents, utilities
- Entry point: index.js starts server on port 3001
- Dependency: Requires backend/server running simultaneously with frontend for full functionality

**server/routes/ (API Endpoints):**
- Purpose: Handle HTTP requests for specific features
- Contains: One file per feature (content.js, docAnalyzer.js, etc.)
- Pattern: Express Router with async POST/GET handlers
- Error handling: 400 for invalid input, 500 for server errors, 429 for rate limit
- Each handler receives {req, res}, returns JSON

**server/agents/ (AI Agent Configuration):**
- Purpose: Configure and export OpenAI Agents
- Contains: Agent definitions with system prompts, tools, instructions
- Pattern: Each agent is a configuration object, called via `run(agent, input)`
- Files organized by domain: invoiceChaserAgents, videoAnalyzerAgents, dataInsightsAgents

**server/middleware/ (Request Processing):**
- Purpose: Apply transformations or checks to all requests
- Contains: authMiddleware (JWT verification), rateLimitMiddleware (daily limits, usage tracking)
- Pattern: Stack in index.js, applied conditionally to specific routes
- Order matters: auth applied to all /api routes, rate limit to specific routes

**server/utils/ (Backend Utilities):**
- Purpose: Helper functions for route handlers
- Contains: urlFetcher.js (extracts text from URLs and YouTube pages)
- Pattern: Reusable, testable functions without side effects

**public/ (Static Assets):**
- Purpose: Files served directly by build process
- Contains: Icons, images, videos
- Not processed: No build step, served as-is
- Access in HTML: Relative paths like /favicon.svg

**netlify/ (Netlify Deployment):**
- Purpose: Serverless functions and deployment config
- Contains: Functions that run on Netlify (if using Netlify Functions instead of backend server)
- Status: Present but may not be actively used if backend server is primary

**supabase/ (Database):**
- Purpose: Version-controlled database schema
- Contains: SQL migrations
- Pattern: Migrations applied sequentially; check files in migrations/ for current schema

## Key File Locations

**Entry Points:**
- `src/main.jsx`: First file executed by browser; mounts React app to DOM
- `src/App.jsx`: Sets up routing; wraps pages with layout (Header, Footer, ChatWidget)
- `server/index.js`: Starts Express server; registers middleware and routes

**Configuration:**
- `package.json`: Dependencies, scripts (dev, build, server, dev:all)
- `vite.config.js`: Vite build settings (React plugin, aliases)
- `eslint.config.js`: Linting rules
- `postcss.config.js`: PostCSS plugins (Tailwind)
- `tailwind.config.js`: Tailwind CSS customization
- `index.html`: HTML template with #root div and meta tags
- `netlify.toml`: Netlify build and function config

**Core Logic:**
- `src/context/AuthContext.jsx`: All authentication and user state
- `src/services/openai.js`: All API interactions (largest service file)
- `server/middleware/rateLimit.js`: Auth verification and rate limiting logic
- `server/routes/content.js`: Content generation orchestration

**Testing:**
- No test files detected in codebase; testing infrastructure not present

## Naming Conventions

**Files:**
- Components: PascalCase, .jsx extension (e.g., `ContentForgeApp.jsx`, `Header.jsx`)
- Utilities/services: camelCase, .js extension (e.g., `urlFetcher.js`, `chatService.js`)
- Pages: PascalCase, .jsx extension (e.g., `Home.jsx`, `DataInsights.jsx`)
- Styles: Match component name, .css extension (e.g., `Header.css` for Header.jsx)
- Routes: camelCase, .js extension (e.g., `toneConverter.js`, `invoiceChaser.js`)

**Directories:**
- Feature-based: apps/, auth/, contentforge/, videoanalyzer/, datainsights/ (lowercase with scope)
- Functional: components/, pages/, services/, hooks/, lib/, context/, agents/, routes/, middleware/, utils/
- Asset folders: assets/, public/, supabase/, docs/, netlify/

**Functions:**
- Components: PascalCase (e.g., `ContentForgeApp`, `Header`)
- Services/utilities: camelCase (e.g., `generateContent`, `fetchUsage`, `urlFetcher`)
- Hooks: Prefix with 'use', camelCase (e.g., `useSEO`, `useAuth`)
- Agents: camelCase + 'Agent' suffix (e.g., `linkedInAgent`, `twitterAgent`)

**Variables:**
- State variables: camelCase (e.g., `user`, `isGenerating`, `generatedOutputs`)
- Constants: UPPER_SNAKE_CASE (e.g., `FREE_TIER_LIMIT`, `API_BASE`, `USAGE_UPDATED_EVENT`)
- Props: camelCase (e.g., `sourceType`, `outputFormats`, `isLoading`)

**Types/Interfaces:**
- Uses Zod (installed but not enforced throughout)
- AuthContext exports `useAuth` hook for type inference
- No TypeScript; uses JSDoc comments sparingly for function signatures

## Where to Add New Code

**New Feature Component (e.g., new AI app):**
- Primary code: `src/components/apps/NewAppName.jsx`
- Sub-components: `src/components/apps/newappname/` (lowercase directory)
- Styling: `src/components/apps/NewAppName.css`
- Backend route: `server/routes/newFeature.js`
- Backend agents: `server/agents/newFeatureAgents.js`
- API wrapper: Add functions to `src/services/openai.js`

**New Page/Route:**
- Implementation: `src/pages/NewPage.jsx`
- Styling: `src/pages/NewPage.css`
- Add route to `src/App.jsx` Routes component
- Use `useSEO` hook for page title and meta tags
- Compose from existing components

**Utility Functions:**
- Shared frontend helpers: `src/lib/utils.js`
- Backend helpers: `server/utils/{newFile}.js` (one utility per file)
- API service wrappers: Add to `src/services/openai.js` (grouped by feature endpoint)

**Global State/Context:**
- Only add if data is needed by 3+ unrelated components
- Create new context file in `src/context/{NewContext}.jsx`
- Export hook like `useNewContext`
- Wrap App in provider in `src/main.jsx`

**Custom Hooks:**
- Reusable React logic: `src/hooks/useNewHook.js`
- Example: useSEO manages meta tags

**UI Primitives:**
- Base components (Button, Input, Card, etc.): `src/components/ui/`
- Follow shadcn/ui patterns: Use Radix UI, Class Variance Authority (CVA), tailwind-merge
- Each primitive is a single, minimal component with className support

## Special Directories

**src/assets/ (Static Assets):**
- Purpose: Images, fonts, icons committed to repo
- Generated: No
- Committed: Yes
- Accessed from components: `import image from '@/assets/...'` or static paths

**public/ (Public Static Assets):**
- Purpose: Files served directly by web server
- Generated: No
- Committed: Yes
- Not processed by Vite build pipeline
- Accessed in HTML: `/filename` (relative to domain root)

**node_modules/ (Dependencies):**
- Purpose: Installed packages from package.json
- Generated: Yes (via npm install)
- Committed: No (.gitignore)
- Auto-generated; never edit manually

**dist/ (Build Output):**
- Purpose: Optimized frontend build output
- Generated: Yes (via `npm run build`)
- Committed: No (.gitignore)
- Use for deployment; regenerate per environment

**server/routes/, server/agents/, server/middleware/, server/utils/:**
- Purpose: Organized backend code
- Generated: No
- Committed: Yes
- Pattern: One feature per file; utilities grouped by domain

**.planning/codebase/ (Architecture Docs):**
- Purpose: GSD codebase analysis documents
- Generated: Yes (via /gsd:map-codebase command)
- Committed: Yes
- Used by: /gsd:plan-phase, /gsd:execute-phase commands

---

*Structure analysis: 2025-02-25*
