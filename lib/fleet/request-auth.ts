import 'server-only';

import { createServerUserClient, getSupabaseRequestConfig } from '@/lib/auth/supabase-request';
import { buildFleetEffectiveAllowlist, evaluateFleetAccess, type FleetAccessResult } from './server-auth';

export async function authorizeFleetRequest(): Promise<FleetAccessResult> {
  if (!process.env.FLEET_ALLOWED_EMAILS?.trim() || !process.env.MAIL_ADMIN_EMAILS?.trim()) {
    return { ok: false, status: 503, code: 'fleet_auth_unavailable' };
  }
  try {
    getSupabaseRequestConfig();
  } catch {
    return { ok: false, status: 503, code: 'fleet_auth_unavailable' };
  }

  try {
    const client = await createServerUserClient();
    const { data: userData, error: userError } = await client.auth.getUser();
    if (userError || !userData.user) {
      return { ok: false, status: 401, code: 'authentication_required' };
    }
    const { data: aalData, error: aalError } = await client.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aalError) {
      return { ok: false, status: 503, code: 'fleet_auth_unavailable' };
    }
    return evaluateFleetAccess(
      userData.user,
      aalData.currentLevel,
      buildFleetEffectiveAllowlist(
        process.env.FLEET_ALLOWED_EMAILS,
        process.env.MAIL_ADMIN_EMAILS,
      ),
    );
  } catch {
    return { ok: false, status: 503, code: 'fleet_auth_unavailable' };
  }
}
