import { createHmac } from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ rpc: vi.fn(), dispatch: vi.fn() }));
vi.mock('server-only', () => ({}));
vi.mock('@/lib/security/events', () => ({ createSecurityClient: () => ({ rpc: mocks.rpc }) }));
vi.mock('@/lib/security/alerts', () => ({ dispatchSecurityAlert: mocks.dispatch }));
import { POST } from '../app/api/webhooks/security/route';
import { GET } from '../app/api/cron/security-alerts/route';

const secret = 'synthetic-webhook-secret-1234567890';
const event = () => ({ id: 'test-event', type: 'firewall.attack', createdAt: Date.now(), payload: { projectId: 'prj_expected', teamId: 'team_expected' } });
function request(body: string, signature?: string) {
  return new Request('https://dashboard.example/api/webhooks/security', {
    method: 'POST', headers: { 'content-type': 'application/json', 'x-vercel-signature': signature ?? createHmac('sha1', secret).update(body).digest('hex') }, body,
  });
}
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('VERCEL_SECURITY_WEBHOOK_SECRET', secret);
  vi.stubEnv('SECURITY_ALERTS_ENABLED', '1');
  vi.stubEnv('SECURITY_VERCEL_PROJECT_ID', 'prj_expected');
  vi.stubEnv('SECURITY_VERCEL_TEAM_ID', 'team_expected');
  vi.stubEnv('CRON_SECRET', secret);
  mocks.rpc.mockResolvedValue({ data: 'recorded', error: null });
  mocks.dispatch.mockResolvedValue('empty');
});
afterEach(() => vi.unstubAllEnvs());

describe('서명된 보안 웹훅', () => {
  it('설정 누락과 서명 변조를 DB 호출 전에 거부한다', async () => {
    expect((await POST(request(JSON.stringify(event()), '0'.repeat(40)))).status).toBe(401);
    vi.stubEnv('VERCEL_SECURITY_WEBHOOK_SECRET', '');
    expect((await POST(request(JSON.stringify(event())))).status).toBe(503);
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
  it('형식·크기·scope 오류를 저장하지 않는다', async () => {
    for (const raw of ['not json', JSON.stringify({ ...event(), type: 'other' }), JSON.stringify({ ...event(), payload: { projectId: 'other' } })]) {
      expect((await POST(request(raw))).status).toBe(400);
    }
    expect((await POST(request('x'.repeat(64001)))).status).toBe(413);
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
  it('원문 대신 이벤트·본문 해시만 저장하며 즉시 메일을 보내지 않는다', async () => {
    const res = await POST(request(JSON.stringify(event())));
    expect(res.status).toBe(200);
    expect(res.headers.get('cache-control')).toContain('no-store');
    expect(mocks.rpc).toHaveBeenCalledWith('record_dashboard_firewall_event', {
      p_event_key: expect.stringMatching(/^[a-f0-9]{64}$/),
      p_payload_hash: expect.stringMatching(/^[a-f0-9]{64}$/),
      p_kind: 'firewall_attack',
    });
    expect(mocks.dispatch).not.toHaveBeenCalled();
  });
  it('완료되지 않는 본문 수신을 5초에 중단한다', async () => {
    vi.useFakeTimers();
    try {
      const req = new Request('https://dashboard.example/api/webhooks/security', {
        method: 'POST', headers: { 'content-type': 'application/json', 'x-vercel-signature': '0'.repeat(40) },
        body: new ReadableStream(), duplex: 'half',
      } as RequestInit & { duplex: string });
      const result = POST(req);
      await vi.advanceTimersByTimeAsync(5000);
      expect((await result).status).toBe(408);
      expect(mocks.rpc).not.toHaveBeenCalled();
    } finally { vi.useRealTimers(); }
  });
  it('중복은 성공 응답, 내용 충돌은409, DB 장애는503으로 구분한다', async () => {
    mocks.rpc.mockResolvedValueOnce({ data: 'duplicate', error: null });
    expect((await POST(request(JSON.stringify(event())))).status).toBe(200);
    mocks.rpc.mockResolvedValueOnce({ data: 'conflict', error: null });
    expect((await POST(request(JSON.stringify(event())))).status).toBe(409);
    mocks.rpc.mockResolvedValueOnce({ data: null, error: { message: 'secret database details' } });
    const res = await POST(request(JSON.stringify(event())));
    expect(res.status).toBe(503);
    expect(await res.text()).not.toContain('secret database details');
  });
});

describe('보안 알림 cron', () => {
  it('유효한 Bearer 없이는 발송기를 호출하지 않는다', async () => {
    expect((await GET(new Request('https://dashboard.example/api/cron/security-alerts'))).status).toBe(401);
    expect(mocks.dispatch).not.toHaveBeenCalled();
  });
  it('정상 인증·빈 큐와 발송 결과 불명확을 구분한다', async () => {
    const req = () => new Request('https://dashboard.example/api/cron/security-alerts', { headers: { authorization: 'Bearer ' + secret } });
    expect((await GET(req())).status).toBe(200);
    expect(mocks.rpc).toHaveBeenCalledWith('prune_dashboard_security_events');
    mocks.dispatch.mockResolvedValue('unknown');
    expect((await GET(req())).status).toBe(502);
  });
  it('비활성·메일 설정 장애와 독립적으로 보관기간 정리를 실행한다', async () => {
    mocks.dispatch.mockResolvedValueOnce('disabled').mockRejectedValueOnce(new Error('smtp config'));
    const req = () => new Request('https://dashboard.example/api/cron/security-alerts', { headers: { authorization: 'Bearer ' + secret } });
    expect((await GET(req())).status).toBe(200);
    expect((await GET(req())).status).toBe(503);
    expect(mocks.rpc.mock.calls.filter(([name]) => name === 'prune_dashboard_security_events')).toHaveLength(2);
  });
});
