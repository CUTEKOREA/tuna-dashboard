import { describe, expect, it } from 'vitest';
import { getMfaDiagnosticCode } from '../lib/mail/mfa-diagnostics';

describe('MFA 공개 진단 코드', () => {
  it('명시적으로 허용한 Supabase MFA 공식 코드만 단계에 병기한다', () => {
    expect(getMfaDiagnosticCode('mfa_enroll_failed', {
      code: 'mfa_factor_name_conflict',
      message: '비공개 원문',
    })).toBe('mfa_enroll_failed:mfa_factor_name_conflict');
  });

  it('알 수 없는 코드·식별자·원문 오류는 단계 코드로 축소한다', () => {
    for (const error of [
      { code: 'user_1234567890' },
      { code: 'token_fragment_abcdef' },
      { code: 'MFA_FACTOR_NAME_CONFLICT' },
      { message: '비공개 원문' },
      null,
    ]) {
      expect(getMfaDiagnosticCode('mfa_enroll_failed', error)).toBe('mfa_enroll_failed');
    }
  });
});
