import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const COOKIE_NAME = 'silla-operation-access-v1';
const NOW = new Date('2026-08-15T12:00:00.000Z');
const TEST_PASSWORD = 'Tuna-Operation!2026';
const TEST_SECRET = 'test-operation-secret-at-least-32-characters';
const LEGACY_CLIENT_PASSWORD = 'a34349900';

const authState = vi.hoisted(() => ({
  operationCookie: null as string | null,
}));

vi.mock('server-only', () => ({}));

vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) => (
      name === COOKIE_NAME && authState.operationCookie
        ? { name, value: authState.operationCookie }
        : undefined
    ),
    getAll: () => [],
  }),
}));

vi.mock('@supabase/ssr', () => ({
  createServerClient: () => ({
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
    },
  }),
}));

type OperationAccessRoute = {
  GET: () => Promise<Response>;
  POST: (request: Request) => Promise<Response>;
  DELETE: () => Promise<Response>;
};

async function loadOperationAccessRoute(): Promise<OperationAccessRoute> {
  return import('../app/api/operation-access/route')
    .then((module) => module as OperationAccessRoute);
}

function readOperationCookie(response: Response): string {
  const setCookie = response.headers.get('set-cookie') ?? '';
  const match = new RegExp(`${COOKIE_NAME}=([^;]+)`).exec(setCookie);
  expect(setCookie).toContain('HttpOnly');
  expect(setCookie).toMatch(/SameSite=Lax/i);
  expect(match).not.toBeNull();
  return decodeURIComponent(match?.[1] ?? '');
}

async function readAtunaResponse() {
  const { GET } = await import('../app/api/atuna-prices/route');
  const response = await GET();
  expect(response.headers.get('cache-control')).toContain('no-store');
  expect(response.headers.get('vary')).toContain('Cookie');
  return response.json() as Promise<{
    restricted: boolean;
    restrictedNote?: string;
    history: Array<{ date: string }>;
  }>;
}

