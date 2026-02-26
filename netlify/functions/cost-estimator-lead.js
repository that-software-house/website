import { Buffer } from 'node:buffer';
import { createClient } from '@supabase/supabase-js';
import { jsonResponse, methodNotAllowed, optionsResponse } from './_lib/http.js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase =
  supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey)
    : null;

function parseBody(event) {
  if (!event?.body) return {};

  const rawBody = event.isBase64Encoded
    ? Buffer.from(event.body, 'base64').toString('utf8')
    : event.body;

  try {
    return JSON.parse(rawBody);
  } catch {
    return {};
  }
}

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

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return optionsResponse();
  if (event.httpMethod !== 'POST') return methodNotAllowed();

  if (!supabase) {
    return jsonResponse(500, {
      error: 'Supabase is not configured for lead capture.',
    });
  }

  const payload = parseBody(event);
  const email = toSafeString(payload.email).toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return jsonResponse(400, {
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
    const { error } = await supabase
      .from('cost_estimator_leads')
      .insert(insertPayload);

    if (error) {
      return jsonResponse(500, {
        error: 'Could not save lead.',
        details: error.message,
      });
    }

    return jsonResponse(200, {
      success: true,
    });
  } catch (error) {
    return jsonResponse(500, {
      error: 'Lead capture failed.',
      details: error.message,
    });
  }
}
