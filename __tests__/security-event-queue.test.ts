import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest, type NextFetchEvent } from 'next/server';
const mocks = vi.hoisted(() => ({ rpc: vi.fn() }));
vi.mock('server-only', () => ({}));
vi.mock('@supabase/supabase-js', () => ({ createClient: () => ({ rpc: mocks.rpc }) }));
vi.mock('@/lib/mail/server-env', () => ({ getSupabaseServiceConfig: () => ({ url: 'https://database.example', serviceRoleKey: 'synthetic' }) }));
import { queueSecurityObservation } from '../lib/security/events';
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('SECURITY_ALERTS_ENABLED', '1');
  vi.stubEnv('SECURITY_EVENT_HASH_KEY', 'synthetic-hash-secret-00000000000000');
  mocks.rpc.mockResolvedValue({ error: null, data: true });
});
afterEach(() => vi.unstubAllEnvs());
describe('인증 proxy 배경 집계', () => {
  it('정제된 값만 한 번 기록하며 Request와 토큰을 전달하지 않는다', async () => {
    const pending: Promise<unknown>[] = [];
    const event = { waitUntil: (p: Promise<unknown>) => pending.push(p) } as unknown as NextFetchEvent;
    queueSecurityObservation(new NextRequest('https://dashboard.example/api/fleet/daily?secret=not-for-logging', { headers: { authorization: 'Bearer do-not-copy' } }),
      { ok: true, email: 'private@example.com', subject: 'private-id' }, event);
    await Promise.all(pending);
    expect(pending).toHaveLength(1);
    expect(mocks.rpc).toHaveBeenCalledTimes(1);
    expect(mocks.rpc.mock.calls[0][1]).toEqual({
      p_kind: 'sensitive_read_request', p_actor_hash: expect.stringMatching(/^[a-f0-9]{64}$/), p_route_group: 'sensitive_api',
    });
    expect(JSON.stringify(mocks.rpc.mock.calls)).not.toMatch(/not-for-logging|do-not-copy|private-id|private@example/);
  });
  it('집계 장애는 waitUntil에서 처리하고 인증 요청에 예외를 전파하지 않는다', async () => {
    mocks.rpc.mockResolvedValue({ error: { message: 'private service details' } });
    const pending: Promise<unknown>[] = [];
    const event = { waitUntil: (p: Promise<unknown>) => pending.push(p) } as unknown as NextFetchEvent;
    queueSecurityObservation(new NextRequest('https://dashboard.example/api/fleet/daily'), { ok: false, status: 401, code: 'authentication_required' }, event);
    await expect(Promise.all(pending)).resolves.toEqual([undefined]);
  });
  it('비활성 또는 503 설정 오류는 집계하지 않는다', () => {
    const waitUntil = vi.fn();
    const event = { waitUntil } as unknown as NextFetchEvent;
    const req = new NextRequest('https://dashboard.example/api/fleet/daily');
    queueSecurityObservation(req, { ok: false, status: 503, code: 'configuration_required' }, event);
    vi.stubEnv('SECURITY_ALERTS_ENABLED', '0');
    queueSecurityObservation(req, { ok: false, status: 401, code: 'authentication_required' }, event);
    expect(waitUntil).not.toHaveBeenCalled(); expect(mocks.rpc).not.toHaveBeenCalled();
  });
});
