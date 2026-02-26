import express from 'express';
import { createClient } from '@supabase/supabase-js';

export const launchCheckerLeadRouter = express.Router();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase =
  supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey)
    : null;

function toSafeString(value) {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

function toSafeObject(value, fallback = {}) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return fallback;
  return value;
}

function toSafeArray(value) {
  if (!Array.isArray(value)) return [];
  return value;
}

function toScore(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return Math.max(0, Math.min(100, Math.round(parsed)));
}

launchCheckerLeadRouter.post('/', async (req, res) => {
  if (!supabase) {
    return res.status(500).json({
      error: 'Supabase is not configured for lead capture.',
    });
  }

  const payload = req.body || {};
  const email = toSafeString(payload.email).toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({
      error: 'A valid email is required.',
    });
  }

  const insertPayload = {
    email,
    name: toSafeString(payload.name) || null,
    track: toSafeString(payload.track) || null,
    answers: toSafeObject(payload.answers),
    overall_score: toScore(payload.overallScore),
    category_scores: toSafeArray(payload.categoryScores),
    top_gaps: toSafeArray(payload.topGaps),
  };

  try {
    const { error } = await supabase.from('launch_checker_leads').insert(insertPayload);

    if (error) {
      return res.status(500).json({
        error: 'Could not save lead.',
        details: error.message,
      });
    }

    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({
      error: 'Lead capture failed.',
      details: error.message,
    });
  }
});
