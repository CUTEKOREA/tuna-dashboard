import { authorizeMailRequest, createMailUserClient } from '@/lib/mail/request-auth';
import { mailError, mailJson } from '@/lib/mail/http';
import { createMailServiceClient } from '@/lib/mail/server-supabase';
import { getCompanySmtpConfig } from '@/lib/mail/server-env';
import { getMailConnectionSummary } from '@/lib/mail/token-store';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';
const RESPONSE_HEADERS = { 'Cache-Control': 'no-store, max-age=0' };

export async function GET() {
  const access = await authorizeMailRequest(false);
  if (!access.ok) return mailError(access.status, access.code);

  try {
    const userClient = await createMailUserClient();
    const factors = await userClient.auth.mfa.listFactors();
    if (factors.error) throw factors.error;
    const verifiedTotp = factors.data.all.find((factor) => (
      factor.factor_type === 'totp' && factor.status === 'verified'
    ));
    const gmail = access.aal === 'aal2'
      ? await getMailConnectionSummary(createMailServiceClient(), access.userId, 'gmail')
      : null;
    let companySmtp: { from: string } | null = null;
    if (access.aal === 'aal2') {
      try {
        const config = getCompanySmtpConfig();
        companySmtp = { from: config.from };
      } catch {
        companySmtp = null;
      }
    }
    return mailJson({
      ok: true,
      aal: access.aal,
      mfa: {
        required: access.aal !== 'aal2',
        enrolled: Boolean(verifiedTotp),
        factorId: verifiedTotp?.id ?? null,
      },
      gmail: gmail ? {
        email: gmail.provider_email,
        connectedAt: gmail.connected_at,
      } : null,
      companySmtp: companySmtp ? { from: companySmtp.from } : null,
    }, { headers: RESPONSE_HEADERS });
  } catch {
    return mailError(503, 'mail_service_unavailable');
  }
}
