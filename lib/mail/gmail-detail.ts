import type { GmailHeader } from './gmail-parser';

interface GmailBody {
  data?: unknown;
  size?: unknown;
}

interface GmailPart {
  mimeType?: unknown;
  filename?: unknown;
  headers?: GmailHeader[];
  body?: GmailBody;
  parts?: GmailPart[];
}

export interface GmailDetailResource {
  id?: unknown;
  threadId?: unknown;
  internalDate?: unknown;
  payload?: GmailPart;
}

export interface MailMessageDetail {
  id: string;
  threadId: string;
  from: string;
  replyTo: string | null;
  subject: string;
  receivedAt: string | null;
  bodyText: string;
  bodyTruncated: boolean;
  messageId: string | null;
  references: string[];
}

export interface MailReplyDraft {
  to: string;
  subject: string;
  text: string;
  threadId: string;
  inReplyTo: string;
  references: string[];
}

const GMAIL_RESOURCE_ID = /^[A-Za-z0-9_-]+$/;
const EMAIL_PATTERN = /^[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?(?:\.[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?)+$/i;
const EMAIL_CANDIDATE_PATTERN = /[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?(?:\.[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?)+/gi;
const MESSAGE_ID_PATTERN = /^<[^<>\s\u0000-\u001F\u007F]{1,188}>$/;
const MAX_BODY_CHARACTERS = 50_000;
const MAX_ENCODED_BODY_LENGTH = 350_000;
const MAX_MIME_DEPTH = 8;
const MAX_MIME_NODES = 100;
const MAX_REFERENCES = 20;
const MAX_REPLY_QUOTE_CHARACTERS = 8_000;
const MAX_SEND_TEXT_LENGTH = 10_000;

function readHeader(headers: GmailHeader[] | undefined, name: string): string | undefined {
  const normalized = name.toLowerCase();
  return headers?.find((header) => header.name?.toLowerCase() === normalized)?.value?.trim() || undefined;
}

function cleanHeader(value: string | undefined, fallback: string, maxLength: number): string {
  return (value ?? '')
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength) || fallback;
}

function parseReceivedAt(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const timestamp = Number(value);
  if (!Number.isFinite(timestamp) || timestamp < 0) return null;
  const date = new Date(timestamp);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function extractSingleAddress(value: string | undefined): string | null {
  if (!value || /[\r\n]/.test(value)) return null;
  const matches = value.match(EMAIL_CANDIDATE_PATTERN) ?? [];
  if (matches.length !== 1) return null;
  const candidate = matches[0]!.trim();
  return candidate.length <= 254 && EMAIL_PATTERN.test(candidate) ? candidate : null;
}

function validMessageId(value: string | undefined): string | null {
  if (!value || value.length > 190 || !MESSAGE_ID_PATTERN.test(value)) return null;
  return value;
}

function parseReferences(value: string | undefined): string[] {
  if (!value || /[\r\n\u0000]/.test(value)) return [];
  const matches = value.match(/<[^<>\s\u0000-\u001F\u007F]{1,188}>/g) ?? [];
  return Array.from(new Set(matches.filter((item) => MESSAGE_ID_PATTERN.test(item)))).slice(-MAX_REFERENCES);
}

function normalizePlainText(value: string): { text: string; truncated: boolean } {
  const normalized = value
    .replace(/\r\n?/g, '\n')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{4,}/g, '\n\n\n')
    .trim();
  return {
    text: normalized.slice(0, MAX_BODY_CHARACTERS),
    truncated: normalized.length > MAX_BODY_CHARACTERS,
  };
}

function decodeHtmlEntity(entity: string): string {
  const named: Record<string, string> = {
    amp: '&', apos: "'", gt: '>', lt: '<', nbsp: ' ', quot: '"',
  };
  const key = entity.slice(1, -1).toLowerCase();
  if (named[key] !== undefined) return named[key];
  const numeric = key.startsWith('#x')
    ? Number.parseInt(key.slice(2), 16)
    : key.startsWith('#') ? Number.parseInt(key.slice(1), 10) : Number.NaN;
  return Number.isInteger(numeric) && numeric > 0 && numeric <= 0x10ffff
    ? String.fromCodePoint(numeric)
    : ' ';
}

function htmlToPlainText(value: string): { text: string; truncated: boolean } {
  const withoutActiveContent = value
    .replace(/<(script|style|noscript|template)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, '')
    .replace(/<(?:br|\/p|\/div|\/li|\/tr|\/h[1-6])\s*\/?>/gi, '\n')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&(?:#\d{1,7}|#x[0-9a-f]{1,6}|[a-z]{2,10});/gi, decodeHtmlEntity);
  return normalizePlainText(withoutActiveContent.replace(/[ \t]{2,}/g, ' '));
}

function decodePartBody(part: GmailPart): { text: string; truncated: boolean } | null {
  const data = part.body?.data;
  if (typeof data !== 'string' || !data || data.length > MAX_ENCODED_BODY_LENGTH) {
    return data && typeof data === 'string' && data.length > MAX_ENCODED_BODY_LENGTH
      ? { text: '', truncated: true }
      : null;
  }
  if (!/^[A-Za-z0-9_-]+={0,2}$/.test(data)) return null;
  let decoded: string;
  try {
    decoded = new TextDecoder('utf-8', { fatal: true }).decode(Buffer.from(data, 'base64url'));
  } catch {
    return null;
  }
  const mimeType = typeof part.mimeType === 'string'
    ? part.mimeType.split(';', 1)[0]!.trim().toLowerCase()
    : '';
  if (mimeType === 'text/plain') return normalizePlainText(decoded);
  if (mimeType === 'text/html') return htmlToPlainText(decoded);
  return null;
}

function isAttachment(part: GmailPart): boolean {
  if (typeof part.filename === 'string' && part.filename.trim()) return true;
  return /^attachment(?:;|$)/i.test(readHeader(part.headers, 'content-disposition') ?? '');
}

function findBody(root: GmailPart | undefined): { text: string; truncated: boolean } {
  if (!root) return { text: '', truncated: false };
  const candidates: Array<{ kind: 'plain' | 'html'; text: string; truncated: boolean }> = [];
  let nodes = 0;

  const visit = (part: GmailPart, depth: number) => {
    nodes += 1;
    if (nodes > MAX_MIME_NODES || depth > MAX_MIME_DEPTH || isAttachment(part)) return;
    const decoded = decodePartBody(part);
    if (decoded) {
      const mimeType = typeof part.mimeType === 'string' ? part.mimeType.toLowerCase() : '';
      candidates.push({ kind: mimeType.startsWith('text/plain') ? 'plain' : 'html', ...decoded });
    }
    if (Array.isArray(part.parts)) {
      for (const child of part.parts) visit(child, depth + 1);
    }
  };
  visit(root, 0);
  return candidates.find((item) => item.kind === 'plain' && item.text)
    ?? candidates.find((item) => item.kind === 'html' && item.text)
    ?? candidates.find((item) => item.truncated)
    ?? { text: '', truncated: false };
}

export function parseGmailMessageDetail(resource: GmailDetailResource): MailMessageDetail {
  const id = resource.id;
  const threadId = resource.threadId;
  if (typeof id !== 'string' || typeof threadId !== 'string'
    || !GMAIL_RESOURCE_ID.test(id) || !GMAIL_RESOURCE_ID.test(threadId)) {
    throw new Error('Gmail 메시지 형식이 올바르지 않습니다');
  }
  const headers = resource.payload?.headers;
  const fromHeader = readHeader(headers, 'from');
  const replyHeader = readHeader(headers, 'reply-to');
  const body = findBody(resource.payload);
  return {
    id,
    threadId,
    from: cleanHeader(fromHeader, '발신자 없음', 320),
    replyTo: replyHeader === undefined ? extractSingleAddress(fromHeader) : extractSingleAddress(replyHeader),
    subject: cleanHeader(readHeader(headers, 'subject'), '(제목 없음)', 500),
    receivedAt: parseReceivedAt(resource.internalDate),
    bodyText: body.text || '표시할 일반 텍스트 본문이 없습니다.',
    bodyTruncated: body.truncated,
    messageId: validMessageId(readHeader(headers, 'message-id')),
    references: parseReferences(readHeader(headers, 'references')),
  };
}

export function buildReplyDraft(detail: MailMessageDetail): MailReplyDraft {
  if (!detail.replyTo || !detail.messageId) throw new Error('회신 정보를 확인할 수 없습니다');
  const subject = /^\s*re\s*:/i.test(detail.subject)
    ? detail.subject.slice(0, 200)
    : `Re: ${detail.subject}`.slice(0, 200);
  const quotePrefix = [
    '',
    '',
    '---- 원문 ----',
    `보낸 사람: ${detail.from.slice(0, 320)}`,
    `수신 시각: ${(detail.receivedAt ?? '수신 시각 없음').slice(0, 64)}`,
    '',
  ].join('\n');
  const quoteBudget = Math.min(MAX_REPLY_QUOTE_CHARACTERS, MAX_SEND_TEXT_LENGTH - quotePrefix.length);
  const quotedBody = detail.bodyText.slice(0, Math.max(0, quoteBudget));
  const references = Array.from(new Set([
    ...detail.references,
    detail.messageId,
  ])).slice(-MAX_REFERENCES);
  return {
    to: detail.replyTo,
    subject,
    text: `${quotePrefix}${quotedBody}`.slice(0, MAX_SEND_TEXT_LENGTH),
    threadId: detail.threadId,
    inReplyTo: detail.messageId,
    references,
  };
}
