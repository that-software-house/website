# Preview Site Generator Agent

**Purpose**: Given a dental practice (or any SMB) website URL, automatically scrape their existing site, extract brand data, and generate a polished modern preview site — hosted and ready to send in a cold outreach email.

This is the technical backbone of the **"See Before You Buy"** outreach strategy.

---

## Overview

```
Input URL (e.g. https://olddentalsite.com)
        │
        ▼
┌─────────────────────┐
│   Orchestrator      │  Coordinates all sub-agents, manages state, returns final URL
└────────┬────────────┘
         │
   ┌─────┴──────┬──────────────┬───────────────┐
   ▼            ▼              ▼               ▼
ScraperAgent  BrandAgent  DesignAgent    CodegenAgent
(extract)     (analyze)   (select UX)    (build site)
                                              │
                                             ▼
                                       DeployAgent
                                    (save + return URL)
```

Each agent is a focused, single-responsibility unit. The Orchestrator feeds outputs forward as inputs to the next stage. Agents run sequentially except where noted.

---

## Tech Stack Alignment

Fits into the existing codebase without new dependencies:

| Need | Existing Tool |
|---|---|
| URL scraping | `server/utils/urlFetcher.js` + `cheerio` |
| Agent orchestration | `@openai/agents` SDK (already in `server/agents/`) |
| UI generation | React 19 + Tailwind CSS 4 + Framer Motion |
| Component primitives | Radix UI + shadcn/ui patterns (already installed) |
| Icons | `lucide-react` (already installed) |
| Preview hosting | Static file served from `server/` or Netlify deploy preview |
| Screenshot capture | `html-to-image` (already installed) |
| Storage | Supabase (already configured) — store preview metadata |

No new `npm install` required.

---

## Agent Definitions

### 1. `ScraperAgent`

**Role**: Extract all raw content and brand signals from the target URL.

**Input**: `{ url: string }`

**Process**:
1. Fetch HTML via existing `fetchUrlContent()` in `server/utils/urlFetcher.js`
2. Use Cheerio to extract structured data (see schema below)
3. Follow links to `/about`, `/services`, `/contact` pages if present (max depth: 1)
4. Use OpenAI Vision (`gpt-4o`) on a screenshot of the homepage to extract visual brand data (colors, layout style, hero image)

**Output schema**:
```json
{
  "businessName": "Smile Dental Austin",
  "tagline": "Family Dentistry in the Heart of South Austin",
  "phone": "(512) 555-0123",
  "email": "hello@smiledentalaustin.com",
  "address": "1234 South Congress Ave, Austin TX 78704",
  "googleMapsUrl": "https://maps.google.com/?...",
  "services": ["General Dentistry", "Teeth Whitening", "Invisalign", "Emergency Care"],
  "teamMembers": [
    { "name": "Dr. Sarah Chen", "title": "Lead Dentist", "bio": "..." }
  ],
  "testimonials": [
    { "author": "Jamie R.", "text": "Best dentist in Austin!", "rating": 5 }
  ],
  "logoUrl": "https://smiledentalaustin.com/logo.png",
  "primaryColor": "#2B6CB0",
  "accentColor": "#EBF8FF",
  "existingFonts": ["Arial", "Georgia"],
  "socialLinks": {
    "facebook": "https://facebook.com/smiledentalaustin",
    "instagram": "https://instagram.com/smiledentalaustin"
  },
  "existingSiteScore": {
    "mobile": 34,
    "desktop": 61,
    "hasBookingWidget": false,
    "hasSSL": true,
    "mobileResponsive": false
  },
  "rawPageText": "..."
}
```

**System prompt**:
```
You are a web data extraction specialist. Given HTML content from a dental practice website, extract structured business information.
Be thorough — infer missing data from context where reasonable (e.g. if no tagline is present, generate one from the page copy that accurately reflects the practice).
Return valid JSON matching the provided schema exactly. Never hallucinate contact details — mark as null if not found.
```

---

### 2. `BrandAgent`

**Role**: Analyze the scraped data and produce a coherent brand profile for the new site.

**Input**: ScraperAgent output

**Process**:
1. Evaluate the extracted colors against WCAG AA contrast requirements
2. Upgrade to a modern complementary palette if the original fails or looks dated
3. Select a modern Google Font pairing appropriate for healthcare (readable + trustworthy)
4. Write modernized copy: hero headline, subheadline, CTA text, section headlines
5. Determine overall design personality: `clinical-modern | warm-boutique | bold-contemporary | minimal-clean`

