import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('관리자 메일 메뉴 계약', () => {
  it('메일 메뉴와 패널을 레지스트리·대시보드 렌더 순서에 연결한다', () => {
    const registry = readFileSync(join(process.cwd(), 'lib/dashboard-registry.ts'), 'utf8');
    const page = readFileSync(join(process.cwd(), 'app/page.tsx'), 'utf8');

    expect(registry).toContain("key: 'mail'");
    expect(registry).toContain("title: '메일'");
    expect(registry).toContain("sidebar: { icon: 'Mail' }");
    expect(page).toContain("const MailInboxDashboard = dynamic(() => import('../components/MailInboxDashboard'))");
    expect(page).toContain('mail: mailAdminVisible ? <MailInboxDashboard /> : null');
  });

  it('메일 메뉴는 sessionStorage 비밀번호를 보안 경계로 사용하지 않는다', () => {
    const registry = readFileSync(join(process.cwd(), 'lib/dashboard-registry.ts'), 'utf8');
    const mailConfig = registry.match(/\{ key: 'mail',[^\n]+\}/)?.[0] ?? '';
    const page = readFileSync(join(process.cwd(), 'app/page.tsx'), 'utf8');

    expect(mailConfig).not.toContain('requiresOperationAccess');
    expect(mailConfig).toContain('requiresAdminAccess: true');
    expect(registry).toContain("SESSION_ACCESS_MENU_KEYS = VALID_MENUS.filter((menu) => menu !== 'mail')");
    expect(page).toContain('SESSION_ACCESS_MENUS.has(activeMenu) && !operationAccessGranted');
    expect(page).toContain("if (item.key === 'mail' && !mailAdminVisible) return null");
    expect(page).toContain('mail: mailAdminVisible ? <MailInboxDashboard /> : null');
  });

  it('직접 /mail 접근도 서버 관리자 경계와 검색 차단을 통과해야 한다', () => {
    const route = readFileSync(join(process.cwd(), 'app/mail/page.tsx'), 'utf8');
    const page = readFileSync(join(process.cwd(), 'app/page.tsx'), 'utf8');

    expect(route).toContain('authorizeMailRequest(false)');
    expect(route).toContain('if (!access.ok) notFound()');
    expect(route).toContain("export const dynamic = 'force-dynamic'");
    expect(route).toContain('index: false');
    expect(route).toContain('follow: false');
    expect(page).toContain("if (path && isActiveMenu(path)) return path");
  });

  it('메일 화면은 텍스트 메타데이터·원본 링크만 제공하고 브라우저 저장소에 토큰을 쓰지 않는다', () => {
    const source = readFileSync(join(process.cwd(), 'components/MailInboxDashboard.tsx'), 'utf8');

    for (const label of ['안 읽은 메일', '발신자', '제목', '수신 시각', '미리보기', 'Gmail 원본 열기']) {
      expect(source).toContain(label);
    }
    expect(source).toContain('rel="noopener noreferrer"');
    expect(source).not.toContain('dangerouslySetInnerHTML');
    expect(source).not.toContain('localStorage');
    expect(source).not.toContain('sessionStorage');
    expect(source).not.toMatch(/답장|첨부파일 저장|메일 발송/);
  });
});