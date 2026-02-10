import { getUsageForEvent, buildRateLimitHeaders } from './_lib/rateLimit.js';
import { jsonResponse, methodNotAllowed, optionsResponse } from './_lib/http.js';

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return optionsResponse();
  if (event.httpMethod !== 'GET') return methodNotAllowed();

  try {
    const usage = await getUsageForEvent(event);
    return jsonResponse(200, usage, buildRateLimitHeaders(usage));
  } catch (error) {
    return jsonResponse(500, {
      error: 'Usage lookup failed',
      message: error.message,
    });
  }
}
