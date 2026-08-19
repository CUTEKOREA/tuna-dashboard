import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { NextRequest } from 'next/server';
import { unstable_doesMiddlewareMatch } from 'next/experimental/testing/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  dashboardOwnerEmailConfig,
  evaluateDashboardOwnerClaims,
  evaluateDashboardOwnerUser,
  isPublicDashboardPath,
  normalizeDashboardNextPath,
} from '../lib/auth/owner-policy';
import { LOCAL_E2E_AUTH_HEADER } from '../lib/auth/local-e2e-access';
import { config, proxy } from '../proxy';

const authMocks = vi.hoisted(() => ({
  exchangeCodeForSession: vi.fn(),
  getClaims: vi.fn(),
  signInWithOAuth: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock('server-only', () => ({}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({
    getAll: () => [],
    set: vi.fn(),
  })),
}));

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      exchangeCodeForSession: authMocks.exchangeCodeForSession,
      getClaims: authMocks.getClaims,
      signInWithOAuth: authMocks.signInWithOAuth,
      signOut: authMocks.signOut,
    },
  })),
}));

const OWNER_EMAIL = 'owner@example.com';
const GOOGLE_CLAIMS = {
  sub: 'owner-user-id',
  email: OWNER_EMAIL,
  role: 'authenticated',
  is_anonymous: false,
  amr: [{ method: 'oauth', timestamp: 1_786_886_400 }],
  app_metadata: { provider: 'google', providers: ['google'] },
};

function apiRoutes(root: string): string[] {
  const apiRoot = join(root, 'app/api');
  const routes: string[] = [];

  function visit(directory: string): void {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const absolute = join(directory, entry.name);
      if (entry.isDirectory()) {
        visit(absolute);
      } else if (entry.name === 'route.ts') {
        routes.push(`/${absolute.slice(join(root, 'app').length + 1).replace(/\/route\.ts$/, '')}`);
      }
    }
  }

  visit(apiRoot);
  return routes;
}

