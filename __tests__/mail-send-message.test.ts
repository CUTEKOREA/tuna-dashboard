import { describe, expect, it } from 'vitest';
import { buildGmailRawMessage, parseGmailSendInput } from '../lib/mail/send-message';

describe('Gmail 즉시 발송 입력', () => {
  it('수신자 한 명·제목·일반 텍스트 본문을 정규화한다', () => {
    expect(parseGmailSendInput({
      to: ' recipient@example.com ',
      subject: ' 발송 확인 ',
      text: '일반 텍스트 본문입니다.\n둘째 줄',
    })).toEqual({
      to: 'recipient@example.com',
      subject: '발송 확인',
      text: '일반 텍스트 본문입니다.\n둘째 줄',
    });
  });

  it('다중 수신자·헤더 개행·빈 본문·과대 본문을 거부한다', () => {
    for (const value of [
      { to: 'a@example.com,b@example.com', subject: '제목', text: '본문' },
      { to: 'a@example.com', subject: '제목\r\nBcc: evil@example.com', text: '본문' },
      { to: 'a@example.com', subject: '제목\u0007', text: '본문' },
      { to: 'a@example.com', subject: '제목', text: '   ' },
      { to: 'a@example.com', subject: '제목', text: '본문\u0007' },
      { to: 'a@example.com', subject: '제목', text: '가'.repeat(10_001) },
    ]) {
      expect(() => parseGmailSendInput(value)).toThrow('메일 발송 입력');
    }
  });

  it('한글 제목과 본문을 RFC 2047·일반 텍스트 MIME으로만 만든다', () => {
    const raw = buildGmailRawMessage({
      to: 'recipient@example.com',
      subject: '발송 확인',
      text: '일반 텍스트 본문입니다.',
    });
    const mime = Buffer.from(raw, 'base64url').toString('utf8');

    expect(mime).toContain('To: recipient@example.com\r\n');
    expect(mime).toContain('Subject: =?UTF-8?B?');
    expect(mime).toContain('MIME-Version: 1.0');
    expect(mime).toContain('Content-Type: text/plain; charset=UTF-8');
    expect(mime).toContain('Content-Transfer-Encoding: base64');
    expect(mime).not.toMatch(/Content-Type: text\/html/i);
    expect(mime).not.toMatch(/\r\n(?:Cc|Bcc):/i);
  });

  it('검증된 회신 thread 메타데이터를 MIME 헤더로 만들고 입력을 정규화한다', () => {
    const message = parseGmailSendInput({
      to: 'reply@example.com',
      subject: 'Re: 수급 확인',
      text: '회신 본문',
      threadId: 'thread_reply_123',
      inReplyTo: '<message-reply@example.com>',
      references: ['<older@example.com>', '<message-reply@example.com>'],
    });
    expect(message).toMatchObject({
      threadId: 'thread_reply_123',
      inReplyTo: '<message-reply@example.com>',
      references: ['<older@example.com>', '<message-reply@example.com>'],
    });

    const mime = Buffer.from(buildGmailRawMessage(message), 'base64url').toString('utf8');
    expect(mime).toContain('In-Reply-To: <message-reply@example.com>\r\n');
    expect(mime).toContain('References: <older@example.com> <message-reply@example.com>\r\n');
  });

  it('부분 회신 메타데이터·헤더 주입·비정상 thread ID를 거부한다', () => {
    for (const value of [
      { to: 'a@example.com', subject: '제목', text: '본문', threadId: 'thread' },
      { to: 'a@example.com', subject: '제목', text: '본문', inReplyTo: '<m@example.com>' },
      { to: 'a@example.com', subject: '제목', text: '본문', threadId: '../evil', inReplyTo: '<m@example.com>', references: [] },
      { to: 'a@example.com', subject: '제목', text: '본문', threadId: 'thread', inReplyTo: '<m@example.com>\r\nBcc: evil@example.com', references: [] },
      { to: 'a@example.com', subject: '제목', text: '본문', threadId: 'thread', inReplyTo: '<m@example.com>', references: ['<ok@example.com>', 'bad\r\nCc: x@example.com'] },
    ]) {
      expect(() => parseGmailSendInput(value)).toThrow('메일 발송 입력');
    }
  });

  it('긴 제목을 75자 이하 RFC 2047 encoded-word로 접어 원문을 보존한다', () => {
    const subject = '긴 한글 제목 '.repeat(20).slice(0, 200);
    const raw = buildGmailRawMessage({
      to: 'recipient@example.com',
      subject,
      text: '본문',
    });
    const mime = Buffer.from(raw, 'base64url').toString('utf8');
    const subjectBlock = mime.slice(
      mime.indexOf('Subject: ') + 'Subject: '.length,
      mime.indexOf('\r\nMIME-Version:'),
    );
    const encodedWords = subjectBlock.split('\r\n ');

    expect(encodedWords.length).toBeGreaterThan(1);
    expect(encodedWords.every((word) => word.length <= 75)).toBe(true);
    expect(encodedWords.map((word) => {
      const match = /^=\?UTF-8\?B\?([A-Za-z0-9+/=]+)\?=$/.exec(word);
      expect(match).not.toBeNull();
      return Buffer.from(match?.[1] ?? '', 'base64').toString('utf8');
    }).join('')).toBe(subject);
  });
});
