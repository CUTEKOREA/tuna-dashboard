import { NextResponse, type NextRequest } from 'next/server';
import { createDashboardUserClient } from '@/lib/auth/server-supabase';
import {
  evaluateDashboardOwnerClaims,
  normalizeDashboardNextPath,
  type OwnerAccessCode,
} from '@/lib/auth/owner-policy';
import { getDashboardPublicOrigin } from '@/lib/auth/server-config';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function loginRedirect(
  request: NextRequest,
  error: OwnerAccessCode | 'oauth_failed',
  nextPath: string,
): NextResponse {
  const loginUrl = new URL('/login', request.url);
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
  const code = request.nextUrl.searchParams.get('code');
  const nextPath = normalizeDashboardNextPath(request.nextUrl.searchParams.get('next'));
  if (!code || request.nextUrl.searchParams.has('error')) {
    return loginRedirect(request, 'oauth_failed', nextPath);
  }

  try {
    const publicOrigin = getDashboardPublicOrigin();
    const client = await createDashboardUserClient();
    const { error: exchangeError } = await client.auth.exchangeCodeForSession(code);
    if (exchangeError) return loginRedirect(request, 'oauth_failed', nextPath);

    const { data, error: claimsError } = await client.auth.getClaims();
    const access = claimsError || !data?.claims
      ? { ok: false as const, status: 401 as const, code: 'authentication_required' as const }
      : evaluateDashboardOwnerClaims(data.claims, process.env.DASHBOARD_OWNER_EMAIL);

    if (!access.ok) {
      await client.auth.signOut({ scope: 'local' });
      return loginRedirect(request, access.code, nextPath);
    }

    return NextResponse.redirect(new URL(nextPath, publicOrigin), {
      headers: {
        'Cache-Control': 'private, no-store, max-age=0',
        Vary: 'Cookie',
      },
    });
  } catch {
    return loginRedirect(request, 'configuration_required', nextPath);
  }
}
