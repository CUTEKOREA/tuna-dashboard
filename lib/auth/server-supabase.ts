import 'server-only';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { getSupabaseAuthConfig } from '@/lib/mail/server-env';

export async function createDashboardUserClient() {
  const config = getSupabaseAuthConfig();
  const cookieStore = await cookies();

  return createServerClient(config.url, config.anonKey, {
    cookieOptions: {
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    },
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
