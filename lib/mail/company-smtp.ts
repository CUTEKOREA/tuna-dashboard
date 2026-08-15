import { createTransport as createNodemailerTransport } from 'nodemailer';

const EMAIL_PATTERN = /^[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?(?:\.[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?)+$/i;
const MAX_SUBJECT_LENGTH = 200;
const MAX_TEXT_LENGTH = 10_000;

export interface CompanySmtpConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  from: string;
}

export interface CompanySmtpMessage {
  to: string;
  subject: string;
  text: string;
}

export interface SmtpTransport {
  sendMail(message: {
    from: string;
    to: string;
    subject: string;
    text: string;
    envelope: { from: string; to: string[] };
  }): Promise<{ accepted: unknown; rejected: unknown; envelope: unknown }>;
}

export type SmtpTransportFactory = (options: {
  host: string;
  port: number;
  secure: false;
  requireTLS: true;
  auth: { user: string; pass: string };
  tls: { rejectUnauthorized: true; servername: string; minVersion: 'TLSv1.2' };
  connectionTimeout: number;
  greetingTimeout: number;
  socketTimeout: number;
}) => SmtpTransport;

function invalidInput(): never {
  throw new Error('회사 메일 발송 입력을 확인해주세요');
}

export function parseCompanySmtpMessage(value: unknown): CompanySmtpMessage {
  if (!value || typeof value !== 'object' || Array.isArray(value)) invalidInput();
  const input = value as Record<string, unknown>;
  if (Object.keys(input).sort().join(',') !== 'subject,text,to') invalidInput();

  const to = typeof input.to === 'string' ? input.to.trim() : '';
  const subject = typeof input.subject === 'string' ? input.subject.trim() : '';
  const text = typeof input.text === 'string' ? input.text.replace(/\r\n?/g, '\n') : '';
  if (
    !EMAIL_PATTERN.test(to)
    || to.length > 254
    || !subject
    || subject.length > MAX_SUBJECT_LENGTH
    || /[\u0000-\u001F\u007F]/.test(subject)
    || !text.trim()
    || text.length > MAX_TEXT_LENGTH
    || /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(text)
  ) invalidInput();

  return { to: to.toLowerCase(), subject, text };
}

export async function sendCompanySmtpMessage(options: {
  config: CompanySmtpConfig;
  message: CompanySmtpMessage;
  createTransport?: SmtpTransportFactory;
}): Promise<void> {
  const createTransport = options.createTransport ?? ((transportOptions) => (
    createNodemailerTransport(transportOptions) as unknown as SmtpTransport
  ));
  const transport = createTransport({
    host: options.config.host,
    port: options.config.port,
    secure: false,
    requireTLS: true,
    auth: { user: options.config.user, pass: options.config.password },
    tls: {
      rejectUnauthorized: true,
      servername: options.config.host,
      minVersion: 'TLSv1.2',
    },
    connectionTimeout: 15_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });
  const result = await transport.sendMail({
    from: options.config.from,
    to: options.message.to,
    subject: options.message.subject,
    text: options.message.text,
    envelope: { from: options.config.from, to: [options.message.to] },
  });
  if (!Array.isArray(result.accepted) || !Array.isArray(result.rejected)) {
    throw new Error('회사 SMTP 발송을 확인하지 못했습니다');
  }
  const acceptedRecipient = result.accepted[0];
  const envelope = result.envelope && typeof result.envelope === 'object'
    ? result.envelope as Record<string, unknown>
    : null;
  const envelopeFrom = typeof envelope?.from === 'string'
    ? envelope.from.trim().toLowerCase()
    : '';
  const envelopeTo = Array.isArray(envelope?.to) ? envelope.to : [];
  if (
    result.accepted.length !== 1
    || typeof acceptedRecipient !== 'string'
    || acceptedRecipient.trim().toLowerCase() !== options.message.to
    || result.rejected.length !== 0
    || envelopeFrom !== options.config.from.toLowerCase()
    || envelopeTo.length !== 1
    || typeof envelopeTo[0] !== 'string'
    || envelopeTo[0].trim().toLowerCase() !== options.message.to
  ) {
    throw new Error('회사 SMTP 발송을 확인하지 못했습니다');
  }
}
