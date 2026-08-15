import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');

describe('회사 SMTP 발송 UI', () => {
  it('AAL2 이후 독립 회사 발송 패널을 렌더링한다', () => {
    const dashboard = read('components/MailInboxDashboard.tsx');
    expect(dashboard).toContain("import CompanySmtpPanel from './CompanySmtpPanel'");
    expect(dashboard).toContain('{!status.mfa.required && status.companySmtp && (');
    expect(dashboard).toContain('<CompanySmtpPanel from={status.companySmtp.from} />');
  });

  it('패널은 최종 확인·UUID idempotency·미확정 재전송 잠금을 제공한다', () => {
    const panel = read('components/CompanySmtpPanel.tsx');
    expect(panel).toContain("'/api/mail/company-smtp/send'");
    expect(panel).toContain("'Idempotency-Key': requestId");
    expect(panel).toContain('crypto.randomUUID()');
    expect(panel).toContain('window.confirm');
    expect(panel).toContain('sendUncertain');
    expect(panel).toContain('disabled={working || sendUncertain}');
    expect(panel).toContain('회사 웹메일 또는 수신자에게 발송 여부를 확인');
    expect(panel).not.toContain('dangerouslySetInnerHTML');
  });

  it('status는 AAL2에서 발신 주소만 반환하고 비밀번호를 노출하지 않는다', () => {
    const status = read('app/api/mail/status/route.ts');
    expect(status).toContain('getCompanySmtpConfig');
    expect(status).toContain("access.aal === 'aal2'");
    expect(status).toContain('companySmtp: companySmtp ? { from: companySmtp.from } : null');
    expect(status).not.toContain('companySmtp.password');
  });
});
