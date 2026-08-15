import { fetchGmailMessageDetail, refreshGmailAccessToken } from '@/lib/mail/google-client';
import { buildReplyDraft } from '@/lib/mail/gmail-detail';
import { hasRequiredGmailScopes } from '@/lib/mail/google-oauth';
import { mailError, mailJson } from '@/lib/mail/http';
import { authorizeMailRequest } from '@/lib/mail/request-auth';
import { getGoogleOAuthConfig, getMailEncryptionKey } from '@/lib/mail/server-env';
import { createMailServiceClient } from '@/lib/mail/server-supabase';
import { getMailConnection, readRefreshToken } from '@/lib/mail/token-store';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';
const RESPONSE_HEADERS = { 'Cache-Control': 'no-store, max-age=0' };
const GMAIL_RESOURCE_ID = /^[A-Za-z0-9_-]+$/;

export async function GET(request: Request) {
  const access = await authorizeMailRequest(true);
  if (!access.ok) return mailError(access.status, access.code);

  try {
    const messageId = new URL(request.url).searchParams.get('id')?.trim() ?? '';
    if (!GMAIL_RESOURCE_ID.test(messageId)) return mailError(400, 'invalid_gmail_message_id');

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
    const message = await fetchGmailMessageDetail({
      accessToken: refreshed.accessToken,
      messageId,
    });
    let replyDraft = null;
    try {
      replyDraft = buildReplyDraft(message);
    } catch {
      replyDraft = null;
    }
    const visibleMessage = {
      id: message.id,
      threadId: message.threadId,
      from: message.from,
      replyTo: message.replyTo,
      subject: message.subject,
      receivedAt: message.receivedAt,
      bodyText: message.bodyText,
      bodyTruncated: message.bodyTruncated,
    };
    return mailJson({ ok: true, message: visibleMessage, replyDraft }, { headers: RESPONSE_HEADERS });
  } catch {
    return mailError(502, 'gmail_message_fetch_failed');
  }
}
