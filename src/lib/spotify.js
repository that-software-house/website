import { supabase } from '@/lib/supabase';

const SPOTIFY_CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const SPOTIFY_SCOPES = 'user-top-read user-read-recently-played';
const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize';
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

function getRedirectUri() {
  return `https://thatsoftwarehouse.com/projects/musicstats`;
}

// --- PKCE Helpers ---

function generateRandomString(length = 64) {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(values, (v) => possible[v % possible.length]).join('');
}

async function sha256(plain) {
  const encoder = new TextEncoder();
  return crypto.subtle.digest('SHA-256', encoder.encode(plain));
}

function base64urlencode(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

async function generateCodeChallenge(verifier) {
  const hashed = await sha256(verifier);
  return base64urlencode(hashed);
}

// --- Auth Flow ---

export async function initiateSpotifyLogin() {
  const codeVerifier = generateRandomString(64);
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  const state = generateRandomString(16);

  sessionStorage.setItem('spotify_code_verifier', codeVerifier);
  sessionStorage.setItem('spotify_auth_state', state);

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: SPOTIFY_CLIENT_ID,
    scope: SPOTIFY_SCOPES,
    redirect_uri: getRedirectUri(),
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
    state,
  });

  window.location.href = `${SPOTIFY_AUTH_URL}?${params.toString()}`;
}

export async function handleSpotifyCallback(urlParams) {
  const code = urlParams.get('code');
  const state = urlParams.get('state');
  const error = urlParams.get('error');

  if (error) {
    throw new Error(`Spotify authorization failed: ${error}`);
  }

  if (!code || !state) {
    throw new Error('Missing authorization code or state parameter');
  }

  const storedState = sessionStorage.getItem('spotify_auth_state');
  if (state !== storedState) {
    throw new Error('State mismatch. Please try connecting again.');
  }

  const codeVerifier = sessionStorage.getItem('spotify_code_verifier');
  if (!codeVerifier) {
    throw new Error('Missing code verifier. Please try connecting again.');
  }

  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: getRedirectUri(),
      client_id: SPOTIFY_CLIENT_ID,
      code_verifier: codeVerifier,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error_description || 'Failed to exchange authorization code');
  }

  const tokens = await response.json();

  sessionStorage.removeItem('spotify_code_verifier');
  sessionStorage.removeItem('spotify_auth_state');

  return tokens;
}

export async function refreshSpotifyToken(refreshToken) {
  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: SPOTIFY_CLIENT_ID,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh Spotify token');
  }

  return response.json();
}

// --- Supabase Token Storage ---

export async function saveSpotifyTokens(userId, tokens) {
  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

  const row = {
    user_id: userId,
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    token_expires_at: expiresAt,
    updated_at: new Date().toISOString(),
  };

  // Try upsert first (for existing rows)
  const { error } = await supabase
    .from('spotify_connections')
    .upsert(row, { onConflict: 'user_id' });

  if (error) {
    console.error('[spotify] saveSpotifyTokens failed:', error);
    throw error;
  }
}

export async function loadSpotifyTokens(userId) {
  const { data, error } = await supabase
    .from('spotify_connections')
    .select('access_token, refresh_token, token_expires_at, spotify_user_id, display_name')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('[spotify] loadSpotifyTokens failed:', error);
    throw error;
  }
  return data || null;
}

export async function deleteSpotifyConnection(userId) {
  const { error } = await supabase
    .from('spotify_connections')
    .delete()
    .eq('user_id', userId);

  if (error) throw error;
}

export async function getValidAccessToken(userId) {
  const tokens = await loadSpotifyTokens(userId);
  if (!tokens) return null;

  const expiresAt = new Date(tokens.token_expires_at).getTime();
  const now = Date.now();
  const bufferMs = 60 * 1000;

  if (expiresAt - now > bufferMs) {
    return tokens.access_token;
  }

  try {
    const refreshed = await refreshSpotifyToken(tokens.refresh_token);
    await saveSpotifyTokens(userId, {
      access_token: refreshed.access_token,
      refresh_token: refreshed.refresh_token || tokens.refresh_token,
      expires_in: refreshed.expires_in,
    });
    return refreshed.access_token;
  } catch {
    await deleteSpotifyConnection(userId);
    return null;
  }
}

// --- Spotify API ---

async function spotifyFetch(endpoint, accessToken, params = {}) {
  if (!accessToken) {
    throw Object.assign(new Error('No Spotify access token available'), { status: 401 });
  }

  //BQCY3EU0iRWUIAXkig0m3zQraogOObGT0NgVxhzYjOa3_u0oZFsZVGKxBFW3pX0G8LTTQOUCl1hm-l9b-M5--ABhnN0_J3QtZTWr-qu4xgvTOlvfT455Zj_tQbFvfGlY4D7iB-TtFa0QePoyqucXYWReP_rV5lbn6GYt4d9A6SNJu-DpOiHJAznnvrLeq7607xTGwbonTZpdAJSQBzfAIkhAMU0uyanAlww242foG9ZhuCnrb2jum4N43xqj

  console.log("ACCESS TOKEN", accessToken);

  const url = new URL(`${SPOTIFY_API_BASE}${endpoint}`);
  Object.entries(params).forEach(([k, v]) => {
    if (v != null) url.searchParams.set(k, String(v));
  });

  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (response.status === 401) {
    throw Object.assign(new Error('Spotify token expired'), { status: 401 });
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Spotify API error (${response.status})`);
  }

  return response.json();
}

export async function fetchTopArtists(accessToken, timeRange = 'short_term', limit = 50) {
  const data = await spotifyFetch('/me/top/artists', accessToken, { time_range: timeRange, limit });
  return data.items || [];
}

export async function fetchTopTracks(accessToken, timeRange = 'short_term', limit = 50) {
  const data = await spotifyFetch('/me/top/tracks', accessToken, { time_range: timeRange, limit });
  return data.items || [];
}

export async function fetchRecentlyPlayed(accessToken, limit = 50) {
  const data = await spotifyFetch('/me/player/recently-played', accessToken, { limit });
  return data.items || [];
}

// --- Data Transformations ---

export function deriveGenreBreakdown(artists) {
  const counts = {};
  for (const artist of artists) {
    for (const genre of artist.genres || []) {
      counts[genre] = (counts[genre] || 0) + 1;
    }
  }

  return Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);
}

export function estimateListeningHours(recentlyPlayed) {
  const totalMs = recentlyPlayed.reduce((sum, item) => {
    return sum + (item.track?.duration_ms || 0);
  }, 0);

  return Math.round((totalMs / (1000 * 60 * 60)) * 10) / 10;
}
