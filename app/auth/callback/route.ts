import { NextResponse, type NextRequest } from 'next/server';
import { createDashboardUserClient } from '@/lib/auth/server-supabase';
import {
  dashboardOwnerEmailConfig,
  evaluateDashboardOwnerClaims,
  normalizeDashboardNextPath,
  type OwnerAccessCode,
} from '@/lib/auth/owner-policy';
import { getDashboardPublicOrigin } from '@/lib/auth/server-config';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function loginRedirect(
  publicOrigin: string,
  error: OwnerAccessCode | 'oauth_failed',
  nextPath: string,
): NextResponse {
  const loginUrl = new URL('/login', publicOrigin);
  loginUrl.searchParams.set('error', error);
  loginUrl.searchParams.set('next', nextPath);
  return NextResponse.redirect(loginUrl, {
    headers: {
      'Cache-Control': 'private, no-store, max-age=0',
      Vary: 'Cookie',
    },
  });
}

export async function GET(request: NextRequest) {
  const nextPath = normalizeDashboardNextPath(request.nextUrl.searchParams.get('next'));

  try {
    const publicOrigin = getDashboardPublicOrigin();
    if (request.nextUrl.origin !== publicOrigin) {
      const canonicalUrl = new URL(`/auth/callback${request.nextUrl.search}`, publicOrigin);
      return NextResponse.redirect(canonicalUrl, {
        headers: {
          'Cache-Control': 'private, no-store, max-age=0',
          Vary: 'Cookie',
        },
      });
    }
    const code = request.nextUrl.searchParams.get('code');
    if (!code || request.nextUrl.searchParams.has('error')) {
      return loginRedirect(publicOrigin, 'oauth_failed', nextPath);
    }
    const client = await createDashboardUserClient();
    const { error: exchangeError } = await client.auth.exchangeCodeForSession(code);
    if (exchangeError) return loginRedirect(publicOrigin, 'oauth_failed', nextPath);

    const { data, error: claimsError } = await client.auth.getClaims();
    const access = claimsError || !data?.claims
      ? { ok: false as const, status: 401 as const, code: 'authentication_required' as const }
      : evaluateDashboardOwnerClaims(data.claims, dashboardOwnerEmailConfig());

    if (!access.ok) {
      await client.auth.signOut({ scope: 'local' });
      return loginRedirect(publicOrigin, access.code, nextPath);
    }

    return NextResponse.redirect(new URL(nextPath, publicOrigin), {
      headers: {
        'Cache-Control': 'private, no-store, max-age=0',
        Vary: 'Cookie',
      },
    });
  } catch {
    return new NextResponse('접속 보안 설정이 완료되지 않았습니다.', {
      status: 503,
      headers: {
        'Cache-Control': 'private, no-store, max-age=0',
        'Content-Type': 'text/plain; charset=utf-8',
        Vary: 'Cookie',
      },
    });
  }
}
