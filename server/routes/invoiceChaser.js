import crypto from 'crypto';
import fs from 'fs';
import express from 'express';
import formidable from 'formidable';
import { run } from '@openai/agents';
import { invoiceDraftAgent } from '../agents/invoiceChaserAgents.js';

export const invoiceChaserRouter = express.Router();

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_ROWS = 2000;

const SUPPORTED_TYPES = [
  'text/csv',
  'application/json',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'application/octet-stream',
];

const SUPPORTED_EXTS = ['.csv', '.json', '.xlsx', '.xls'];
const ACTIVE_STATUS = new Set(['open', 'overdue', 'partial']);
const ALLOWED_ACTIONS = new Set([
  'copied',
  'sent',
  'paid',
  'promise_to_pay',
  'promise_broken',
  'note',
]);

const queueStore = new Map();

const FIELD_ALIASES = {
  invoiceId: [
    'invoiceid',
    'invoice',
    'invoicenumber',
    'invoiceno',
    'invoicenum',
    'documentnumber',
    'number',
    'id',
  ],
  customerName: [
    'customer',
    'customername',
    'client',
    'clientname',
    'company',
    'accountname',
    'name',
  ],
  customerEmail: ['email', 'customeremail', 'clientemail', 'billingemail', 'contactemail'],
  amountDue: [
    'amountdue',
    'balancedue',
    'outstanding',
    'outstandingamount',
    'dueamount',
    'balance',
    'amount',
    'totaldue',
  ],
  dueDate: ['duedate', 'paymentdue', 'date_due', 'duedt'],
  issueDate: ['issuedate', 'invoicedate', 'date', 'dateissued'],
  status: ['status', 'invoicestatus', 'paymentstatus'],
  lastContactDate: ['lastcontact', 'lastfollowup', 'lastreminder', 'followupdate'],
  currency: ['currency', 'curr', 'currencycode'],
  notes: ['notes', 'memo', 'description', 'comment'],
};

function normalizeHeaderName(name = '') {
  return String(name).toLowerCase().replace(/[^a-z0-9]/g, '');
}

function mapRowKeys(row) {
  const mapped = new Map();
  Object.entries(row || {}).forEach(([key, value]) => {
    mapped.set(normalizeHeaderName(key), value);
  });
  return mapped;
}

function pickField(rowMap, aliasList = []) {
  for (const alias of aliasList) {
    if (rowMap.has(alias)) {
      const value = rowMap.get(alias);
      if (value !== undefined && value !== null && String(value).trim() !== '') {
        return value;
      }
    }
  }

  // Secondary fallback for slightly mismatched export columns.
  for (const [key, value] of rowMap.entries()) {
    if (aliasList.some((alias) => key.includes(alias) || alias.includes(key))) {
      if (value !== undefined && value !== null && String(value).trim() !== '') {
        return value;
      }
    }
  }

  return '';
}

function parseMoney(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (!value) return 0;

  const raw = String(value).trim();
  if (!raw) return 0;

  const negativeByParens = raw.includes('(') && raw.includes(')');
  const normalized = raw.replace(/,/g, '').replace(/[^0-9.\-()]/g, '');
  const stripped = normalized.replace(/[()]/g, '');
  const parsed = parseFloat(stripped);

  if (!Number.isFinite(parsed)) return 0;
  return negativeByParens ? -Math.abs(parsed) : parsed;
}

function parseCurrency(value, fallback = 'USD') {
  if (!value && value !== 0) return fallback;
  const str = String(value).trim();
  if (!str) return fallback;

  const upper = str.toUpperCase();
  if (/^[A-Z]{3}$/.test(upper)) return upper;
  if (str.includes('$')) return 'USD';
  if (str.includes('€')) return 'EUR';
  if (str.includes('£')) return 'GBP';

  return fallback;
}

