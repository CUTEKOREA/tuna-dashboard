import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

/**
 * 쿠키 기반 세션 클라이언트 (@supabase/ssr).
 *
 * 기존 @supabase/supabase-js 기본 클라이언트는 세션을 localStorage에만 저장해
 * 서버(API Route)가 인증 상태를 볼 수 없었음. createBrowserClient는 세션을
 * 쿠키에 저장하므로 /api/atuna-prices 등 라우트에서 createServerClient로
 * 세션 검증이 가능해짐 (A-5 인증 게이팅).
 *
 * 주의: 전환 시점에 기존 localStorage 세션은 인계되지 않으므로
 * 기존 로그인 사용자는 1회 재로그인이 필요함.
 *
 * auth API 시그니처(supabase.auth.getSession / onAuthStateChange /
 * 세션 조회와 로그아웃 API 시그니처는 supabase-js와 동일.
 */
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey, {
  cookieOptions: {
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  },
});
