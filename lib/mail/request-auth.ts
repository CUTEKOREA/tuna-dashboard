import 'server-only';
import { createServerUserClient, getSupabaseRequestConfig } from '@/lib/auth/supabase-request';
import { parseAdminEmailAllowlist } from './admin-auth';
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
    const { data: aalData, error: aalError } = await client.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aalError) {
      return { ok: false, status: 401, code: 'authentication_required' };
    }

    return evaluateMailAccess(
      userData.user,
      aalData.currentLevel,
      parseAdminEmailAllowlist(process.env.MAIL_ADMIN_EMAILS),
      requireAal2,
    );
  } catch {
    return { ok: false, status: 401, code: 'authentication_required' };
  }
}
