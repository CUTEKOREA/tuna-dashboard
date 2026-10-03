import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ user: vi.fn(), aal: vi.fn(), send: vi.fn(), reserve: vi.fn(), summary: vi.fn() }));
vi.mock('server-only', () => ({}));
vi.mock('@/lib/auth/supabase-request', () => ({
  getSupabaseRequestConfig: () => ({}),
  createServerUserClient: async () => ({ auth: { getUser: mocks.user, mfa: { getAuthenticatorAssuranceLevel: mocks.aal, listFactors: async () => ({ data: { all: [] }, error: null }) } } }),
}));
vi.mock('@/lib/mail/server-env', () => ({ getMailPublicBaseUrl: () => 'https://dashboard.example', getCompanySmtpConfig: () => ({ from: 'company@example.com' }) }));
vi.mock('@/lib/mail/server-supabase', () => ({ createMailServiceClient: () => ({}) }));
vi.mock('@/lib/mail/token-store', () => ({ getMailConnectionSummary: mocks.summary }));
vi.mock('@/lib/mail/company-smtp-audit', () => ({ reserveCompanySmtpSendRequest: mocks.reserve, recordCompanySmtpSendOutcome: async () => {} }));
vi.mock('@/lib/mail/company-smtp', async (importOriginal) => ({ ...await importOriginal<typeof import('../lib/mail/company-smtp')>(), sendCompanySmtpMessage: mocks.send }));
import { authorizeMailRequest } from '../lib/mail/request-auth';
import { POST } from '../app/api/mail/company-smtp/send/route';
import { GET as status } from '../app/api/mail/status/route';

function identity(email: string, role = 'member') {
  mocks.user.mockResolvedValue({ error: null, data: { user: { id: 'synthetic-user', email, email_confirmed_at: '2026-10-03', app_metadata: { provider: 'google', providers: ['google'], role }, user_metadata: { role: 'admin' }, identities: [{ provider: 'google' }] } } });
}
function request() {
  return new Request('https://dashboard.example/api/mail/company-smtp/send', { method: 'POST', headers: { origin: 'https://dashboard.example', 'content-type': 'application/json', 'idempotency-key': '11111111-1111-4111-8111-111111111111' }, body: JSON.stringify({ to: 'recipient@example.com', subject: '정상 제목', text: '정상 본문' }) });
}
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('DASHBOARD_OWNER_EMAIL', 'owner@example.com');
  vi.stubEnv('DASHBOARD_ALLOWED_EMAILS', 'viewer@example.com');
  vi.stubEnv('DASHBOARD_ALLOWED_EMAILS_APPEND', 'append@example.com');
  mocks.aal.mockResolvedValue({ error: null, data: { currentLevel: 'aal2' } });
  mocks.reserve.mockResolvedValue({ decision: 'reserved' });
  mocks.send.mockResolvedValue(undefined);
  mocks.summary.mockResolvedValue({ provider_email: 'personal@example.com', connected_at: '2026-10-03' });
});
afterEach(() => vi.unstubAllEnvs());

describe('회사 SMTP는 대시보드 열람 권한과 분리된다', () => {
  it.each(['viewer@example.com', 'append@example.com'])('추가 열람자 %s는 자기 Gmail 권한이 있어도 회사 발송은 거부된다', async (email) => {
    identity(email);
    expect(await authorizeMailRequest(true)).toMatchObject({ ok: true, userId: 'synthetic-user' });
    const response = await POST(request());
    expect(response.status).toBe(403);
    expect(mocks.reserve).not.toHaveBeenCalled();
    expect(mocks.send).not.toHaveBeenCalled();
    expect(await (await status()).json()).toMatchObject({ gmail: { email: 'personal@example.com' }, companySmtp: null });
  });
  it('일반 계정의 metadata 역할로 회사 발신 소유자 범위를 넓히지 않는다', async () => {
    identity('viewer@example.com', 'admin');
    expect((await POST(request())).status).toBe(403);
    expect(mocks.send).not.toHaveBeenCalled();
  });
  it('확인된 소유자의 AAL2 발송과 기존 복수 소유자 설정을 유지한다', async () => {
    vi.stubEnv('DASHBOARD_OWNER_EMAIL', ' owner@example.com, second@example.com ');
    identity('second@example.com');
    expect((await POST(request())).status).toBe(200);
    expect(mocks.send).toHaveBeenCalledTimes(1);
    expect(await (await status()).json()).toMatchObject({ companySmtp: { from: 'company@example.com' } });
  });
  it('소유자라도 AAL1과 비정상 소유자 설정은 닫힌다', async () => {
    identity('owner@example.com');
    mocks.aal.mockResolvedValue({ error: null, data: { currentLevel: 'aal1' } });
    expect((await POST(request())).status).toBe(403);
    vi.stubEnv('DASHBOARD_OWNER_EMAIL', '');
    expect((await POST(request())).status).toBe(403);
    expect(mocks.send).not.toHaveBeenCalled();
  });
});
