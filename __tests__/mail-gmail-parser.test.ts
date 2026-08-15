import { describe, expect, it } from 'vitest';
import { parseGmailMessage } from '../lib/mail/gmail-parser';

describe('Gmail 메타데이터 파서', () => {
  it('대소문자 무관 헤더와 UNREAD 상태를 읽고 본문·첨부파일을 버린다', () => {
    const parsed = parseGmailMessage({
      id: '18fabc_123',
      threadId: '18fthread_456',
      labelIds: ['INBOX', 'UNREAD'],
      internalDate: '1786742400000',
      snippet: '<b>중요</b> & 회신 부탁드립니다',
      payload: {
        headers: [
          { name: 'fRoM', value: '홍길동 <sender@example.com>' },
          { name: 'SUBJECT', value: '수급 확인' },
          { name: 'date', value: 'Sat, 15 Aug 2026 09:00:00 +0900' },
        ],
        body: { data: '민감한-본문', size: 999 },
        parts: [{ filename: 'secret.pdf', body: { attachmentId: 'attachment-secret' } }],
      },
    });

    expect(parsed).toEqual({
      id: '18fabc_123',
      threadId: '18fthread_456',
      from: '홍길동 <sender@example.com>',
      subject: '수급 확인',
      receivedAt: '2026-08-14T21:20:00.000Z',
      snippet: '<b>중요</b> & 회신 부탁드립니다',
      unread: true,
      gmailUrl: 'https://mail.google.com/mail/u/0/#inbox/18fthread_456',
    });
    expect(JSON.stringify(parsed)).not.toContain('민감한-본문');
    expect(JSON.stringify(parsed)).not.toContain('attachment-secret');
  });

  it('누락값과 잘못된 날짜에 안전한 대체값을 쓰고 snippet을 200자로 제한한다', () => {
    const parsed = parseGmailMessage({
      id: 'abc123',
      threadId: 'thread123',
      internalDate: 'not-a-date',
      snippet: `  ${'가'.repeat(250)}  `,
      payload: { headers: [] },
    });

    expect(parsed.from).toBe('발신자 없음');
    expect(parsed.subject).toBe('(제목 없음)');
    expect(parsed.receivedAt).toBeNull();
    expect(parsed.snippet).toHaveLength(200);
    expect(parsed.unread).toBe(false);
  });

  it('검증된 Gmail 메시지·스레드 ID만 deep link로 만든다', () => {
    expect(() => parseGmailMessage({
      id: 'abc/../../evil',
      threadId: 'https://evil.example',
      payload: { headers: [] },
    })).toThrow('Gmail 메시지 형식');
  });

  it('비정상적으로 긴 헤더와 제어문자를 응답 경계에서 제한한다', () => {
    const parsed = parseGmailMessage({
      id: 'message123',
      threadId: 'thread123',
      payload: {
        headers: [
          { name: 'From', value: `보낸이\u0000${'가'.repeat(500)}` },
          { name: 'Subject', value: `제목\r\n${'나'.repeat(1_200)}` },
        ],
      },
    });

    expect(parsed.from).toHaveLength(320);
    expect(parsed.subject).toHaveLength(500);
    expect(parsed.from).not.toMatch(/[\u0000-\u001F\u007F]/);
    expect(parsed.subject).not.toMatch(/[\u0000-\u001F\u007F]/);
  });

  it('헤더가 제어문자뿐이면 안전한 대체값을 사용한다', () => {
    const parsed = parseGmailMessage({
      id: 'message456',
      threadId: 'thread456',
      payload: {
        headers: [
          { name: 'From', value: '\u0000\r\n' },
          { name: 'Subject', value: '\t\u007F' },
        ],
      },
    });

    expect(parsed.from).toBe('발신자 없음');
    expect(parsed.subject).toBe('(제목 없음)');
  });
});
