# Website Cost Estimator — Design Document

**Date:** 2026-02-26
**Status:** Approved
**Goal:** Lead generation + brand awareness free tool for small business owners

---

## Overview

An interactive, multi-step card picker tool that helps small business owners estimate how much a website costs based on their specific needs. Users select options via visual cards, see a running total update in real-time, and receive a cost range with a gated detailed breakdown behind email capture.

**Route:** `/website-cost-estimator`
**Target audience:** Small business owners considering getting a website built
**Primary goal:** Capture qualified leads (email + project details)
**Secondary goal:** Brand awareness, SEO traffic, social shareability

---

## Architecture

### File Structure

```
src/
  pages/
    WebsiteCostEstimator.jsx          # Page wrapper (hero + SEO)
  components/
    apps/
      CostEstimatorApp.jsx            # Main app (step state, pricing logic)
      CostEstimatorApp.css            # Component styles
      cost-estimator/
        StepIndustry.jsx              # Step 1: Business type
        StepSiteSize.jsx              # Step 2: Site size
        StepFeatures.jsx              # Step 3: Feature selection
        StepExtras.jsx                # Step 4: Design & add-ons
        EstimateResults.jsx           # Step 5: Results + email gate
        RunningTotal.jsx              # Sticky footer with animated total
        SelectableCard.jsx            # Reusable card component
        ProgressBar.jsx               # Step progress indicator
        pricingData.js                # All pricing configuration
netlify/
  functions/
    cost-estimator-lead.js            # Serverless function for Supabase insert
```

### State Management

- Local `useReducer` for all selections (no new libraries)
- Pricing calculated client-side from `pricingData.js`
- Matches existing app patterns (VideoAnalyzer, DataInsights, etc.)

### SEO

- `useSEO` hook with JSON-LD `SoftwareApplication` schema
- Target keywords: "website cost calculator", "how much does a website cost", "small business website pricing"

---

## Step-by-Step Flow

### Step 1: "First things first — what's your vibe?"

Single select. Sets business context for personalized results copy and lead qualification.

| Card | Icon |
|------|------|
| Restaurant / Food | utensils |
| Retail / Shop | shopping-bag |
| Professional Services | briefcase |
| Health & Wellness | heart |
| Real Estate | home |
| Other | sparkles |

### Step 2: "How much real estate are we talking?"

Single select. Sets the base price.

| Card | Description | Price Range |
|------|-------------|-------------|
| Single Page | Landing page, all info on one scroll | $500 - $800 |
| Small Site (3-5 pages) | Home, About, Services, Contact | $1,000 - $2,000 |
| Medium Site (6-10 pages) | Multiple service pages, team, FAQ | $2,500 - $4,000 |
| Large Site (10+) | Full content site, multiple sections | $5,000 - $8,000 |

### Step 3: "Now the fun part — pick your features"

Multi-select. Each adds to the running total.

| Card | Description | Price Range |
|------|-------------|-------------|
| Online Store | Sell products, accept payments | $1,500 - $3,000 |
| Booking / Scheduling | Let customers book appointments | $400 - $800 |
| Blog / News | Publish articles, updates | $300 - $600 |
| Contact Forms | Custom forms, file uploads | $200 - $400 |
| Photo Gallery / Portfolio | Showcase your work | $200 - $400 |
| Customer Reviews | Testimonials, ratings | $150 - $300 |
| Live Chat | Chat widget for visitors | $200 - $400 |
| Member Area / Login | User accounts, gated content | $800 - $1,500 |

### Step 4: "Almost there — any extras?"

Mixed selection.

**Design level (single select):**

| Card | Description | Price Range |
|------|-------------|-------------|
| Template-Based | Clean, modern template customized to your brand | $0 (included in base) |
| Custom Design | Unique design, built from scratch for you | $1,000 - $2,500 |

**Add-ons (multi-select):**

| Card | Description | Price Range |
|------|-------------|-------------|
| SEO Setup | Search engine optimization, Google listing | $300 - $500 |
| Speed Optimization | Fast loading, image optimization | $200 - $400 |
| Rush Delivery | Need it in 2 weeks instead of 4-6? | +30% of total |
| Ongoing Maintenance | Monthly updates, backups, support | $100 - $300/mo |

### Step 5: Results

- Animated count-up to the total range
- Summary checklist of selections
- Estimated timeline
- Email gate for detailed breakdown
- CTA to contact TSH

---

## UI & Interaction Design

### Visual Style

Matches existing site dark theme:
- Background: `var(--bg)` / `var(--layer-1)`
- Cards: `var(--card)` with `var(--glass)` hover effect
- Selected state: `var(--accent)` (#5de4c7) border glow + subtle scale
- Text: `var(--text-primary)`, descriptions in `var(--text-muted)`
- Fonts: Space Grotesk (headings), Manrope (body)

### Card Component

- ~160px x 140px responsive grid (2 cols mobile, 3-4 cols desktop)
- Icon top, label center, description bottom (muted)
- Hover: subtle lift (y: -4) + glow border
- Selected: accent border, checkmark badge top-right, slight scale up
- Framer Motion `whileHover` and `whileTap`

### Running Total (Sticky Footer)

- Fixed bottom, glass background
- Shows: "Estimated cost: **$X,XXX - $X,XXX**"
- Number animates smoothly on selection change (count-up effect)
- "Next" button on right side
- Mobile: full-width bar

### Step Transitions

- `AnimatePresence` with directional slide (forward = left, back = right)
- Segmented progress bar at top, fills with accent color
- Step label: "1 of 5 — Business Type"

### Results Page Animations

- Total range: dramatic count-up from $0
- Breakdown items: stagger in (delay: idx * 0.08)
- Email gate card: slides up after ~1s delay
- CTA button: subtle pulse animation

### Micro-copy Tone

Casual, Gen Z-friendly (per CLAUDE.md):
- Step 1: "First things first — what's your vibe?"
- Step 2: "How much real estate are we talking?"
- Step 3: "Now the fun part — pick your features"
- Step 4: "Almost there — any extras?"
- Results: "Here's the damage" / "Not bad, right?"

---

## Lead Capture & Data Flow

### What's Free (No Email)

- Total estimated range ($X,XXX - $X,XXX)
- Summary checklist of selections
- Estimated timeline

### What's Gated (Behind Email)

- Line-item cost breakdown (each feature with individual range)
- "What to Expect When Hiring a Developer" — 5 quick tips
- Comparison: DIY vs Template vs Custom

### Email Form Fields

- Email (required)
- Name (optional)
- Hidden: all selections + estimated range

### Data Flow

```
User completes steps
  → selections in local useReducer state
  → results calculated client-side from pricingData.js

User submits email
  → Netlify Forms POST (hidden form, data-netlify="true")
  → Simultaneously: fetch('/api/cost-estimator-lead')
    → Supabase insert to cost_estimator_leads table
  → On success: reveal gated content (no page reload, state change)
```

### Supabase Table: `cost_estimator_leads`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | auto-generated |
| email | text | required |
| name | text | nullable |
| industry | text | selected industry |
| site_size | text | selected size tier |
| features | jsonb | array of selected features |
| extras | jsonb | design level + add-ons |
| estimate_low | integer | calculated low end |
| estimate_high | integer | calculated high end |
| created_at | timestamp | auto-generated |

### Netlify Serverless Function

`netlify/functions/cost-estimator-lead.js` — receives POST, validates, inserts into Supabase.

---

## Future Enhancements (Not MVP)

- Email the PDF report via SendGrid/Resend
- Shareable link with encoded selections in URL params
- A/B test different pricing (just update pricingData.js)
- Analytics tracking on each step completion