function parseDate(value) {
  if (!value && value !== 0) return null;

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  const str = String(value).trim();
  if (!str) return null;

  const parsed = new Date(str);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function toISODate(date) {
  if (!date) return null;
  return date.toISOString();
}

function daysOverdueFromISO(dueDateISO) {
  if (!dueDateISO) return 0;
  const due = new Date(dueDateISO);
  if (Number.isNaN(due.getTime())) return 0;

  const now = new Date();
  const dueStart = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  const nowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffMs = nowStart.getTime() - dueStart.getTime();

  return Math.max(0, Math.floor(diffMs / (24 * 60 * 60 * 1000)));
}

function normalizeStatus(statusValue) {
  const status = String(statusValue || '').toLowerCase();

  if (!status) return 'open';
  if (/paid|settled|closed|complete/.test(status)) return 'paid';
  if (/partial/.test(status)) return 'partial';
  if (/void|cancel|draft/.test(status)) return 'inactive';
  if (/overdue|pastdue|late/.test(status)) return 'overdue';

  return 'open';
}

function calculateHistoryWeight(history = []) {
  if (!Array.isArray(history) || history.length === 0) return 0;

  const sentCount = history.filter((h) => h.actionType === 'sent').length;
  const copiedCount = history.filter((h) => h.actionType === 'copied').length;
  const promiseBrokenCount = history.filter((h) => h.actionType === 'promise_broken').length;
  const promiseToPayCount = history.filter((h) => h.actionType === 'promise_to_pay').length;
  const paidCount = history.filter((h) => h.actionType === 'paid').length;

  let score = sentCount * 7 + copiedCount * 3 + promiseBrokenCount * 18;
  score -= promiseToPayCount * 6;

  if (paidCount > 0) {
    score -= 100;
  }

  const lastAction = history[history.length - 1];
  if (lastAction?.timestamp) {
    const daysSinceLastAction = daysOverdueFromISO(lastAction.timestamp);
    if (daysSinceLastAction <= 1) {
      score -= 8;
    }
  }

  return score;
}

function rankInvoice(invoice) {
  const daysOverdue = daysOverdueFromISO(invoice.dueDate);
  const amountDue = Number(invoice.amountDue || 0);
  const historyWeight = calculateHistoryWeight(invoice.history || []);

  let score = 0;
  score += Math.min(daysOverdue, 120) * 0.6;

  if (amountDue >= 10000) score += 20;
  else if (amountDue >= 5000) score += 14;
  else if (amountDue >= 2500) score += 10;
  else if (amountDue >= 1000) score += 6;
  else if (amountDue > 0) score += 2;

  if (!invoice.customerEmail) score += 10;
  if (invoice.status === 'partial') score += 7;

  if (invoice.lastContactDate) {
    const lastTouchAge = daysOverdueFromISO(invoice.lastContactDate);
    if (lastTouchAge >= 14) score += 8;
  } else {
    score += 5;
  }

  score += historyWeight;
  score = Math.max(0, Math.min(100, Math.round(score)));

  let riskTier = 'low';
  if (score >= 70) riskTier = 'high';
  else if (score >= 40) riskTier = 'medium';

  const reasons = [];
  if (daysOverdue >= 30) reasons.push(`${daysOverdue} days overdue`);
  if (amountDue >= 5000) reasons.push('High balance due');
  if (!invoice.customerEmail) reasons.push('Missing billing email');
  if ((invoice.history || []).some((h) => h.actionType === 'promise_broken')) {
    reasons.push('Broken payment promise');
  }
  if (reasons.length === 0) {
    reasons.push('Normal overdue monitoring');
  }

  let nextAction = 'Send a friendly reminder and request a payment date.';
  if (riskTier === 'medium') {
    nextAction = 'Send a firm reminder with a clear due-by date.';
  } else if (riskTier === 'high') {
    nextAction = 'Escalate with final notice and same-day follow-up.';
  }

  return {
    ...invoice,
    daysOverdue,
    priorityScore: score,
    riskTier,
    riskReasons: reasons,
    nextAction,
  };
}

function isInvoiceActive(invoice) {
  const status = invoice.status || 'open';
  return (
    ACTIVE_STATUS.has(status) &&
    Number(invoice.amountDue || 0) > 0 &&
    Number(invoice.daysOverdue || 0) > 0
  );
}

function reprioritizeQueue(queueRecord) {
  const enriched = queueRecord.invoices.map((invoice) => rankInvoice(invoice));

  queueRecord.invoices = enriched;
  queueRecord.prioritizedInvoices = enriched
    .filter((invoice) => isInvoiceActive(invoice))
    .sort((a, b) => {
      if (b.priorityScore !== a.priorityScore) return b.priorityScore - a.priorityScore;
      if (b.daysOverdue !== a.daysOverdue) return b.daysOverdue - a.daysOverdue;
      return Number(b.amountDue || 0) - Number(a.amountDue || 0);
    });

  queueRecord.lastPrioritizedAt = new Date().toISOString();
}

function summarizeQueue(queueRecord) {
  const queue = queueRecord.prioritizedInvoices || [];
  const totalsByTier = {
    high: queue.filter((x) => x.riskTier === 'high').length,
    medium: queue.filter((x) => x.riskTier === 'medium').length,
    low: queue.filter((x) => x.riskTier === 'low').length,
  };

  const totalAmountDue = queue.reduce((sum, invoice) => sum + Number(invoice.amountDue || 0), 0);

  const currencyBreakdown = {};
  queue.forEach((invoice) => {
    const currency = invoice.currency || 'USD';
    currencyBreakdown[currency] = (currencyBreakdown[currency] || 0) + Number(invoice.amountDue || 0);
  });

  return {
    totalOverdueInvoices: queue.length,
    totalsByTier,
    totalAmountDue,
    currencyBreakdown,
    recoveredInvoices: queueRecord.invoices.filter((x) => x.status === 'paid').length,
    lastPrioritizedAt: queueRecord.lastPrioritizedAt,
  };
}

function parseCSV(content) {
  const lines = content.trim().split(/\r?\n/);
  if (lines.length === 0) return { headers: [], rows: [] };

  const parseRow = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  };

  const headers = parseRow(lines[0]);
  const rows = lines.slice(1).map((line) => {
    const values = parseRow(line);
    const row = {};

    headers.forEach((header, index) => {
      row[header] = values[index] ?? '';
    });

    return row;
  });

  return { headers, rows };
}

