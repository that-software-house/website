import express from 'express';
import { google } from 'googleapis';

export const googleAuthRouter = express.Router();

const SCOPES = [
  'https://www.googleapis.com/auth/youtube.readonly',
  'https://www.googleapis.com/auth/yt-analytics.readonly',
];

const COOKIE_NAME = 'yt_tokens';
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days

function getOAuthClient(req) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
  const host = req.headers.host || 'localhost:3001';
  const baseUrl = process.env.SITE_BASE_URL || `${protocol}://${host}`;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${baseUrl}/api/oauth2callback`;

  if (!clientId || !clientSecret) {
    throw new Error('Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET');
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

function readTokens(req) {
  const encoded = req.cookies?.[COOKIE_NAME];
  if (!encoded) return null;
  try {
    const json = Buffer.from(encoded, 'base64url').toString();
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function setTokenCookie(res, tokens) {
  const encoded = Buffer.from(JSON.stringify(tokens)).toString('base64url');
  res.cookie(COOKIE_NAME, encoded, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });
}

// GET /api/googleAuth - Redirect to Google OAuth consent screen
googleAuthRouter.get('/googleAuth', (req, res) => {
  try {
    const oauth2Client = getOAuthClient(req);
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: SCOPES,
      state: 'insightcard',
    });
    res.redirect(url);
  } catch (error) {
    console.error('Auth redirect error:', error);
    res.status(500).json({ error: 'Failed to start auth', message: error.message });
  }
});

// GET /api/oauth2callback - Handle Google OAuth callback
googleAuthRouter.get('/oauth2callback', async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'Missing authorization code' });
  }

  try {
    const oauth2Client = getOAuthClient(req);
    const { tokens } = await oauth2Client.getToken(code);

    setTokenCookie(res, tokens);

    // Derive the frontend origin from GOOGLE_REDIRECT_URI so we redirect
    // back to the Vite dev server, not the Express server.
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || '';
    const frontendOrigin = redirectUri.replace(/\/api\/oauth2callback$/, '');
    res.redirect(`${frontendOrigin}/projects/insightcard?connected=1`);
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.status(500).json({ error: 'Token exchange failed', message: error.message });
  }
});

// GET /api/disconnect - Clear tokens and force re-auth
googleAuthRouter.get('/disconnect', (req, res) => {
  res.clearCookie(COOKIE_NAME, { path: '/' });
  res.json({ ok: true });
});

// GET /api/profile - Fetch YouTube channel & analytics
googleAuthRouter.get('/profile', async (req, res) => {
  try {
    const tokens = readTokens(req);
    console.log("TOKENS IS", tokens);
    if (!tokens) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const oauth2Client = getOAuthClient(req);
    oauth2Client.setCredentials(tokens);

    // Refresh if expired
    if (tokens.expiry_date && tokens.expiry_date < Date.now()) {
      const { credentials } = await oauth2Client.refreshAccessToken();
      oauth2Client.setCredentials(credentials);
      setTokenCookie(res, credentials);
    }

    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

    // Try mine:true first, then managedByMe:true for Brand Account channels.
    let channelResp = await youtube.channels.list({
      part: 'snippet,statistics',
      mine: true,
    });

    if (!channelResp.data.items?.length) {
      channelResp = await youtube.channels.list({
        part: 'snippet,statistics',
        managedByMe: true,
      });
    }

    const channel = channelResp.data.items?.[0] || null;
    const channelId = channel?.id;

    let analyticsData = null;
    if (channelId) {
      try {
        const analytics = google.youtubeAnalytics({ version: 'v2', auth: oauth2Client });

        const today = new Date();
        const endDate = today.toISOString().slice(0, 10);
        const start = new Date();
        start.setDate(today.getDate() - 28);
        const startDate = start.toISOString().slice(0, 10);

        // Try with the explicit channel ID first, fall back to MINE.
        let analyticsResp;
        try {
          analyticsResp = await analytics.reports.query({
            ids: `channel==${channelId}`,
            startDate,
            endDate,
            metrics: 'views,estimatedMinutesWatched,averageViewDuration,averageViewPercentage',
            dimensions: 'country',
            sort: '-views',
            maxResults: 5,
          });
        } catch {
          analyticsResp = await analytics.reports.query({
            ids: 'channel==MINE',
            startDate,
            endDate,
            metrics: 'views,estimatedMinutesWatched,averageViewDuration,averageViewPercentage',
            dimensions: 'country',
            sort: '-views',
            maxResults: 5,
          });
        }

        analyticsData = analyticsResp.data;
      } catch (analyticsError) {
        console.warn('YouTube Analytics fetch failed (non-fatal):', analyticsError.message);
        analyticsData = { error: analyticsError.message };
      }
    } else {
      analyticsData = { error: 'No YouTube channel found for this account' };
    }

    res.json({
      channel,
      analytics: analyticsData,
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'API request failed', message: error.message });
  }
});
