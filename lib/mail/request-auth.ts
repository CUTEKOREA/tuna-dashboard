import 'server-only';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { parseAdminEmailAllowlist } from './admin-auth';
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
