import { hasTrustedMailOrigin } from '@/lib/mail/csrf';
import { revokeGoogleToken } from '@/lib/mail/google-client';
import { mailError, mailJson } from '@/lib/mail/http';
import { authorizeMailRequest } from '@/lib/mail/request-auth';
import { getMailEncryptionKey, getMailPublicBaseUrl } from '@/lib/mail/server-env';
import { createMailServiceClient } from '@/lib/mail/server-supabase';
import { deleteMailConnection, getMailConnection, readRefreshToken } from '@/lib/mail/token-store';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';
const RESPONSE_HEADERS = { 'Cache-Control': 'no-store, max-age=0' };

export async function DELETE(request: Request) {
  const access = await authorizeMailRequest(true);
  if (!access.ok) return mailError(access.status, access.code);

  try {
    if (!hasTrustedMailOrigin(request, getMailPublicBaseUrl())) {
      return mailError(403, 'invalid_origin');
    }
    const client = createMailServiceClient();
    const connection = await getMailConnection(client, access.userId, 'gmail');
    let revoked = true;
    let refreshToken: string | null = null;
    if (connection) {
      try {
        refreshToken = readRefreshToken(connection, getMailEncryptionKey());
      } catch {
        revoked = false;
      }
    }
    if (refreshToken) {
      try {
        await revokeGoogleToken(refreshToken);
      } catch {
        revoked = false;
      }
    }
    await deleteMailConnection(client, access.userId, 'gmail');
    return mailJson({ ok: true, revoked }, { headers: RESPONSE_HEADERS });
  } catch {
    return mailError(503, 'gmail_disconnect_failed');
  }
}
