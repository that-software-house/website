import crypto from 'crypto';
import zlib from 'zlib';
import { Agent, run, setOpenAIAPI } from '@openai/agents';
import { parseMultipart } from './_lib/multipart.js';
import { consumeRateLimit } from './_lib/rateLimit.js';
import { extractSubpath, jsonResponse, methodNotAllowed, optionsResponse } from './_lib/http.js';

setOpenAIAPI('chat_completions');

const invoiceDraftAgent = new Agent({
  name: 'Invoice Follow-up Drafter',
  model: 'gpt-4o-mini',
  instructions: `You are an accounts receivable collections specialist.

Generate 3 short, high-conversion email drafts to collect overdue invoices:
1) friendly reminder
2) firm reminder
3) final notice

Rules:
- Keep each email 90-170 words.
- Be clear, professional, and respectful.
- Mention invoice ID, overdue days, and amount due.
- Include a concrete CTA with a payment timeframe.
- Avoid legal threats or abusive language.
- Preserve factual details exactly as provided.

Output JSON ONLY:
{
  "friendly": { "subject": "...", "body": "..." },
  "firm": { "subject": "...", "body": "..." },
  "final": { "subject": "...", "body": "..." }
}`,
});

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_ROWS = 2000;
const SUPPORTED_TYPES = [
  'text/csv',
  'application/json',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'application/pdf',
  'application/octet-stream',
];
const SUPPORTED_EXTS = ['.csv', '.json', '.xlsx', '.xls', '.pdf'];
const ACTIVE_STATUS = new Set(['open', 'overdue', 'partial']);
const ALLOWED_ACTIONS = new Set(['copied', 'sent', 'paid', 'promise_to_pay', 'promise_broken', 'note']);

const queueStore = globalThis.__INVOICE_CHASER_QUEUE_STORE__ || new Map();
globalThis.__INVOICE_CHASER_QUEUE_STORE__ = queueStore;
const MONTH_NAME_PATTERN = '(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)';
const DATE_PATTERN = `\\b(?:\\d{1,2}[/-]\\d{1,2}[/-]\\d{2,4}|${MONTH_NAME_PATTERN}\\s+\\d{1,2},\\s+\\d{4})\\b`;
const MONEY_PATTERN = '[$€£]\\s*\\(?-?\\d[\\d,]*(?:\\.\\d{2})?\\)?|\\(?-?\\d[\\d,]*\\.\\d{2}\\)?';
const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;

