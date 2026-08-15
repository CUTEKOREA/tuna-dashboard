export interface GmailHeader {
  name?: string;
  value?: string;
}

export interface GmailMessageResource {
  id?: string;
  threadId?: string;
  labelIds?: string[];
  internalDate?: string;
  snippet?: string;
  payload?: {
    headers?: GmailHeader[];
    body?: unknown;
    parts?: unknown[];
  };
}

export interface MailListItem {
  id: string;
  threadId: string;
  from: string;
  subject: string;
  receivedAt: string | null;
  snippet: string;
  unread: boolean;
  gmailUrl: string;
}

const GMAIL_RESOURCE_ID = /^[A-Za-z0-9_-]+$/;
const MAX_SNIPPET_LENGTH = 200;
const MAX_FROM_LENGTH = 320;
const MAX_SUBJECT_LENGTH = 500;

function sanitizeText(value: string, maxLength: number): string {
  return value
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

function sanitizedOrFallback(value: string | undefined, fallback: string, maxLength: number): string {
  return sanitizeText(value ?? '', maxLength) || fallback;
}

function readHeader(headers: GmailHeader[], name: string): string | undefined {
  const normalizedName = name.toLowerCase();
  return headers.find((header) => header.name?.toLowerCase() === normalizedName)?.value?.trim() || undefined;
}

function parseReceivedAt(internalDate: string | undefined, dateHeader: string | undefined): string | null {
  const internalTimestamp = Number(internalDate);
  if (internalDate && Number.isFinite(internalTimestamp) && internalTimestamp >= 0) {
    const parsed = new Date(internalTimestamp);
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
  }

  if (dateHeader) {
    const timestamp = Date.parse(dateHeader);
    if (!Number.isNaN(timestamp)) return new Date(timestamp).toISOString();
  }

  return null;
}

export function parseGmailMessage(resource: GmailMessageResource): MailListItem {
  const id = resource.id;
  const threadId = resource.threadId;
  if (!id || !threadId || !GMAIL_RESOURCE_ID.test(id) || !GMAIL_RESOURCE_ID.test(threadId)) {
    throw new Error('Gmail 메시지 형식이 올바르지 않습니다');
  }

  const headers = resource.payload?.headers ?? [];
  return {
    id,
    threadId,
    from: sanitizedOrFallback(readHeader(headers, 'from'), '발신자 없음', MAX_FROM_LENGTH),
    subject: sanitizedOrFallback(readHeader(headers, 'subject'), '(제목 없음)', MAX_SUBJECT_LENGTH),
    receivedAt: parseReceivedAt(resource.internalDate, readHeader(headers, 'date')),
    snippet: sanitizeText(resource.snippet ?? '', MAX_SNIPPET_LENGTH),
    unread: resource.labelIds?.includes('UNREAD') ?? false,
    gmailUrl: `https://mail.google.com/mail/u/0/#inbox/${threadId}`,
  };
}
