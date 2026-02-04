import { google } from 'googleapis'
import {
  getOAuthClient,
  readTokensFromCookie,
  storeTokensCookie,
  headersJson,
} from './_google.js'

const responseHeaders = {
  ...headersJson,
  'Content-Type': 'application/json',
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: responseHeaders, body: '' }
  }

  try {
    const tokens = readTokensFromCookie(event.headers.cookie)
    console.log("TOKENS IS", tokens);
    if (!tokens) {
      return { statusCode: 401, headers: responseHeaders, body: JSON.stringify({ error: 'Not authenticated' }) }
    }

    const oauth2Client = getOAuthClient(event)
    oauth2Client.setCredentials(tokens)

    // Refresh if needed
    if (tokens.expiry_date && tokens.expiry_date < Date.now()) {
      const newTokens = await oauth2Client.refreshAccessToken()
      oauth2Client.setCredentials(newTokens.credentials)
    }

    const youtube = google.youtube({ version: 'v3', auth: oauth2Client })

    // Try mine:true first, then managedByMe:true for Brand Account channels.
    let channelResp = await youtube.channels.list({
      part: 'snippet,statistics',
      mine: true,
    })

    if (!channelResp.data.items?.length) {
      channelResp = await youtube.channels.list({
        part: 'snippet,statistics',
        managedByMe: true,
      })
    }

    const channel = channelResp.data.items?.[0] || null
    const channelId = channel?.id

    let analyticsData = null
    if (channelId) {
      try {
        const analytics = google.youtubeAnalytics({ version: 'v2', auth: oauth2Client })

        const today = new Date()
        const endDate = today.toISOString().slice(0, 10)
        const start = new Date()
        start.setDate(today.getDate() - 28)
        const startDate = start.toISOString().slice(0, 10)

        let analyticsResp
        try {
          analyticsResp = await analytics.reports.query({
            ids: `channel==${channelId}`,
            startDate,
            endDate,
            metrics: 'views,estimatedMinutesWatched,averageViewDuration,averageViewPercentage',
            dimensions: 'country',
            sort: '-views',
            maxResults: 5,
          })
        } catch {
          analyticsResp = await analytics.reports.query({
            ids: 'channel==MINE',
            startDate,
            endDate,
            metrics: 'views,estimatedMinutesWatched,averageViewDuration,averageViewPercentage',
            dimensions: 'country',
            sort: '-views',
            maxResults: 5,
          })
        }

        analyticsData = analyticsResp.data
      } catch (analyticsError) {
        console.warn('YouTube Analytics fetch failed (non-fatal):', analyticsError.message)
        analyticsData = { error: analyticsError.message }
      }
    } else {
      analyticsData = { error: 'No YouTube channel found for this account' }
    }

    const updatedTokens = oauth2Client.credentials
    const setCookieHeader = updatedTokens.access_token ? storeTokensCookie(updatedTokens) : undefined

    return {
      statusCode: 200,
      headers: {
        ...responseHeaders,
        ...(setCookieHeader ? { 'Set-Cookie': setCookieHeader } : {}),
      },
      body: JSON.stringify({
        channel,
        analytics: analyticsData,
      }),
    }
  } catch (error) {
    // console.error('Profile fetch error', error)
    return {
      statusCode: 500,
      headers: responseHeaders,
      body: JSON.stringify({ error: 'API request failed', message: error.message }),
    }
  }
}
