import { hasTrustedMailOrigin } from '@/lib/mail/csrf';
import { mailError, mailJson } from '@/lib/mail/http';
import {
  recordCompanySmtpSendOutcome,
  reserveCompanySmtpSendRequest,
} from '@/lib/mail/company-smtp-audit';
import { parseCompanySmtpMessage, sendCompanySmtpMessage } from '@/lib/mail/company-smtp';
import { readLimitedRequestText, RequestBodyTooLargeError } from '@/lib/mail/request-body';
import { authorizeMailRequest } from '@/lib/mail/request-auth';
import { getCompanySmtpConfig, getMailPublicBaseUrl } from '@/lib/mail/server-env';
import { createMailServiceClient } from '@/lib/mail/server-supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';
const RESPONSE_HEADERS = { 'Cache-Control': 'no-store, max-age=0' };
const MAX_SEND_REQUEST_BYTES = 40_000;
const REQUEST_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  const access = await authorizeMailRequest(true);
  if (!access.ok) return mailError(access.status, access.code);

  try {
    if (!hasTrustedMailOrigin(request, getMailPublicBaseUrl())) return mailError(403, 'invalid_origin');
    if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) {
      return mailError(415, 'invalid_content_type');
    }
    const requestId = request.headers.get('idempotency-key')?.trim() ?? '';
    if (!REQUEST_ID_PATTERN.test(requestId)) return mailError(400, 'invalid_idempotency_key');
    const declaredLength = Number(request.headers.get('content-length') ?? '0');
    if (Number.isFinite(declaredLength) && declaredLength > MAX_SEND_REQUEST_BYTES) {
      return mailError(413, 'mail_send_too_large');
    }

    let rawRequest: string;
    try {
      rawRequest = await readLimitedRequestText(request, MAX_SEND_REQUEST_BYTES);
    } catch (error) {
      return error instanceof RequestBodyTooLargeError
        ? mailError(413, 'mail_send_too_large')
        : mailError(400, 'invalid_company_smtp_input');
    }

    let message;
    try {
      message = parseCompanySmtpMessage(JSON.parse(rawRequest));
    } catch {
      return mailError(400, 'invalid_company_smtp_input');
    }

    const config = getCompanySmtpConfig();
    const serviceClient = createMailServiceClient();
    const reservation = await reserveCompanySmtpSendRequest(
      serviceClient,
      access.userId,
      requestId,
      message,
    );
    if (reservation.decision === 'sent') {
      return mailJson({ ok: true, duplicate: true }, { headers: RESPONSE_HEADERS });
    }
    if (reservation.decision === 'rate_limited') return mailError(429, 'mail_send_rate_limited');
    if (reservation.decision === 'pending_or_unknown') return mailError(409, 'mail_send_status_unknown');
    if (reservation.decision !== 'reserved') return mailError(400, 'invalid_idempotency_key');

    try {
      await sendCompanySmtpMessage({ config, message });
    } catch {
      await recordCompanySmtpSendOutcome(serviceClient, {
        userId: access.userId,
        requestId,
        status: 'unknown',
      }).catch(() => undefined);
      return mailError(502, 'company_smtp_send_failed');
    }

    try {
      await recordCompanySmtpSendOutcome(serviceClient, {
        userId: access.userId,
        requestId,
        status: 'sent',
      });
    } catch {
      await recordCompanySmtpSendOutcome(serviceClient, {
        userId: access.userId,
        requestId,
        status: 'unknown',
      }).catch(() => undefined);
      return mailError(502, 'company_smtp_send_failed');
    }
    return mailJson({ ok: true }, { headers: RESPONSE_HEADERS });
  } catch {
    return mailError(502, 'company_smtp_send_failed');
  }
}
