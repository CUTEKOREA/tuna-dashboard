import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const authState = vi.hoisted(() => ({
  access: {
    ok: false as boolean,
    status: 401,
    code: 'authentication_required',
  },
}));

vi.mock('server-only', () => ({}));

vi.mock('@/lib/auth/request-auth', () => ({
  authorizeDashboardRequest: vi.fn(async () => authState.access),
}));

describe('구글 소유자 인증과 Atuna 전체 이력', () => {
  beforeEach(() => {
    vi.resetModules();
    authState.access = {
      ok: false,
      status: 401,
      code: 'authentication_required',
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('과거 공용 비밀번호 API는 모든 메서드를 폐기 상태로 응답한다', async () => {
    const route = await import('../app/api/operation-access/route');

    for (const response of [
      await route.GET(),
      await route.POST(),
      await route.DELETE(),
    ]) {
      expect(response.status).toBe(410);
      expect(response.headers.get('cache-control')).toContain('no-store');
      expect(response.headers.get('set-cookie')).toBeNull();
      expect(await response.json()).toMatchObject({
        granted: false,
        code: 'google_login_required',
      });
    }
  });

  it('운영 화면에 비밀번호 입력·가입·과거 쿠키 경계가 남지 않는다', () => {
    const pageSource = readFileSync(join(process.cwd(), 'app/page.tsx'), 'utf8');
    const retiredSource = readFileSync(join(process.cwd(), 'lib/server/operation-access.ts'), 'utf8');

    expect(pageSource).not.toContain('current-password');
    expect(pageSource).not.toContain('signInWithPassword');
    expect(pageSource).not.toContain('signUp');
    expect(pageSource).not.toContain('silla-operation-access');
    expect(retiredSource).not.toContain('SILLA_OPERATION_PASSWORD');
    expect(retiredSource).not.toContain('SILLA_OPERATION_ACCESS_SECRET');
    expect(retiredSource).toContain('return false');
  });

  it('미인증 요청에는 Atuna 프리뷰를 포함한 어떤 원장 데이터도 주지 않는다', async () => {
    const { GET } = await import('../app/api/atuna-prices/route');
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(body).toEqual({
      error: '허용된 구글 계정 로그인이 필요합니다.',
      code: 'authentication_required',
      restricted: true,
    });
    expect(body).not.toHaveProperty('history');
    expect(body).not.toHaveProperty('latestByHub');
  });

  it('정확한 소유자 인증 뒤에만 Atuna 전체 이력을 제공한다', async () => {
    authState.access = {
      ok: true,
      status: 200,
      code: 'granted',
    };
    const { GET } = await import('../app/api/atuna-prices/route');
    const response = await GET();
    const body = await response.json() as {
      restricted: boolean;
      history: Array<{ date: string }>;
    };

    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(body.restricted).toBe(false);
    expect(body.history.length).toBeGreaterThan(700);
    expect(body.history.some((row) => row.date === '2022-01-01')).toBe(true);
  });

  it('Atuna 일일 데이터도 미인증 요청에서 본문 없이 차단한다', async () => {
    const { GET } = await import('../app/api/atuna-daily/route');
    const response = await GET(new Request('https://dashboard.example/api/atuna-daily'));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(body).toMatchObject({
      code: 'authentication_required',
      restricted: true,
    });
    expect(body).not.toHaveProperty('items');
    expect(body).not.toHaveProperty('available_dates');
  });
});
