import { createClient } from '@supabase/supabase-js';

const FREE_TIER_LIMIT = 10;
const PREMIUM_LIMIT = 1000;
const RATE_LIMIT_TABLE = 'api_daily_usage';
const RATE_LIMIT_RPC = 'increment_api_daily_usage';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

const rateLimitStore = globalThis.__NETLIFY_RATE_LIMIT_STORE__ || new Map();
globalThis.__NETLIFY_RATE_LIMIT_STORE__ = rateLimitStore;

function getResetTime() {
  const now = new Date();
  return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0, 0);
}

function getUsageDateKey() {
  return new Date().toISOString().slice(0, 10);
}

function cleanupExpired(currentDateKey = getUsageDateKey()) {
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.usageDate !== currentDateKey) {
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

function toUsage(count, limit, resetAtMs) {
  return {
    used: count,
    limit,
    remaining: Math.max(0, limit - count),
    resetsAt: new Date(resetAtMs).toISOString(),
  };
}

async function readUsageCountFromSupabase(identifier, usageDate) {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from(RATE_LIMIT_TABLE)
      .select('request_count')
      .eq('identifier', identifier)
      .eq('usage_date', usageDate)
      .maybeSingle();

    if (error) {
      console.error('Rate limit read failed:', error.message);
      return null;
    }

    const count = Number.parseInt(data?.request_count ?? 0, 10);
    if (!Number.isFinite(count)) return 0;
    return Math.max(0, count);
  } catch (error) {
    console.error('Rate limit read failed:', error.message);
    return null;
  }
}

async function incrementUsageCountInSupabase(identifier, usageDate, incrementBy = 1) {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase.rpc(RATE_LIMIT_RPC, {
      p_identifier: identifier,
      p_usage_date: usageDate,
      p_increment: incrementBy,
    });

    if (error) {
      console.error('Rate limit increment failed:', error.message);
      return null;
    }

    const count = Number.parseInt(data ?? 0, 10);
    if (!Number.isFinite(count)) return 0;
    return Math.max(0, count);
  } catch (error) {
    console.error('Rate limit increment failed:', error.message);
    return null;
  }
}

function readUsageCountFromMemory(identifier, usageDate) {
  cleanupExpired(usageDate);
  const record = rateLimitStore.get(identifier);
  if (!record || record.usageDate !== usageDate) return 0;
  return Math.max(0, Number.parseInt(record.count ?? 0, 10) || 0);
}

function incrementUsageCountInMemory(identifier, usageDate, incrementBy = 1) {
  cleanupExpired(usageDate);
  const currentCount = readUsageCountFromMemory(identifier, usageDate);
  const nextCount = currentCount + incrementBy;
  rateLimitStore.set(identifier, {
    usageDate,
    count: nextCount,
  });
  return nextCount;
}

async function getUsageCount(identifier, usageDate) {
  const supabaseCount = await readUsageCountFromSupabase(identifier, usageDate);
  if (supabaseCount !== null) return supabaseCount;
  return readUsageCountFromMemory(identifier, usageDate);
}

async function incrementUsageCount(identifier, usageDate, incrementBy = 1) {
  const supabaseCount = await incrementUsageCountInSupabase(identifier, usageDate, incrementBy);
  if (supabaseCount !== null) return supabaseCount;
  return incrementUsageCountInMemory(identifier, usageDate, incrementBy);
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
  const user = await getUserFromEvent(event);
  const identifier = user?.id ? `user:${user.id}` : `ip:${extractIp(event)}`;

  const isPremium = Boolean(user?.user_metadata?.is_premium);
  const limit = isPremium ? PREMIUM_LIMIT : FREE_TIER_LIMIT;
  const usageDate = getUsageDateKey();
  const resetAtMs = getResetTime();
  const count = await getUsageCount(identifier, usageDate);

  return {
    ...toUsage(count, limit, resetAtMs),
    isPremium,
  };
}

export async function consumeRateLimit(event, options = {}) {
  const { consume = true } = options;
  const user = await getUserFromEvent(event);
  const identifier = user?.id ? `user:${user.id}` : `ip:${extractIp(event)}`;

  const isPremium = Boolean(user?.user_metadata?.is_premium);
  const limit = isPremium ? PREMIUM_LIMIT : FREE_TIER_LIMIT;
  const usageDate = getUsageDateKey();
  const resetAtMs = getResetTime();
  const currentCount = await getUsageCount(identifier, usageDate);

  if (consume && currentCount >= limit) {
    const now = Date.now();
    const usage = {
      ...toUsage(currentCount, limit, resetAtMs),
      isPremium,
    };

    return {
      allowed: false,
      usage,
      headers: {
        ...buildRateLimitHeaders(usage),
        'Retry-After': String(Math.ceil((resetAtMs - now) / 1000)),
      },
      user,
    };
  }

  const nextCount = consume
    ? await incrementUsageCount(identifier, usageDate, 1)
    : currentCount;

  const usage = {
    ...toUsage(nextCount, limit, resetAtMs),
    isPremium,
  };

  return {
    allowed: true,
    usage,
    headers: buildRateLimitHeaders(usage),
    user,
  };
}
