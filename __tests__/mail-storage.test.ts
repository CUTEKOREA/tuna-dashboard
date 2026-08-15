import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildMailConnectionRecord, saveMailConnection } from '../lib/mail/token-store';

const KEY = Buffer.alloc(32, 11).toString('base64');

describe('메일 OAuth 저장소 계약', () => {
  it('공급자별 refresh token만 암호화 레코드로 만들고 access token은 저장하지 않는다', () => {
    const record = buildMailConnectionRecord({
      userId: 'user-1',
      provider: 'gmail',
      providerEmail: 'owner@gmail.com',
      providerAccountId: 'google-account-1',
      refreshToken: 'refresh-secret',
      grantedScopes: ['https://www.googleapis.com/auth/gmail.readonly'],
      encryptionKey: KEY,
    });

    expect(record.provider).toBe('gmail');
    expect(record.refresh_token_ciphertext).not.toContain('refresh-secret');
    expect(record).not.toHaveProperty('access_token');
    expect(record).not.toHaveProperty('refresh_token');
  });

  it('마이그레이션이 사용자·공급자 복합 키, RLS, 브라우저 역할 권한 회수를 고정한다', () => {
    const sql = readFileSync(join(process.cwd(), 'supabase/migrations/20260815_create_mail_oauth_connections.sql'), 'utf8');

    expect(sql).toMatch(/primary key\s*\(user_id,\s*provider\)/i);
    expect(sql).toMatch(/enable row level security/i);
    expect(sql).toMatch(/revoke all on .*mail_oauth_connections from anon, authenticated/i);
    expect(sql).toMatch(/grant select, insert, update, delete on .*mail_oauth_connections to service_role/i);
    expect(sql).not.toMatch(/refresh_token\s+text/i);
    expect(sql).not.toMatch(/access_token/i);
  });

  it('기존 연결을 덮어쓰지 않도록 신규 사용자·공급자 행만 insert한다', async () => {
    let writtenRecord: unknown;
    const client = {
      from: () => ({
        insert: async (record: unknown) => {
          writtenRecord = record;
          return { error: null };
        },
      }),
    };

    await saveMailConnection(client as never, {
      userId: 'user-1',
      provider: 'gmail',
      providerEmail: 'owner@gmail.com',
      providerAccountId: 'owner@gmail.com',
      refreshToken: 'new-refresh-secret',
      grantedScopes: ['https://www.googleapis.com/auth/gmail.readonly'],
      encryptionKey: KEY,
    });

    expect(writtenRecord).toMatchObject({ user_id: 'user-1', provider: 'gmail' });
    expect(JSON.stringify(writtenRecord)).not.toContain('new-refresh-secret');
  });
});