**Output schema**:
```json
{
  "brandPersonality": "warm-boutique",
  "palette": {
    "primary": "#1A56DB",
    "primaryLight": "#EBF5FF",
    "accent": "#0E9F6E",
    "background": "#F9FAFB",
    "surface": "#FFFFFF",
    "text": "#111928",
    "textMuted": "#6B7280"
  },
  "fonts": {
    "heading": "Plus Jakarta Sans",
    "body": "Inter"
  },
  "copy": {
    "heroHeadline": "Your Smile, Our Priority",
    "heroSubheadline": "Gentle, modern dentistry for the whole family — right here in South Austin.",
    "heroCta": "Book Your Visit",
    "secondaryCta": "See Our Services",
    "aboutSnippet": "Dr. Sarah Chen and her team have been caring for Austin families since 2009..."
  }
}
```

**System prompt**:
```
You are a brand strategist and UX copywriter specializing in healthcare practices.
Given raw data from an existing dental practice website, create a refined brand profile for a modern redesign.
Preserve the practice's authentic identity and genuine warmth — do not genericize them.
Choose font pairings from Google Fonts that convey trust, modernity, and approachability.
Write copy that speaks to a local patient, not a corporate audience.
Return valid JSON matching the provided schema exactly.
```

---

### 3. `DesignAgent`

**Role**: Select the right layout patterns, sections, and component styles for the preview site.

**Input**: ScraperAgent output + BrandAgent output

**Process**:
1. Choose section composition from the approved pattern library (see below)
2. Select component variants based on `brandPersonality`
3. Decide hero type: `split-image | full-bleed | centered-text | video-bg`
4. Select card style for services: `icon-grid | horizontal-list | image-cards | minimal-list`
5. Choose testimonial layout: `carousel | masonry | single-quote | grid`
6. Define animation level: `none | subtle | expressive`

**Design pattern library** (sourced from 21dev.co, Mobbin healthcare references, shadcn patterns):

```
HERO PATTERNS:
  - split-image:     Left: headline + CTA + phone. Right: warm photo of dentist/patient.
  - full-bleed:      Full-width hero image with gradient overlay + centered headline + dual CTA.
  - centered-text:   Centered headline, subtext, primary CTA, soft background pattern.

SERVICES PATTERNS:
  - icon-grid:       2×3 grid, lucide icon + service name + 1-line description. Hover: lift shadow.
  - horizontal-list: Alternating left/right image+text rows. Good for 3–5 services.
  - image-cards:     Cards with stock dental photos, overlay title, hover reveal description.

SOCIAL PROOF PATTERNS:
  - review-strip:    Star ratings + short quotes, horizontal scroll on mobile.
  - single-quote:    Large pull quote, patient name, subtle background.
  - grid-cards:      2×2 review cards with avatar, name, star rating, truncated text.

BOOKING CTA PATTERNS:
  - sticky-banner:   Fixed bottom bar on mobile with phone + "Book Now" button.
  - section-cta:     Full-width tinted section, headline + two buttons (call + online form).
  - inline-form:     Embedded simple form (name, phone, preferred time) inline on page.

NAV PATTERNS:
  - minimal-transparent: Logo left, links center, phone right. Transparent on hero, white on scroll.
  - sidebar-mobile:      Hamburger menu on mobile, full-screen slide-in drawer.
```

**Output schema**:
```json
{
  "sections": ["nav", "hero", "trust-bar", "services", "about", "testimonials", "booking-cta", "footer"],
  "heroType": "split-image",
  "servicesStyle": "icon-grid",
  "testimonialsStyle": "review-strip",
  "ctaStyle": "section-cta",
  "navStyle": "minimal-transparent",
  "animationLevel": "subtle",
  "mobileSticky": true,
  "includeBookingForm": true,
  "trustBarItems": ["google-rating", "years-in-practice", "patients-served", "insurance-accepted"]
}
```

**System prompt**:
```
You are a senior UX designer specializing in healthcare landing pages.
Given a brand profile and scraped practice data, select the best layout composition for a high-converting single-page preview site.
Prioritize: mobile-first, fast-loading, clear hierarchy, single primary CTA.
Dental practice patients are often anxious — the design should feel calm, trustworthy, and local. Not corporate, not clinical.
Reference modern healthcare UI patterns (think: One Medical, Forward Health, Simple Practice marketing pages).
Return valid JSON matching the provided schema exactly.
```

---

### 4. `CodegenAgent`

**Role**: Generate the full React + Tailwind preview site source code as a single self-contained file.

**Input**: All previous agent outputs (scraper + brand + design)

