import { hasTrustedMailOrigin } from '@/lib/mail/csrf';
import { mailError, mailJson } from '@/lib/mail/http';
import { authorizeMailRequest, createMailUserClient } from '@/lib/mail/request-auth';
import { getMailPublicBaseUrl } from '@/lib/mail/server-env';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';
const RESPONSE_HEADERS = { 'Cache-Control': 'no-store, max-age=0' };

export async function POST(request: Request) {
  const access = await authorizeMailRequest(false);
  if (!access.ok) return mailError(access.status, access.code);

  try {
    if (!hasTrustedMailOrigin(request, getMailPublicBaseUrl())) {
      return mailError(403, 'invalid_origin');
    }
    const value = await request.json() as { factorId?: unknown; code?: unknown };
    if (
      typeof value.factorId !== 'string'
      || !value.factorId
      || typeof value.code !== 'string'
      || !/^\d{6}$/.test(value.code)
    ) return mailError(400, 'invalid_mfa_code');

    const client = await createMailUserClient();
    const factors = await client.auth.mfa.listFactors();
    if (factors.error || !factors.data.all.some((factor) => (
      factor.id === value.factorId && factor.factor_type === 'totp'
    ))) {
      return mailError(403, 'invalid_mfa_factor');
    }
    const result = await client.auth.mfa.challengeAndVerify({ factorId: value.factorId, code: value.code });
    if (result.error) return mailError(403, 'mfa_verification_failed');
    return mailJson({ ok: true }, { headers: RESPONSE_HEADERS });
  } catch {
    return mailError(400, 'mfa_verification_failed');
  }
}
