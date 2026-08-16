import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseAuthConfig } from '@/lib/mail/server-env';
import {
  evaluateDashboardOwnerClaims,
  isPublicDashboardPath,
  normalizeDashboardNextPath,
  type OwnerAccessResult,
} from './owner-policy';
import { isLocalDashboardE2ERequest } from './local-e2e-access';
import { renderDashboardLogin } from './login-response';

const PRIVATE_HEADERS = {
  'Cache-Control': 'private, no-store, max-age=0',
  Vary: 'Cookie',
};

function privateResponse(response: NextResponse): NextResponse {
  for (const [name, value] of Object.entries(PRIVATE_HEADERS)) {
    response.headers.set(name, value);
  }
  return response;
}

function apiDenied(access: Extract<OwnerAccessResult, { ok: false }>): NextResponse {
  const message = access.status === 401
    ? '구글 로그인이 필요합니다.'
    : access.status === 503
      ? '접속 보안 설정이 완료되지 않았습니다.'
      : '허용된 구글 계정이 아닙니다.';

  return NextResponse.json(
    { error: message, code: access.code },
    { status: access.status, headers: PRIVATE_HEADERS },
  );
}

function pageDenied(
  request: NextRequest,
  access: Extract<OwnerAccessResult, { ok: false }>,
): NextResponse {
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set(
    'next',
    normalizeDashboardNextPath(`${request.nextUrl.pathname}${request.nextUrl.search}`),
  );
  if (access.code !== 'authentication_required') {
    loginUrl.searchParams.set('error', access.code);
  }
  return privateResponse(NextResponse.redirect(loginUrl));
}

export async function updateDashboardOwnerSession(request: NextRequest): Promise<NextResponse> {
  if (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/mail/login') {
    return renderDashboardLogin(request);
  }
  if (isPublicDashboardPath(request.nextUrl.pathname)) {
    return privateResponse(NextResponse.next());
  }
  if (isLocalDashboardE2ERequest(request)) {
    return privateResponse(NextResponse.next({ request }));
  }

  let response = NextResponse.next({ request });
  let access: OwnerAccessResult;

  try {
    const config = getSupabaseAuthConfig();
    const supabase = createServerClient(config.url, config.anonKey, {
      cookieOptions: {
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      },
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const cookie of cookiesToSet) {
            request.cookies.set(cookie.name, cookie.value);
          }
          response = NextResponse.next({ request });
          for (const cookie of cookiesToSet) {
            response.cookies.set(cookie.name, cookie.value, cookie.options);
          }
        },
      },
    });
    const { data, error } = await supabase.auth.getClaims();
    access = error || !data?.claims
      ? { ok: false, status: 401, code: 'authentication_required' }
      : evaluateDashboardOwnerClaims(data.claims, process.env.DASHBOARD_OWNER_EMAIL);
  } catch {
    access = { ok: false, status: 503, code: 'configuration_required' };
  }

  if (!access.ok) {
    return request.nextUrl.pathname.startsWith('/api/')
      ? apiDenied(access)
      : pageDenied(request, access);
  }

  return privateResponse(response);
}
