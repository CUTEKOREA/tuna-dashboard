export interface GmailSendMessage {
  to: string;
  subject: string;
  text: string;
  threadId?: string;
  inReplyTo?: string;
  references?: string[];
}

const EMAIL_PATTERN = /^[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?(?:\.[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?)+$/i;
const MAX_RECIPIENT_LENGTH = 254;
const MAX_SUBJECT_LENGTH = 200;
const MAX_TEXT_LENGTH = 10_000;
const GMAIL_RESOURCE_ID = /^[A-Za-z0-9_-]+$/;
const MESSAGE_ID_PATTERN = /^<[^<>\s\u0000-\u001F\u007F]{1,190}>$/;
const MAX_REFERENCES = 20;

function invalidInput(): never {
  throw new Error('메일 발송 입력을 확인해주세요');
}

export function parseGmailSendInput(value: unknown): GmailSendMessage {
  if (!value || typeof value !== 'object' || Array.isArray(value)) invalidInput();
  const input = value as Record<string, unknown>;
  const to = typeof input.to === 'string' ? input.to.trim() : '';
  const subject = typeof input.subject === 'string' ? input.subject.trim() : '';
  const text = typeof input.text === 'string' ? input.text.replace(/\r\n?/g, '\n') : '';
  const hasReplyMetadata = input.threadId !== undefined
    || input.inReplyTo !== undefined
    || input.references !== undefined;

  if (
    !to
    || to.length > MAX_RECIPIENT_LENGTH
    || !EMAIL_PATTERN.test(to)
    || !subject
    || subject.length > MAX_SUBJECT_LENGTH
    || /[\u0000-\u001F\u007F]/.test(subject)
    || !text.trim()
    || text.length > MAX_TEXT_LENGTH
    || /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(text)
  ) invalidInput();

  if (!hasReplyMetadata) return { to, subject, text };
  const threadId = typeof input.threadId === 'string' ? input.threadId : '';
  const inReplyTo = typeof input.inReplyTo === 'string' ? input.inReplyTo : '';
  const references = Array.isArray(input.references) ? input.references : null;
  if (
    !GMAIL_RESOURCE_ID.test(threadId)
    || !MESSAGE_ID_PATTERN.test(inReplyTo)
    || !references
    || references.length > MAX_REFERENCES
    || !references.every((item): item is string => typeof item === 'string' && MESSAGE_ID_PATTERN.test(item))
    || references.join(' ').length > 900
  ) invalidInput();

  return { to, subject, text, threadId, inReplyTo, references: Array.from(new Set(references)) };
}

function wrapMimeBase64(value: string): string {
  return Buffer.from(value, 'utf8').toString('base64').match(/.{1,76}/g)?.join('\r\n') ?? '';
}

function encodeMimeSubject(value: string): string {
  const chunks: string[] = [];
  let chunk = '';
  let chunkBytes = 0;

  for (const character of value) {
    const characterBytes = Buffer.byteLength(character, 'utf8');
    if (chunk && chunkBytes + characterBytes > 42) {
      chunks.push(chunk);
      chunk = '';
      chunkBytes = 0;
    }
    chunk += character;
    chunkBytes += characterBytes;
  }
  if (chunk) chunks.push(chunk);

  return chunks
    .map((part) => `=?UTF-8?B?${Buffer.from(part, 'utf8').toString('base64')}?=`)
    .join('\r\n ');
}

export function buildGmailRawMessage(message: GmailSendMessage): string {
  const mime = [
    `To: ${message.to}`,
    `Subject: ${encodeMimeSubject(message.subject)}`,
    ...(message.inReplyTo ? [`In-Reply-To: ${message.inReplyTo}`] : []),
    ...(message.references?.length ? [`References: ${message.references.join(' ')}`] : []),
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    wrapMimeBase64(message.text),
  ].join('\r\n');
  return Buffer.from(mime, 'utf8').toString('base64url');
}