**Process**:
1. Generate a single `PreviewSite.jsx` component (self-contained, no external imports beyond React + Tailwind + lucide-react + framer-motion — all already in the project)
2. Inline all brand data (colors via Tailwind arbitrary values or CSS variables, fonts via Google Fonts link in a `<style>` tag)
3. Use real scraped content (business name, services, testimonials, contact info) — not lorem ipsum
4. Implement each section based on DesignAgent selections
5. Ensure full mobile responsiveness (Tailwind responsive prefixes: `sm:`, `md:`, `lg:`)
6. Add a subtle "Preview by That Software House" watermark in the footer with a link to TSH's contact page

**Output**: A single JSX file (`PreviewSite.jsx`) + a metadata object

**Key implementation rules for CodegenAgent**:

```
MUST:
- Use Tailwind utility classes only (no arbitrary CSS files)
- Use lucide-react for all icons (imported inline)
- Use framer-motion for scroll-triggered section fade-ins (animationLevel: subtle = opacity 0→1 + y 20→0)
- Make the phone number a real tel: link
- Make the address a real Google Maps link
- Include a sticky mobile bottom bar with phone + CTA if mobileSticky: true
- Add smooth scroll behavior between sections

MUST NOT:
- Use placeholder text (no "Lorem ipsum", no "[Insert name]")
- Use external image URLs that may go down (use Unsplash CDN with specific dental-relevant queries)
- Require any additional npm packages
- Include any forms that POST to a real backend (use mailto: or just visual mock)
- Include the client's real booking system (keep it visual-only for the preview)

UNSPLASH IMAGE STRATEGY:
- Hero: https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1200 (dental office)
- About: https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=800 (dentist portrait)
- Team: https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400 (medical professional)
- Patient: https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=600 (happy patient)
```

**System prompt**:
```
You are a senior React developer and UI engineer.
Generate a complete, production-quality single-page React component for a dental practice preview website.
Use only: React, Tailwind CSS utility classes, lucide-react icons, and framer-motion animations.
The site must look like it was designed by a top-tier agency — not a template.
Use real business data provided. No placeholders. No lorem ipsum.
Output only valid JSX. The component must be a default export named PreviewSite.
```

---

### 5. `DeployAgent`

**Role**: Save the generated preview site and return a shareable URL.

**Input**: CodegenAgent output (JSX string + metadata)

**Process**:
1. Save `PreviewSite.jsx` to `server/previews/{slug}/PreviewSite.jsx`
2. Generate a static HTML wrapper (`index.html`) that loads the React component via Vite
3. Trigger a Netlify deploy preview via Netlify API (or serve from Express static route as fallback)
4. Store preview metadata in Supabase: `{ slug, prospect_url, business_name, preview_url, created_at, opened_at }`
5. Return the preview URL

**Preview URL format**: `https://preview.thatsoftwarehouse.com/{slug}`
**Fallback (dev)**: `http://localhost:3001/preview/{slug}`

**Supabase table**: `previews`
```sql
CREATE TABLE previews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  prospect_url TEXT NOT NULL,
  business_name TEXT,
  preview_url TEXT NOT NULL,
  outreach_email TEXT,
  opened_at TIMESTAMPTZ,
  clicked_cta_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Tracking pixel**: Embed a 1px transparent PNG from TSH's server in the preview page so you know when the prospect opens the link:
```html
<img src="https://thatsoftwarehouse.com/api/track/open/{slug}" width="1" height="1" />
```

---

## Orchestrator

**Location**: `server/agents/previewSiteAgent.js`

**Entry point**: `POST /api/preview/generate`

```javascript
// Request body
{
  "url": "https://olddentalsite.com",
  "outreachEmail": "dr.smith@olddentalsite.com"  // optional
}

// Response
{
  "success": true,
  "previewUrl": "https://preview.thatsoftwarehouse.com/smile-dental-austin-x7k2",
  "businessName": "Smile Dental Austin",
  "slug": "smile-dental-austin-x7k2",
  "siteScoreBefore": { "mobile": 34, "desktop": 61 },
  "generatedAt": "2026-03-04T14:22:00Z"
}
```

**Orchestrator flow**:
```javascript
async function generatePreviewSite(url, outreachEmail) {
  // 1. Scrape
  const scraped = await run(scraperAgent, { url });

  // 2. Brand analysis (parallel with design selection if scrape is complete)
  const [brand, design] = await Promise.all([
    run(brandAgent, { scraped }),
    run(designAgent, { scraped })  // can run in parallel — both only need scraper output
  ]);

  // 3. Code generation
  const { jsx, metadata } = await run(codegenAgent, { scraped, brand, design });

  // 4. Deploy
  const { previewUrl, slug } = await run(deployAgent, { jsx, metadata, outreachEmail });

  return { previewUrl, slug, businessName: scraped.businessName, siteScoreBefore: scraped.existingSiteScore };
}
```

---

## File Structure

```
server/
├── agents/
│   ├── index.js                    ← Export all agents (add previewSiteAgents here)
│   ├── previewSiteAgents.js        ← NEW: scraperAgent, brandAgent, designAgent, codegenAgent
│   └── (existing agents...)
├── routes/
│   └── previewSite.js              ← NEW: POST /api/preview/generate, GET /api/preview/:slug
├── utils/
│   └── urlFetcher.js               ← EXISTING: reuse as-is for scraping
└── previews/                       ← NEW: generated preview files stored here
    └── {slug}/
        ├── PreviewSite.jsx
        └── index.html

