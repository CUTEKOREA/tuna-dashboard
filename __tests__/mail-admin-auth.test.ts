import { describe, expect, it } from 'vitest';
import { isMailAdmin, parseAdminEmailAllowlist } from '../lib/mail/admin-auth';

describe('메일 관리자 인증', () => {
  it('설정이 없으면 모든 사용자를 거부한다', () => {
    expect(parseAdminEmailAllowlist(undefined)).toEqual(new Set());
    expect(isMailAdmin({ email: 'admin@example.com', appRole: undefined }, new Set())).toBe(false);
  });

  it('확인된 이메일의 서버 app_metadata 관리자 또는 서버 이메일 허용목록만 인정한다', () => {
    const allowlist = parseAdminEmailAllowlist(' owner@example.com,SECOND@example.com ');
    const confirmedAt = '2026-08-15T00:00:00.000Z';

    expect(isMailAdmin({ email: 'owner@example.com', emailConfirmedAt: confirmedAt }, allowlist)).toBe(true);
    expect(isMailAdmin({ email: 'second@example.com', emailConfirmedAt: confirmedAt }, allowlist)).toBe(true);
    expect(isMailAdmin({ email: 'any@example.com', emailConfirmedAt: confirmedAt, appRole: 'admin' }, allowlist)).toBe(true);
    expect(isMailAdmin({ email: 'other@example.com', emailConfirmedAt: confirmedAt, appRole: 'member' }, allowlist)).toBe(false);
  });

  it('이메일 미확인 사용자와 user_metadata 역할 승격을 거부한다', () => {
    const allowlist = parseAdminEmailAllowlist('owner@example.com');

    expect(isMailAdmin({ email: 'owner@example.com', appRole: 'admin' }, allowlist)).toBe(false);
    expect(isMailAdmin({ email: 'owner@example.com', emailConfirmedAt: null, appRole: 'admin' }, allowlist)).toBe(false);
    expect(isMailAdmin({ email: 'owner@example.com', emailConfirmedAt: '2026-08-15', userRole: 'admin' }, new Set())).toBe(false);
  });

  it('확인 시각과 서버 관리자 역할이 있어도 이메일이 없으면 거부한다', () => {
    expect(isMailAdmin({
      email: undefined,
      emailConfirmedAt: '2026-08-15T00:00:00.000Z',
      appRole: 'admin',
    }, new Set())).toBe(false);
  });
});
