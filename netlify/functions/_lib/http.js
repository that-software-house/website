export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

export function jsonResponse(statusCode, body, extraHeaders = {}) {
  return {
    statusCode,
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'application/json',
      ...extraHeaders,
    },
    body: JSON.stringify(body ?? {}),
  };
}

export function optionsResponse(extraHeaders = {}) {
  return {
    statusCode: 200,
    headers: {
      ...CORS_HEADERS,
      ...extraHeaders,
    },
    body: '',
  };
}

export function methodNotAllowed(extraHeaders = {}) {
  return jsonResponse(405, { error: 'Method not allowed' }, extraHeaders);
}

export function extractSubpath(event, apiPrefix, functionName) {
  const rawPath = String(event?.path || '');
  if (rawPath.startsWith(apiPrefix)) {
    const sub = rawPath.slice(apiPrefix.length);
    return sub || '/';
  }

  const functionPrefix = `/.netlify/functions/${functionName}`;
  if (rawPath.startsWith(functionPrefix)) {
    const sub = rawPath.slice(functionPrefix.length);
    return sub || '/';
  }

  return '/';
}
