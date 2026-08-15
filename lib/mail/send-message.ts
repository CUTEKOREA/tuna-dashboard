export interface GmailSendMessage {
  to: string;
  subject: string;
  text: string;
}

const EMAIL_PATTERN = /^[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?(?:\.[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?)+$/i;
const MAX_RECIPIENT_LENGTH = 254;
const MAX_SUBJECT_LENGTH = 200;
const MAX_TEXT_LENGTH = 10_000;

function invalidInput(): never {
  throw new Error('메일 발송 입력을 확인해주세요');
}

export function parseGmailSendInput(value: unknown): GmailSendMessage {
  if (!value || typeof value !== 'object' || Array.isArray(value)) invalidInput();
  const input = value as Record<string, unknown>;
  const to = typeof input.to === 'string' ? input.to.trim() : '';
  const subject = typeof input.subject === 'string' ? input.subject.trim() : '';
  const text = typeof input.text === 'string' ? input.text.replace(/\r\n?/g, '\n') : '';

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

  return { to, subject, text };
}

function wrapMimeBase64(value: string): string {
  return Buffer.from(value, 'utf8').toString('base64').match(/.{1,76}/g)?.join('\r\n') ?? '';
}

export function buildGmailRawMessage(message: GmailSendMessage): string {
  const encodedSubject = Buffer.from(message.subject, 'utf8').toString('base64');
  const mime = [
    `To: ${message.to}`,
    `Subject: =?UTF-8?B?${encodedSubject}?=`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    wrapMimeBase64(message.text),
  ].join('\r\n');
  return Buffer.from(mime, 'utf8').toString('base64url');
}
