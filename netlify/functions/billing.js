import crypto from 'crypto';
import { Buffer } from 'node:buffer';
import { createClient } from '@supabase/supabase-js';
import { extractSubpath, jsonResponse, methodNotAllowed, optionsResponse } from './_lib/http.js';

const STRIPE_API_BASE = 'https://api.stripe.com/v1';
const INVOICE_CHASER_PLAN = 'invoice_chaser_unlimited';
const ACTIVE_SUBSCRIPTION_STATUSES = new Set(['active', 'trialing', 'past_due']);

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY;

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripeWebhookSecret =
  process.env.STRIPE_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SIGNING_SECRET;
const stripeInvoiceChaserPriceId =
  process.env.STRIPE_PRICE_ID_INVOICE_CHASER_MONTHLY ||
  process.env.STRIPE_INVOICE_CHASER_PRICE_ID;

const configuredSiteUrl = (process.env.VITE_SITE_URL || process.env.SITE_URL || '').trim();

const supabase =
  supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey)
    : null;

function normalizeSubpath(subpath) {
  return subpath.endsWith('/') && subpath.length > 1 ? subpath.slice(0, -1) : subpath;
}

function parseJsonBody(event) {
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

function getRawBody(event) {
  if (!event?.body) return '';
  return event.isBase64Encoded
    ? Buffer.from(event.body, 'base64').toString('utf8')
    : event.body;
}

function getSiteUrl(event) {
  if (configuredSiteUrl) {
    return configuredSiteUrl.replace(/\/+$/, '');
  }

  const headers = event?.headers || {};
  const host = headers['x-forwarded-host'] || headers.host || headers.Host;
  const proto = headers['x-forwarded-proto'] || 'https';
  if (!host) return 'http://localhost:8888';
  return `${proto}://${host}`.replace(/\/+$/, '');
}

function parseStripeSignatureHeader(headerValue) {
  const parsed = { timestamp: '', signatures: [] };
  const chunks = String(headerValue || '').split(',');

  for (const chunk of chunks) {
    const [key, value] = chunk.trim().split('=', 2);
    if (key === 't') parsed.timestamp = value || '';
    if (key === 'v1' && value) parsed.signatures.push(value);
  }

  return parsed;
}

function safeCompareHex(expected, provided) {
  try {
    if (!expected || !provided || expected.length !== provided.length) return false;
    return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(provided, 'hex'));
  } catch {
    return false;
  }
}

function verifyStripeSignature(rawBody, signatureHeader) {
  if (!stripeWebhookSecret) return false;

  const { timestamp, signatures } = parseStripeSignatureHeader(signatureHeader);
  if (!timestamp || signatures.length === 0) return false;

  const timestampSeconds = Number.parseInt(timestamp, 10);
  if (!Number.isFinite(timestampSeconds)) return false;

  const nowSeconds = Math.floor(Date.now() / 1000);
  if (Math.abs(nowSeconds - timestampSeconds) > 300) return false;

  const payload = `${timestamp}.${rawBody}`;
  const expectedSignature = crypto
    .createHmac('sha256', stripeWebhookSecret)
    .update(payload, 'utf8')
    .digest('hex');

  return signatures.some((signature) => safeCompareHex(expectedSignature, signature));
}

