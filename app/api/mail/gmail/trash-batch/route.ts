import {
  BULK_TRASH_CONCURRENCY,
  mapWithConcurrency,
  parseBulkTrashInput,
} from '@/lib/mail/bulk-trash';
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
const MAX_BULK_TRASH_REQUEST_BYTES = 16_384;

type BulkTrashResult = {
  requestId: string;
  status: 'completed' | 'unknown' | 'failed';
  code?: 'mail_trash_rate_limited' | 'invalid_idempotency_key';
};

export async function POST(request: Request) {
  const access = await authorizeMailRequest(true);
  if (!access.ok) return mailError(access.status, access.code);

  try {
    const publicBaseUrl = getMailPublicBaseUrl();
    if (!hasTrustedMailOrigin(request, publicBaseUrl)) return mailError(403, 'invalid_origin');
    if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) {
      return mailError(415, 'invalid_content_type');
    }
    const declaredLength = Number(request.headers.get('content-length') ?? '0');
    if (Number.isFinite(declaredLength) && declaredLength > MAX_BULK_TRASH_REQUEST_BYTES) {
      return mailError(413, 'mail_trash_too_large');
    }

    let items: ReturnType<typeof parseBulkTrashInput>;
    try {
      const rawRequest = await readLimitedRequestText(request, MAX_BULK_TRASH_REQUEST_BYTES);
      items = parseBulkTrashInput(JSON.parse(rawRequest));
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

    const results = await mapWithConcurrency(items, BULK_TRASH_CONCURRENCY, async (item): Promise<BulkTrashResult> => {
      try {
        const reservation = await reserveMailTrashRequest(
          serviceClient,
          access.userId,
          item.requestId,
          item.messageId,
        );
        if (reservation.decision === 'completed') {
          return { requestId: item.requestId, status: 'completed' };
        }
        if (reservation.decision === 'rate_limited') {
          return { requestId: item.requestId, status: 'failed', code: 'mail_trash_rate_limited' };
        }
        const canExecuteTrash = reservation.decision === 'reserved' || reservation.decision === 'pending_or_unknown';
        if (!canExecuteTrash) {
          return { requestId: item.requestId, status: 'failed', code: 'invalid_idempotency_key' };
        }

        try {
          await trashGmailMessage({ accessToken: refreshed.accessToken, messageId: item.messageId });
        } catch {
          await recordMailTrashOutcome(serviceClient, {
            userId: access.userId,
            requestId: item.requestId,
            status: 'unknown',
          }).catch(() => undefined);
          return { requestId: item.requestId, status: 'unknown' };
        }

        try {
          await recordMailTrashOutcome(serviceClient, {
            userId: access.userId,
            requestId: item.requestId,
            status: 'completed',
          });
          return { requestId: item.requestId, status: 'completed' };
        } catch {
          return { requestId: item.requestId, status: 'unknown' };
        }
      } catch {
        return { requestId: item.requestId, status: 'unknown' };
      }
    });

    return mailJson({ ok: true, results }, { headers: RESPONSE_HEADERS });
  } catch {
    return mailError(502, 'gmail_trash_failed');
  }
}
