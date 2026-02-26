# Launch Readiness Checker — Design Document

**Date:** 2026-02-26
**Status:** Approved
**Goal:** Lead generation + brand awareness tool for founders and small business owners

---

## Overview

An interactive, multi-step checklist tool that scores how ready a user is to launch their product or website. Users pick a track (Product Launch vs Website Launch), answer Yes/No/Not sure on 23 items across 5 categories, and receive a scored results page with category breakdown, gap analysis, shareable social card, and an email-gated personalized action plan.

**Route:** `/launch-readiness-checker`
**Target audience:** Founders launching a product/SaaS + small business owners launching a website
**Primary goal:** Capture qualified leads with rich intent data (track, scores, specific gaps)
**Secondary goal:** Brand awareness via shareable score cards on social media

---

## Architecture

### Approach

Extend cost estimator components (Approach A). Reuse `SelectableCard`, `ProgressBar`, and email gate pattern. Build new `ChecklistItem`, `ScoreBar`, `ScoreResults`, and `ShareCard` components.

### File Structure

```
src/
  pages/
    LaunchReadiness.jsx               # Page wrapper (hero + SEO)
    LaunchReadiness.css
  components/
    apps/
      LaunchCheckerApp.jsx            # Main app (step state, scoring logic)
      LaunchCheckerApp.css
      launch-checker/
        checklistData.js              # All questions, categories, scoring per track
        ChecklistItem.jsx             # Yes / No / Not sure button group
        StepTrackPicker.jsx           # Step 1: Product Launch vs Website Launch
        StepCategory.jsx              # Generic step rendering N ChecklistItems
        ScoreResults.jsx              # Overall score, bars, gaps, share card, email gate
        ScoreBar.jsx                  # Animated horizontal bar per category
        ShareCard.jsx                 # Canvas-generated shareable image
netlify/
  functions/
    launch-checker-lead.js            # Supabase insert for email captures
```

### Reused from Cost Estimator

- `ProgressBar` — same step progress indicator
- `SelectableCard` — for track picker (Step 1)
- Email gate pattern — dual Netlify Forms + Supabase submit
- Animation timings, CSS design tokens, Framer Motion patterns

### State Management

`useReducer` — local state, no new libraries:

```js
{
  track: 'product' | 'website' | null,
  step: 0,
  answers: { [questionId]: 'yes' | 'no' | 'unsure' }
}
```

### SEO

`useSEO` hook with JSON-LD `SoftwareApplication` schema.
Target keywords: "launch readiness checklist", "am I ready to launch", "product launch checklist", "website launch checklist"

---

## Step Flow

### Step 1: "What are you launching?"

Single select using `SelectableCard` from cost estimator.

| Card | Description |
|------|-------------|
| Product / App | SaaS, mobile app, or digital product |
| Website | Business website, portfolio, or online store |

Selecting a track loads that track's categories for Steps 2-6.

### Steps 2-6: Category Checklists

Each step shows one category with 4-5 questions. User answers Yes / No / Not sure per item.

### Step 7: Results

Score calculation + results page + email gate.

---

## Track A: Product / App Launch (23 items)

### Category 1 — Product Readiness (5 items)

| # | Question |
|---|----------|
| 1 | Is your core feature built and working? |
| 2 | Have you tested with at least 3-5 real users? |
| 3 | Do you have a plan for bugs and feedback after launch? |
| 4 | Is your onboarding flow clear for first-time users? |
| 5 | Can your infrastructure handle a traffic spike on launch day? |

### Category 2 — Distribution & Go-to-Market (5 items)

| # | Question |
|---|----------|
| 1 | Do you know the 2-3 specific channels where your target users hang out? |
| 2 | Have you built an audience or waitlist before launch? |
| 3 | Do you have a launch-day promotion plan (not just "post it and pray")? |
| 4 | Have you lined up any partnerships, cross-promos, or influencer mentions? |
| 5 | Do you have a follow-up plan for week 2 and beyond? |

