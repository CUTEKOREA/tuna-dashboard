import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROUTES = [
  ['status', 'GET'],
  ['gmail/connect', 'POST'],
  ['gmail/callback', 'GET'],
  ['mfa/enroll', 'POST'],
  ['mfa/verify', 'POST'],
  ['gmail/messages', 'GET'],
  ['gmail/disconnect', 'DELETE'],
] as const;

function routeSource(route: string): string {
  return readFileSync(join(process.cwd(), `app/api/mail/${route}/route.ts`), 'utf8');
}

describe('관리자 메일 API route 계약', () => {
  it.each(ROUTES)('/api/mail/%s는 %s와 명시적 no-store 정책을 제공한다', (route, method) => {
    const source = routeSource(route);
    expect(source).toMatch(new RegExp(`export\\s+async\\s+function\\s+${method}\\b`));
    expect(source).toContain("export const dynamic = 'force-dynamic'");
    expect(source).toMatch(/Cache-Control['"]?\s*:\s*['"]no-store, max-age=0['"]/);
  });

  it('메일 데이터·OAuth는 AAL2, 상태·MFA bootstrap은 확인된 관리자 인증을 검증한다', () => {
    for (const route of ['gmail/connect', 'gmail/callback', 'gmail/messages', 'gmail/disconnect']) {
      expect(routeSource(route)).toContain('authorizeMailRequest(true)');
    }
    for (const route of ['status', 'mfa/enroll', 'mfa/verify']) {
      expect(routeSource(route)).toContain('authorizeMailRequest(false)');
    }
  });

  it('변경 route는 검증된 공개 기준 URL로 Origin을 비교한다', () => {
    for (const route of ['gmail/connect', 'mfa/enroll', 'mfa/verify', 'gmail/disconnect']) {
      const source = routeSource(route);
      expect(source).toContain('getMailPublicBaseUrl()');
      expect(source).toContain('hasTrustedMailOrigin(request,');
    }
  });

  it('MFA 등록 route는 TOTP URI와 안전한 SVG QR만 브라우저에 전달한다', () => {
    const source = routeSource('mfa/enroll');
    expect(source).toContain('isSafeTotpQrDataUrl(data.totp.qr_code)');
    expect(source).toContain("data.totp.uri.startsWith('otpauth://totp/')");
    expect(source).not.toMatch(/\n\s+uri:\s*data\.totp\.uri/);
  });

  it('MFA 재등록 전에는 이름과 무관하게 미검증 TOTP factor만 정리한다', () => {
    const source = routeSource('mfa/enroll');
    expect(source).toContain("totpFactors.filter((item) => item.status === 'unverified')");
    expect(source).not.toContain("item.status === 'unverified' && item.friendly_name");
  });

  it('MFA 등록 실패는 원문 오류 대신 안전한 단계·공식 코드만 반환한다', () => {
    const source = routeSource('mfa/enroll');
    for (const code of [
      'mfa_factor_list_failed',
      'mfa_factor_cleanup_failed',
      'mfa_enroll_failed',
      'mfa_qr_rejected',
      'mfa_uri_rejected',
    ]) {
      expect(source).toContain(code);
    }
    expect(source).not.toContain('error.message');
    expect(readFileSync(join(process.cwd(), 'components/MailInboxDashboard.tsx'), 'utf8'))
      .toContain('진단 코드:');
  });

  it('OAuth cookie는 HttpOnly·SameSite=Lax·10분·callback 전용이고 callback에서 삭제한다', () => {
    const connect = routeSource('gmail/connect');
    const callback = routeSource('gmail/callback');
    expect(connect).toContain('httpOnly: true');
    expect(connect).toContain("sameSite: 'lax'");
    expect(connect).toContain('maxAge: 600');
    expect(connect).toContain("path: '/api/mail/gmail/callback'");
    expect(callback).toContain('response.cookies.delete');
  });

  it('연결 중 재연결과 callback 경쟁은 기존 레코드를 덮어쓰지 않는다', () => {
    expect(routeSource('gmail/connect')).toContain('gmail_already_connected');
    expect(routeSource('gmail/callback')).toContain('getMailConnectionSummary');
    expect(routeSource('gmail/callback')).toContain('revokeGoogleToken(refreshToken)');
  });

  it('연결 해제는 Google 철회를 먼저 시도하고 결과와 무관하게 DB 레코드를 삭제한다', () => {
    const source = routeSource('gmail/disconnect');
    expect(source.indexOf('revokeGoogleToken(refreshToken)')).toBeLessThan(
      source.indexOf("deleteMailConnection(client, access.userId, 'gmail')"),
    );
    expect(source).toContain('let revoked = true');
    expect(source).toContain('revoked = false');
    expect(source).toContain('try {\n        refreshToken = readRefreshToken');
  });

  it('메일 목록 route는 본문·첨부파일·토큰을 로그하지 않는다', () => {
    const source = routeSource('gmail/messages');
    expect(source).not.toContain('console.log');
    expect(source).not.toContain('dangerouslySetInnerHTML');
    expect(source).not.toMatch(/body\s*:/);
    expect(source).not.toMatch(/attachment/i);
  });
});
