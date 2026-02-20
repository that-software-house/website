# SEO Audit Report - That Software House Website

Date: 2026-02-20  
Scope: Local code audit of `/Users/darkknight/Desktop/projects/tsh/website`  
Priority lens: Service-lead pages first (`/seo`, `/marketing`, `/services`, `/custom-software`, `/ai-software`, `/contact`)

## Executive Summary
Overall SEO health is **medium**. Core commercial pages have route-level metadata and canonical coverage, but there are structural technical issues that can suppress indexing quality and snippet quality.

Top priorities:
1. **Prevent soft-404 indexing and utility-page indexing leakage** by adding explicit robots directives and fixing SPA fallback behavior.
2. **Fix SEO state leakage in SPA navigation** (`useSEO`) so canonical and JSON-LD do not persist incorrectly between routes.
3. **Repair broken internal URLs and missing social/favicon assets** to avoid crawl friction and degraded SERP/social previews.
4. **Reduce heavy media and JS footprint** to improve CWV risk on landing/service pages.

---

## Crawlability and Indexation Baseline

### Route classification

| Route group | Current state | Evidence |
|---|---|---|
| Core service pages (`/`, `/seo`, `/marketing`, `/services`, `/custom-software`, `/ai-software`, etc.) | Indexable and in sitemap | `/Users/darkknight/Desktop/projects/tsh/website/public/sitemap.xml:4`, `/Users/darkknight/Desktop/projects/tsh/website/public/sitemap.xml:69` |
| Utility pages (`/reset-password`, `/thank-you`, `/data-insights`) | Disallowed in robots but not explicitly noindex | `/Users/darkknight/Desktop/projects/tsh/website/public/robots.txt:5`, `/Users/darkknight/Desktop/projects/tsh/website/src/pages/ResetPassword.jsx:10`, `/Users/darkknight/Desktop/projects/tsh/website/src/pages/ThankYou.jsx:6`, `/Users/darkknight/Desktop/projects/tsh/website/src/pages/DataInsights.jsx:8` |
| Dynamic project pages (`/projects/:projectId`) | Crawlable via internal links but absent from sitemap | `/Users/darkknight/Desktop/projects/tsh/website/src/App.jsx:44`, `/Users/darkknight/Desktop/projects/tsh/website/src/pages/Projects.jsx:118`, `/Users/darkknight/Desktop/projects/tsh/website/public/sitemap.xml:44` |
| Unknown paths (`*`) | Routed to app 404 component, but Netlify returns 200 fallback | `/Users/darkknight/Desktop/projects/tsh/website/src/App.jsx:53`, `/Users/darkknight/Desktop/projects/tsh/website/netlify.toml:74` |

---

## Technical SEO Findings

### 1) Soft-404 risk: unknown URLs are returned as HTTP 200
- **Issue**: SPA fallback rewrites all unknown routes to `index.html` with status 200.
- **Impact**: High (indexation quality, crawl waste, possible soft-404 classification).
- **Evidence**: `/Users/darkknight/Desktop/projects/tsh/website/netlify.toml:74` to `:76`, `/Users/darkknight/Desktop/projects/tsh/website/src/App.jsx:53`.
- **Fix**: Add a proper 404 handling strategy on Netlify (e.g., edge/function-based 404 for unknown non-app routes, or prerender/SSR approach with correct status). Ensure unknown URLs emit 404 HTTP status.
- **Priority**: High

### 2) Robots-only blocking on utility pages without explicit `noindex`
- **Issue**: Utility pages are disallowed in robots but still render normal indexable metadata and no robots meta.
- **Impact**: High (URLs can still be indexed via external/internal discovery, often without content fetch).
- **Evidence**: `/Users/darkknight/Desktop/projects/tsh/website/public/robots.txt:5`, `/Users/darkknight/Desktop/projects/tsh/website/public/robots.txt:7`, `/Users/darkknight/Desktop/projects/tsh/website/src/pages/ResetPassword.jsx:10`, `/Users/darkknight/Desktop/projects/tsh/website/src/pages/ThankYou.jsx:6`, `/Users/darkknight/Desktop/projects/tsh/website/src/pages/DataInsights.jsx:8`.
- **Fix**: Extend `useSEO` to support `robots` directive and apply `noindex,nofollow` to utility/private routes; optionally remove robots disallow once noindex is shipped to allow recrawl and deindexing.
- **Priority**: Critical

