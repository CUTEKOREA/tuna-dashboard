import { NextResponse, type NextRequest } from 'next/server';
import { createDashboardUserClient } from '@/lib/auth/server-supabase';
import { normalizeDashboardNextPath } from '@/lib/auth/owner-policy';
import { getDashboardPublicOrigin } from '@/lib/auth/server-config';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const PRIVATE_HEADERS = {
  'Cache-Control': 'private, no-store, max-age=0',
  Vary: 'Cookie',
};

function loginFailure(publicOrigin: string, nextPath: string): NextResponse {
  const loginUrl = new URL('/login', publicOrigin);
  loginUrl.searchParams.set('error', 'oauth_failed');
  loginUrl.searchParams.set('next', nextPath);
  return NextResponse.redirect(loginUrl, { headers: PRIVATE_HEADERS });
}

export async function GET(request: NextRequest) {
  const nextPath = normalizeDashboardNextPath(request.nextUrl.searchParams.get('next'));

  try {
    const publicOrigin = getDashboardPublicOrigin();
    if (request.nextUrl.origin !== publicOrigin) {
      const canonicalUrl = new URL(`/auth/start${request.nextUrl.search}`, publicOrigin);
      return NextResponse.redirect(canonicalUrl, { headers: PRIVATE_HEADERS });
    }
    const callbackUrl = new URL('/auth/callback', publicOrigin);
    callbackUrl.searchParams.set('next', nextPath);
    const client = await createDashboardUserClient();
    const { data, error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: callbackUrl.toString(),
        scopes: 'openid email profile',
        queryParams: { prompt: 'select_account' },
      },
    });
    if (error || !data.url) return loginFailure(publicOrigin, nextPath);
    return NextResponse.redirect(data.url, { headers: PRIVATE_HEADERS });
  } catch {
    return new NextResponse('접속 보안 설정이 완료되지 않았습니다.', {
      status: 503,
      headers: {
        ...PRIVATE_HEADERS,
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  }
}
