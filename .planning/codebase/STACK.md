# Technology Stack

**Analysis Date:** 2026-02-25

## Languages

**Primary:**
- JavaScript (ES2020+) - Frontend React components and utilities
- JavaScript (Node.js) - Backend API routes and middleware

**Secondary:**
- HTML/JSX - React component templates
- CSS - Tailwind utility-based styling

## Runtime

**Environment:**
- Node.js (LTS) - Backend API server and Netlify Functions

**Package Manager:**
- npm 10+ (via npm cli)
- Lockfile: `package-lock.json` present (612KB)

## Frameworks

**Core:**
- React 19.2.0 - Frontend UI and component framework
- React Router DOM 7.9.5 - Client-side routing
- Express.js 5.1.0 - Backend HTTP server and API routing
- Vite 7.2.2 - Frontend build tool and dev server

**Styling:**
- Tailwind CSS 4.1.17 - Utility-first CSS framework
- @tailwindcss/vite 4.1.17 - Vite plugin for Tailwind
- @tailwindcss/postcss 4.1.17 - PostCSS integration
- Radix UI - Headless component library (`@radix-ui/react-label`, `@radix-ui/react-slot`, `@radix-ui/react-tabs`)
- shadcn/ui patterns - Class variance authority (`class-variance-authority` 0.7.1) for component variants

**Animation & Motion:**
- Framer Motion 12.23.24 - React animation library
- Motion 12.23.24 - Lightweight motion primitives

**Build/Dev:**
- ESLint 9.39.1 - JavaScript linter with React plugin support
- Autoprefixer 10.4.22 - CSS vendor prefixing
- PostCSS 8.5.6 - CSS processing

## Key Dependencies

**Critical (AI & Content Generation):**
- @openai/agents 0.3.3 - OpenAI Agents SDK for multi-agent workflows
- openai 6.8.1 - OpenAI API client (GPT models, vision, embeddings)

**Data & File Processing:**
- xlsx 0.18.5 - Excel file parsing and generation
- papaparse 5.5.3 - CSV file parsing
- formidable 3.5.4 - Form/file upload parsing
- busboy 1.6.0 - Multipart form data parser
- cheerio 1.1.2 - jQuery-like DOM parsing for web scraping

**Media Processing:**
- @distube/ytdl-core 4.16.12 - YouTube video downloading and metadata extraction
- fluent-ffmpeg 2.1.3 - FFmpeg wrapper for video/audio processing
- ffmpeg-static 5.3.0 - Bundled FFmpeg binary
- html-to-image 1.11.13 - Convert HTML to image files

**Backend Database & Auth:**
- @supabase/supabase-js 2.81.0 - Supabase client (PostgreSQL ORM + Auth)

**Frontend Utilities:**
- react-datepicker 9.1.0 - Date/time input component
- recharts 3.7.0 - React charting library
- lucide-react 0.553.0 - Icon library
- marked 17.0.0 - Markdown parser
- zod 3 - TypeScript-first schema validation
- clsx 2.1.1 - Conditional classname utility
- tailwind-merge 3.4.0 - Tailwind class merging
- input-otp 1.4.2 - OTP input component

**Server & Network:**
- cors 2.8.5 - Cross-origin resource sharing middleware
- React DOM 19.2.0 - React rendering engine

**Dev Utilities:**
- concurrently 9.2.1 - Run multiple npm scripts in parallel
- netlify-cli 23.11.1 - Netlify deployment and dev tools
- @vitejs/plugin-react 5.1.0 - Vite React fast refresh
- @types/react 19.2.2 - TypeScript definitions
- @types/react-dom 19.2.2 - TypeScript definitions
- globals 16.5.0 - Global variable definitions for ESLint
- eslint-plugin-react-hooks 5.2.0 - React hooks linting
- eslint-plugin-react-refresh 0.4.24 - Fast refresh validation

## Configuration

**Environment Variables (from `.env.example`):**
- Browser-side (VITE_ prefix):
  - `VITE_SUPABASE_URL` - Supabase project URL
  - `VITE_SUPABASE_ANON_KEY` or `VITE_SUPABASE_PUBLISHABLE_API_KEY` - Public Supabase key
  - `VITE_SPOTIFY_CLIENT_ID` - Spotify OAuth client ID

- Server-side (NODE_ENV):
  - `OPENAI_API_KEY` - OpenAI API key for content generation and chat
  - `YOUTUBE_API_KEY` - YouTube Data API v3 key for metadata/captions
  - `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` (or alternatives) - Server-side Supabase credentials
  - `PORT` - Server port (defaults to 3001)

**Build Configuration:**
- `vite.config.js` - Vite build config with React plugin, path alias (`@` → `./src`), API proxy to localhost:3001, ngrok.app allowlist
- `eslint.config.js` - Flat ESLint config (recommended JS, React hooks, React refresh) with unused variable tolerance
- `tailwind.config.js` - Tailwind config with JIT mode, content scanned from `src/**/*.{js,ts,jsx,tsx}`
- `netlify.toml` - Netlify deployment configuration with Functions redirects and dev server settings

## Platform Requirements

**Development:**
- Node.js 18+ (for ES modules and modern APIs)
- npm 10+ for package management
- Vite for hot module reloading (port 5173 by default)
- Express.js server for backend API (port 3001)
- Modern browser (Chrome 90+, Firefox 87+, Safari 15+)

**Production:**
- Netlify deployment (serverless functions for API routes)
- Supabase PostgreSQL backend (Auth, database, vector search ready)
- YouTube Data API v3 (for video metadata and transcript extraction)
- OpenAI API (GPT-4 capable for content generation and vision analysis)
- FFmpeg (for video frame extraction and media processing)

---

*Stack analysis: 2026-02-25*
