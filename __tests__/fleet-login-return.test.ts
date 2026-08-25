import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { resolveLoginReturnPath } from '@/app/mail/login/page';
import { resolveProtectedReturnPath } from '@/lib/auth/protected-return';
import { fleetDetailGateMessage } from '@/lib/fleet-daily-gate';

describe('protected dashboard login return path', () => {
  it('allows only exact internal protected paths', () => {
    expect(resolveLoginReturnPath('/fleet')).toBe('/fleet');
    expect(resolveLoginReturnPath('/mail')).toBe('/mail');
    expect(resolveLoginReturnPath(['/fleet', '/mail'])).toBe('/fleet');
    expect(resolveLoginReturnPath('https://example.com')).toBe('/mail');
    expect(resolveLoginReturnPath('//example.com')).toBe('/mail');
    expect(resolveLoginReturnPath('/fleet?admin=1')).toBe('/mail');
    expect(resolveLoginReturnPath(undefined)).toBe('/mail');
    expect(resolveProtectedReturnPath('/fleet')).toBe('/fleet');
  });

  it('removes fleet step-up MFA while preserving the mail return path', () => {
    const fleet = readFileSync(join(process.cwd(), 'components/FleetCommandCenter.tsx'), 'utf8');
    const operations = readFileSync(join(process.cwd(), 'components/FleetDailyOperations.tsx'), 'utf8');
    const mail = readFileSync(join(process.cwd(), 'components/MailInboxDashboard.tsx'), 'utf8');
    expect(fleet).not.toContain("href: '/mail'");
    expect(fleet).not.toContain('FleetStepUpMfa');
    expect(operations).not.toContain('FleetStepUpMfa');
    expect(mail).toContain("if (next === '/fleet')");
    expect(mail).toContain("window.location.assign('/fleet')");
  });

  it('explains a public-aggregate mismatch instead of a generic lock', () => {
    expect(fleetDetailGateMessage({ status: 'error', code: 'fleet_data_unavailable' }))
      .toBe('선박 상세 데이터가 공개 집계와 맞지 않습니다.');
    expect(fleetDetailGateMessage({ status: 'denied', code: 'mfa_required' }))
      .toBe('로그인 세션을 다시 확인해주세요.');
  });
});
