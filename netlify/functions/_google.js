import { google } from 'googleapis'

const SCOPES = [
  'https://www.googleapis.com/auth/youtube.readonly',
  'https://www.googleapis.com/auth/yt-analytics.readonly',
]

const cookieName = 'yt_tokens'

const serializeCookie = (value, maxAgeSeconds = 60 * 60 * 24 * 30) => {
  const encoded = Buffer.from(JSON.stringify(value)).toString('base64url')
  const attrs = [
    `${cookieName}=${encoded}`,
    `Path=/`,
    `HttpOnly`,
    `SameSite=Lax`,
    `Max-Age=${maxAgeSeconds}`,
  ]
  if (process.env.NETLIFY === 'true') {
    attrs.push('Secure')
  }
  return attrs.join('; ')
}

const parseCookie = (cookieHeader) => {
  if (!cookieHeader) return null
  const cookies = Object.fromEntries(
    cookieHeader
      .split(';')
      .map((c) => c.trim().split('=').map(decodeURIComponent))
      .filter(([k]) => k === cookieName)
  )
  if (!cookies[cookieName]) return null
  try {
    const json = Buffer.from(cookies[cookieName], 'base64url').toString()
    return JSON.parse(json)
  } catch {
    return null
  }
}

const getBaseUrl = (event) =>
  process.env.SITE_BASE_URL ||
  process.env.URL ||
  `${event.headers['x-forwarded-proto'] || 'https'}://${event.headers.host}`

export const getOAuthClient = (event) => {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI ||
    `${getBaseUrl(event)}/api/oauth2callback`

  if (!clientId || !clientSecret) {
    throw new Error('Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET')
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri)
}

export const buildAuthUrl = (event, state = '') => {
  const oauth2Client = getOAuthClient(event)
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: SCOPES,
    state,
  })
}

export const storeTokensCookie = (tokens) => serializeCookie(tokens)
export const readTokensFromCookie = (cookieHeader) => parseCookie(cookieHeader)

export const headersJson = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
}
