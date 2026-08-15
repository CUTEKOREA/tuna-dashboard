import { describe, expect, it } from 'vitest';
import { evaluateMailAccess } from '../lib/mail/server-auth';

const CONFIRMED_USER = {
  id: 'user-1',
  email: 'owner@example.com',
  email_confirmed_at: '2026-08-15T00:00:00.000Z',
  app_metadata: { role: 'admin' },
  user_metadata: {},
};

describe('메일 서버 접근 경계', () => {
  it('서버 검증 사용자가 없으면 401을 반환한다', () => {
    expect(evaluateMailAccess(null, null, new Set(), true)).toEqual({
      ok: false,
      status: 401,
      code: 'authentication_required',
    });
  });

  it('미확인 이메일·비관리자·user_metadata 관리자 주장을 403으로 거부한다', () => {
    expect(evaluateMailAccess(
      { ...CONFIRMED_USER, email_confirmed_at: undefined },
      'aal2',
      new Set(['owner@example.com']),
      true,
    )).toEqual({ ok: false, status: 403, code: 'admin_required' });
    expect(evaluateMailAccess(
      { ...CONFIRMED_USER, app_metadata: {}, user_metadata: { role: 'admin' } },
      'aal2',
      new Set(),
      true,
    )).toEqual({ ok: false, status: 403, code: 'admin_required' });
    expect(evaluateMailAccess(
      { ...CONFIRMED_USER, app_metadata: { role: 'member' } },
      'aal2',
      new Set(),
      true,
    )).toEqual({ ok: false, status: 403, code: 'admin_required' });
  });

  it('관리자라도 Gmail 토큰 작업에는 AAL2를 강제한다', () => {
    expect(evaluateMailAccess(CONFIRMED_USER, 'aal1', new Set(), true)).toEqual({
      ok: false,
      status: 403,
      code: 'mfa_required',
    });
    expect(evaluateMailAccess(CONFIRMED_USER, 'aal2', new Set(), true)).toMatchObject({
      ok: true,
      userId: 'user-1',
      email: 'owner@example.com',
      aal: 'aal2',
    });
  });

  it('상태 확인은 관리자에게 AAL1을 알려 MFA 등록을 허용한다', () => {
    expect(evaluateMailAccess(CONFIRMED_USER, 'aal1', new Set(), false)).toMatchObject({
      ok: true,
      aal: 'aal1',
    });
  });
});
