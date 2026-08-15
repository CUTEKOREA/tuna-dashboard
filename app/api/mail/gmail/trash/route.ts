import { refreshGmailAccessToken, trashGmailMessage } from '@/lib/mail/google-client';
import { hasTrustedMailOrigin } from '@/lib/mail/csrf';
import { hasRequiredGmailScopes } from '@/lib/mail/google-oauth';
import { mailError, mailJson } from '@/lib/mail/http';
import { recordMailTrashOutcome, reserveMailTrashRequest } from '@/lib/mail/message-action-audit';
import { readLimitedRequestText, RequestBodyTooLargeError } from '@/lib/mail/request-body';
import { authorizeMailRequest } from '@/lib/mail/request-auth';
import { getGoogleOAuthConfig, getMailEncryptionKey, getMailPublicBaseUrl } from '@/lib/mail/server-env';
import { createMailServiceClient } from '@/lib/mail/server-supabase';
import { getMailConnection, readRefreshToken } from '@/lib/mail/token-store';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';
const RESPONSE_HEADERS = { 'Cache-Control': 'no-store, max-age=0' };
const MAX_TRASH_REQUEST_BYTES = 1_024;
const GMAIL_RESOURCE_ID = /^[A-Za-z0-9_-]+$/;
const REQUEST_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function parseTrashInput(value: unknown): string {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('invalid');
  const input = value as Record<string, unknown>;
  if (Object.keys(input).length !== 1 || typeof input.messageId !== 'string'
    || !GMAIL_RESOURCE_ID.test(input.messageId)) {
    throw new Error('invalid');
  }
  return input.messageId;
}

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
    if (Number.isFinite(declaredLength) && declaredLength > MAX_TRASH_REQUEST_BYTES) {
      return mailError(413, 'mail_trash_too_large');
    }

    let messageId: string;
    try {
      const rawRequest = await readLimitedRequestText(request, MAX_TRASH_REQUEST_BYTES);
      messageId = parseTrashInput(JSON.parse(rawRequest));
    } catch (error) {
      return error instanceof RequestBodyTooLargeError
        ? mailError(413, 'mail_trash_too_large')
        : mailError(400, 'invalid_mail_trash_input');
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
    const reservation = await reserveMailTrashRequest(serviceClient, access.userId, requestId, messageId);
    if (reservation.decision === 'completed') {
      return mailJson({ ok: true, duplicate: true }, { headers: RESPONSE_HEADERS });
    }
    if (reservation.decision === 'rate_limited') return mailError(429, 'mail_trash_rate_limited');
    if (reservation.decision === 'pending_or_unknown') return mailError(409, 'mail_trash_status_unknown');
    if (reservation.decision !== 'reserved') return mailError(400, 'invalid_idempotency_key');

    try {
      await trashGmailMessage({ accessToken: refreshed.accessToken, messageId });
    } catch {
      await recordMailTrashOutcome(serviceClient, {
        userId: access.userId,
        requestId,
        status: 'unknown',
      }).catch(() => undefined);
      return mailError(502, 'gmail_trash_failed');
    }
    await recordMailTrashOutcome(serviceClient, {
      userId: access.userId,
      requestId,
      status: 'completed',
    });
    return mailJson({ ok: true }, { headers: RESPONSE_HEADERS });
  } catch {
    return mailError(502, 'gmail_trash_failed');
  }
}