function parseJSON(content) {
  const data = JSON.parse(content);
  const rows = Array.isArray(data) ? data : data.data || data.rows || [data];
  const safeRows = rows.filter((row) => row && typeof row === 'object');

  if (safeRows.length === 0) return { headers: [], rows: [] };

  const headers = Object.keys(safeRows[0]);
  return { headers, rows: safeRows };
}

async function parseExcel(buffer) {
  const XLSX = await import('xlsx');
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const firstSheetName = workbook.SheetNames[0];
  const firstSheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json(firstSheet);

  if (!rows || rows.length === 0) return { headers: [], rows: [] };
  return { headers: Object.keys(rows[0]), rows };
}

function normalizeRowsToInvoices(rows = []) {
  const dedup = new Map();

  rows.slice(0, MAX_ROWS).forEach((row, index) => {
    const rowMap = mapRowKeys(row);

    const invoiceIdRaw = pickField(rowMap, FIELD_ALIASES.invoiceId) || `INV-${index + 1}`;
    const invoiceId = String(invoiceIdRaw).trim();

    const customerName = String(
      pickField(rowMap, FIELD_ALIASES.customerName) || 'Unknown Customer'
    ).trim();
    const customerEmail = String(pickField(rowMap, FIELD_ALIASES.customerEmail) || '').trim();

    const amountRaw = pickField(rowMap, FIELD_ALIASES.amountDue);
    const amountDue = Math.max(0, parseMoney(amountRaw));

    const currencyRaw = pickField(rowMap, FIELD_ALIASES.currency);
    const currency = parseCurrency(currencyRaw || amountRaw || 'USD');

    const dueDateRaw = pickField(rowMap, FIELD_ALIASES.dueDate);
    const issueDateRaw = pickField(rowMap, FIELD_ALIASES.issueDate);
    const statusRaw = pickField(rowMap, FIELD_ALIASES.status);
    const lastContactRaw = pickField(rowMap, FIELD_ALIASES.lastContactDate);
    const notes = String(pickField(rowMap, FIELD_ALIASES.notes) || '').trim();

    const issueDate = parseDate(issueDateRaw);
    const dueDate = parseDate(dueDateRaw) || (issueDate ? new Date(issueDate.getTime() + 30 * 24 * 60 * 60 * 1000) : null);
    const lastContactDate = parseDate(lastContactRaw);

    const invoice = {
      invoiceId,
      invoiceKey: '',
      customerName,
      customerEmail,
      amountDue,
      currency,
      dueDate: toISODate(dueDate),
      issueDate: toISODate(issueDate),
      status: normalizeStatus(statusRaw),
      lastContactDate: toISODate(lastContactDate),
      notes,
      history: [],
    };

    invoice.daysOverdue = daysOverdueFromISO(invoice.dueDate);

    if (!invoice.dueDate || invoice.daysOverdue <= 0) return;
    if (invoice.amountDue <= 0) return;
    if (!ACTIVE_STATUS.has(invoice.status)) return;

    const dedupKey = `${invoice.invoiceId}::${invoice.customerName}`;
    invoice.invoiceKey = dedupKey;
    const existing = dedup.get(dedupKey);

    if (!existing) {
      dedup.set(dedupKey, invoice);
      return;
    }

    // Keep the higher-risk row if there are duplicates in the export.
    if (
      invoice.daysOverdue > existing.daysOverdue ||
      invoice.amountDue > existing.amountDue
    ) {
      dedup.set(dedupKey, invoice);
    }
  });

  return Array.from(dedup.values());
}

