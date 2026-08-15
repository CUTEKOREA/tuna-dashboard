import { fetchGmailInbox, refreshGmailAccessToken } from '@/lib/mail/google-client';
import { GMAIL_READONLY_SCOPE } from '@/lib/mail/google-oauth';
import { mailError, mailJson } from '@/lib/mail/http';
import { authorizeMailRequest } from '@/lib/mail/request-auth';
import { getGoogleOAuthConfig, getMailEncryptionKey } from '@/lib/mail/server-env';
import { createMailServiceClient } from '@/lib/mail/server-supabase';
import { getMailConnection, readRefreshToken } from '@/lib/mail/token-store';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';
const RESPONSE_HEADERS = { 'Cache-Control': 'no-store, max-age=0' };

export async function GET(request: Request) {
  const access = await authorizeMailRequest(true);
  if (!access.ok) return mailError(access.status, access.code);

  try {
    const connection = await getMailConnection(createMailServiceClient(), access.userId, 'gmail');
    if (!connection) return mailError(409, 'gmail_not_connected');
    if (
      connection.granted_scopes.length !== 1
      || connection.granted_scopes[0] !== GMAIL_READONLY_SCOPE
    ) return mailError(403, 'invalid_gmail_scope');

    const config = getGoogleOAuthConfig();
    const refreshed = await refreshGmailAccessToken({
      refreshToken: readRefreshToken(connection, getMailEncryptionKey()),
      clientId: config.clientId,
      clientSecret: config.clientSecret,
    });
    const requested = Number(new URL(request.url).searchParams.get('limit') ?? '20');
    const limit = Number.isFinite(requested) ? Math.min(50, Math.max(20, Math.trunc(requested))) : 20;
    const inbox = await fetchGmailInbox({ accessToken: refreshed.accessToken, limit });
    const messages = inbox.messages.map((message) => ({
      ...message,
      gmailUrl: `https://mail.google.com/mail/?authuser=${encodeURIComponent(connection.provider_email)}#inbox/${encodeURIComponent(message.threadId)}`,
    }));
    return mailJson({ ok: true, unreadCount: inbox.unreadCount, messages }, { headers: RESPONSE_HEADERS });
  } catch {
    return mailError(502, 'gmail_fetch_failed');
  }
}
