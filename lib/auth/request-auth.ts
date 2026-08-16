import 'server-only';
import { createDashboardUserClient } from './server-supabase';
import {
  evaluateDashboardOwnerClaims,
  type OwnerAccessResult,
} from './owner-policy';

export async function authorizeDashboardRequest(): Promise<OwnerAccessResult> {
  try {
    const client = await createDashboardUserClient();
    const { data, error } = await client.auth.getClaims();
    if (error || !data?.claims) {
      return { ok: false, status: 401, code: 'authentication_required' };
    }
    return evaluateDashboardOwnerClaims(
      data.claims,
      process.env.DASHBOARD_OWNER_EMAIL,
    );
  } catch {
    return { ok: false, status: 503, code: 'configuration_required' };
  }
}
