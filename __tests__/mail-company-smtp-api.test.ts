import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { reserveCompanySmtpSendRequest } from '../lib/mail/company-smtp-audit';

const migrationPath = join(
  process.cwd(),
  'supabase/migrations/20260815233000_create_company_smtp_send_requests.sql',
);

function routeSource(): string {
  return readFileSync(join(process.cwd(), 'app/api/mail/company-smtp/send/route.ts'), 'utf8');
}

describe('회사 SMTP 발송 API·감사 원장', () => {
  it('route는 관리자 AAL2·trusted Origin·no-store·bounded plain text·감사를 강제한다', () => {
    const source = routeSource();
    expect(source).toContain('export async function POST');
    expect(source).toContain("export const dynamic = 'force-dynamic'");
    expect(source).toContain("'Cache-Control': 'no-store, max-age=0'");
    expect(source).toContain('authorizeMailRequest(true)');
    expect(source).toContain('hasTrustedMailOrigin(request, getMailPublicBaseUrl())');
    expect(source).toContain('MAX_SEND_REQUEST_BYTES');
    expect(source).toContain("request.headers.get('idempotency-key')");
    expect(source).toContain('parseCompanySmtpMessage');
    expect(source).toContain('reserveCompanySmtpSendRequest');
    expect(source).toContain('recordCompanySmtpSendOutcome');
    expect(source).toContain('sendCompanySmtpMessage');
    expect(source).not.toContain('console.log');
    expect(source).not.toContain('password:');
  });

  it('migration은 payload hash 결속·RLS·service-role 전용 RPC·원자 상태 전이를 둔다', () => {
    const sql = readFileSync(migrationPath, 'utf8');
    expect(sql).toContain('create table if not exists public.company_smtp_send_requests');
    expect(sql).toContain("payload_hash text not null check (payload_hash ~ '^[a-f0-9]{64}$')");
    expect(sql).toContain('enable row level security');
    expect(sql).toContain('revoke all on table public.company_smtp_send_requests from public');
    expect(sql).toContain('revoke all on table public.company_smtp_send_requests from anon, authenticated');
    expect(sql).toContain('security definer');
    expect(sql).toContain("set search_path = ''");
    expect(sql).toContain('v_existing.payload_hash <> p_payload_hash');
    expect(sql).toContain("status in ('pending', 'sent', 'unknown')");
    expect(sql).toContain("and status = 'pending'");
    expect(sql).toContain('grant execute on function public.reserve_company_smtp_send_request(uuid, uuid, text) to service_role');
  });

  it('감사 예약은 정규화된 payload의 SHA-256만 RPC에 전달한다', async () => {
    const rpc = vi.fn(async () => ({
      data: [{ decision: 'reserved', existing_status: 'pending' }],
      error: null,
    }));
    const client = { rpc } as never;
    const message = { to: 'partner@example.com', subject: '제목', text: '본문' };

    await expect(reserveCompanySmtpSendRequest(
      client,
      '11111111-2222-4333-8444-555555555555',
      'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
      message,
    )).resolves.toEqual({ decision: 'reserved' });

    expect(rpc).toHaveBeenCalledWith('reserve_company_smtp_send_request', {
      p_user_id: '11111111-2222-4333-8444-555555555555',
      p_request_id: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
      p_payload_hash: expect.stringMatching(/^[a-f0-9]{64}$/),
    });
  });
});
