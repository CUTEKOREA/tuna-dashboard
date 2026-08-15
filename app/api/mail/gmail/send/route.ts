import { sendGmailMessage, refreshGmailAccessToken } from '@/lib/mail/google-client';
import { hasTrustedMailOrigin } from '@/lib/mail/csrf';
import { hasRequiredGmailScopes } from '@/lib/mail/google-oauth';
import { mailError, mailJson } from '@/lib/mail/http';
import { authorizeMailRequest } from '@/lib/mail/request-auth';
import { recordMailSendOutcome, reserveMailSendRequest } from '@/lib/mail/send-audit';
import { getGoogleOAuthConfig, getMailEncryptionKey, getMailPublicBaseUrl } from '@/lib/mail/server-env';
import { createMailServiceClient } from '@/lib/mail/server-supabase';
import { parseGmailSendInput } from '@/lib/mail/send-message';
import { getMailConnection, readRefreshToken } from '@/lib/mail/token-store';

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
    const publicBaseUrl = getMailPublicBaseUrl();
    if (!hasTrustedMailOrigin(request, publicBaseUrl)) return mailError(403, 'invalid_origin');
    if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) {
      return mailError(415, 'invalid_content_type');
    }
    const requestId = request.headers.get('idempotency-key')?.trim() ?? '';
    if (!REQUEST_ID_PATTERN.test(requestId)) return mailError(400, 'invalid_idempotency_key');
    const declaredLength = Number(request.headers.get('content-length') ?? '0');
    if (Number.isFinite(declaredLength) && declaredLength > MAX_SEND_REQUEST_BYTES) {
      return mailError(413, 'mail_send_too_large');
    }
    const rawRequest = await request.text();
    if (Buffer.byteLength(rawRequest, 'utf8') > MAX_SEND_REQUEST_BYTES) {
      return mailError(413, 'mail_send_too_large');
    }

    let message;
    try {
      message = parseGmailSendInput(JSON.parse(rawRequest));
    } catch {
      return mailError(400, 'invalid_mail_send_input');
    }

    const serviceClient = createMailServiceClient();
    const connection = await getMailConnection(serviceClient, access.userId, 'gmail');
    if (!connection) return mailError(409, 'gmail_not_connected');
    if (!hasRequiredGmailScopes(connection.granted_scopes)) {
      return mailError(403, 'invalid_gmail_scope');
    }

    const config = getGoogleOAuthConfig();
    const refreshed = await refreshGmailAccessToken({
      refreshToken: readRefreshToken(connection, getMailEncryptionKey()),
      clientId: config.clientId,
      clientSecret: config.clientSecret,
    });

    const reservation = await reserveMailSendRequest(serviceClient, access.userId, requestId);
    if (reservation.decision === 'sent') {
      return mailJson({ ok: true, duplicate: true }, { headers: RESPONSE_HEADERS });
    }
    if (reservation.decision === 'rate_limited') return mailError(429, 'mail_send_rate_limited');
    if (reservation.decision === 'pending_or_unknown') return mailError(409, 'mail_send_status_unknown');
    if (reservation.decision !== 'reserved') return mailError(400, 'invalid_idempotency_key');

    let sent;
    try {
      sent = await sendGmailMessage({ accessToken: refreshed.accessToken, message });
    } catch {
      await recordMailSendOutcome(serviceClient, {
        userId: access.userId,
        requestId,
        status: 'unknown',
      }).catch(() => undefined);
      return mailError(502, 'gmail_send_failed');
    }
    await recordMailSendOutcome(serviceClient, {
      userId: access.userId,
      requestId,
      status: 'sent',
      gmailMessageId: sent.id,
    });
    return mailJson({ ok: true }, { headers: RESPONSE_HEADERS });
  } catch {
    return mailError(502, 'gmail_send_failed');
  }
}
