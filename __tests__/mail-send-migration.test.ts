import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const migration = readFileSync(join(
  process.cwd(),
  'supabase/migrations/20260815184500_create_mail_send_requests.sql',
), 'utf8');

describe('메일 발송 감사·제한 migration', () => {
  it('RLS와 service-role 전용 RPC를 강제한다', () => {
    expect(migration).toContain('alter table public.mail_send_requests enable row level security');
    expect(migration).toContain('security definer');
    expect(migration).toContain("set search_path = ''");
    expect(migration).toContain('revoke all on table public.mail_send_requests from anon, authenticated');
    expect(migration).toContain('grant execute on function public.reserve_mail_send_request(uuid, uuid) to service_role');
  });

  it('사용자별 원자적 잠금과 분·일 발송 제한을 적용한다', () => {
    expect(migration).toContain('pg_advisory_xact_lock');
    expect(migration).toContain("interval '1 minute'");
    expect(migration).toContain("interval '1 day'");
    expect(migration).toContain('v_minute_count >= 5');
    expect(migration).toContain('v_day_count >= 50');
  });

  it('감사 테이블에 수신자·제목·본문을 저장하지 않는다', () => {
    expect(migration).not.toMatch(/recipient|subject|body|message_text/);
    expect(migration).toContain('gmail_message_id text');
    expect(migration).toContain("status in ('pending', 'sent', 'unknown')");
  });
});