### 3) SEO state leakage in SPA (`canonical`, JSON-LD, OG/Twitter)
- **Issue**: `useSEO` only sets tags when values exist and does not clear stale canonical/JSON-LD/meta values when route changes.
- **Impact**: Critical (wrong canonical/schema can persist across pages and confuse indexing).
- **Evidence**: `canonicalUrl` only set conditionally `/Users/darkknight/Desktop/projects/tsh/website/src/hooks/useSEO.js:62`; JSON-LD only set when provided `/Users/darkknight/Desktop/projects/tsh/website/src/hooks/useSEO.js:73`; cleanup is empty `/Users/darkknight/Desktop/projects/tsh/website/src/hooks/useSEO.js:85`.
- **Fix**: Refactor hook to track managed tags and deterministically clear/reset absent fields on navigation. Add explicit robots meta support in same hook.
- **Priority**: Critical

### 4) Missing social/icon assets referenced in head
- **Issue**: `index.html` references files that do not exist in `public/`.
- **Impact**: Medium (broken social previews and favicon fallbacks; lower snippet/share quality).
- **Evidence**: references in `/Users/darkknight/Desktop/projects/tsh/website/index.html:6`, `:7`, `:24`; files missing from public (`website/public/favicon.ico`, `website/public/apple-touch-icon.png`, `website/public/og-image.png`).
- **Fix**: Add these assets or update tags to existing files; verify 200 responses in production.
- **Priority**: High

### 5) Large JS and media payload risking CWV
- **Issue**: Production bundle and hero videos are heavy.
- **Impact**: High for LCP/INP on key commercial pages.
- **Evidence**: build output shows `dist/assets/index-C_XlPnIj.js` at ~1.46MB and CSS ~202KB; video assets include `/public/video/seo-growth.mp4` ~26MB and hero videos ~14-16MB.
- **Fix**: Code-split app routes/components, defer non-critical JS, replace/optimize videos (compressed variants, posters, lazy strategy), and prioritize static hero imagery for first paint.
- **Priority**: High

### 6) Video poster misuse on SEO page
- **Issue**: `<video poster>` points to an MP4 rather than an image.
- **Impact**: Medium (poster fallback/render inefficiency; potential LCP regressions).
- **Evidence**: `/Users/darkknight/Desktop/projects/tsh/website/src/pages/SeoPage.jsx:113`.
- **Fix**: Use optimized image poster (`.jpg`/`.webp`) and keep video source separate.
- **Priority**: Medium

---

## On-Page SEO Findings

### 7) Broken internal legal link
- **Issue**: Terms page links to `/privacy-policy`, but real route is `/privacy`.
- **Impact**: Medium (internal link equity leakage and bad UX/crawl path).
- **Evidence**: broken link `/Users/darkknight/Desktop/projects/tsh/website/src/pages/Terms.jsx:131`; valid route `/Users/darkknight/Desktop/projects/tsh/website/src/App.jsx:42`.
- **Fix**: Replace `/privacy-policy` with `/privacy`.
- **Priority**: High

### 8) Invalid post-reset redirect path
- **Issue**: Password reset redirect goes to `/projects/invoice-chaser`, but actual project route ID is `invoicechaser`.
- **Impact**: Medium (sends users/bots to non-existent slug and additional soft-404 risk).
- **Evidence**: redirect `/Users/darkknight/Desktop/projects/tsh/website/src/pages/ResetPassword.jsx:71`; valid id `/Users/darkknight/Desktop/projects/tsh/website/src/pages/Projects.jsx:84`; route pattern `/Users/darkknight/Desktop/projects/tsh/website/src/App.jsx:44`.
- **Fix**: Redirect to `/projects/invoicechaser`.
- **Priority**: High

### 9) Dynamic project detail URLs not represented in sitemap
- **Issue**: `/projects/:projectId` pages are internally linked and canonicalized but absent from sitemap.
- **Impact**: Medium (lower discovery efficiency for project/tool pages).
- **Evidence**: dynamic route `/Users/darkknight/Desktop/projects/tsh/website/src/App.jsx:44`; internal links `/Users/darkknight/Desktop/projects/tsh/website/src/pages/Projects.jsx:118`; sitemap only includes `/projects` `/Users/darkknight/Desktop/projects/tsh/website/public/sitemap.xml:44`.
- **Fix**: If these pages should rank, include canonical project URLs in sitemap. If not, apply `noindex` to project detail pages that are utility-only.
- **Priority**: Medium