function cleanJsonText(text = '') {
  let cleaned = String(text).trim();
  if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
  else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
  if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
  return cleaned.trim();
}

function fallbackDrafts(invoice) {
  const amount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: invoice.currency || 'USD',
    maximumFractionDigits: 2,
  }).format(Number(invoice.amountDue || 0));

  const baseContext = `Invoice ${invoice.invoiceId} is ${invoice.daysOverdue} days overdue for ${amount}.`;

  return {
    friendly: {
      subject: `Friendly reminder: Invoice ${invoice.invoiceId}`,
      body: `Hi ${invoice.customerName},\n\nHope you're doing well. ${baseContext} Could you confirm the payment date when you have a moment?\n\nIf payment has already been sent, please share the remittance details so we can update our records.\n\nThank you,`,
    },
    firm: {
      subject: `Action needed: Invoice ${invoice.invoiceId} is overdue`,
      body: `Hi ${invoice.customerName},\n\nFollowing up on ${invoice.invoiceId}. It is currently ${invoice.daysOverdue} days past due with an outstanding balance of ${amount}.\n\nPlease process payment within the next 3 business days and reply with confirmation. If there is a blocker, let us know today so we can resolve it quickly.\n\nBest,`,
    },
    final: {
      subject: `Final notice: Invoice ${invoice.invoiceId}`,
      body: `Hi ${invoice.customerName},\n\nThis is a final reminder regarding ${invoice.invoiceId}. The invoice remains unpaid at ${amount} and is ${invoice.daysOverdue} days overdue.\n\nPlease complete payment within 48 hours or reply with a concrete payment commitment date by end of day.\n\nThank you for your immediate attention,`,
    },
  };
}

function parseDraftOutput(text, invoice) {
  try {
    const parsed = JSON.parse(cleanJsonText(text));

    const tones = ['friendly', 'firm', 'final'];
    const valid = tones.every(
      (tone) =>
        parsed?.[tone] &&
        typeof parsed[tone].subject === 'string' &&
        typeof parsed[tone].body === 'string'
    );

    if (!valid) return fallbackDrafts(invoice);

    return {
      friendly: {
        subject: parsed.friendly.subject.trim(),
        body: parsed.friendly.body.trim(),
      },
      firm: {
        subject: parsed.firm.subject.trim(),
        body: parsed.firm.body.trim(),
      },
      final: {
        subject: parsed.final.subject.trim(),
        body: parsed.final.body.trim(),
      },
    };
  } catch {
    return fallbackDrafts(invoice);
  }
}

