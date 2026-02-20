# LeadFlow AI — Lightweight AI CRM Demo

**Date:** 2026-02-20
**Status:** Approved

## Overview

LeadFlow AI is an interactive demo app for the THAT Software House website that showcases an AI-powered CRM capable of auto-capturing leads from email, web forms, and social DMs with zero manual data entry.

**Tagline:** "Your leads find you. Your CRM builds itself."

**Target persona:** Freelancers and solopreneurs who currently track leads in spreadsheets or their heads. Designed to expand to small agencies and local businesses later.

## Problem

- HubSpot charges enterprise prices; SMBs use 10% of features
- Most small businesses track deals in spreadsheets or nowhere
- Manual lead entry is tedious and leads slip through cracks
- CRM tools are bloated with features nobody asked for

## Solution

A two-part interactive experience:

1. **Simulation Mode** — Pre-loaded realistic data showing leads streaming in from 3 channels (email, forms, social DMs), getting AI-processed in real-time, and landing in a Kanban pipeline
2. **Try It Mode** — User pastes a raw email, DM, or form submission and the AI extracts structured lead data live using OpenAI, then saves to Supabase

## UI Architecture

### Layout

- Header with badge ("AI-Powered CRM"), title, subtitle
- Tab bar: Live Demo | Try It Yourself
- Dark theme, consistent with existing site
- Framer Motion animations for streaming leads

### Live Demo Tab

- **Incoming Feed** (left): Leads stream in every 2-3 seconds with source icons (email, Instagram, Twitter, form)
- **Kanban Pipeline** (right): Columns — New, Qualified, Proposal, Won
- **Stats Bar**: Total leads, hot leads count, total pipeline value
- AI processing animation (sparkle/pulse) as each lead gets parsed
- Click a lead to see full details (original message + extracted data)

### Try It Tab

- Source selector: Email / DM / Form
- Textarea for pasting raw text
- "Extract Lead" button
- Extracted result card showing: Name, Company, Channel, Intent, Urgency, Est. Deal Size, Suggested Action
- Personal Kanban pipeline below showing all saved leads
- Drag-and-drop between pipeline stages

## Technical Architecture

### File Structure

```
src/components/apps/LeadFlowApp.jsx    — Main component
src/components/apps/LeadFlowApp.css    — Styles
src/services/openai.js                 — Add extractLead() function
src/pages/ProjectDetail.jsx            — Add 'leadflow' case
```

### Simulation Mode (client-side only)

- Pre-loaded array of ~12 realistic sample leads
- `useEffect` + `setInterval` streams leads in one by one
- Each lead animates: Incoming Feed → AI processing → Kanban pipeline
- Stats update in real-time

### Try It Mode (OpenAI + Supabase)

- User selects source type and pastes raw text
- Calls `extractLead(text, sourceType)` in openai.js
- OpenAI returns structured JSON
- Result saves to Supabase `leads` table
- Auth required (existing useAuth + AuthModal pattern)
- Usage tracking via existing usage headers

### Supabase Schema

```sql
CREATE TABLE leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT,
  company TEXT,
  email TEXT,
  phone TEXT,
  channel TEXT CHECK (channel IN ('email', 'dm', 'form')),
  intent TEXT,
  urgency TEXT CHECK (urgency IN ('low', 'medium', 'high')),
  deal_size INTEGER,
  suggested_action TEXT,
  summary TEXT,
  raw_text TEXT,
  stage TEXT DEFAULT 'new' CHECK (stage IN ('new', 'qualified', 'proposal', 'won')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Users can only see/edit their own leads
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own leads"
  ON leads FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### Dependencies

No new dependencies — uses React, Framer Motion, Lucide icons, and existing OpenAI service.

## Sample Data

| Source | Name | Company | Intent | Urgency | Deal Size |
|--------|------|---------|--------|---------|-----------|
| Email | Sarah Chen | TechStart Inc | Custom web app for inventory | High | $15,000 |
| IG DM | @markbuilds | BuildRight Co | Mobile app for contractors | Medium | $8,000 |
| Form | James Rivera | Acme Legal | Case management system | High | $25,000 |
| Email | Priya Patel | GreenLeaf Cafe | Online ordering system | Medium | $5,000 |
| Twitter DM | @designstudio_ | PixelPerfect | Rebrand + new website | Low | $3,500 |
| Form | David Kim | Kim & Associates | Client portal | High | $12,000 |

Plus 6 additional varied leads across all pipeline stages.

## Approach Rationale

Chose **Hybrid approach** (simulation + paste-and-parse) because:
- Simulation sells the dream of what an AI CRM could be
- Paste-and-parse proves the tech is real with the user's own data
- Supabase persistence adds stickiness — users come back to their pipeline
- Together they make a compelling case for consulting engagement
