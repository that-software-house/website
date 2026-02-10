import { jsonResponse, methodNotAllowed, optionsResponse } from './_lib/http.js';

const ZOHO_EVENT_REQUEST_URL =
  'https://calendar.zoho.com/eventreq/zz0801123048eba502da4d422846acf2b1b883b8d1cf743e8f02124fee436449b8776743a8d4bc9cff846adddd69e774bcc8b6c0d7';

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return optionsResponse();
  if (event.httpMethod !== 'POST') return methodNotAllowed();

  try {
    const { name, mailId, date, time, reason } = JSON.parse(event.body || '{}');

    if (!name || !mailId || !date || !time) {
      return jsonResponse(400, {
        success: false,
        message: 'Name, email, date, and time are required.',
      });
    }

    const params = new URLSearchParams({
      name,
      mailId,
      date,
      time,
      reason: reason || 'General meeting',
    });

    const response = await fetch(`${ZOHO_EVENT_REQUEST_URL}?${params.toString()}`, {
      method: 'GET',
    });

    if (!response.ok) {
      const details = await response.text().catch(() => '');
      return jsonResponse(502, {
        success: false,
        message: 'Zoho scheduling request failed.',
        details,
      });
    }

    return jsonResponse(200, { success: true });
  } catch (error) {
    return jsonResponse(500, {
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
}
