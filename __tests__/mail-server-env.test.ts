import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import { getMailPublicBaseUrl } from '../lib/mail/server-env';

const ORIGINAL_URL = process.env.MAIL_PUBLIC_BASE_URL;

afterEach(() => {
  if (ORIGINAL_URL === undefined) delete process.env.MAIL_PUBLIC_BASE_URL;
  else process.env.MAIL_PUBLIC_BASE_URL = ORIGINAL_URL;
});

describe('메일 공개 기준 URL 설정', () => {
  it('운영 HTTPS origin만 정규화해 반환한다', () => {
    process.env.MAIL_PUBLIC_BASE_URL = 'https://leedonggun.co.kr';
    expect(getMailPublicBaseUrl('production')).toBe('https://leedonggun.co.kr');
  });

  it('경로·자격증명·운영 HTTP·설정 부재를 fail closed로 거부한다', () => {
    for (const value of [
      'https://leedonggun.co.kr/mail',
      'https://user:pass@leedonggun.co.kr',
      'http://leedonggun.co.kr',
    ]) {
      process.env.MAIL_PUBLIC_BASE_URL = value;
      expect(() => getMailPublicBaseUrl('production')).toThrow();
    }
    delete process.env.MAIL_PUBLIC_BASE_URL;
    expect(() => getMailPublicBaseUrl('production')).toThrow();
  });

  it('개발 환경의 localhost HTTP만 예외로 허용한다', () => {
    process.env.MAIL_PUBLIC_BASE_URL = 'http://localhost:3000';
    expect(getMailPublicBaseUrl('development')).toBe('http://localhost:3000');
    process.env.MAIL_PUBLIC_BASE_URL = 'http://127.0.0.1:3000';
    expect(getMailPublicBaseUrl('development')).toBe('http://127.0.0.1:3000');
  });
});