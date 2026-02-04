import express from 'express';

const router = express.Router();

const ZOHO_EVENT_REQUEST_URL =
  'https://calendar.zoho.com/eventreq/zz0801123048eba502da4d422846acf2b1b883b8d1cf743e8f02124fee436449b8776743a8d4bc9cff846adddd69e774bcc8b6c0d7';

router.post('/', async (req, res) => {
  try {
    const { name, mailId, date, time, reason } = req.body || {};

    if (!name || !mailId || !date || !time) {
      return res.status(400).json({
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
      const body = await response.text().catch(() => '');
      return res.status(502).json({
        success: false,
        message: 'Zoho scheduling request failed.',
        details: body,
      });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error('Schedule API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

export { router as scheduleRouter };
