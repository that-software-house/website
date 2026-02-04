import { getOAuthClient, storeTokensCookie, headersJson } from './_google.js'

export async function handler(event) {
  const params = event.queryStringParameters || {}
  const code = params.code

  if (!code) {
    return { statusCode: 400, headers: headersJson, body: 'Missing code' }
  }

  try {
    const oauth2Client = getOAuthClient(event)
    const { tokens } = await oauth2Client.getToken(code)

    const cookie = storeTokensCookie(tokens)
    const redirectTarget = '/projects/insightcard?connected=1'

    return {
      statusCode: 302,
      headers: {
        ...headersJson,
        Location: redirectTarget,
        'Set-Cookie': cookie,
      },
      body: '',
    }
  } catch (error) {
    console.error('OAuth callback error', error)
    return {
      statusCode: 500,
      headers: headersJson,
      body: JSON.stringify({ error: 'Token exchange failed', message: error.message }),
    }
  }
}
