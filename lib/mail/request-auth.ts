import 'server-only';
import { createServerUserClient, getSupabaseRequestConfig } from '@/lib/auth/supabase-request';
import { dashboardOwnerEmailConfig, evaluateDashboardOwnerUser } from '@/lib/auth/owner-policy';
import { evaluateMailAccess, type MailAccessResult } from './server-auth';

export async function createMailUserClient() {
  return createServerUserClient();
}

export async function authorizeMailRequest(requireAal2: boolean): Promise<MailAccessResult> {
  try {
    getSupabaseRequestConfig();
  } catch {
    return { ok: false, status: 401, code: 'authentication_required' };
  }

  try {
    const client = await createMailUserClient();
    const { data: userData, error: userError } = await client.auth.getUser();
    if (userError) {
      return { ok: false, status: 401, code: 'authentication_required' };
    }
    const user = userData.user;
    const ownerAccess = evaluateDashboardOwnerUser(user ? {
      id: user.id,
      email: user.email,
      email_confirmed_at: user.email_confirmed_at,
      app_metadata: {
        provider: user.app_metadata?.provider,
        providers: user.app_metadata?.providers,
      },
      identities: user.identities?.map((identity) => ({ provider: identity.provider })),
    } : null, dashboardOwnerEmailConfig());
    if (!ownerAccess.ok) {
      return ownerAccess.status === 401
        ? { ok: false, status: 401, code: 'authentication_required' }
        : { ok: false, status: 403, code: 'admin_required' };
    }

    const { data: aalData, error: aalError } = await client.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aalError) {
      return { ok: false, status: 401, code: 'authentication_required' };
    }

    return evaluateMailAccess(
      user,
      aalData.currentLevel,
      new Set([ownerAccess.email]),
      requireAal2,
    );
  } catch {
    return { ok: false, status: 401, code: 'authentication_required' };
  }
}
