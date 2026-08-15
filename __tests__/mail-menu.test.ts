import { existsSync, readFileSync } from 'node:fs';
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

  it('공개 대시보드와 분리된 관리자 로그인 경로가 Supabase 세션을 만든다', () => {
    const loginPagePath = join(process.cwd(), 'app/mail/login/page.tsx');
    const loginComponentPath = join(process.cwd(), 'components/MailAdminLogin.tsx');

    expect(existsSync(loginPagePath)).toBe(true);
    expect(existsSync(loginComponentPath)).toBe(true);

    const loginPage = existsSync(loginPagePath) ? readFileSync(loginPagePath, 'utf8') : '';
    const loginComponent = existsSync(loginComponentPath) ? readFileSync(loginComponentPath, 'utf8') : '';

    expect(loginPage).toContain('index: false');
    expect(loginPage).toContain('follow: false');
    expect(loginComponent).toContain('supabase.auth.signInWithPassword');
    expect(loginComponent).toContain("router.replace('/mail')");
    expect(loginComponent).not.toContain('signUp');
    expect(loginComponent).not.toContain('localStorage');
    expect(loginComponent).not.toContain('sessionStorage');
  });

  it('메일 화면은 상세 확인·회신 자동 채움·단건 휴지통·확인 후 발송만 제공한다', () => {
    const source = readFileSync(join(process.cwd(), 'components/MailInboxDashboard.tsx'), 'utf8');

    for (const label of ['안 읽은 메일', '발신자', '제목', '수신 시각', '미리보기', 'Gmail 원본 열기', '내용 확인', '회신 작성', '휴지통으로 이동', '새 메일 보내기', '받는 사람', '본문', '즉시 발송']) {
      expect(source).toContain(label);
    }
    expect(source).toContain('rel="noopener noreferrer"');
    expect(source).not.toContain('dangerouslySetInnerHTML');
    expect(source).not.toContain('localStorage');
    expect(source).not.toContain('sessionStorage');
    expect(source).toContain('window.confirm');
    expect(source).toContain("'Idempotency-Key': requestId");
    expect(source).toContain('crypto.randomUUID()');
    expect(source).toContain("mailRequest(`/api/mail/gmail/message?id=${encodeURIComponent(messageId)}`)");
    expect(source).toContain("mailRequest('/api/mail/gmail/trash'");
    expect(source).toContain("window.confirm('선택한 메일 1건을 Gmail 휴지통으로 이동하시겠습니까? 휴지통에서는 복구할 수 있습니다.')");
    expect(source).toContain('const trashRequestRef = useRef<{ messageId: string; requestId: string } | null>(null)');
    expect(source).toContain('currentRequest.messageId !== selectedMessage.message.id && trashUncertain');
    expect(source).toContain('value.messages.some((message) => message.id === pendingTrash.messageId)');
    expect(source).toContain('pendingTrash && !trashingRef.current');
    expect(source).toContain('currentRequest?.messageId === selectedMessage.message.id');
    expect(source).toContain('trashRequestRef.current = { messageId: selectedMessage.message.id, requestId }');
    expect(source).toContain('<select disabled={working} value={limit}');
    expect(source).toContain("trashRequestRef.current = null;\n        setTrashUncertain(false);\n        setError(value.code === 'mail_trash_rate_limited'");
    expect(source).toContain('threadId: replyMetadata.threadId');
    expect(source).toContain('inReplyTo: replyMetadata.inReplyTo');
    expect(source).toContain('references: replyMetadata.references');
    expect(source).toContain('<pre className={styles.messageBody}>{selectedMessage.message.bodyText}</pre>');
    expect(source).toContain('Gmail 보낸편지함을 먼저 확인해주세요.');
    expect(source).toContain('const [sendUncertain, setSendUncertain] = useState(false)');
    expect(source).toContain("setError('발송 상태를 확인할 수 없습니다. 중복 발송을 막기 위해 Gmail 보낸편지함을 먼저 확인해주세요.')");
    expect(source).toContain('disabled={working || sendUncertain}');
    expect(source).toContain('Gmail 보낸편지함 확인 완료');
    expect(source).toContain("window.confirm('Gmail 보낸편지함에서 발송 여부를 확인하셨습니까? 확인 후에만 새 메일을 준비합니다.')");
    expect(source).toContain('첨부파일과 자동 발송은 지원하지 않습니다.');
    expect(source).not.toContain('type="file"');
    expect(source).not.toMatch(/영구 삭제|messages\/delete|batchDelete/);
    expect(source).not.toMatch(/setInterval|scheduleMail/);
  });
});