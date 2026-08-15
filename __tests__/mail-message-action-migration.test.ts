import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const migrationPath = join(
  process.cwd(),
  'supabase/migrations/20260815200000_create_mail_message_actions.sql',
);

describe('메일 휴지통 이동 감사·제한 migration', () => {
  it('migration 파일과 service-role 전용 보안 경계를 제공한다', () => {
    expect(existsSync(migrationPath)).toBe(true);
    const migration = readFileSync(migrationPath, 'utf8');
    expect(migration).toContain('alter table public.mail_message_actions enable row level security');
    expect(migration).toContain('security definer');
    expect(migration).toContain("set search_path = ''");
    expect(migration).toContain('revoke all on table public.mail_message_actions from public, anon, authenticated');
    expect(migration).toContain('grant execute on function public.reserve_mail_message_action(uuid, uuid, text) to service_role');
    expect(migration).toContain('grant execute on function public.complete_mail_message_action(uuid, uuid, text) to service_role');
  });

  it('사용자별 advisory lock과 분당 10건·일 100건 제한을 적용한다', () => {
    const migration = readFileSync(migrationPath, 'utf8');
    expect(migration).toContain('pg_advisory_xact_lock');
    expect(migration).toContain("interval '1 minute'");
    expect(migration).toContain("interval '1 day'");
    expect(migration).toContain('v_minute_count >= 10');
    expect(migration).toContain('v_day_count >= 100');
    expect(migration).toContain("if v_status = 'unknown' then");
    expect(migration).toContain("set status = 'pending'");
    expect(migration).toContain('v_message_id_hash <> p_gmail_message_id_hash');
  });

  it('메시지 ID 원문·발신자·제목·본문 없이 hash와 상태만 저장한다', () => {
    const migration = readFileSync(migrationPath, 'utf8');
    expect(migration).toContain('gmail_message_id_hash text');
    expect(migration).toContain("action = 'trash'");
    expect(migration).toContain("status in ('pending', 'completed', 'unknown')");
    expect(migration).not.toMatch(/recipient|sender|subject|body|message_text|gmail_message_id text/);
  });
});