async function stripeRequest(path, params = null) {
  if (!stripeSecretKey) {
    throw new Error('Stripe is not configured');
  }

  const response = await fetch(`${STRIPE_API_BASE}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${stripeSecretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params ? params.toString() : '',
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.error?.message || 'Stripe request failed');
  }

  return payload;
}

async function getUserFromEvent(event) {
  if (!supabase) return null;

  const headers = event?.headers || {};
  const authHeader = headers.authorization || headers.Authorization;
  if (!authHeader || !String(authHeader).startsWith('Bearer ')) return null;

  const token = String(authHeader).slice(7);
  if (!token) return null;

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user;
}

async function getUserById(userId) {
  const { data, error } = await supabase.auth.admin.getUserById(userId);
  if (error || !data?.user) {
    throw new Error('Could not load user for billing update');
  }
  return data.user;
}

async function updateUserMetadata(userId, patch) {
  const user = await getUserById(userId);
  const currentMetadata = user.user_metadata || {};
  const nextMetadata = { ...currentMetadata, ...patch };

  const { data, error } = await supabase.auth.admin.updateUserById(userId, {
    user_metadata: nextMetadata,
  });

  if (error) {
    throw new Error('Could not update billing metadata');
  }

  return data?.user || null;
}

async function ensureStripeCustomerId(user) {
  const existingCustomerId = user?.user_metadata?.stripe_customer_id;
  if (existingCustomerId) return existingCustomerId;

  const params = new URLSearchParams();
  if (user?.email) params.set('email', user.email);
  params.set('metadata[supabase_user_id]', user.id);

  const customer = await stripeRequest('/customers', params);
  await updateUserMetadata(user.id, {
    stripe_customer_id: customer.id,
  });

  return customer.id;
}

async function createCheckoutSession(user, siteUrl) {
  if (!stripeInvoiceChaserPriceId) {
    throw new Error('Stripe price is not configured');
  }

  const customerId = await ensureStripeCustomerId(user);
  const params = new URLSearchParams();
  params.set('mode', 'subscription');
  params.set('customer', customerId);
  params.set('line_items[0][price]', stripeInvoiceChaserPriceId);
  params.set('line_items[0][quantity]', '1');
  params.set('allow_promotion_codes', 'true');
  params.set('success_url', `${siteUrl}/projects/invoice-chaser?billing=success`);
  params.set('cancel_url', `${siteUrl}/projects/invoice-chaser?billing=cancel`);
  params.set('client_reference_id', user.id);
  params.set('metadata[supabase_user_id]', user.id);
  params.set('metadata[plan]', INVOICE_CHASER_PLAN);
  params.set('subscription_data[metadata][supabase_user_id]', user.id);
  params.set('subscription_data[metadata][plan]', INVOICE_CHASER_PLAN);

  return stripeRequest('/checkout/sessions', params);
}

async function createPortalSession(user, siteUrl) {
  const customerId = user?.user_metadata?.stripe_customer_id;
  if (!customerId) {
    throw new Error('No Stripe customer found for this account');
  }

  const params = new URLSearchParams();
  params.set('customer', customerId);
  params.set('return_url', `${siteUrl}/projects/invoice-chaser`);
  return stripeRequest('/billing_portal/sessions', params);
}

function resolveStripeEventUserId(eventObject = {}) {
  return (
    eventObject?.metadata?.supabase_user_id ||
    eventObject?.client_reference_id ||
    null
  );
}

async function applyInvoiceChaserEntitlement({
  userId,
  enabled,
  stripeCustomerId = null,
  stripeSubscriptionId = null,
  stripeSubscriptionStatus = null,
}) {
  if (!userId) return;

  const patch = {
    invoice_chaser_unlimited: Boolean(enabled),
  };

  if (stripeCustomerId) patch.stripe_customer_id = stripeCustomerId;
  if (stripeSubscriptionId !== null) patch.stripe_subscription_id = stripeSubscriptionId;
  if (stripeSubscriptionStatus !== null) patch.stripe_subscription_status = stripeSubscriptionStatus;

  await updateUserMetadata(userId, patch);
}

async function processStripeWebhook(stripeEvent) {
  const eventType = stripeEvent?.type || '';
  const object = stripeEvent?.data?.object || {};

  if (eventType === 'checkout.session.completed') {
    if (object?.mode !== 'subscription') return;
    const userId = resolveStripeEventUserId(object);
    if (!userId) return;

    await applyInvoiceChaserEntitlement({
      userId,
      enabled: true,
      stripeCustomerId: object?.customer || null,
      stripeSubscriptionId: object?.subscription || null,
      stripeSubscriptionStatus: 'active',
    });
    return;
  }

  if (
    eventType === 'customer.subscription.created' ||
    eventType === 'customer.subscription.updated' ||
    eventType === 'customer.subscription.deleted'
  ) {
    const userId = resolveStripeEventUserId(object);
    if (!userId) return;

    const subscriptionStatus = object?.status || null;
    const enabled = ACTIVE_SUBSCRIPTION_STATUSES.has(subscriptionStatus);

    await applyInvoiceChaserEntitlement({
      userId,
      enabled,
      stripeCustomerId: object?.customer || null,
      stripeSubscriptionId: object?.id || null,
      stripeSubscriptionStatus: subscriptionStatus,
    });
  }
}

async function handleCheckout(event, user) {
  const { plan = INVOICE_CHASER_PLAN } = parseJsonBody(event);
  if (plan !== INVOICE_CHASER_PLAN) {
    return jsonResponse(400, { error: 'Unsupported plan' });
  }

  const siteUrl = getSiteUrl(event);
  const session = await createCheckoutSession(user, siteUrl);

  return jsonResponse(200, {
    checkoutUrl: session.url,
    sessionId: session.id,
  });
}

async function handlePortal(event, user) {
  const siteUrl = getSiteUrl(event);
  const session = await createPortalSession(user, siteUrl);

  return jsonResponse(200, {
    portalUrl: session.url,
  });
}

async function handleWebhook(event) {
  const rawBody = getRawBody(event);
  const signatureHeader =
    event?.headers?.['stripe-signature'] || event?.headers?.['Stripe-Signature'] || '';

  if (!verifyStripeSignature(rawBody, signatureHeader)) {
    return jsonResponse(400, { error: 'Invalid Stripe signature' });
  }

  let stripeEvent = null;
  try {
    stripeEvent = JSON.parse(rawBody);
  } catch {
    return jsonResponse(400, { error: 'Invalid Stripe payload' });
  }

  await processStripeWebhook(stripeEvent);
  return jsonResponse(200, { received: true });
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return optionsResponse();
  if (event.httpMethod !== 'POST') return methodNotAllowed();

  if (!supabase) {
    return jsonResponse(500, { error: 'Supabase is not configured for billing' });
  }

  const subpath = normalizeSubpath(extractSubpath(event, '/api/billing', 'billing'));

  try {
    if (subpath === '/webhook') {
      return await handleWebhook(event);
    }

    const user = await getUserFromEvent(event);
    if (!user) {
      return jsonResponse(401, {
        error: 'Unauthorized',
        message: 'Sign in required for billing',
      });
    }

    if (subpath === '/checkout') {
      return await handleCheckout(event, user);
    }

    if (subpath === '/portal') {
      return await handlePortal(event, user);
    }

    return jsonResponse(404, { error: 'Route not found' });
  } catch (error) {
    return jsonResponse(500, {
      error: 'Billing request failed',
      message: error.message,
    });
  }
}
