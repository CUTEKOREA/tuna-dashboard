import { describe, expect, it, vi } from 'vitest';
import {
  parseCompanySmtpMessage,
  sendCompanySmtpMessage,
  type SmtpTransport,
} from '../lib/mail/company-smtp';

describe('회사 SMTP 발송', () => {
  it('일반 텍스트 단일 수신자 입력만 정규화한다', () => {
    expect(parseCompanySmtpMessage({
      to: ' partner@example.com ',
      subject: ' 발송 확인 ',
      text: '일반 텍스트 본문\r\n둘째 줄',
    })).toEqual({
      to: 'partner@example.com',
      subject: '발송 확인',
      text: '일반 텍스트 본문\n둘째 줄',
    });

    for (const value of [
      { to: 'a@example.com,b@example.com', subject: '제목', text: '본문' },
      { to: 'a@example.com', subject: '제목\r\nBcc: x@example.com', text: '본문' },
      { to: 'a@example.com', subject: '제목', text: '본문\u0007' },
      { to: 'a@example.com', subject: '제목', text: '   ' },
      { to: 'a@example.com', subject: '제목', text: '가'.repeat(10_001) },
    ]) {
      expect(() => parseCompanySmtpMessage(value)).toThrow('회사 메일 발송 입력');
    }
  });

  it('STARTTLS 필수 transport로 일반 텍스트 한 건만 보내고 envelope를 고정한다', async () => {
    const sendMail = vi.fn(async () => ({
      accepted: ['partner@example.com'],
      rejected: [],
      envelope: { from: 'ledog@sla.co.kr', to: ['partner@example.com'] },
    }));
    const transport: SmtpTransport = { sendMail };

    await sendCompanySmtpMessage({
      config: {
        host: 'mail1.sla.co.kr',
        port: 587,
        user: 'ledog@sla.co.kr',
        password: 'secret',
        from: 'ledog@sla.co.kr',
      },
      message: { to: 'partner@example.com', subject: '제목', text: '본문' },
      createTransport: (options) => {
        expect(options).toMatchObject({
          host: 'mail1.sla.co.kr',
          port: 587,
          secure: false,
          requireTLS: true,
          tls: { rejectUnauthorized: true, servername: 'mail1.sla.co.kr' },
        });
        return transport;
      },
    });

    expect(sendMail).toHaveBeenCalledWith({
      from: 'ledog@sla.co.kr',
      to: 'partner@example.com',
      subject: '제목',
      text: '본문',
      envelope: { from: 'ledog@sla.co.kr', to: ['partner@example.com'] },
    });
  });

  it('SMTP가 정확히 한 수신자를 수락하지 않으면 성공으로 처리하지 않는다', async () => {
    await expect(sendCompanySmtpMessage({
      config: {
        host: 'mail1.sla.co.kr', port: 587, user: 'ledog@sla.co.kr', password: 'secret', from: 'ledog@sla.co.kr',
      },
      message: { to: 'partner@example.com', subject: '제목', text: '본문' },
      createTransport: () => ({
        sendMail: async () => ({
          accepted: [],
          rejected: ['partner@example.com'],
          envelope: { from: 'ledog@sla.co.kr', to: ['partner@example.com'] },
        }),
      }),
    })).rejects.toThrow('회사 SMTP 발송을 확인하지 못했습니다');
  });

  it('SMTP가 다른 수신자를 수락하면 성공으로 처리하지 않는다', async () => {
    await expect(sendCompanySmtpMessage({
      config: {
        host: 'mail1.sla.co.kr', port: 587, user: 'ledog@sla.co.kr', password: 'secret', from: 'ledog@sla.co.kr',
      },
      message: { to: 'partner@example.com', subject: '제목', text: '본문' },
      createTransport: () => ({
        sendMail: async () => ({
          accepted: ['other@example.com'],
          rejected: [],
          envelope: { from: 'ledog@sla.co.kr', to: ['partner@example.com'] },
        }),
      }),
    })).rejects.toThrow('회사 SMTP 발송을 확인하지 못했습니다');
  });

  it('provider의 배열 유사 객체와 envelope 불일치를 성공으로 처리하지 않는다', async () => {
    const config = {
      host: 'mail1.sla.co.kr', port: 587, user: 'ledog@sla.co.kr', password: 'secret', from: 'ledog@sla.co.kr',
    };
    const message = { to: 'partner@example.com', subject: '제목', text: '본문' };

    await expect(sendCompanySmtpMessage({
      config,
      message,
      createTransport: () => ({
        sendMail: async () => ({
          accepted: { 0: message.to, length: 1 },
          rejected: { length: 0 },
          envelope: { from: config.from, to: [message.to] },
        }),
      } as unknown as SmtpTransport),
    })).rejects.toThrow('회사 SMTP 발송을 확인하지 못했습니다');

    await expect(sendCompanySmtpMessage({
      config,
      message,
      createTransport: () => ({
        sendMail: async () => ({
          accepted: [message.to],
          rejected: [],
          envelope: { from: config.from, to: [message.to, 'other@example.com'] },
        }),
      }),
    })).rejects.toThrow('회사 SMTP 발송을 확인하지 못했습니다');
  });
});