describe('대시보드 단일 구글 계정 보안 경계', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key');
    vi.stubEnv('DASHBOARD_OWNER_EMAIL', OWNER_EMAIL);
    vi.stubEnv('DASHBOARD_PUBLIC_BASE_URL', 'https://dashboard.example');
    authMocks.exchangeCodeForSession.mockResolvedValue({ error: null });
    authMocks.getClaims.mockResolvedValue({ data: null, error: new Error('no session') });
    authMocks.signInWithOAuth.mockResolvedValue({
      data: { url: 'https://accounts.example/authorize' },
      error: null,
    });
    authMocks.signOut.mockResolvedValue({ error: null });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it('공용 비밀번호 대신 전역 서버 프록시와 구글 로그인만 사용한다', () => {
    const root = process.cwd();
    const pageSource = readFileSync(join(root, 'app/page.tsx'), 'utf8');
    const serverClientSource = readFileSync(join(root, 'lib/auth/server-supabase.ts'), 'utf8');
    const requestClientSource = readFileSync(join(root, 'lib/auth/supabase-request.ts'), 'utf8');

    expect(existsSync(join(root, 'proxy.ts'))).toBe(true);
    expect(existsSync(join(root, 'lib/auth/login-response.ts'))).toBe(true);
    expect(existsSync(join(root, 'app/auth/start/route.ts'))).toBe(true);
    expect(existsSync(join(root, 'app/auth/callback/route.ts'))).toBe(true);
    expect(pageSource).not.toContain('/api/operation-access');
    expect(pageSource).not.toContain('signInWithPassword');
    expect(pageSource).not.toContain('signUp');
    expect(pageSource).not.toContain('silla-operation-access');
    expect(serverClientSource).toContain("secure: process.env.NODE_ENV === 'production'");
    expect(requestClientSource).toContain("secure: process.env.NODE_ENV === 'production'");
  });

  it('정확히 허용된 구글 계정만 승인한다', () => {
    expect(evaluateDashboardOwnerClaims(GOOGLE_CLAIMS, ' OWNER@example.com ')).toEqual({
      ok: true,
      email: OWNER_EMAIL,
      subject: 'owner-user-id',
    });
    expect(evaluateDashboardOwnerClaims({
      ...GOOGLE_CLAIMS,
      email: 'other@example.com',
    }, OWNER_EMAIL)).toEqual({ ok: false, status: 403, code: 'owner_required' });
    expect(evaluateDashboardOwnerClaims({
      ...GOOGLE_CLAIMS,
      app_metadata: { provider: 'email', providers: ['email'] },
    }, OWNER_EMAIL)).toEqual({ ok: false, status: 403, code: 'google_account_required' });
    expect(evaluateDashboardOwnerClaims({
      ...GOOGLE_CLAIMS,
      app_metadata: { provider: 'email', providers: ['email', 'google'] },
    }, OWNER_EMAIL)).toEqual({
      ok: true,
      email: OWNER_EMAIL,
      subject: 'owner-user-id',
    });
    expect(evaluateDashboardOwnerClaims({
      ...GOOGLE_CLAIMS,
      amr: [{ method: 'password', timestamp: 1_786_886_400 }],
      app_metadata: { provider: 'email', providers: ['email', 'google'] },
    }, OWNER_EMAIL)).toEqual({ ok: false, status: 403, code: 'google_account_required' });
    expect(evaluateDashboardOwnerClaims({
      ...GOOGLE_CLAIMS,
      app_metadata: { provider: 'email', providers: ['email', 'google', 'github'] },
    }, OWNER_EMAIL)).toEqual({ ok: false, status: 403, code: 'google_account_required' });
    expect(evaluateDashboardOwnerClaims({
      ...GOOGLE_CLAIMS,
      amr: undefined,
    }, OWNER_EMAIL)).toEqual({ ok: false, status: 403, code: 'google_account_required' });
    expect(evaluateDashboardOwnerClaims(GOOGLE_CLAIMS, undefined)).toEqual({
      ok: false,
      status: 503,
      code: 'configuration_required',
    });
  });

  it('쉼표 목록의 모든 허용 계정을 승인하고 형식 오류는 전체를 잠근다', () => {
    const LIST = ' owner@example.com, second@example.com ,';
    expect(evaluateDashboardOwnerClaims(GOOGLE_CLAIMS, LIST)).toEqual({
      ok: true,
      email: OWNER_EMAIL,
      subject: 'owner-user-id',
    });
    expect(evaluateDashboardOwnerClaims({
      ...GOOGLE_CLAIMS,
      email: 'Second@Example.com',
    }, LIST)).toEqual({ ok: true, email: 'second@example.com', subject: 'owner-user-id' });
    expect(evaluateDashboardOwnerClaims({
      ...GOOGLE_CLAIMS,
      email: 'third@example.com',
    }, LIST)).toEqual({ ok: false, status: 403, code: 'owner_required' });
    // 목록에 형식이 틀린 항목이 하나라도 있으면 전체 잠금 (fail-closed)
    expect(evaluateDashboardOwnerClaims(GOOGLE_CLAIMS, 'owner@example.com,not-an-email')).toEqual({
      ok: false,
      status: 503,
      code: 'configuration_required',
    });
    expect(evaluateDashboardOwnerUser({
      id: 'owner-user-id',
      email: 'second@example.com',
      email_confirmed_at: '2026-08-16T00:00:00Z',
      app_metadata: { provider: 'google' },
      identities: [{ provider: 'google' }],
    }, LIST)).toMatchObject({ ok: true, email: 'second@example.com' });
  });

  it('추가 허용 목록(DASHBOARD_ALLOWED_EMAILS)은 소유자 변수가 있을 때만 병합된다', () => {
    vi.stubEnv('DASHBOARD_ALLOWED_EMAILS', 'second@example.com');
    expect(dashboardOwnerEmailConfig()).toBe(`${OWNER_EMAIL},second@example.com`);
    expect(evaluateDashboardOwnerClaims({
      ...GOOGLE_CLAIMS,
      email: 'second@example.com',
    }, dashboardOwnerEmailConfig())).toMatchObject({ ok: true, email: 'second@example.com' });
    // 소유자 변수가 비면 추가 목록만으로는 절대 열리지 않는다
    vi.stubEnv('DASHBOARD_OWNER_EMAIL', '');
    expect(dashboardOwnerEmailConfig()).toBeUndefined();
    expect(evaluateDashboardOwnerClaims(GOOGLE_CLAIMS, dashboardOwnerEmailConfig())).toEqual({
      ok: false,
      status: 503,
      code: 'configuration_required',
    });
  });

  it('메일의 최신 사용자 조회에서도 확인된 구글 소유자만 승인한다', () => {
    expect(evaluateDashboardOwnerUser({
      id: 'owner-user-id',
      email: OWNER_EMAIL,
      email_confirmed_at: '2026-08-16T00:00:00Z',
      app_metadata: { provider: 'google' },
      identities: [{ provider: 'google' }],
    }, OWNER_EMAIL)).toMatchObject({ ok: true, email: OWNER_EMAIL });
    expect(evaluateDashboardOwnerUser({
      id: 'owner-user-id',
      email: OWNER_EMAIL,
      email_confirmed_at: '2026-08-16T00:00:00Z',
      app_metadata: { provider: 'email' },
      identities: [{ provider: 'email' }],
    }, OWNER_EMAIL)).toEqual({ ok: false, status: 403, code: 'google_account_required' });
    expect(evaluateDashboardOwnerUser({
      id: 'owner-user-id',
      email: OWNER_EMAIL,
      email_confirmed_at: '2026-08-16T00:00:00Z',
      app_metadata: { provider: 'email', providers: ['email', 'google'] },
      identities: [{ provider: 'email' }, { provider: 'google' }],
    }, OWNER_EMAIL)).toMatchObject({ ok: true, email: OWNER_EMAIL });
    expect(evaluateDashboardOwnerUser({
      id: 'owner-user-id',
      email: OWNER_EMAIL,
      email_confirmed_at: '2026-08-16T00:00:00Z',
      app_metadata: { provider: 'email', providers: ['email', 'google', 'github'] },
      identities: [{ provider: 'email' }, { provider: 'google' }, { provider: 'github' }],
    }, OWNER_EMAIL)).toEqual({ ok: false, status: 403, code: 'google_account_required' });
  });

  it('로그인·콜백·서명 웹훅·cron과 캐시 삭제 서비스워커만 공개 경로로 둔다', () => {
    expect(isPublicDashboardPath('/login')).toBe(true);
    expect(isPublicDashboardPath('/mail/login')).toBe(true);
    expect(isPublicDashboardPath('/auth/start')).toBe(true);
    expect(isPublicDashboardPath('/auth/callback')).toBe(true);
    expect(isPublicDashboardPath('/api/webhooks/unloading')).toBe(true);
    // 2026-08-17: 주간 브리핑 cron — 라우트 내부 CRON_SECRET 검증으로 fail-closed
    expect(isPublicDashboardPath('/api/cron/weekly-briefing')).toBe(true);
    expect(isPublicDashboardPath('/sw.js')).toBe(true);
    expect(isPublicDashboardPath('/market')).toBe(false);
    expect(isPublicDashboardPath('/api/unloading-history')).toBe(false);
  });

  it('공개 하역 웹훅은 기본 토큰 없이 독립적으로 fail-closed 한다', async () => {
    const route = await import('../app/api/webhooks/unloading/route');
    vi.stubEnv('UNLOADING_WEBHOOK_SECRET', '');

    const unconfigured = await route.POST(new Request(
      'https://dashboard.example/api/webhooks/unloading?token=secret123',
      { method: 'POST' },
    ));
    expect(unconfigured.status).toBe(503);

    const secret = 'random-webhook-secret-that-is-longer-than-32-characters';
    vi.stubEnv('UNLOADING_WEBHOOK_SECRET', secret);
    const rejected = await route.POST(new Request(
      'https://dashboard.example/api/webhooks/unloading?token=secret123',
      { method: 'POST' },
    ));
    expect(rejected.status).toBe(401);

    const formData = new FormData();
    const authenticated = await route.POST(new Request(
      'https://dashboard.example/api/webhooks/unloading',
      {
        method: 'POST',
        headers: { 'x-unloading-webhook-secret': secret },
        body: formData,
      },
    ));
    expect(authenticated.status).toBe(400);
    await expect(authenticated.json()).resolves.toEqual({
      error: 'No text body found in email',
    });
  });

  it('외부·인증 경로로 향하는 next 값을 대시보드 기본 경로로 되돌린다', () => {
    expect(normalizeDashboardNextPath('/unloading?date=2026-08-15')).toBe('/unloading?date=2026-08-15');
    expect(normalizeDashboardNextPath('https://evil.example/steal')).toBe('/market');
    expect(normalizeDashboardNextPath('//evil.example/steal')).toBe('/market');
    expect(normalizeDashboardNextPath('/auth/callback')).toBe('/market');
    expect(normalizeDashboardNextPath('/login?next=/mail')).toBe('/market');
  });

  it('미인증 페이지는 로그인으로 보내고 미인증 API는 JSON 401로 닫는다', async () => {
    const pageResponse = await proxy(new NextRequest('https://dashboard.example/unloading?day=15'));
    expect(pageResponse.status).toBe(307);
    expect(pageResponse.headers.get('location')).toBe(
      'https://dashboard.example/login?next=%2Funloading%3Fday%3D15',
    );

    const apiResponse = await proxy(new NextRequest('https://dashboard.example/api/unloading-history'));
    expect(apiResponse.status).toBe(401);
    expect(await apiResponse.json()).toEqual({
      error: '구글 로그인이 필요합니다.',
      code: 'authentication_required',
    });
    expect(apiResponse.headers.get('cache-control')).toContain('no-store');
  });

  it('미인증 기존 브라우저도 캐시 삭제 서비스워커 갱신은 받을 수 있다', async () => {
    const response = await proxy(new NextRequest('https://dashboard.example/sw.js'));

    expect(response.status).toBe(200);
    expect(response.headers.get('x-middleware-next')).toBe('1');
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(authMocks.getClaims).not.toHaveBeenCalled();
  });

  it('로그인 화면은 서버 탐색 링크로 OAuth를 시작하고 엄격한 폼 CSP를 유지한다', async () => {
    const response = await proxy(new NextRequest(
      'https://dashboard.example/login?next=%2Funloading%3Fday%3D15',
    ));
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(response.headers.get('content-security-policy')).toContain("default-src 'none'");
    expect(response.headers.get('content-security-policy')).toContain("form-action 'self'");
    expect(html).toContain('참치왕국 보안 로그인');
    expect(html).toContain('구글 계정으로 로그인');
    expect(html).toContain('href="/auth/start?next=%2Funloading%3Fday%3D15"');
    expect(html).not.toContain('<form');
    expect(html).not.toContain('/_next/static');
    expect(html).not.toContain('<script');
    expect(authMocks.getClaims).not.toHaveBeenCalled();
  });

  it('보조 Vercel 호스트의 로그인 요청은 PKCE 전에 운영 호스트로 정규화한다', async () => {
    const pageResponse = await proxy(new NextRequest(
      'https://preview-alias.vercel.app/unloading?day=15',
    ));
    expect(pageResponse.status).toBe(307);
    expect(pageResponse.headers.get('location')).toBe(
      'https://dashboard.example/login?next=%2Funloading%3Fday%3D15',
    );

    const loginResponse = await proxy(new NextRequest(
      'https://preview-alias.vercel.app/login?next=%2Funloading',
    ));

    expect(loginResponse.status).toBe(307);
    expect(loginResponse.headers.get('location')).toBe(
      'https://dashboard.example/login?next=%2Funloading',
    );
    expect(authMocks.getClaims).toHaveBeenCalledTimes(1);
  });

  it('서버 OAuth 시작과 콜백이 안전한 복귀 경로로 구글 세션을 연결한다', async () => {
    const startRoute = await import('../app/auth/start/route');
    const canonicalStart = await startRoute.GET(new NextRequest(
      'https://forged-host.example/auth/start?next=%2Funloading%3Fday%3D15',
    ));
    expect(canonicalStart.status).toBe(307);
    expect(canonicalStart.headers.get('location')).toBe(
      'https://dashboard.example/auth/start?next=%2Funloading%3Fday%3D15',
    );
    expect(authMocks.signInWithOAuth).not.toHaveBeenCalled();

    const startResponse = await startRoute.GET(new NextRequest(
      'https://dashboard.example/auth/start?next=%2Funloading%3Fday%3D15',
    ));
    expect(startResponse.status).toBe(307);
    expect(startResponse.headers.get('location')).toBe('https://accounts.example/authorize');
    expect(authMocks.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: {
        redirectTo: 'https://dashboard.example/auth/callback?next=%2Funloading%3Fday%3D15',
        scopes: 'openid email profile',
        queryParams: { prompt: 'select_account' },
      },
    });

    authMocks.getClaims.mockResolvedValue({ data: { claims: GOOGLE_CLAIMS }, error: null });
    const callbackRoute = await import('../app/auth/callback/route');
    const canonicalCallback = await callbackRoute.GET(new NextRequest(
      'https://forged-host.example/auth/callback?code=oauth-code&next=%2Funloading%3Fday%3D15',
    ));
    expect(canonicalCallback.status).toBe(307);
    expect(canonicalCallback.headers.get('location')).toBe(
      'https://dashboard.example/auth/callback?code=oauth-code&next=%2Funloading%3Fday%3D15',
    );
    expect(authMocks.exchangeCodeForSession).not.toHaveBeenCalled();

    const callbackResponse = await callbackRoute.GET(new NextRequest(
      'https://dashboard.example/auth/callback?code=oauth-code&next=%2Funloading%3Fday%3D15',
    ));
    expect(authMocks.exchangeCodeForSession).toHaveBeenCalledWith('oauth-code');
    expect(callbackResponse.status).toBe(307);
    expect(callbackResponse.headers.get('location')).toBe(
      'https://dashboard.example/unloading?day=15',
    );
  });

  it('다른 계정과 비구글 계정은 세션이 있어도 거부한다', async () => {
    authMocks.getClaims.mockResolvedValue({
      data: { claims: { ...GOOGLE_CLAIMS, email: 'other@example.com' } },
      error: null,
    });
    const otherAccount = await proxy(new NextRequest('https://dashboard.example/api/tuna'));
    expect(otherAccount.status).toBe(403);

    authMocks.getClaims.mockResolvedValue({
      data: {
        claims: {
          ...GOOGLE_CLAIMS,
          app_metadata: { provider: 'email', providers: ['email'] },
        },
      },
      error: null,
    });
    const passwordAccount = await proxy(new NextRequest('https://dashboard.example/market'));
    expect(passwordAccount.status).toBe(307);
    expect(passwordAccount.headers.get('location')).toContain('error=google_account_required');
  });

  it('허용된 구글 계정은 페이지와 API를 통과시킨다', async () => {
    authMocks.getClaims.mockResolvedValue({ data: { claims: GOOGLE_CLAIMS }, error: null });

    const pageResponse = await proxy(new NextRequest('https://dashboard.example/market'));
    const apiResponse = await proxy(new NextRequest('https://dashboard.example/api/tuna'));

    expect(pageResponse.status).toBe(200);
    expect(pageResponse.headers.get('x-middleware-next')).toBe('1');
    expect(apiResponse.status).toBe(200);
    expect(apiResponse.headers.get('cache-control')).toContain('private');
  });

  it('로컬 E2E 난수 경계는 loopback에서만 열리고 Vercel에서는 열리지 않는다', async () => {
    const secret = 'random-test-secret-that-is-longer-than-32-characters';
    vi.stubEnv('DASHBOARD_E2E_MODE', 'local');
    vi.stubEnv('DASHBOARD_E2E_AUTH_SECRET', secret);
    vi.stubEnv('VERCEL', '');
    vi.stubEnv('VERCEL_ENV', '');

    const localResponse = await proxy(new NextRequest('http://127.0.0.1:3027/unloading', {
      headers: { [LOCAL_E2E_AUTH_HEADER]: secret },
    }));
    expect(localResponse.status).toBe(200);
    expect(localResponse.headers.get('x-middleware-next')).toBe('1');
    expect(authMocks.getClaims).not.toHaveBeenCalled();

    const externalResponse = await proxy(new NextRequest('https://dashboard.example/unloading', {
      headers: { [LOCAL_E2E_AUTH_HEADER]: secret },
    }));
    expect(externalResponse.status).toBe(307);

    vi.stubEnv('VERCEL', '1');
    const vercelResponse = await proxy(new NextRequest('http://127.0.0.1:3027/unloading', {
      headers: { [LOCAL_E2E_AUTH_HEADER]: secret },
    }));
    expect(vercelResponse.status).toBe(307);
  });

  it('모든 API·JSON·실행 청크·이미지는 프록시 대상이다', () => {
    const root = process.cwd();
    for (const route of apiRoutes(root)) {
      expect(unstable_doesMiddlewareMatch({ config, nextConfig: {}, url: route }), route).toBe(true);
    }
    expect(unstable_doesMiddlewareMatch({ config, nextConfig: {}, url: '/data/private.json' })).toBe(true);
    expect(unstable_doesMiddlewareMatch({ config, nextConfig: {}, url: '/_next/static/chunk.js' })).toBe(true);
    expect(unstable_doesMiddlewareMatch({ config, nextConfig: {}, url: '/icons/icon-192.png' })).toBe(true);
  });

  it('인증 이미지의 요청 헤더를 잃는 최적화 경로를 사용하지 않는다', () => {
    const nextConfigSource = readFileSync(join(process.cwd(), 'next.config.mjs'), 'utf8');

    expect(nextConfigSource).toMatch(/images:\s*\{\s*unoptimized: true,/);
  });
});