invoiceChaserRouter.post('/upload', async (req, res) => {
  const form = formidable({ multiples: false, maxFileSize: MAX_FILE_SIZE });

  form.parse(req, async (err, _fields, files) => {
    try {
      if (err) {
        return res.status(400).json({ error: 'Upload failed', message: err.message });
      }

      const fileData = files.file;
      const file = Array.isArray(fileData) ? fileData[0] : fileData;

      if (!file) {
        return res.status(400).json({ error: 'Invalid request', message: 'File is required' });
      }

      const filename = String(file.originalFilename || '').toLowerCase();
      const mimetype = String(file.mimetype || '').toLowerCase();
      const hasSupportedExt = SUPPORTED_EXTS.some((ext) => filename.endsWith(ext));
      const hasSupportedType = SUPPORTED_TYPES.includes(mimetype);

      if (!hasSupportedExt && !hasSupportedType) {
        return res.status(400).json({
          error: 'Unsupported file',
          message: 'Please upload a CSV, JSON, or Excel invoice export',
        });
      }

      const buffer = await fs.promises.readFile(file.filepath);
      let parsed = { headers: [], rows: [] };

      if (filename.endsWith('.csv') || mimetype === 'text/csv') {
        parsed = parseCSV(buffer.toString('utf-8'));
      } else if (filename.endsWith('.json') || mimetype === 'application/json') {
        parsed = parseJSON(buffer.toString('utf-8'));
      } else {
        parsed = await parseExcel(buffer);
      }

      if (!parsed.rows || parsed.rows.length === 0) {
        return res.status(400).json({
          error: 'Empty file',
          message: 'The uploaded export has no rows to process',
        });
      }

      const invoices = normalizeRowsToInvoices(parsed.rows);
      if (invoices.length === 0) {
        return res.status(400).json({
          error: 'No overdue invoices found',
          message: 'No actionable overdue invoices were detected in the export',
        });
      }

      const queueId = crypto.randomUUID();
      const queueRecord = {
        id: queueId,
        sourceFileName: file.originalFilename || 'invoice-export',
        createdAt: new Date().toISOString(),
        invoices,
        prioritizedInvoices: [],
        actions: [],
        lastPrioritizedAt: null,
      };

      reprioritizeQueue(queueRecord);
      queueStore.set(queueId, queueRecord);

      return res.json({
        queueId,
        summary: summarizeQueue(queueRecord),
        queue: queueRecord.prioritizedInvoices,
        sourceFileName: queueRecord.sourceFileName,
        generatedAt: queueRecord.lastPrioritizedAt,
      });
    } catch (error) {
      console.error('Invoice upload error:', error);
      return res.status(500).json({
        error: 'Queue generation failed',
        message: error.message,
      });
    }
  });
});

invoiceChaserRouter.post('/drafts', async (req, res) => {
  try {
    const { queueId, invoiceId, invoiceKey } = req.body || {};

    if (!queueId || (!invoiceId && !invoiceKey)) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'queueId and invoiceKey (or invoiceId) are required',
      });
    }

    const queueRecord = queueStore.get(queueId);
    if (!queueRecord) {
      return res.status(404).json({
        error: 'Queue not found',
        message: 'Upload an invoice export first',
      });
    }

    reprioritizeQueue(queueRecord);

    const invoice = invoiceKey
      ? queueRecord.invoices.find((row) => row.invoiceKey === invoiceKey)
      : queueRecord.invoices.find((row) => row.invoiceId === invoiceId);
    if (!invoice) {
      return res.status(404).json({
        error: 'Invoice not found',
        message: 'The selected invoice is not in this queue',
      });
    }

    const historySummary = (invoice.history || [])
      .slice(-5)
      .map((h) => `${h.timestamp}: ${h.actionType}${h.notes ? ` (${h.notes})` : ''}`)
      .join('\n') || 'No prior follow-up activity logged.';

    const prompt = `Generate collection drafts for this invoice:\n
Invoice ID: ${invoice.invoiceId}\nCustomer: ${invoice.customerName}\nCustomer Email: ${invoice.customerEmail || 'Not provided'}\nAmount Due: ${invoice.amountDue} ${invoice.currency || 'USD'}\nDays Overdue: ${invoice.daysOverdue}\nRisk Tier: ${invoice.riskTier}\nSuggested Next Action: ${invoice.nextAction}\nRecent Follow-up History:\n${historySummary}`;

    const result = await run(invoiceDraftAgent, prompt);
    const drafts = parseDraftOutput(result.finalOutput, invoice);

    return res.json({
      queueId,
      invoiceId: invoice.invoiceId,
      invoiceKey: invoice.invoiceKey,
      drafts,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Invoice draft generation error:', error);
    return res.status(500).json({
      error: 'Draft generation failed',
      message: error.message,
    });
  }
});

