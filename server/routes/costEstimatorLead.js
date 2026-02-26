import express from 'express';
import { createClient } from '@supabase/supabase-js';

export const costEstimatorLeadRouter = express.Router();

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

function toStringArray(value) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item)).filter(Boolean);
}

function toEstimateNumber(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return Math.max(0, Math.round(parsed));
}

costEstimatorLeadRouter.post('/', async (req, res) => {
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
    industry: toSafeString(payload.industry) || null,
    site_size: toSafeString(payload.siteSize) || null,
    features: toStringArray(payload.features),
    extras: payload.extras && typeof payload.extras === 'object' ? payload.extras : {},
    estimate_low: toEstimateNumber(payload.estimateLow),
    estimate_high: toEstimateNumber(payload.estimateHigh),
  };

  try {
    const { error } = await supabase.from('cost_estimator_leads').insert(insertPayload);

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
