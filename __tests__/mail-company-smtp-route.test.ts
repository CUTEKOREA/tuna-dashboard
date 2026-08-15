import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  reserve: vi.fn(),
  record: vi.fn(),
  send: vi.fn(),
}));

vi.mock('@/lib/mail/request-auth', () => ({
  authorizeMailRequest: vi.fn(async () => ({
    ok: true as const,
    userId: '11111111-2222-4333-8444-555555555555',
    aal: 'aal2',
  })),
}));
vi.mock('@/lib/mail/server-env', () => ({
  getMailPublicBaseUrl: vi.fn(() => 'https://leedonggun.co.kr'),
  getCompanySmtpConfig: vi.fn(() => ({
    host: 'mail1.sla.co.kr',
    port: 587,
    user: 'ledog@sla.co.kr',
    password: 'secret',
    from: 'ledog@sla.co.kr',
  })),
}));
vi.mock('@/lib/mail/server-supabase', () => ({
  createMailServiceClient: vi.fn(() => ({ kind: 'service-client' })),
}));
vi.mock('@/lib/mail/company-smtp-audit', () => ({
  reserveCompanySmtpSendRequest: mocks.reserve,
  recordCompanySmtpSendOutcome: mocks.record,
}));
vi.mock('@/lib/mail/company-smtp', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../lib/mail/company-smtp')>();
  return { ...actual, sendCompanySmtpMessage: mocks.send };
});

import { POST } from '../app/api/mail/company-smtp/send/route';

const requestId = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';
function request() {
  return new Request('https://leedonggun.co.kr/api/mail/company-smtp/send', {
    method: 'POST',
    headers: {
      Origin: 'https://leedonggun.co.kr',
      'Content-Type': 'application/json',
      'Idempotency-Key': requestId,
    },
    body: JSON.stringify({ to: 'partner@example.com', subject: '제목', text: '본문' }),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.reserve.mockResolvedValue({ decision: 'reserved' });
  mocks.record.mockResolvedValue(undefined);
  mocks.send.mockResolvedValue(undefined);
});

describe('회사 SMTP 발송 route 실행', () => {
  it('예약 후 한 번 발송하고 sent를 기록한다', async () => {
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(mocks.send).toHaveBeenCalledTimes(1);
    expect(mocks.record).toHaveBeenCalledWith(expect.anything(), {
      userId: '11111111-2222-4333-8444-555555555555',
      requestId,
      status: 'sent',
    });
  });

  it('이미 sent인 UUID는 provider를 다시 호출하지 않는다', async () => {
    mocks.reserve.mockResolvedValue({ decision: 'sent' });
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(mocks.send).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toMatchObject({ ok: true, duplicate: true });
  });

  it('provider 오류는 unknown으로 기록하고 502를 반환한다', async () => {
    mocks.send.mockRejectedValue(new Error('socket closed'));
    const response = await POST(request());
    expect(response.status).toBe(502);
    expect(mocks.record).toHaveBeenCalledWith(expect.anything(), {
      userId: '11111111-2222-4333-8444-555555555555',
      requestId,
      status: 'unknown',
    });
  });
});