### Category 3 — Landing Page & Messaging (5 items)

| # | Question |
|---|----------|
| 1 | Can a stranger understand what you do within 5 seconds of landing? |
| 2 | Is your value prop specific (not generic "we help businesses grow")? |
| 3 | Do you have a clear, single CTA above the fold? |
| 4 | Have you tested your messaging with people outside your team? |
| 5 | Does your landing page work well on mobile? |

### Category 4 — Analytics & Tracking (4 items)

| # | Question |
|---|----------|
| 1 | Do you have analytics installed (Google Analytics, Mixpanel, etc.)? |
| 2 | Are you tracking conversion events (signups, purchases, key actions)? |
| 3 | Do you know what your success metric is for launch week? |
| 4 | Can you tell where your traffic is coming from? |

### Category 5 — Social Proof & Credibility (4 items)

| # | Question |
|---|----------|
| 1 | Do you have testimonials, case studies, or beta user quotes? |
| 2 | Does your site have real team/founder info (not anonymous)? |
| 3 | Do you have any press mentions, awards, or notable logos? |
| 4 | Is there any form of trust signal (reviews, security badges, guarantees)? |

---

## Track B: Website Launch (23 items)

### Category 1 — Content Readiness (5 items)

| # | Question |
|---|----------|
| 1 | Is all your page content written and reviewed? |
| 2 | Do you have professional photos or quality visuals (not just stock)? |
| 3 | Is your contact info accurate and easy to find? |
| 4 | Do you have an About page that tells your story? |
| 5 | Are your services/products clearly described with pricing or next steps? |

### Category 2 — SEO Fundamentals (5 items)

| # | Question |
|---|----------|
| 1 | Does every page have a unique title tag and meta description? |
| 2 | Have you set up Google Business Profile for local search? |
| 3 | Do your images have alt text? |
| 4 | Is your site structure clean (clear navigation, no orphan pages)? |
| 5 | Have you submitted your sitemap to Google Search Console? |

### Category 3 — Technical & Mobile (4 items)

| # | Question |
|---|----------|
| 1 | Does your site load in under 3 seconds? |
| 2 | Does it look and work properly on phones? |
| 3 | Is HTTPS / SSL set up? |
| 4 | Do all links and forms actually work (no broken links)? |

### Category 4 — Legal & Trust (4 items)

| # | Question |
|---|----------|
| 1 | Do you have a Privacy Policy page? |
| 2 | Do you have Terms of Service? |
| 3 | If collecting emails, are you GDPR/CAN-SPAM compliant? |
| 4 | Do you have real testimonials or reviews visible? |

### Category 5 — Lead Capture & Analytics (5 items)

| # | Question |
|---|----------|
| 1 | Do you have at least one way to capture leads (form, email signup, chat)? |
| 2 | Is analytics installed and tracking page views? |
| 3 | Do you have conversion tracking set up (form submissions, calls, etc.)? |
| 4 | Do you know what action you want visitors to take? |
| 5 | Is there a clear CTA on every page? |

---

## Scoring Logic

- **Yes** = 1 point
- **Not sure** = 0.5 points (flagged as gap)
- **No** = 0 points (flagged as gap)
- Per-category score = (points earned / possible) * 100
- Overall score = average of all category percentages (equal weight)
- Total: 23 items per track, max 23 points

### Score Labels

| Range | Label | Color Tone |
|-------|-------|------------|
| 0-39% | "Not ready yet" | Red / warning |
| 40-69% | "Getting there" | Amber |
| 70-89% | "Almost launch-ready" | Accent (teal) |
| 90-100% | "You're ready to ship" | Green / success |

---

## UI & Interaction Design

### Visual Style

