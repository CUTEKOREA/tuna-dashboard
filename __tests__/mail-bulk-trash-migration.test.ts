import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const migrationPath = join(
  process.cwd(),
  'supabase/migrations/20260815205500_expand_mail_trash_action_limits.sql',
);

describe('선택 휴지통 이동 rate limit migration', () => {
  it('한 번의 50건 수동 선택을 허용하되 사용자별 분당 50건·일 200건으로 제한한다', () => {
    expect(existsSync(migrationPath)).toBe(true);
    const migration = existsSync(migrationPath) ? readFileSync(migrationPath, 'utf8') : '';
    expect(migration).toContain('create or replace function public.reserve_mail_message_action');
    expect(migration).toContain('pg_advisory_xact_lock');
    expect(migration).toContain('v_minute_count >= 50');
    expect(migration).toContain('v_day_count >= 200');
    expect(migration).toContain('v_message_id_hash <> p_gmail_message_id_hash');
    expect(migration).toContain("if v_status = 'unknown' then");
  });

  it('재정의 함수도 service-role 전용·고정 search_path 경계를 유지한다', () => {
    const migration = existsSync(migrationPath) ? readFileSync(migrationPath, 'utf8') : '';
    expect(migration).toContain('security definer');
    expect(migration).toContain("set search_path = ''");
    expect(migration).toContain('revoke all on function public.reserve_mail_message_action(uuid, uuid, text) from public, anon, authenticated');
    expect(migration).toContain('grant execute on function public.reserve_mail_message_action(uuid, uuid, text) to service_role');
    expect(migration).not.toMatch(/recipient|sender|subject|body|message_text|gmail_message_id text/);
  });
});