---

## Structured Data Findings

### 10) Structured data is present but prone to stale carryover
- **Issue**: Multiple pages/apps define JSON-LD, but SPA cleanup logic does not remove it when navigating to pages without schema.
- **Impact**: High (schema mismatch per route can trigger invalid rich result interpretation).
- **Evidence**: schema usage in `/Users/darkknight/Desktop/projects/tsh/website/src/pages/Home.jsx:23`, `/Users/darkknight/Desktop/projects/tsh/website/src/pages/SeoPage.jsx:13`, `/Users/darkknight/Desktop/projects/tsh/website/src/components/apps/TextCleanerApp.jsx:124`; persistence logic in `/Users/darkknight/Desktop/projects/tsh/website/src/hooks/useSEO.js:73` and empty cleanup at `:85`.
- **Fix**: Manage a per-route schema key and remove stale script on route transitions when schema is absent.
- **Priority**: Critical

### Runtime validation limitation
- Static code confirms schema injection points, but runtime validation still required in a rendered environment (Rich Results Test / browser DOM check).

---

## Prioritized Action Plan

### 1) Critical fixes (indexation/ranking blockers)
1. Refactor `/Users/darkknight/Desktop/projects/tsh/website/src/hooks/useSEO.js` to support:
   - `robots` directive (`index,follow` default; route override support).
   - Deterministic cleanup/reset for canonical/meta/OG/Twitter/JSON-LD.
2. Apply `noindex,nofollow` to utility routes:
   - `/Users/darkknight/Desktop/projects/tsh/website/src/pages/ResetPassword.jsx`
   - `/Users/darkknight/Desktop/projects/tsh/website/src/pages/ThankYou.jsx`
   - `/Users/darkknight/Desktop/projects/tsh/website/src/pages/DataInsights.jsx`
   - `/Users/darkknight/Desktop/projects/tsh/website/src/pages/NotFound.jsx`
3. Implement true 404 HTTP behavior for unknown routes in Netlify config/function flow.

### 2) High-impact improvements
1. Fix broken internal URL in `/Users/darkknight/Desktop/projects/tsh/website/src/pages/Terms.jsx:131`.
2. Fix reset redirect slug in `/Users/darkknight/Desktop/projects/tsh/website/src/pages/ResetPassword.jsx:71`.
3. Add missing assets referenced by `/Users/darkknight/Desktop/projects/tsh/website/index.html` (`favicon.ico`, `apple-touch-icon.png`, `og-image.png`) or update references.
4. Reduce payload on hero/service pages (video optimization + JS code splitting).

### 3) Quick wins
1. Replace video poster MP4 with real image in `/Users/darkknight/Desktop/projects/tsh/website/src/pages/SeoPage.jsx:113`.
2. Add sitemap entries for project detail URLs that are intended to rank.
3. Add a lightweight audit script/check in CI to verify internal route/link consistency and required SEO assets.

### 4) Long-term recommendations
1. Consider SSR/prerender strategy for stable metadata and correct status codes.
2. Add automated metadata regression tests for route transitions (canonical/schema/robots).
3. Establish periodic CWV budget checks for bundle and media sizes.

---

## Acceptance Test Scenarios for Remediation
1. Indexable routes retain unique title, description, canonical, OG/Twitter tags after direct load and client-side navigation.
2. Utility/private routes emit `<meta name="robots" content="noindex,nofollow">` and do not inherit stale canonicals.
3. Unknown URLs return HTTP 404 (not 200 with app fallback).
4. All internal links resolve to valid routes (`/privacy` fixed; no invalid project slug redirects).
5. Meta-referenced assets return 200 in production (`favicon.ico`, `apple-touch-icon.png`, `og-image.png`).
6. JSON-LD is route-correct and removed when leaving schema-enabled pages.
7. Sitemap contains only canonical, indexable URLs and matches intended ranking pages.

---

## Notes and constraints
- Audit performed from local repository state only (no Search Console, no live crawl logs).
- Structured data runtime validation is required post-deploy in Rich Results Test / rendered browser context.
