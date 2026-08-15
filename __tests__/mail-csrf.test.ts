import { afterEach, describe, expect, it } from 'vitest';
import { hasTrustedMailOrigin } from '../lib/mail/csrf';

const ORIGINAL_BASE_URL = process.env.MAIL_PUBLIC_BASE_URL;

afterEach(() => {
  if (ORIGINAL_BASE_URL === undefined) delete process.env.MAIL_PUBLIC_BASE_URL;
  else process.env.MAIL_PUBLIC_BASE_URL = ORIGINAL_BASE_URL;
});

describe('메일 변경 요청 Origin 검증', () => {
  it('공개 기준 URL과 정확히 같은 origin만 허용한다', () => {
    process.env.MAIL_PUBLIC_BASE_URL = 'https://leedonggun.co.kr';
    const trusted = new Request('https://leedonggun.co.kr/api/mail/gmail/connect', {
      headers: { Origin: 'https://leedonggun.co.kr' },
    });
    const attacker = new Request('https://leedonggun.co.kr/api/mail/gmail/connect', {
      headers: { Origin: 'https://attacker.example' },
    });

    expect(hasTrustedMailOrigin(trusted, 'https://leedonggun.co.kr')).toBe(true);
    expect(hasTrustedMailOrigin(attacker, 'https://leedonggun.co.kr')).toBe(false);
  });

  it('Origin 또는 서버 설정이 없으면 fail closed 한다', () => {
    process.env.MAIL_PUBLIC_BASE_URL = 'https://leedonggun.co.kr';
    expect(hasTrustedMailOrigin(
      new Request('https://leedonggun.co.kr/api/mail/status'),
      'https://leedonggun.co.kr',
    )).toBe(false);

    delete process.env.MAIL_PUBLIC_BASE_URL;
    expect(hasTrustedMailOrigin(new Request('https://leedonggun.co.kr/api/mail/status', {
      headers: { Origin: 'https://leedonggun.co.kr' },
    }), '')).toBe(false);
  });
});