# Website Cost Estimator — Implementation Plan

**Design doc:** `docs/plans/2026-02-26-website-cost-estimator-design.md`

---

## Phase 1: Foundation (Core Data + Reusable Components)

### Task 1.1: Create pricing data config
**File:** `src/components/apps/cost-estimator/pricingData.js`
- All step options, labels, icons, descriptions, price ranges
- Helper functions: `calculateEstimate(selections)` → `{ low, high }`
- Timeline estimation logic based on selections
- Export everything as named exports for easy testing/updating

### Task 1.2: Create SelectableCard component
**File:** `src/components/apps/cost-estimator/SelectableCard.jsx`
- Props: `icon`, `label`, `description`, `selected`, `onClick`, `priceRange` (optional)
- Framer Motion `whileHover`, `whileTap` animations
- Selected state: accent border glow, checkmark badge, scale
- Responsive: works in 2-col (mobile) and 3-4 col (desktop) grids
- Uses existing design tokens (--card, --accent, --glass, etc.)

### Task 1.3: Create ProgressBar component
**File:** `src/components/apps/cost-estimator/ProgressBar.jsx`
- Props: `currentStep`, `totalSteps`, `stepLabel`
- Segmented bar, fills with accent color
- Animated fill transition

### Task 1.4: Create RunningTotal component
**File:** `src/components/apps/cost-estimator/RunningTotal.jsx`
- Props: `low`, `high`, `onNext`, `onBack`, `canGoNext`, `canGoBack`, `isLastStep`
- Fixed bottom, glass background
- Animated count-up when values change (use `useEffect` + requestAnimationFrame)
- Next/Back buttons
- Mobile: full-width bar

---

## Phase 2: Step Components

### Task 2.1: StepIndustry (Step 1)
**File:** `src/components/apps/cost-estimator/StepIndustry.jsx`
- Single-select card grid
- 6 industry options from pricingData
- Lucide icons: Utensils, ShoppingBag, Briefcase, Heart, Home, Sparkles

### Task 2.2: StepSiteSize (Step 2)
**File:** `src/components/apps/cost-estimator/StepSiteSize.jsx`
- Single-select card grid
- 4 size options with price ranges shown on cards
- Updates running total on selection

### Task 2.3: StepFeatures (Step 3)
**File:** `src/components/apps/cost-estimator/StepFeatures.jsx`
- Multi-select card grid
- 8 feature options with price ranges
- Running total updates as features toggle

### Task 2.4: StepExtras (Step 4)
**File:** `src/components/apps/cost-estimator/StepExtras.jsx`
- Two sections: Design Level (single-select) + Add-ons (multi-select)
- Rush delivery applies +30% multiplier to running total
- Maintenance shows "/mo" pricing separately

---

## Phase 3: Results & Lead Capture

### Task 3.1: EstimateResults component
**File:** `src/components/apps/cost-estimator/EstimateResults.jsx`
- Animated count-up for total range ($0 → final number)
- Summary checklist of all selections
- Estimated timeline display
- "Ungated" section visible immediately
- "Gated" section (line-item breakdown, tips, comparison) hidden until email submitted
- Email form: email (required), name (optional), hidden fields (selections + estimate)
- Dual submit: Netlify Forms + fetch to serverless function
- On success: reveal gated content with slide animation
- CTA button: "Talk to TSH" → links to /contact

### Task 3.2: Netlify serverless function
**File:** `netlify/functions/cost-estimator-lead.js`
- POST handler
- Validates email
- Inserts into Supabase `cost_estimator_leads` table
- Returns success/error JSON
- Uses existing `_lib/http.js` helpers (jsonResponse, optionsResponse, methodNotAllowed)

---

## Phase 4: Main App + Page Integration

### Task 4.1: CostEstimatorApp main component
**File:** `src/components/apps/CostEstimatorApp.jsx` + `CostEstimatorApp.css`
- `useReducer` for all state: `{ step, industry, siteSize, features, extras, email }`
- Dispatch actions: SET_INDUSTRY, SET_SITE_SIZE, TOGGLE_FEATURE, SET_DESIGN_LEVEL, TOGGLE_ADDON, SET_EMAIL, NEXT_STEP, PREV_STEP
- Calculates estimate from state using `calculateEstimate()`
- Renders current step with `AnimatePresence` directional transitions
- Renders ProgressBar and RunningTotal

### Task 4.2: Page wrapper + routing
**File:** `src/pages/WebsiteCostEstimator.jsx` + `WebsiteCostEstimator.css`
- Matches VideoAnalyzer page pattern: hero section + app component
- `useSEO` with title, description, JSON-LD
- Hero copy: "Website Cost Estimator" + subtitle

**File:** `src/App.jsx`
- Add import and route: `/website-cost-estimator`

---

## Phase 5: Polish & Testing

### Task 5.1: Responsive testing
- Test all steps at mobile (375px), tablet (768px), desktop (1200px+)
- Ensure card grids reflow properly
- Running total bar works on all sizes

### Task 5.2: Animation polish
- Verify step transitions are smooth
- Count-up animations feel good
- Results page stagger timing
- No layout shifts during transitions

### Task 5.3: Lead capture testing
- Test Netlify Forms submission (hidden form trick)
- Test Supabase insert via serverless function
- Verify gated content reveals on success
- Error handling for failed submissions

---

## Build Order

```
1.1 (pricingData) → 1.2-1.4 (components, parallel)
  → 2.1-2.4 (steps, parallel)
    → 3.1 (results) + 3.2 (serverless, parallel)
      → 4.1 (main app) → 4.2 (page + route)
        → 5.1-5.3 (polish, parallel)
```

**Estimated files to create:** 13 new files
**Estimated files to modify:** 1 (App.jsx — add route)
