# Launch Readiness Checker — Implementation Plan

**Design doc:** `docs/plans/2026-02-26-launch-readiness-checker-design.md`

---

## Phase 1: Data & Core Components

### Task 1.1: Create checklist data config
**File:** `src/components/apps/launch-checker/checklistData.js`
- Two track definitions: `PRODUCT_TRACK` and `WEBSITE_TRACK`
- Each track: array of categories, each category has `id`, `name`, `icon`, `questions[]`
- Each question: `id`, `text`, `gapMessage` (actionable one-liner for results)
- Helper functions:
  - `calculateScores(track, answers)` → `{ overall, categories: [{ name, score, total }], gaps: [{ question, gapMessage, severity }] }`
  - `getScoreLabel(score)` → `{ label, colorClass }`
- Export everything as named exports

### Task 1.2: Create ChecklistItem component
**File:** `src/components/apps/launch-checker/ChecklistItem.jsx`
- Props: `question`, `answer`, `onAnswer`
- Question text on left, three buttons on right: Yes / No / Not sure
- Selected button gets accent highlight (Yes = green-ish, No = red-ish, Not sure = amber)
- Framer Motion entrance animation
- Mobile responsive: buttons stack below text
- Uses existing design tokens

### Task 1.3: Create ScoreBar component
**File:** `src/components/apps/launch-checker/ScoreBar.jsx`
- Props: `label`, `score` (0-100), `delay` (for stagger)
- Horizontal bar with animated fill (0 → score%)
- Color shifts: red (0-39) → amber (40-69) → accent (70-89) → green (90-100)
- Label + percentage display
- Framer Motion for fill animation

---

## Phase 2: Step Components

### Task 2.1: StepTrackPicker (Step 1)
**File:** `src/components/apps/launch-checker/StepTrackPicker.jsx`
- Import `SelectableCard` from cost estimator
- Two cards: "Product / App" and "Website"
- Icons from Lucide: Rocket, Globe
- Single select

### Task 2.2: StepCategory (Generic category step)
**File:** `src/components/apps/launch-checker/StepCategory.jsx`
- Props: `category` (from checklistData), `answers`, `onAnswer`
- Renders category name as heading
- Maps over `category.questions` rendering a `ChecklistItem` for each
- Staggered entrance animation (delay: idx * 0.06)
- No "Next" button here — that's in the main app's navigation

---

## Phase 3: Results & Shareable Card

### Task 3.1: ShareCard component
**File:** `src/components/apps/launch-checker/ShareCard.jsx`
- Props: `track`, `overallScore`, `categoryScores`
- Uses `<canvas>` to render a 1200x675 image
- Content: TSH branding, overall score, 5 category bars, URL watermark
- "Download Card" button: converts canvas to PNG blob, triggers download
- `useEffect` to render canvas when scores are available
- Dark background matching site theme

### Task 3.2: ScoreResults component
**File:** `src/components/apps/launch-checker/ScoreResults.jsx`
- Props: `track`, `answers`, `email`, `onEmailChange`, `onEmailCaptured`
- Calculates scores using `calculateScores()` from checklistData
- Sections:
  1. **Overall score** — animated count-up (reuse cost estimator pattern)
  2. **Category bars** — 5x `ScoreBar` with staggered entrance
  3. **Top gaps** — warning icon + actionable message (max 5)
  4. **Share card** — `ShareCard` component + download button
  5. **Email gate** — same pattern as cost estimator `EstimateResults`:
     - Hidden Netlify form (form-name: "launch-readiness-checker")
     - Email (required) + Name (optional)
     - Dual submit: Netlify Forms + fetch to `/api/launch-checker-lead`
     - On success: reveal gated action plan
  6. **Gated content** — personalized action plan (prioritized gaps with recommendations)
  7. **Cross-sell** — website track shows link to cost estimator
  8. **CTA** — "Talk to TSH" → /contact

### Task 3.3: Netlify serverless function
**File:** `netlify/functions/launch-checker-lead.js`
- POST handler
- Validates email
- Inserts into Supabase `launch_checker_leads` table
- Uses existing `_lib/http.js` helpers
- Returns success/error JSON

---

## Phase 4: Main App + Page Integration

### Task 4.1: LaunchCheckerApp main component
**File:** `src/components/apps/LaunchCheckerApp.jsx` + `LaunchCheckerApp.css`
- `useReducer` for state: `{ track, step, answers, email }`
- Actions: SET_TRACK, SET_ANSWER, NEXT_STEP, PREV_STEP, SET_EMAIL
- Step routing:
  - Step 0: StepTrackPicker
  - Steps 1-5: StepCategory (loads correct category based on track + step)
  - Step 6: ScoreResults
- `AnimatePresence` for directional step transitions
- `ProgressBar` (imported from cost estimator) — 7 steps total
- Navigation: Back/Next buttons (Next disabled until all items in step answered)

### Task 4.2: Page wrapper + routing
**File:** `src/pages/LaunchReadiness.jsx` + `LaunchReadiness.css`
- Matches existing page pattern (VideoAnalyzer, cost estimator)
- Hero section: "Launch Readiness Checker" + subtitle
- `useSEO` hook with title, description, JSON-LD

**File:** `src/App.jsx`
- Add import and route: `/launch-readiness-checker`

### Task 4.3: CSS styles
**File:** `src/components/apps/LaunchCheckerApp.css`
- ChecklistItem styles (question + button group layout)
- ScoreBar styles (bar track, fill, color variants)
- ScoreResults styles (score hero, grid, gap list, email gate)
- ShareCard styles (canvas container, download button)
- Responsive breakpoints (mobile card stacking, button layout)
- Reuse cost estimator CSS patterns where applicable (`.cost-btn`, `.cost-results__gate` equivalents)

---

## Phase 5: Polish & Testing

### Task 5.1: Responsive testing
- Test all steps at 375px, 768px, 1200px+
- ChecklistItem buttons stack properly on mobile
- ScoreBar labels don't overflow
- ShareCard canvas renders correctly at all sizes
- Navigation bar works on all sizes

### Task 5.2: Animation polish
- Step transitions smooth and directional
- Count-up animation feels satisfying
- ScoreBar fill animations stagger nicely
- Gap items entrance timing
- Email gate reveal transition

### Task 5.3: Share card quality check
- Canvas renders at correct 1200x675 dimensions
- PNG download works across browsers (Chrome, Safari, Firefox)
- TSH branding legible
- Score bars render proportionally
- Text anti-aliasing looks clean

### Task 5.4: Lead capture testing
- Netlify Forms submission works (hidden form trick)
- Supabase insert via serverless function works
- Gated content reveals on success
- Error handling for failed submissions
- All hidden fields (track, answers, scores, gaps) captured correctly

### Task 5.5: Cross-tool funnel
- Website track results link to `/website-cost-estimator` works
- Product track results CTA to `/contact` works
- "Powered by TSH" on share card links work

---

## Build Order

```
1.1 (checklistData) → 1.2 + 1.3 (components, parallel)
  → 2.1 + 2.2 (steps, parallel)
    → 3.1 + 3.3 (share card + serverless, parallel) → 3.2 (results, depends on 3.1)
      → 4.1 (main app) → 4.2 + 4.3 (page + CSS, parallel)
        → 5.1-5.5 (polish, parallel)
```

**New files to create:** 12
**Files to modify:** 1 (App.jsx — add route)

**Reused from cost estimator:**
- `SelectableCard` (imported)
- `ProgressBar` (imported)
- Email gate pattern (adapted)
- Count-up animation pattern (adapted)
- CSS design tokens and animation timings
