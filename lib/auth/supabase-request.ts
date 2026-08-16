import 'server-only';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error('서버 인증 설정이 완료되지 않았습니다');
  return value;
}

export function getSupabaseRequestConfig(): { url: string; anonKey: string } {
  return {
    url: required('NEXT_PUBLIC_SUPABASE_URL'),
    anonKey: required('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  };
}

export async function createServerUserClient() {
  const config = getSupabaseRequestConfig();
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
