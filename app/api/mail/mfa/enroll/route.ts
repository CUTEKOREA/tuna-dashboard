import { hasTrustedMailOrigin } from '@/lib/mail/csrf';
import { mailError, mailJson } from '@/lib/mail/http';
import { authorizeMailRequest, createMailUserClient } from '@/lib/mail/request-auth';
import { getMailPublicBaseUrl } from '@/lib/mail/server-env';
import { isSafeTotpQrDataUrl } from '@/lib/mail/totp-qr';

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
    const client = await createMailUserClient();
    const factors = await client.auth.mfa.listFactors();
    if (factors.error) throw factors.error;
    const totpFactors = factors.data.all.filter((factor) => factor.factor_type === 'totp');
    const managedFactorName = '참치왕국 관리자 메일';
    if (totpFactors.some((factor) => factor.status === 'verified')) {
      return mailError(409, 'mfa_already_enrolled');
    }
    for (const factor of totpFactors.filter((item) => item.status === 'unverified')) {
      const result = await client.auth.mfa.unenroll({ factorId: factor.id });
      if (result.error) throw result.error;
    }
    const { data, error } = await client.auth.mfa.enroll({
      factorType: 'totp',
      friendlyName: managedFactorName,
    });
    if (
      error
      || !isSafeTotpQrDataUrl(data.totp.qr_code)
      || !data.totp.uri.startsWith('otpauth://totp/')
    ) {
      throw error ?? new Error('2단계 인증 응답이 올바르지 않습니다');
    }
    return mailJson({
      ok: true,
      factorId: data.id,
      qrCode: data.totp.qr_code,
    }, { headers: RESPONSE_HEADERS });
  } catch {
    return mailError(400, 'mfa_enrollment_failed');
  }
}