src/
└── pages/
    └── PreviewDashboard.jsx        ← NEW (optional): internal TSH tool to view all generated previews + open tracking
```

---

## Frontend Dashboard (Internal TSH Tool)

A simple internal page at `/preview-dashboard` (auth-gated to TSH team) showing:

- Table of all generated previews with: business name, prospect URL, preview URL, generated date, opened date, CTA clicked date
- One-click "Copy outreach email" button that pre-fills the cold email template with the prospect's preview URL
- Preview thumbnail (screenshot via `html-to-image`)
- Status badge: `sent | opened | clicked | converted`

This turns the agent into a proper sales pipeline tool, not just a code generator.

---

## Design Reference Sources

Use these as inspiration sources in `DesignAgent` prompts:

| Source | What to Pull |
|---|---|
| **21dev.co** | Hero layouts, card components, CTA sections — filter by "healthcare" or "landing page" |
| **Mobbin** (mobbin.com) | Real healthcare app UI patterns — One Medical, ZocDoc, Headspace for UI inspiration |
| **shadcn/ui** | Component primitives already in the project — Button, Card, Badge, Tabs, Input |
| **Radix UI** | Accessible headless components — already installed, use for any interactive elements |
| **Tailwind UI** (reference only) | Marketing page patterns — hero sections, feature grids, testimonials |
| **Dribbble** search: `dental website 2025` | Visual inspiration for hero imagery and color palette choices |

**Non-negotiable design standards for every preview**:
- Lighthouse mobile score target: **>85** (vs. their current ~34)
- First Contentful Paint: **<1.5s**
- No horizontal scroll on mobile
- Touch targets minimum 44×44px
- Color contrast WCAG AA compliant

---

## Error Handling

| Failure Point | Fallback |
|---|---|
| Scraper: site blocks requests | Retry with puppeteer-like headers; if still blocked, ask user to paste HTML manually |
| Scraper: no services found | Use generic dental services list: General, Cosmetic, Preventive, Emergency |
| BrandAgent: unreadable colors | Default to trusted healthcare palette: `#1A56DB` / `#F9FAFB` / `#0E9F6E` |
| CodegenAgent: invalid JSX output | Re-run with stricter prompt + JSON-mode; max 3 retries |
| Deploy: Netlify API down | Serve from Express static route as fallback |

---

## Time & Cost Estimates

| Step | Time | API Cost (est.) |
|---|---|---|
| ScraperAgent (scrape + vision) | ~15s | ~$0.02 (GPT-4o vision) |
| BrandAgent | ~8s | ~$0.01 |
| DesignAgent | ~5s | ~$0.005 |
| CodegenAgent | ~25s | ~$0.08 (large output) |
| DeployAgent | ~10s | $0 |
| **Total** | **~60s** | **~$0.11/preview** |

At $0.11 per preview and a 15–25% conversion rate, the cost per closed client from this channel is under $1 in API spend. The real cost is the dev time to build the agent — estimated **3–5 days** for a senior dev familiar with the codebase.

---

## MVP Scope vs. Full Version

### MVP (build in 3–5 days)
- [ ] ScraperAgent using existing `urlFetcher.js` + Cheerio
- [ ] Hardcoded brand defaults (skip BrandAgent, use a fixed modern healthcare palette)
- [ ] 3 hardcoded layout templates (warm, modern, minimal) — pick based on scraped personality keywords
- [ ] CodegenAgent generates static HTML (not JSX) for simplicity
- [ ] Preview served from Express static route
- [ ] Manual outreach (copy URL, paste into email)

### Full Version (1–2 weeks)
- [ ] All 5 agents with full prompt engineering
- [ ] Dynamic Tailwind + React generation
- [ ] Netlify deploy preview integration
- [ ] Supabase tracking (open pixel + CTA click)
- [ ] Internal dashboard at `/preview-dashboard`
- [ ] One-click outreach email generation
