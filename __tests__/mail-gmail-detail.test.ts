import { describe, expect, it } from 'vitest';
import { buildReplyDraft, parseGmailMessageDetail } from '../lib/mail/gmail-detail';

function encode(value: string): string {
  return Buffer.from(value, 'utf8').toString('base64url');
}

describe('Gmail 메일 상세 파서', () => {
  it('중첩 multipart에서 일반 텍스트를 우선하고 첨부파일을 제외한다', () => {
    const detail = parseGmailMessageDetail({
      id: 'message_123',
      threadId: 'thread_456',
      internalDate: '1786742400000',
      payload: {
        mimeType: 'multipart/mixed',
        headers: [
          { name: 'From', value: '홍길동 <sender@example.com>' },
          { name: 'Reply-To', value: '"Support, Team" <reply@example.com>' },
          { name: 'Subject', value: '수급 확인' },
          { name: 'Message-ID', value: '<message-123@example.com>' },
          { name: 'References', value: '<older@example.com> <old@example.com>' },
        ],
        parts: [
          {
            mimeType: 'multipart/alternative',
            parts: [
              { mimeType: 'text/html', body: { data: encode('<p>HTML 본문</p>') } },
              { mimeType: 'text/plain', body: { data: encode('일반 텍스트 본문\n둘째 줄') } },
            ],
          },
          {
            filename: 'secret.txt',
            mimeType: 'text/plain',
            headers: [{ name: 'Content-Disposition', value: 'attachment' }],
            body: { data: encode('첨부파일 비밀') },
          },
        ],
      },
    });

    expect(detail).toMatchObject({
      id: 'message_123',
      threadId: 'thread_456',
      from: '홍길동 <sender@example.com>',
      replyTo: 'reply@example.com',
      subject: '수급 확인',
      bodyText: '일반 텍스트 본문\n둘째 줄',
      bodyTruncated: false,
      messageId: '<message-123@example.com>',
      references: ['<older@example.com>', '<old@example.com>'],
    });
    expect(JSON.stringify(detail)).not.toContain('첨부파일 비밀');
    expect(JSON.stringify(detail)).not.toContain('<p>');
  });

  it('HTML-only 본문에서 위험 요소와 태그를 제거한 텍스트만 반환한다', () => {
    const detail = parseGmailMessageDetail({
      id: 'message_html',
      threadId: 'thread_html',
      payload: {
        mimeType: 'text/html',
        headers: [{ name: 'From', value: 'sender@example.com' }],
        body: { data: encode('<style>.x{display:none}</style><script>alert(1)</script><p>안녕하세요<br>확인&nbsp;부탁드립니다.</p>') },
      },
    });

    expect(detail.bodyText).toBe('안녕하세요\n확인 부탁드립니다.');
    expect(detail.bodyText).not.toMatch(/script|style|alert|<|>/i);
  });

  it('multipart 순서와 무관하게 HTML보다 text/plain을 우선한다', () => {
    const detail = parseGmailMessageDetail({
      id: 'message_order',
      threadId: 'thread_order',
      payload: {
        mimeType: 'multipart/alternative',
        headers: [
          { name: 'From', value: 'sender@example.com' },
          { name: 'Subject', value: '순서 검증' },
          { name: 'Message-ID', value: '<order@example.com>' },
        ],
        parts: [
          { mimeType: 'text/html', body: { data: encode('<b>HTML 먼저</b>') } },
          { mimeType: 'text/plain', body: { data: encode('텍스트 우선') } },
        ],
      },
    });
    expect(detail.bodyText).toBe('텍스트 우선');
  });

  it('다중 Reply-To, 비정상 ID, 과대·과심 MIME을 fail-closed 제한한다', () => {
    const tooDeep: Record<string, unknown> = { mimeType: 'text/plain', body: { data: encode('깊은 본문') } };
    for (let index = 0; index < 12; index += 1) {
      const child = { ...tooDeep };
      for (const key of Object.keys(tooDeep)) delete tooDeep[key];
      Object.assign(tooDeep, { mimeType: 'multipart/mixed', parts: [child] });
    }
    const detail = parseGmailMessageDetail({
      id: 'message_safe',
      threadId: 'thread_safe',
      payload: {
        mimeType: 'multipart/mixed',
        headers: [
          { name: 'From', value: 'sender@example.com' },
          { name: 'Reply-To', value: 'a@example.com, b@example.com' },
          { name: 'Message-ID', value: '<ok@example.com>\r\nBcc: evil@example.com' },
        ],
        parts: [tooDeep],
      },
    });

    expect(detail.replyTo).toBeNull();
    expect(detail.messageId).toBeNull();
    expect(detail.bodyText).toBe('표시할 일반 텍스트 본문이 없습니다.');
  });

  it('회신 필드를 자동 채우되 자동 발송 없이 10,000자 경계를 지킨다', () => {
    const draft = buildReplyDraft({
      id: 'message_reply',
      threadId: 'thread_reply',
      from: '홍길동 <sender@example.com>',
      replyTo: 'reply@example.com',
      subject: '수급 확인',
      receivedAt: '2026-08-15T09:00:00.000Z',
      bodyText: '가'.repeat(20_000),
      bodyTruncated: true,
      messageId: '<message-reply@example.com>',
      references: ['<older@example.com>'],
    });

    expect(draft.to).toBe('reply@example.com');
    expect(draft.subject).toBe('Re: 수급 확인');
    expect(draft.text).toContain('---- 원문 ----');
    expect(draft.text.length).toBeLessThanOrEqual(10_000);
    expect(draft.threadId).toBe('thread_reply');
    expect(draft.inReplyTo).toBe('<message-reply@example.com>');
    expect(draft.references).toEqual(['<older@example.com>', '<message-reply@example.com>']);
    expect(buildReplyDraft({
      id: 'message_existing_reply',
      threadId: 'thread_reply',
      from: 'sender@example.com',
      replyTo: 'sender@example.com',
      subject: 'Re: 기존 회신',
      receivedAt: null,
      bodyText: '원문',
      bodyTruncated: false,
      messageId: '<existing-reply@example.com>',
      references: [],
    }).subject).toBe('Re: 기존 회신');
  });

  it('단일 회신 주소나 원본 Message-ID가 없으면 회신 초안을 만들지 않는다', () => {
    const base = {
      id: 'message_no_reply',
      threadId: 'thread_no_reply',
      from: 'sender@example.com',
      replyTo: 'sender@example.com' as string | null,
      subject: '제목',
      receivedAt: null,
      bodyText: '본문',
      bodyTruncated: false,
      messageId: '<message@example.com>' as string | null,
      references: [] as string[],
    };
    expect(() => buildReplyDraft({ ...base, replyTo: null })).toThrow('회신');
    expect(() => buildReplyDraft({ ...base, messageId: null })).toThrow('회신');
  });
});
