import 'server-only';

import { createServerUserClient, getSupabaseRequestConfig } from '@/lib/auth/supabase-request';
import { dashboardOwnerEmailConfig, evaluateDashboardOwnerUser } from '@/lib/auth/owner-policy';
import { evaluateFleetAccess, type FleetAccessResult } from './server-auth';

export async function authorizeFleetRequest(): Promise<FleetAccessResult> {
  if (!process.env.DASHBOARD_OWNER_EMAIL?.trim()) {
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
    const user = userData.user;
    const ownerAccess = evaluateDashboardOwnerUser({
      id: user.id,
      email: user.email,
      email_confirmed_at: user.email_confirmed_at,
      app_metadata: {
        provider: user.app_metadata?.provider,
        providers: user.app_metadata?.providers,
      },
      identities: user.identities?.map((identity) => ({ provider: identity.provider })),
    }, dashboardOwnerEmailConfig());
    if (!ownerAccess.ok) {
      if (ownerAccess.status === 401) {
        return { ok: false, status: 401, code: 'authentication_required' };
      }
      if (ownerAccess.status === 503) {
        return { ok: false, status: 503, code: 'fleet_auth_unavailable' };
      }
      return { ok: false, status: 403, code: 'fleet_access_required' };
    }
    return evaluateFleetAccess(
      user,
      new Set([ownerAccess.email]),
    );
  } catch {
    return { ok: false, status: 503, code: 'fleet_auth_unavailable' };
  }
}
