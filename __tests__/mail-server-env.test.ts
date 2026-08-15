import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import { getCompanySmtpConfig, getMailPublicBaseUrl } from '../lib/mail/server-env';

const ORIGINAL_URL = process.env.MAIL_PUBLIC_BASE_URL;
const SMTP_NAMES = [
  'COMPANY_SMTP_HOST',
  'COMPANY_SMTP_PORT',
  'COMPANY_SMTP_USER',
  'COMPANY_SMTP_PASSWORD',
  'COMPANY_SMTP_FROM',
] as const;
const ORIGINAL_SMTP = Object.fromEntries(SMTP_NAMES.map((name) => [name, process.env[name]]));

afterEach(() => {
  if (ORIGINAL_URL === undefined) delete process.env.MAIL_PUBLIC_BASE_URL;
  else process.env.MAIL_PUBLIC_BASE_URL = ORIGINAL_URL;
  for (const name of SMTP_NAMES) {
    const value = ORIGINAL_SMTP[name];
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  }
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

describe('회사 SMTP 설정', () => {
  function setValidConfig() {
    process.env.COMPANY_SMTP_HOST = 'mail1.sla.co.kr';
    process.env.COMPANY_SMTP_PORT = '587';
    process.env.COMPANY_SMTP_USER = 'ledog@sla.co.kr';
    process.env.COMPANY_SMTP_PASSWORD = 'server-secret';
    process.env.COMPANY_SMTP_FROM = 'ledog@sla.co.kr';
  }

  it('고정 SLA 호스트·STARTTLS 포트·동일 발신 계정만 반환한다', () => {
    setValidConfig();
    expect(getCompanySmtpConfig()).toEqual({
      host: 'mail1.sla.co.kr',
      port: 587,
      user: 'ledog@sla.co.kr',
      password: 'server-secret',
      from: 'ledog@sla.co.kr',
    });
  });

  it('설정 누락·다른 호스트·평문 포트·발신자 불일치를 거부한다', () => {
    setValidConfig();
    delete process.env.COMPANY_SMTP_PASSWORD;
    expect(() => getCompanySmtpConfig()).toThrow();

    setValidConfig();
    process.env.COMPANY_SMTP_HOST = 'evil.example.com';
    expect(() => getCompanySmtpConfig()).toThrow();

    setValidConfig();
    process.env.COMPANY_SMTP_PORT = '25';
    expect(() => getCompanySmtpConfig()).toThrow();

    setValidConfig();
    process.env.COMPANY_SMTP_FROM = 'other@sla.co.kr';
    expect(() => getCompanySmtpConfig()).toThrow();
  });
});