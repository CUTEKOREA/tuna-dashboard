import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ rpc: vi.fn(), send: vi.fn(), config: vi.fn() }));
vi.mock('server-only', () => ({}));
vi.mock('@/lib/security/events', () => ({ createSecurityClient: () => ({ rpc: mocks.rpc }) }));
vi.mock('@/lib/mail/server-env', () => ({ getCompanySmtpConfig: mocks.config }));
vi.mock('@/lib/mail/company-smtp', async importOriginal => ({
  ...await importOriginal<typeof import('../lib/mail/company-smtp')>(), sendCompanySmtpMessage: mocks.send,
}));
import { dispatchSecurityAlert } from '../lib/security/alerts';
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('SECURITY_ALERTS_ENABLED', '1');
  vi.stubEnv('SECURITY_ALERT_EMAIL', 'owner@example.com');
  mocks.config.mockReturnValue({ host: 'smtp.example', from: 'sender@example.com' });
  mocks.send.mockResolvedValue(undefined);
  mocks.rpc.mockImplementation(async (name) => name === 'claim_dashboard_security_alert'
    ? { data: [{ id: 'alert-id', kind: 'auth_denied', event_count: 30, occurred_at: new Date().toISOString(), related_alerts: 3 }], error: null }
    : { data: true, error: null });
});
afterEach(() => vi.unstubAllEnvs());
describe('고정 수신자와 알림 예약', () => {
  it('비활성·잘못된 수신 설정은 예약과 메일을 발생시키지 않는다', async () => {
    vi.stubEnv('SECURITY_ALERTS_ENABLED', '0');
    expect(await dispatchSecurityAlert()).toBe('disabled');
    vi.stubEnv('SECURITY_ALERTS_ENABLED', '1'); vi.stubEnv('SECURITY_ALERT_EMAIL', 'bad\nrecipient@example.com');
    await expect(dispatchSecurityAlert()).rejects.toThrow();
    expect(mocks.rpc).not.toHaveBeenCalled(); expect(mocks.send).not.toHaveBeenCalled();
  });
  it('예약이 없거나 실패하면 보내지 않는다', async () => {
    mocks.rpc.mockResolvedValueOnce({ data: [], error: null });
    expect(await dispatchSecurityAlert()).toBe('empty');
    mocks.rpc.mockResolvedValueOnce({ data: null, error: {} });
    await expect(dispatchSecurityAlert()).rejects.toThrow('security_alert_claim_failed');
    expect(mocks.send).not.toHaveBeenCalled();
  });
  it('고정된 내용으로 1회 보내고 완료를 기록한다', async () => {
    expect(await dispatchSecurityAlert()).toBe('sent');
    expect(mocks.send).toHaveBeenCalledTimes(1);
    expect(mocks.send.mock.calls[0][0].message).toMatchObject({ to: 'owner@example.com', subject: '[참치왕국 보안] 반복된 접근 거부' });
    expect(mocks.rpc).toHaveBeenLastCalledWith('complete_dashboard_security_alert', { p_id: 'alert-id', p_status: 'sent' });
  });
  it('SMTP 결과가 불명확하면 unknown으로 기록해 자동 중복 발송을 피한다', async () => {
    mocks.send.mockRejectedValue(new Error('secret socket details'));
    expect(await dispatchSecurityAlert()).toBe('unknown');
    expect(mocks.rpc).toHaveBeenLastCalledWith('complete_dashboard_security_alert', { p_id: 'alert-id', p_status: 'unknown' });
  });
});