describe('운영 화면 접근과 Atuna 전체 이력', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    vi.stubEnv('SILLA_OPERATION_PASSWORD', TEST_PASSWORD);
    vi.stubEnv('SILLA_OPERATION_ACCESS_SECRET', TEST_SECRET);
    authState.operationCookie = null;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });

  it('화면 비밀번호를 검증한 새 기기에 HttpOnly 쿠키를 발급하고 전체 이력을 제공한다', async () => {
    const accessRoute = await loadOperationAccessRoute();

    const loginResponse = await accessRoute.POST(new Request('https://dashboard.example/api/operation-access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: TEST_PASSWORD }),
    }));
    expect(loginResponse.status).toBe(200);
    expect(loginResponse.headers.get('set-cookie')).toContain('Secure');
    authState.operationCookie = readOperationCookie(loginResponse);

    const statusResponse = await accessRoute.GET();
    expect(await statusResponse.json()).toEqual({ granted: true });

    const atuna = await readAtunaResponse();
    expect(atuna.restricted).toBe(false);
    expect(atuna.restrictedNote).toBeUndefined();
    expect(atuna.history.length).toBeGreaterThan(700);
    expect(atuna.history.some((row) => row.date === '2022-01-01')).toBe(true);
  });

  it('모바일에서도 영숫자 서버 비밀번호를 입력할 수 있다', () => {
    const pageSource = readFileSync(join(process.cwd(), 'app/page.tsx'), 'utf8');

    expect(pageSource).not.toContain('inputMode="numeric"');
    expect(pageSource).toContain('autoComplete="current-password"');
  });

  it('모바일에서 전체 메뉴 잠금이 성공하면 열린 사이드바도 닫는다', () => {
    const pageSource = readFileSync(join(process.cwd(), 'app/page.tsx'), 'utf8');
    const handlerStart = pageSource.indexOf('const handleOperationLock = async () => {');
    const handlerEnd = pageSource.indexOf('\n  const toggleTheme', handlerStart);
    const handlerSource = pageSource.slice(handlerStart, handlerEnd);

    expect(handlerStart).toBeGreaterThanOrEqual(0);
    expect(handlerEnd).toBeGreaterThan(handlerStart);
    expect(handlerSource).toMatch(
      /window\.sessionStorage\.removeItem\(OPERATION_ACCESS_STORAGE_KEY\);\s*setOperationAccessGranted\(false\);\s*setIsMobileSidebarOpen\(false\);/,
    );
  });

  it('틀린 비밀번호와 변조된 쿠키에는 최근 90일 프리뷰만 제공한다', async () => {
    const accessRoute = await loadOperationAccessRoute();

    const denied = await accessRoute.POST(new Request('http://localhost/api/operation-access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'wrong-password' }),
    }));
    expect(denied.status).toBe(401);
    expect(denied.headers.get('set-cookie')).toBeNull();

    authState.operationCookie = 'v1.9999999999999.tampered';
    const statusResponse = await accessRoute.GET();
    expect(await statusResponse.json()).toEqual({ granted: false });

    const atuna = await readAtunaResponse();
    expect(atuna.restricted).toBe(true);
    expect(atuna.restrictedNote).toContain('최근 90일');
    expect(atuna.history.length).toBeGreaterThan(0);
    expect(atuna.history.every((row) => row.date >= '2026-05-08')).toBe(true);
    expect(atuna.history.some((row) => row.date === '2022-01-01')).toBe(false);
  });

  it('서버 전용 설정이 비었거나 과거 클라이언트 비밀번호면 권한을 발급하지 않는다', async () => {
    vi.stubEnv('SILLA_OPERATION_PASSWORD', '');
    vi.stubEnv('SILLA_OPERATION_ACCESS_SECRET', '');
    const accessRoute = await loadOperationAccessRoute();

    const missingConfig = await accessRoute.POST(new Request('https://dashboard.example/api/operation-access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: LEGACY_CLIENT_PASSWORD }),
    }));
    expect(missingConfig.status).toBe(503);
    expect(missingConfig.headers.get('set-cookie')).toBeNull();
    expect(await (await accessRoute.GET()).json()).toEqual({ granted: false });
    expect((await readAtunaResponse()).restricted).toBe(true);

    vi.stubEnv('SILLA_OPERATION_PASSWORD', LEGACY_CLIENT_PASSWORD);
    vi.stubEnv('SILLA_OPERATION_ACCESS_SECRET', TEST_SECRET);
    const legacyPassword = await accessRoute.POST(new Request('https://dashboard.example/api/operation-access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: LEGACY_CLIENT_PASSWORD }),
    }));
    expect(legacyPassword.status).toBe(503);
    expect(legacyPassword.headers.get('set-cookie')).toBeNull();

    vi.stubEnv('SILLA_OPERATION_PASSWORD', 'weak-operation-password-2026');
    vi.stubEnv('SILLA_OPERATION_ACCESS_SECRET', TEST_SECRET);
    const weakPassword = await accessRoute.POST(new Request('https://dashboard.example/api/operation-access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'weak-operation-password-2026' }),
    }));
    expect(weakPassword.status).toBe(503);

    vi.stubEnv('SILLA_OPERATION_PASSWORD', TEST_PASSWORD);
    vi.stubEnv('SILLA_OPERATION_ACCESS_SECRET', 'too-short');
    const shortSecret = await accessRoute.POST(new Request('https://dashboard.example/api/operation-access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: TEST_PASSWORD }),
    }));
    expect(shortSecret.status).toBe(503);

    const reusedCredential = 'Same-Operation-Credential!2026-ABcd';
    vi.stubEnv('SILLA_OPERATION_PASSWORD', reusedCredential);
    vi.stubEnv('SILLA_OPERATION_ACCESS_SECRET', reusedCredential);
    const equalCredentials = await accessRoute.POST(new Request('https://dashboard.example/api/operation-access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: reusedCredential }),
    }));
    expect(equalCredentials.status).toBe(503);
  });

  it('만료되거나 잠금 처리된 쿠키는 전체 이력 권한을 유지하지 않는다', async () => {
    const accessRoute = await loadOperationAccessRoute();

    const loginResponse = await accessRoute.POST(new Request('http://localhost/api/operation-access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: TEST_PASSWORD }),
    }));
    authState.operationCookie = readOperationCookie(loginResponse);

    vi.setSystemTime(new Date(NOW.getTime() + 13 * 60 * 60 * 1000));
    expect(await (await accessRoute.GET()).json()).toEqual({ granted: false });
    expect((await readAtunaResponse()).restricted).toBe(true);

    const logoutResponse = await accessRoute.DELETE();
    expect(logoutResponse.headers.get('set-cookie')).toContain('Max-Age=0');
  });
});
