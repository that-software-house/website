import { buildAuthUrl, headersJson } from './_google.js'

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: headersJson, body: '' }
  }

  try {
    const url = buildAuthUrl(event, 'insightcard')
    return {
      statusCode: 302,
      headers: {
        ...headersJson,
        Location: url,
      },
      body: '',
    }
  } catch (error) {
    console.error('Auth redirect error', error)
    return {
      statusCode: 500,
      headers: headersJson,
      body: JSON.stringify({ error: 'Failed to start auth', message: error.message }),
    }
  }
}
