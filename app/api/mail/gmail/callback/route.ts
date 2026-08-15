import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { exchangeGmailAuthorizationCode, fetchGmailProfile, revokeGoogleToken } from '@/lib/mail/google-client';
import { consumeGmailOAuthFlow, getGmailRedirectUri } from '@/lib/mail/google-oauth';
import { authorizeMailRequest } from '@/lib/mail/request-auth';
import { getGoogleOAuthConfig, getMailEncryptionKey, getMailPublicBaseUrl } from '@/lib/mail/server-env';
import { createMailServiceClient } from '@/lib/mail/server-supabase';
import { getMailConnectionSummary, saveMailConnection } from '@/lib/mail/token-store';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';
const RESPONSE_HEADERS = { 'Cache-Control': 'no-store, max-age=0' };
const OAUTH_COOKIE_NAME = 'mail_gmail_oauth';
const OAUTH_COOKIE_PATH = '/api/mail/gmail/callback';


function mailRedirect(publicBaseUrl: string, result: 'connected' | 'denied' | 'failed'): NextResponse {
  const destination = new URL('/mail', publicBaseUrl);
  destination.searchParams.set(result === 'connected' ? 'mail_connected' : 'mail_error', result);
  const response = NextResponse.redirect(destination, { headers: RESPONSE_HEADERS });
  response.cookies.delete({ name: OAUTH_COOKIE_NAME, path: OAUTH_COOKIE_PATH });
  return response;
}

export async function GET(request: Request) {
  let publicBaseUrl: string;
  try {
    publicBaseUrl = getMailPublicBaseUrl();
  } catch {
    const response = NextResponse.json(
      { ok: false, code: 'mail_service_unavailable' },
      { status: 503, headers: RESPONSE_HEADERS },
    );
    response.cookies.delete({ name: OAUTH_COOKIE_NAME, path: OAUTH_COOKIE_PATH });
    return response;
  }

  const access = await authorizeMailRequest(true);
  if (!access.ok) return mailRedirect(publicBaseUrl, 'failed');

  const query = new URL(request.url).searchParams;
  const codes = query.getAll('code');
  const states = query.getAll('state');
  const errors = query.getAll('error');
  if (codes.length > 1 || states.length !== 1 || errors.length > 1) {
    return mailRedirect(publicBaseUrl, 'failed');
  }

  const state = states[0];
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(OAUTH_COOKIE_NAME)?.value;
  if (!cookieValue) return mailRedirect(publicBaseUrl, 'failed');

  let codeVerifier: string;
  try {
    ({ codeVerifier } = consumeGmailOAuthFlow({
      cookieValue,
      returnedState: state,
      userId: access.userId,
      encryptionKey: getMailEncryptionKey(),
    }));
  } catch {
    return mailRedirect(publicBaseUrl, 'failed');
  }

  if (errors.length === 1) return mailRedirect(publicBaseUrl, 'denied');
  const code = codes[0];
  if (!code) return mailRedirect(publicBaseUrl, 'failed');

  let refreshToken: string | undefined;
  try {
    const config = getGoogleOAuthConfig();
    const token = await exchangeGmailAuthorizationCode({
      code,
      codeVerifier,
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      redirectUri: getGmailRedirectUri(publicBaseUrl),
    });
    refreshToken = token.refreshToken;
    const profile = await fetchGmailProfile(token.accessToken);
    const serviceClient = createMailServiceClient();
    const existing = await getMailConnectionSummary(serviceClient, access.userId, 'gmail');
    if (existing) {
      await revokeGoogleToken(refreshToken);
      refreshToken = undefined;
      return mailRedirect(publicBaseUrl, 'failed');
    }
    await saveMailConnection(serviceClient, {
      userId: access.userId,
      provider: 'gmail',
      providerEmail: profile.email,
      providerAccountId: profile.accountId,
      refreshToken,
      grantedScopes: token.scopes,
      encryptionKey: getMailEncryptionKey(),
    });
    return mailRedirect(publicBaseUrl, 'connected');
  } catch {
    if (refreshToken) {
      try {
        await revokeGoogleToken(refreshToken);
      } catch {
        // 저장 실패 시 방금 발급된 권한 철회는 최선 노력으로 수행한다.
      }
    }
    return mailRedirect(publicBaseUrl, 'failed');
  }
}