invoiceChaserRouter.post('/actions', (req, res) => {
  try {
    const {
      queueId,
      invoiceId,
      invoiceKey,
      actionType,
      tone = null,
      channel = 'email',
      subject = null,
      body = null,
      notes = null,
    } = req.body || {};

    if (!queueId || (!invoiceId && !invoiceKey) || !actionType) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'queueId, invoiceKey (or invoiceId), and actionType are required',
      });
    }

    if (!ALLOWED_ACTIONS.has(actionType)) {
      return res.status(400).json({
        error: 'Invalid action',
        message: `actionType must be one of: ${Array.from(ALLOWED_ACTIONS).join(', ')}`,
      });
    }

    const queueRecord = queueStore.get(queueId);
    if (!queueRecord) {
      return res.status(404).json({
        error: 'Queue not found',
        message: 'Upload an invoice export first',
      });
    }

    const invoice = invoiceKey
      ? queueRecord.invoices.find((row) => row.invoiceKey === invoiceKey)
      : queueRecord.invoices.find((row) => row.invoiceId === invoiceId);
    if (!invoice) {
      return res.status(404).json({
        error: 'Invoice not found',
        message: 'The selected invoice is not in this queue',
      });
    }

    const action = {
      id: crypto.randomUUID(),
      invoiceId: invoice.invoiceId,
      invoiceKey: invoice.invoiceKey,
      actionType,
      tone,
      channel,
      subject,
      body,
      notes,
      timestamp: new Date().toISOString(),
    };

    invoice.history = [...(invoice.history || []), action];
    queueRecord.actions.push(action);

    if (actionType === 'copied' || actionType === 'sent') {
      invoice.lastContactDate = action.timestamp;
    }

    if (actionType === 'paid') {
      invoice.status = 'paid';
      invoice.amountDue = 0;
    }

    if (actionType === 'promise_to_pay') {
      invoice.status = 'partial';
      invoice.lastContactDate = action.timestamp;
    }

    if (actionType === 'promise_broken') {
      invoice.status = 'overdue';
    }

    reprioritizeQueue(queueRecord);

    return res.json({
      success: true,
      action,
      invoice,
      summary: summarizeQueue(queueRecord),
      queue: queueRecord.prioritizedInvoices,
      recentActions: queueRecord.actions.slice(-30).reverse(),
    });
  } catch (error) {
    console.error('Invoice action logging error:', error);
    return res.status(500).json({
      error: 'Action logging failed',
      message: error.message,
    });
  }
});

invoiceChaserRouter.get('/queue/:queueId', (req, res) => {
  try {
    const { queueId } = req.params;
    const queueRecord = queueStore.get(queueId);

    if (!queueRecord) {
      return res.status(404).json({
        error: 'Queue not found',
        message: 'Upload an invoice export first',
      });
    }

    reprioritizeQueue(queueRecord);

    return res.json({
      queueId,
      sourceFileName: queueRecord.sourceFileName,
      createdAt: queueRecord.createdAt,
      summary: summarizeQueue(queueRecord),
      queue: queueRecord.prioritizedInvoices,
      recentActions: queueRecord.actions.slice(-30).reverse(),
    });
  } catch (error) {
    console.error('Invoice queue fetch error:', error);
    return res.status(500).json({
      error: 'Queue fetch failed',
      message: error.message,
    });
  }
});
