import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client for server-side
// Use non-VITE prefixed variables for server (VITE_ vars are for browser only)
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('Warning: Supabase server credentials not set. Auth features may not work.');
}

const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

// In-memory store for rate limiting (for demo - use Redis in production)
const rateLimitStore = new Map();

const FREE_TIER_LIMIT = 10; // requests per day
const PREMIUM_LIMIT = 1000; // requests per day for premium users

// Clean up old entries every hour
setInterval(() => {
  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60 * 60 * 1000);

const getClientIdentifier = (req) => {
  // Use user ID if authenticated, otherwise use IP
  const userId = req.user?.id;
  if (userId) return `user:${userId}`;

  const ip = req.headers['x-forwarded-for']?.split(',')[0] ||
             req.headers['x-real-ip'] ||
             req.connection?.remoteAddress ||
             req.ip ||
             'unknown';
  return `ip:${ip}`;
};

const getResetTime = () => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow.getTime();
};

const shouldConsumeRequest = (req) => {
  if (req.baseUrl !== '/api/invoice-chaser') return true;
  const normalizedPath = (req.path || '/').replace(/\/+$/, '') || '/';
  return req.method === 'POST' && (normalizedPath === '/' || normalizedPath === '/upload');
};

export const rateLimitMiddleware = async (req, res, next) => {
  try {
    const identifier = getClientIdentifier(req);
    const isPremium = req.user?.user_metadata?.is_premium || false;
    const limit = isPremium ? PREMIUM_LIMIT : FREE_TIER_LIMIT;
    const shouldConsume = shouldConsumeRequest(req);

    const now = Date.now();
    let record = rateLimitStore.get(identifier);

    // Reset if new day or no record
    if (!record || record.resetAt < now) {
      record = {
        count: 0,
        resetAt: getResetTime(),
      };
    }

    // Check if over limit
    if (shouldConsume && record.count >= limit) {
      const retryAfter = Math.ceil((record.resetAt - now) / 1000);
      res.set('X-RateLimit-Limit', limit.toString());
      res.set('X-RateLimit-Remaining', '0');
      res.set('X-RateLimit-Reset', record.resetAt.toString());
      res.set('Retry-After', retryAfter.toString());

      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: `You've used all ${limit} free requests today. ${isPremium ? 'Contact support.' : 'Sign up for premium to get more requests.'}`,
        usage: {
          used: record.count,
          limit,
          remaining: 0,
          resetsAt: new Date(record.resetAt).toISOString(),
        },
      });
    }

    // Increment count
    if (shouldConsume) {
      record.count++;
      rateLimitStore.set(identifier, record);
    }

    // Set rate limit headers
    res.set('X-RateLimit-Limit', limit.toString());
    res.set('X-RateLimit-Remaining', (limit - record.count).toString());
    res.set('X-RateLimit-Reset', record.resetAt.toString());

    // Attach usage info to request for later use
    req.rateLimit = {
      used: record.count,
      limit,
      remaining: limit - record.count,
      resetsAt: new Date(record.resetAt).toISOString(),
    };

    next();
  } catch (err) {
    console.error('Rate limit error:', err);
    // Don't block on rate limit errors
    next();
  }
};

// Middleware to verify Supabase JWT token
export const authMiddleware = async (req, res, next) => {
  try {
    // If Supabase isn't configured, skip auth
    if (!supabase) {
      req.user = null;
      return next();
    }

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.substring(7);

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      req.user = null;
      return next();
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    req.user = null;
    next();
  }
};

// Get usage stats for a user or IP
export const getUsage = (req) => {
  const identifier = getClientIdentifier(req);
  const isPremium = req.user?.user_metadata?.is_premium || false;
  const limit = isPremium ? PREMIUM_LIMIT : FREE_TIER_LIMIT;

  const record = rateLimitStore.get(identifier);

  if (!record || record.resetAt < Date.now()) {
    return {
      used: 0,
      limit,
      remaining: limit,
      resetsAt: new Date(getResetTime()).toISOString(),
      isPremium,
    };
  }

  return {
    used: record.count,
    limit,
    remaining: Math.max(0, limit - record.count),
    resetsAt: new Date(record.resetAt).toISOString(),
    isPremium,
  };
};
