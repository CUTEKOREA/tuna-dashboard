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

function loginFailure(request: NextRequest, nextPath: string): NextResponse {
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('error', 'oauth_failed');
  loginUrl.searchParams.set('next', nextPath);
  return NextResponse.redirect(loginUrl, { headers: PRIVATE_HEADERS });
}

export async function GET(request: NextRequest) {
  const nextPath = normalizeDashboardNextPath(request.nextUrl.searchParams.get('next'));

  try {
    const callbackUrl = new URL('/auth/callback', getDashboardPublicOrigin());
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
    if (error || !data.url) return loginFailure(request, nextPath);
    return NextResponse.redirect(data.url, { headers: PRIVATE_HEADERS });
  } catch {
    return loginFailure(request, nextPath);
  }
}
