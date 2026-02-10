import { createClient } from '@supabase/supabase-js';

const FREE_TIER_LIMIT = 10;
const PREMIUM_LIMIT = 1000;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

const rateLimitStore = globalThis.__NETLIFY_RATE_LIMIT_STORE__ || new Map();
globalThis.__NETLIFY_RATE_LIMIT_STORE__ = rateLimitStore;

function getResetTime() {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow.getTime();
}

function cleanupExpired() {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}

function extractIp(event) {
  const headers = event?.headers || {};
  const forwardedFor = headers['x-forwarded-for'] || headers['X-Forwarded-For'];
  const netlifyIp = headers['x-nf-client-connection-ip'] || headers['X-Nf-Client-Connection-Ip'];

  if (forwardedFor) return String(forwardedFor).split(',')[0].trim();
  if (netlifyIp) return String(netlifyIp).trim();
  return 'unknown';
}

async function getUserFromEvent(event) {
  if (!supabase) return null;

  const headers = event?.headers || {};
  const authHeader = headers.authorization || headers.Authorization;

  if (!authHeader || !String(authHeader).startsWith('Bearer ')) {
    return null;
  }

  const token = String(authHeader).slice(7);
  if (!token) return null;

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) return null;

  return data.user;
}

function toUsage(record, limit) {
  return {
    used: record.count,
    limit,
    remaining: Math.max(0, limit - record.count),
    resetsAt: new Date(record.resetAt).toISOString(),
  };
}

export function buildRateLimitHeaders(usage) {
  if (!usage) return {};
  return {
    'X-RateLimit-Limit': String(usage.limit),
    'X-RateLimit-Remaining': String(usage.remaining),
    'X-RateLimit-Reset': String(new Date(usage.resetsAt).getTime()),
  };
}

export async function getUsageForEvent(event) {
  cleanupExpired();

  const user = await getUserFromEvent(event);
  const identifier = user?.id ? `user:${user.id}` : `ip:${extractIp(event)}`;

  const isPremium = Boolean(user?.user_metadata?.is_premium);
  const limit = isPremium ? PREMIUM_LIMIT : FREE_TIER_LIMIT;

  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record || record.resetAt < now) {
    return {
      used: 0,
      limit,
      remaining: limit,
      resetsAt: new Date(getResetTime()).toISOString(),
      isPremium,
    };
  }

  return {
    ...toUsage(record, limit),
    isPremium,
  };
}

export async function consumeRateLimit(event) {
  cleanupExpired();

  const user = await getUserFromEvent(event);
  const identifier = user?.id ? `user:${user.id}` : `ip:${extractIp(event)}`;

  const isPremium = Boolean(user?.user_metadata?.is_premium);
  const limit = isPremium ? PREMIUM_LIMIT : FREE_TIER_LIMIT;

  const now = Date.now();
  let record = rateLimitStore.get(identifier);

  if (!record || record.resetAt < now) {
    record = {
      count: 0,
      resetAt: getResetTime(),
    };
  }

  if (record.count >= limit) {
    const usage = {
      ...toUsage(record, limit),
      isPremium,
    };

    return {
      allowed: false,
      usage,
      headers: {
        ...buildRateLimitHeaders(usage),
        'Retry-After': String(Math.ceil((record.resetAt - now) / 1000)),
      },
      user,
    };
  }

  record.count += 1;
  rateLimitStore.set(identifier, record);

  const usage = {
    ...toUsage(record, limit),
    isPremium,
  };

  return {
    allowed: true,
    usage,
    headers: buildRateLimitHeaders(usage),
    user,
  };
}
