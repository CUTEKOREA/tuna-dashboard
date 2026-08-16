import 'server-only';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { evaluateDashboardOwnerUser } from '@/lib/auth/owner-policy';
import { evaluateMailAccess, type MailAccessResult } from './server-auth';
import { getSupabaseAuthConfig } from './server-env';

export async function createMailUserClient() {
  const config = getSupabaseAuthConfig();
  const cookieStore = await cookies();
  return createServerClient(config.url, config.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        for (const cookie of cookiesToSet) {
          try {
            cookieStore.set(cookie.name, cookie.value, cookie.options);
          } catch {
            // 읽기 전용 렌더 문맥에서는 쿠키 갱신이 불가능할 수 있다.
          }
        }
      },
    },
  });
}

export async function authorizeMailRequest(requireAal2: boolean): Promise<MailAccessResult> {
  try {
    getSupabaseAuthConfig();
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
    } : null, process.env.DASHBOARD_OWNER_EMAIL);
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
