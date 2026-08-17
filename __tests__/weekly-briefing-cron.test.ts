import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

/**
 * 주간 브리핑 cron 계약 (P3-7 2단계) — fail-closed 검증.
 * 시크릿 미설정 → 503, 오답 → 401, 정답 + SMTP env 미설정 → 503 (발송 시도 없이 정직).
 */
describe('weekly briefing cron', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  const call = async (auth?: string) => {
    const { GET } = await import('../app/api/cron/weekly-briefing/route');
    return GET(new Request('https://dashboard.example/api/cron/weekly-briefing', {
      headers: auth ? { authorization: auth } : {},
    }));
  };

  it('CRON_SECRET 미설정이면 503으로 정직하게 거부한다', async () => {
    vi.stubEnv('CRON_SECRET', '');
    const response = await call('Bearer anything');
    expect(response.status).toBe(503);
    expect((await response.json()).sent).toBe(false);
  });

  it('시크릿 불일치는 401', async () => {
    vi.stubEnv('CRON_SECRET', 'a'.repeat(40));
    const response = await call('Bearer ' + 'b'.repeat(40));
    expect(response.status).toBe(401);
  });

  it('시크릿 일치 + SMTP env 미설정이면 503 (발송 시도 없이)', async () => {
    vi.stubEnv('CRON_SECRET', 'a'.repeat(40));
    vi.stubEnv('COMPANY_SMTP_HOST', '');
    const response = await call('Bearer ' + 'a'.repeat(40));
    expect(response.status).toBe(503);
    expect((await response.json()).sent).toBe(false);
  });
});
