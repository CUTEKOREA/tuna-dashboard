import { hasTrustedMailOrigin } from '@/lib/mail/csrf';
import { createGmailOAuthFlow } from '@/lib/mail/google-oauth';
import { mailError, mailJson } from '@/lib/mail/http';
import { authorizeMailRequest } from '@/lib/mail/request-auth';
import { getGoogleOAuthConfig, getMailEncryptionKey, getMailPublicBaseUrl } from '@/lib/mail/server-env';
import { createMailServiceClient } from '@/lib/mail/server-supabase';
import { getMailConnectionSummary } from '@/lib/mail/token-store';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';
const RESPONSE_HEADERS = { 'Cache-Control': 'no-store, max-age=0' };
const OAUTH_COOKIE_NAME = 'mail_gmail_oauth';

export async function POST(request: Request) {
  const access = await authorizeMailRequest(true);
  if (!access.ok) return mailError(access.status, access.code);

  try {
    const publicBaseUrl = getMailPublicBaseUrl();
    if (!hasTrustedMailOrigin(request, publicBaseUrl)) return mailError(403, 'invalid_origin');
    const existing = await getMailConnectionSummary(createMailServiceClient(), access.userId, 'gmail');
    if (existing) return mailError(409, 'gmail_already_connected');
    const { clientId } = getGoogleOAuthConfig();
    const flow = createGmailOAuthFlow({
      userId: access.userId,
      clientId,
      publicBaseUrl,
      encryptionKey: getMailEncryptionKey(),
    });
    const response = mailJson(
      { ok: true, authorizationUrl: flow.authorizationUrl },
      { headers: RESPONSE_HEADERS },
    );
    response.cookies.set(OAUTH_COOKIE_NAME, flow.cookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'lax',
      maxAge: 600,
      path: '/api/mail/gmail/callback',
    });
    return response;
  } catch {
    return mailError(503, 'mail_service_unavailable');
  }
}