const FIELD_ALIASES = {
  invoiceId: ['invoiceid', 'invoice', 'invoicenumber', 'invoiceno', 'invoicenum', 'documentnumber', 'number', 'id'],
  customerName: ['customer', 'customername', 'client', 'clientname', 'company', 'accountname', 'name'],
  customerEmail: ['email', 'customeremail', 'clientemail', 'billingemail', 'contactemail'],
  amountDue: ['amountdue', 'balancedue', 'outstanding', 'outstandingamount', 'dueamount', 'balance', 'amount', 'totaldue'],
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

function pickField(rowMap, aliases = []) {
  for (const alias of aliases) {
    if (rowMap.has(alias)) {
      const value = rowMap.get(alias);
      if (value !== undefined && value !== null && String(value).trim() !== '') {
        return value;
      }
    }
  }

  for (const [key, value] of rowMap.entries()) {
    if (aliases.some((alias) => key.includes(alias) || alias.includes(key))) {
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

  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;

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

  const sentCount = history.filter((x) => x.actionType === 'sent').length;
  const copiedCount = history.filter((x) => x.actionType === 'copied').length;
  const promiseBrokenCount = history.filter((x) => x.actionType === 'promise_broken').length;
  const promiseToPayCount = history.filter((x) => x.actionType === 'promise_to_pay').length;
  const paidCount = history.filter((x) => x.actionType === 'paid').length;

  let score = sentCount * 7 + copiedCount * 3 + promiseBrokenCount * 18;
  score -= promiseToPayCount * 6;

  if (paidCount > 0) score -= 100;

  const lastAction = history[history.length - 1];
  if (lastAction?.timestamp) {
    const daysSinceLast = daysOverdueFromISO(lastAction.timestamp);
    if (daysSinceLast <= 1) score -= 8;
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
    const touchAge = daysOverdueFromISO(invoice.lastContactDate);
    if (touchAge >= 14) score += 8;
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
  if ((invoice.history || []).some((x) => x.actionType === 'promise_broken')) {
    reasons.push('Broken payment promise');
  }
  if (reasons.length === 0) reasons.push('Normal overdue monitoring');

  let nextAction = 'Send a friendly reminder and request a payment date.';
  if (riskTier === 'medium') nextAction = 'Send a firm reminder with a clear due-by date.';
  if (riskTier === 'high') nextAction = 'Escalate with final notice and same-day follow-up.';

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
  return ACTIVE_STATUS.has(status) && Number(invoice.amountDue || 0) > 0 && Number(invoice.daysOverdue || 0) > 0;
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
          i += 1;
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
  return { headers: Object.keys(safeRows[0]), rows: safeRows };
}

async function parseExcel(buffer) {
  const XLSX = await import('xlsx');
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet);

  if (!rows || rows.length === 0) return { headers: [], rows: [] };
  return { headers: Object.keys(rows[0]), rows };
}

function decodePdfLiteralString(value = '') {
  return String(value)
    .replace(/\\([0-7]{1,3})/g, (_match, octal) => String.fromCharCode(parseInt(octal, 8)))
    .replace(/\\([nrtbf()\\])/g, (_match, escaped) => {
      if (escaped === 'n') return '\n';
      if (escaped === 'r') return '\r';
      if (escaped === 't') return '\t';
      if (escaped === 'b') return '\b';
      if (escaped === 'f') return '\f';
      return escaped;
    });
}

function decodePdfHexString(value = '') {
  const cleaned = String(value).replace(/[^A-Fa-f0-9]/g, '');
  if (!cleaned) return '';

  const normalized = cleaned.length % 2 === 0 ? cleaned : `${cleaned}0`;
  const bytes = [];
  for (let index = 0; index < normalized.length; index += 2) {
    const byte = parseInt(normalized.slice(index, index + 2), 16);
    if (Number.isFinite(byte)) bytes.push(byte);
  }

  return Buffer.from(bytes).toString('latin1');
}

function extractTextFromPdfBuffer(buffer) {
  if (!buffer || buffer.length === 0) return '';

  const raw = buffer.toString('latin1');
  const segments = [raw];

  let cursor = 0;
  while (cursor < raw.length) {
    const streamStart = raw.indexOf('stream', cursor);
    if (streamStart === -1) break;

    let dataStart = streamStart + 6;
    if (raw[dataStart] === '\r' && raw[dataStart + 1] === '\n') dataStart += 2;
    else if (raw[dataStart] === '\n') dataStart += 1;

    const streamEnd = raw.indexOf('endstream', dataStart);
    if (streamEnd === -1) break;

    const dictStart = raw.lastIndexOf('<<', streamStart);
    const dictEnd = raw.lastIndexOf('>>', streamStart);
    const dictText =
      dictStart !== -1 && dictEnd !== -1 && dictEnd > dictStart
        ? raw.slice(dictStart, dictEnd + 2)
        : '';

    if (/FlateDecode/i.test(dictText)) {
      try {
        let compressed = buffer.subarray(dataStart, streamEnd);
        while (
          compressed.length > 0 &&
          (compressed[compressed.length - 1] === 0x0a || compressed[compressed.length - 1] === 0x0d)
        ) {
          compressed = compressed.subarray(0, compressed.length - 1);
        }

        const inflated = zlib.inflateSync(compressed);
        segments.push(inflated.toString('latin1'));
      } catch {
        // Ignore stream inflate failures and continue with available text.
      }
    }

    cursor = streamEnd + 'endstream'.length;
  }

  const combined = segments.join('\n');
  const literalText = (combined.match(/\((?:\\.|[^\\()])*\)/g) || [])
    .map((token) => decodePdfLiteralString(token.slice(1, -1)))
    .join('\n');
  const hexText = [...combined.matchAll(/<([A-Fa-f0-9]{4,})>/g)]
    .map((match) => decodePdfHexString(match[1]))
    .join('\n');
  const plainText = combined.replace(/[^\x09\x0A\x0D\x20-\x7E]/g, ' ');

  return `${literalText}\n${hexText}\n${plainText}`
    .replace(/\u0000/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function sanitizeInvoiceId(value = '') {
  const candidate = String(value)
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')[0]
    .replace(/^[#:\-]+/, '')
    .replace(/[^A-Za-z0-9/_-]/g, '')
    .trim();

  if (!candidate) return '';
  if (/^(date|amount|due|invoice|total)$/i.test(candidate)) return '';
  return candidate;
}

function extractLabeledValue(lines = [], labels = []) {
  for (let i = 0; i < lines.length; i += 1) {
    const line = String(lines[i] || '');
    const lower = line.toLowerCase();

    for (const label of labels) {
      const labelLower = label.toLowerCase();
      const index = lower.indexOf(labelLower);
      if (index === -1) continue;

      const suffix = line
        .slice(index + labelLower.length)
        .replace(/^[\s:#-]+/, '')
        .trim();
      if (suffix) return suffix;

      const nextLine = String(lines[i + 1] || '').trim();
      if (nextLine && !/:\s*$/.test(nextLine)) {
        return nextLine;
      }
    }
  }

  return '';
}

function extractDateFromText(text = '') {
  const match = String(text).match(new RegExp(DATE_PATTERN, 'i'));
  return match ? match[0] : '';
}

function extractLargestMoneyToken(text = '') {
  const tokens = [...String(text).matchAll(new RegExp(MONEY_PATTERN, 'g'))].map((match) => match[0]);
  if (tokens.length === 0) return '';

  return tokens.reduce((bestToken, token) => {
    const amount = Math.abs(parseMoney(token));
    const bestAmount = Math.abs(parseMoney(bestToken));
    return amount > bestAmount ? token : bestToken;
  }, tokens[0]);
}

function extractAmountFromLines(lines = []) {
  const labeledAmount = extractLargestMoneyToken(
    extractLabeledValue(lines, [
      'amount due',
      'balance due',
      'total due',
      'total amount due',
      'outstanding balance',
      'amount outstanding',
      'balance',
    ])
  );
  if (labeledAmount) return labeledAmount;

  let bestToken = '';
  let bestAmount = 0;
  for (const line of lines) {
    if (!/(amount|balance|total|due|outstanding)/i.test(line)) continue;
    const token = extractLargestMoneyToken(line);
    if (!token) continue;

    const numeric = Math.abs(parseMoney(token));
    if (numeric > bestAmount) {
      bestAmount = numeric;
      bestToken = token;
    }
  }

  if (bestToken) return bestToken;
  return extractLargestMoneyToken(lines.join(' '));
}

function extractCustomerNameFromLines(lines = [], customerEmail = '') {
  const labeledName = extractLabeledValue(lines, [
    'bill to',
    'customer name',
    'customer',
    'client',
    'company',
    'account name',
  ]);
  if (labeledName && !labeledName.includes('@')) {
    return labeledName.replace(/\s+/g, ' ').trim();
  }

  if (customerEmail) {
    const emailLower = customerEmail.toLowerCase();
    const emailLineIndex = lines.findIndex((line) => line.toLowerCase().includes(emailLower));
    if (emailLineIndex > 0) {
      const candidate = String(lines[emailLineIndex - 1] || '').replace(/\s+/g, ' ').trim();
      if (candidate && !candidate.includes('@') && !/invoice|amount|due/i.test(candidate)) {
        return candidate;
      }
    }
  }

  return 'Unknown Customer';
}

async function parsePDF(buffer, sourceFileName = 'invoice-pdf') {
  const text = extractTextFromPdfBuffer(buffer);
  if (!text) return { headers: [], rows: [] };

  const lines = text
    .split(/\r?\n| {2,}/)
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean);

  const filenameSeed = String(sourceFileName || 'invoice-pdf')
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/[^A-Za-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const fallbackInvoiceId = filenameSeed || `PDF-${Date.now()}`;

  const labeledInvoiceId = sanitizeInvoiceId(
    extractLabeledValue(lines, [
      'invoice number',
      'invoice no',
      'invoice #',
      'invoice id',
      'invoice',
      'reference',
    ])
  );
  const regexInvoiceId = sanitizeInvoiceId(
    text.match(/\b(?:INV|INVOICE)[-\s#]*([A-Z0-9][A-Z0-9-]{2,})\b/i)?.[1] || ''
  );

  const customerEmail = String(text.match(EMAIL_PATTERN)?.[0] || '').trim();
  const customerName = extractCustomerNameFromLines(lines, customerEmail);
  const amountToken = extractAmountFromLines(lines);

  const allDates = [...text.matchAll(new RegExp(DATE_PATTERN, 'gi'))].map((match) => match[0]);
  const issueDate =
    extractDateFromText(
      extractLabeledValue(lines, ['invoice date', 'issue date', 'date issued', 'statement date'])
    ) ||
    extractDateFromText(extractLabeledValue(lines, ['date'])) ||
    allDates[0] ||
    '';

  let dueDate =
    extractDateFromText(extractLabeledValue(lines, ['due date', 'payment due', 'due by', 'past due'])) ||
    allDates[allDates.length - 1] ||
    '';

  if (!dueDate && issueDate) {
    const issueDateValue = parseDate(issueDate);
    if (issueDateValue) {
      const inferredDueDate = new Date(issueDateValue.getTime());
      inferredDueDate.setDate(inferredDueDate.getDate() + 30);
      dueDate = inferredDueDate.toISOString().slice(0, 10);
    }
  }

  if (!dueDate) {
    const fallbackDate = new Date();
    fallbackDate.setDate(fallbackDate.getDate() - 30);
    dueDate = fallbackDate.toISOString().slice(0, 10);
  }

  const status = /paid in full|payment received|settled/i.test(text) ? 'paid' : 'overdue';
  const row = {
    invoiceId: labeledInvoiceId || regexInvoiceId || fallbackInvoiceId,
    customerName,
    customerEmail,
    amountDue: amountToken || '0',
    currency: parseCurrency(amountToken || 'USD'),
    dueDate,
    issueDate,
    status,
    notes: 'Parsed from PDF upload',
  };

  return { headers: Object.keys(row), rows: [row] };
}

function normalizeRowsToInvoices(rows = []) {
  const dedup = new Map();

  rows.slice(0, MAX_ROWS).forEach((row, index) => {
    const rowMap = mapRowKeys(row);

    const invoiceIdRaw = pickField(rowMap, FIELD_ALIASES.invoiceId) || `INV-${index + 1}`;
    const invoiceId = String(invoiceIdRaw).trim();
    const customerName = String(pickField(rowMap, FIELD_ALIASES.customerName) || 'Unknown Customer').trim();
    const customerEmail = String(pickField(rowMap, FIELD_ALIASES.customerEmail) || '').trim();

    const amountRaw = pickField(rowMap, FIELD_ALIASES.amountDue);
    const amountDue = Math.max(0, parseMoney(amountRaw));
    const currency = parseCurrency(pickField(rowMap, FIELD_ALIASES.currency) || amountRaw || 'USD');

    const dueDate = parseDate(pickField(rowMap, FIELD_ALIASES.dueDate));
    const issueDate = parseDate(pickField(rowMap, FIELD_ALIASES.issueDate));
    const status = normalizeStatus(pickField(rowMap, FIELD_ALIASES.status));
    const lastContactDate = parseDate(pickField(rowMap, FIELD_ALIASES.lastContactDate));
    const notes = String(pickField(rowMap, FIELD_ALIASES.notes) || '').trim();

    const invoice = {
      invoiceId,
      invoiceKey: '',
      customerName,
      customerEmail,
      amountDue,
      currency,
      dueDate: toISODate(dueDate),
      issueDate: toISODate(issueDate),
      status,
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

    if (invoice.daysOverdue > existing.daysOverdue || invoice.amountDue > existing.amountDue) {
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

  const context = `Invoice ${invoice.invoiceId} is ${invoice.daysOverdue} days overdue for ${amount}.`;

  return {
    friendly: {
      subject: `Friendly reminder: Invoice ${invoice.invoiceId}`,
      body: `Hi ${invoice.customerName},\n\nHope you are doing well. ${context} Could you confirm your payment date?\n\nIf payment was sent already, please share remittance details so we can update records.\n\nThank you,`,
    },
    firm: {
      subject: `Action needed: Invoice ${invoice.invoiceId} is overdue`,
      body: `Hi ${invoice.customerName},\n\nFollowing up on ${invoice.invoiceId}. It is now ${invoice.daysOverdue} days overdue with ${amount} outstanding.\n\nPlease process payment within 3 business days and reply with confirmation. If there is a blocker, let us know today.\n\nBest,`,
    },
    final: {
      subject: `Final notice: Invoice ${invoice.invoiceId}`,
      body: `Hi ${invoice.customerName},\n\nThis is a final reminder for ${invoice.invoiceId}. The invoice is ${invoice.daysOverdue} days overdue with ${amount} still unpaid.\n\nPlease complete payment within 48 hours or reply with a concrete payment commitment by end of day.\n\nThank you,`,
    },
  };
}

function parseDraftOutput(text, invoice) {
  try {
    const parsed = JSON.parse(cleanJsonText(text));
    const tones = ['friendly', 'firm', 'final'];

    const valid = tones.every((tone) => (
      parsed?.[tone] &&
      typeof parsed[tone].subject === 'string' &&
      typeof parsed[tone].body === 'string'
    ));

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

function parseBody(event) {
  if (!event.body) return {};
  try {
    return JSON.parse(event.body);
  } catch {
    return {};
  }
}

async function handleUpload(event, rateHeaders) {
  const { files } = await parseMultipart(event);
  const file = Array.isArray(files) ? files[0] : null;

  if (!file) {
    return jsonResponse(400, { error: 'Invalid request', message: 'File is required' }, rateHeaders);
  }

  if (file.buffer.length > MAX_FILE_SIZE) {
    return jsonResponse(400, { error: 'File too large', message: 'Max size is 10MB' }, rateHeaders);
  }

  const filename = String(file.filename || '').toLowerCase();
  const mimetype = String(file.mimeType || '').toLowerCase();
  const hasSupportedExt = SUPPORTED_EXTS.some((ext) => filename.endsWith(ext));
  const hasSupportedType = SUPPORTED_TYPES.includes(mimetype);

  if (!hasSupportedExt && !hasSupportedType) {
    return jsonResponse(
      400,
      { error: 'Unsupported file', message: 'Please upload a CSV, JSON, Excel, or PDF invoice export' },
      rateHeaders
    );
  }

  let parsed = { headers: [], rows: [] };

  if (filename.endsWith('.csv') || mimetype === 'text/csv') {
    parsed = parseCSV(file.buffer.toString('utf-8'));
  } else if (filename.endsWith('.json') || mimetype === 'application/json') {
    parsed = parseJSON(file.buffer.toString('utf-8'));
  } else if (filename.endsWith('.xlsx') || filename.endsWith('.xls')) {
    parsed = await parseExcel(file.buffer);
  } else if (filename.endsWith('.pdf') || mimetype === 'application/pdf') {
    try {
      parsed = await parsePDF(file.buffer, file.filename || filename);
    } catch {
      return jsonResponse(
        400,
        {
          error: 'Unsupported PDF',
          message: 'Unable to parse this PDF. Please upload a text-based invoice PDF or a CSV/JSON/Excel export.',
        },
        rateHeaders
      );
    }
  } else {
    parsed = await parseExcel(file.buffer);
  }

  if (!parsed.rows || parsed.rows.length === 0) {
    return jsonResponse(400, { error: 'Empty file', message: 'The uploaded export has no rows to process' }, rateHeaders);
  }

  const invoices = normalizeRowsToInvoices(parsed.rows);
  if (invoices.length === 0) {
    return jsonResponse(
      400,
      { error: 'No overdue invoices found', message: 'No actionable overdue invoices were detected in the export' },
      rateHeaders
    );
  }

  const queueId = crypto.randomUUID();
  const queueRecord = {
    id: queueId,
    sourceFileName: file.filename || 'invoice-export',
    createdAt: new Date().toISOString(),
    invoices,
    prioritizedInvoices: [],
    actions: [],
    lastPrioritizedAt: null,
  };

  reprioritizeQueue(queueRecord);
  queueStore.set(queueId, queueRecord);

  return jsonResponse(
    200,
    {
      queueId,
      summary: summarizeQueue(queueRecord),
      queue: queueRecord.prioritizedInvoices,
      sourceFileName: queueRecord.sourceFileName,
      generatedAt: queueRecord.lastPrioritizedAt,
    },
    rateHeaders
  );
}

async function handleDrafts(event, rateHeaders) {
  const { queueId, invoiceId, invoiceKey } = parseBody(event);

  if (!queueId || (!invoiceId && !invoiceKey)) {
    return jsonResponse(
      400,
      { error: 'Invalid request', message: 'queueId and invoiceKey (or invoiceId) are required' },
      rateHeaders
    );
  }

  const queueRecord = queueStore.get(queueId);
  if (!queueRecord) {
    return jsonResponse(404, { error: 'Queue not found', message: 'Upload an invoice export first' }, rateHeaders);
  }

  reprioritizeQueue(queueRecord);

  const invoice = invoiceKey
    ? queueRecord.invoices.find((row) => row.invoiceKey === invoiceKey)
    : queueRecord.invoices.find((row) => row.invoiceId === invoiceId);

  if (!invoice) {
    return jsonResponse(404, { error: 'Invoice not found', message: 'The selected invoice is not in this queue' }, rateHeaders);
  }

  const historySummary = (invoice.history || [])
    .slice(-5)
    .map((x) => `${x.timestamp}: ${x.actionType}${x.notes ? ` (${x.notes})` : ''}`)
    .join('\n') || 'No prior follow-up activity logged.';

  const prompt = `Generate collection drafts for this invoice:\n\nInvoice ID: ${invoice.invoiceId}\nCustomer: ${invoice.customerName}\nCustomer Email: ${invoice.customerEmail || 'Not provided'}\nAmount Due: ${invoice.amountDue} ${invoice.currency || 'USD'}\nDays Overdue: ${invoice.daysOverdue}\nRisk Tier: ${invoice.riskTier}\nSuggested Next Action: ${invoice.nextAction}\nRecent Follow-up History:\n${historySummary}`;

  const result = await run(invoiceDraftAgent, prompt);
  const drafts = parseDraftOutput(result.finalOutput, invoice);

  return jsonResponse(
    200,
    {
      queueId,
      invoiceId: invoice.invoiceId,
      invoiceKey: invoice.invoiceKey,
      drafts,
      generatedAt: new Date().toISOString(),
    },
    rateHeaders
  );
}

function handleActions(event, rateHeaders) {
  const { queueId, invoiceId, invoiceKey, actionType, tone = null, channel = 'email', subject = null, body = null, notes = null } = parseBody(event);

  if (!queueId || (!invoiceId && !invoiceKey) || !actionType) {
    return jsonResponse(
      400,
      { error: 'Invalid request', message: 'queueId, invoiceKey (or invoiceId), and actionType are required' },
      rateHeaders
    );
  }

  if (!ALLOWED_ACTIONS.has(actionType)) {
    return jsonResponse(
      400,
      { error: 'Invalid action', message: `actionType must be one of: ${Array.from(ALLOWED_ACTIONS).join(', ')}` },
      rateHeaders
    );
  }

  const queueRecord = queueStore.get(queueId);
  if (!queueRecord) {
    return jsonResponse(404, { error: 'Queue not found', message: 'Upload an invoice export first' }, rateHeaders);
  }

  const invoice = invoiceKey
    ? queueRecord.invoices.find((row) => row.invoiceKey === invoiceKey)
    : queueRecord.invoices.find((row) => row.invoiceId === invoiceId);

  if (!invoice) {
    return jsonResponse(404, { error: 'Invoice not found', message: 'The selected invoice is not in this queue' }, rateHeaders);
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

  return jsonResponse(
    200,
    {
      success: true,
      action,
      invoice,
      summary: summarizeQueue(queueRecord),
      queue: queueRecord.prioritizedInvoices,
      recentActions: queueRecord.actions.slice(-30).reverse(),
    },
    rateHeaders
  );
}

function handleQueue(event, rateHeaders) {
  const subpath = extractSubpath(event, '/api/invoice-chaser', 'invoice-chaser');
  const match = subpath.match(/^\/queue\/([^/]+)$/);
  const queueId = match?.[1] ? decodeURIComponent(match[1]) : null;

  if (!queueId) {
    return jsonResponse(400, { error: 'Invalid request', message: 'queueId is required' }, rateHeaders);
  }

  const queueRecord = queueStore.get(queueId);
  if (!queueRecord) {
    return jsonResponse(404, { error: 'Queue not found', message: 'Upload an invoice export first' }, rateHeaders);
  }

  reprioritizeQueue(queueRecord);

  return jsonResponse(
    200,
    {
      queueId,
      sourceFileName: queueRecord.sourceFileName,
      createdAt: queueRecord.createdAt,
      summary: summarizeQueue(queueRecord),
      queue: queueRecord.prioritizedInvoices,
      recentActions: queueRecord.actions.slice(-30).reverse(),
    },
    rateHeaders
  );
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return optionsResponse();

  const subpath = extractSubpath(event, '/api/invoice-chaser', 'invoice-chaser');

  if (event.httpMethod !== 'GET' && event.httpMethod !== 'POST') {
    return methodNotAllowed();
  }

  const rate = await consumeRateLimit(event);
  if (!rate.allowed) {
    return jsonResponse(
      429,
      {
        error: 'Rate limit exceeded',
        message: `You've used all ${rate.usage.limit} free requests today.`,
        usage: rate.usage,
      },
      rate.headers
    );
  }

  try {
    if (event.httpMethod === 'POST' && (subpath === '/' || subpath === '/upload')) {
      return await handleUpload(event, rate.headers);
    }

    if (event.httpMethod === 'POST' && subpath === '/drafts') {
      return await handleDrafts(event, rate.headers);
    }

    if (event.httpMethod === 'POST' && subpath === '/actions') {
      return handleActions(event, rate.headers);
    }

    if (event.httpMethod === 'GET' && subpath.startsWith('/queue/')) {
      return handleQueue(event, rate.headers);
    }

    return jsonResponse(404, { error: 'Route not found' }, rate.headers);
  } catch (error) {
    return jsonResponse(500, { error: 'Invoice chaser failed', message: error.message }, rate.headers);
  }
}