Same as cost estimator — dark theme, existing design tokens:
- Background: `var(--bg)` / `var(--layer-1)`
- Cards/panels: `var(--card)` with `var(--glass)`
- Accent: `var(--accent)` (#5de4c7)
- Fonts: Space Grotesk (headings), Manrope (body)

### ChecklistItem Component

- Question text on the left
- Three buttons on the right: `[ Yes ]  [ No ]  [ Not sure ]`
- Selected button gets accent highlight
- Framer Motion fade-in for each item (stagger: idx * 0.06)
- Mobile: buttons stack below the question text

### Step Transitions

- `AnimatePresence` with directional slide (same as cost estimator)
- `ProgressBar` from cost estimator (reused directly)
- Steps: 1 (track) + 5 (categories) + 1 (results) = 7 total

### ScoreBar Component

- Horizontal bar per category, fills from 0 to percentage with animation
- Color shifts from red (low) → amber (mid) → accent/green (high)
- Label + percentage on right side
- Staggered entrance (delay per bar)

### Results Page

- Overall score: animated count-up (reuse cost estimator pattern)
- Category bars: staggered entrance animation
- Top gaps: listed with warning icon + actionable one-liner
- Shareable card section
- Email gate section
- CTA to TSH

### Shareable Card

Generated client-side with `<canvas>`:
- Dimensions: 1200x675 (Twitter/LinkedIn optimized)
- Content: Overall score, 5 category bars, TSH branding + URL
- "Download Card" button saves as PNG
- TSH logo + "Check yours → tsh.io/launch" watermark

### Micro-copy Tone

Casual, Gen Z-friendly:
- Step 1: "What are you launching?"
- Category steps: "Let's check your [category]"
- Results (low): "Okay... you've got some homework"
- Results (mid): "Getting there — a few gaps to close"
- Results (high): "You're basically ready to ship"
- Results (100%): "You absolute legend"

---

## Lead Capture & Data Flow

### What's Free (No Email)

- Overall percentage score with label
- Per-category score bars
- Top 5 gaps with actionable one-liners

### What's Email-Gated

- Personalized action plan:
  - For each gap: recommendation + relevant resource link
  - Prioritized: "Fix these first" (No) → "Verify these" (Not sure)
- Cross-sell to cost estimator (website track only):
  - "Thinking about a website upgrade? Try our Website Cost Estimator →"
- TSH soft pitch: "Need help with any of this? We build and launch products for founders."

### Email Form Fields

- Email (required)
- Name (optional)
- Hidden: track, all answers, overall score, category scores, top gaps

### Data Flow

```
User completes all steps
  → answers stored in local useReducer state
  → scores calculated client-side from checklistData.js

User submits email
  → Netlify Forms POST (hidden form, data-netlify="true")
  → Simultaneously: fetch('/api/launch-checker-lead')
    → Supabase insert to launch_checker_leads table
  → On success: reveal gated content (state change, no reload)
```

### Supabase Table: `launch_checker_leads`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | auto-generated |
| email | text | required |
| name | text | nullable |
| track | text | 'product' or 'website' |
| answers | jsonb | all question answers |
| overall_score | integer | 0-100 |
| category_scores | jsonb | per-category percentages |
| top_gaps | jsonb | array of gap items |
| created_at | timestamp | auto-generated |

### Netlify Serverless Function

`netlify/functions/launch-checker-lead.js` — POST handler, validates email, inserts into Supabase.

---

## Cross-Tool Funnel

```
Launch Readiness Checker (this tool)
  → Website track gaps → "Try our Website Cost Estimator"
  → Product track gaps → "Need help building? Talk to TSH"
  → Shareable card → Brand awareness → New users discover both tools
```

---

## Future Enhancements (Not MVP)

- Email the action plan as a formatted PDF
- Shareable URL with encoded answers (revisit your score later)
- Industry-specific question sets (SaaS vs e-commerce vs agency)
- Benchmark comparison ("You scored higher than 68% of founders")
- Retake tracking (see improvement over time)
