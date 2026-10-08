import { createTransport } from 'nodemailer';
import { describe, expect, it } from 'vitest';
import {
  sendCompanySmtpMessage,
  type SmtpTransportFactory,
} from '../lib/mail/company-smtp';

// nodemailer 를 모킹하지 않는다. 실제 라이브러리의 streamTransport·jsonTransport 로
// 메시지 한 통을 네트워크 없이 조립해, 9.x 에서 뽑은 기준 출력과 같은지 단언한다.
const CONFIG = {
  host: 'smtp.example.com',
  port: 587,
  user: 'ops@silla.example',
  password: 'unused-no-network',
  from: 'ops@silla.example',
};
const MESSAGE = {
  to: 'ceo@silla.example',
  subject: '주간 브리핑 — 참치 시세',
  text: '첫 줄\n둘째 줄 한글 본문',
};

// 9.1.1 로 같은 입력을 조립해 얻은 원문 (Message-ID·Date 는 매번 달라 치환).
const EXPECTED_RFC822 = [
  'From: ops@silla.example',
  'To: ceo@silla.example',
  'Subject: =?UTF-8?B?7KO86rCEIOu4jOumrO2VkSDigJQg7LC47LmYIA==?=',
  ' =?UTF-8?B?7Iuc7IS4?=',
  'Message-ID: <MID>',
  'Content-Transfer-Encoding: base64',
  'Date: <DATE>',
  'MIME-Version: 1.0',
  'Content-Type: text/plain; charset=utf-8',
  '',
  '7LKrIOykhArrkZjsp7gg7KSEIO2VnOq4gCDrs7jrrLg=',
  '',
].join('\n');

type Captured = { options: unknown; envelope: unknown; message: string };

function realTransportFactory(
  transportOptions: Parameters<typeof createTransport>[0],
  captured: Captured[],
): SmtpTransportFactory {
  return (options) => {
    const transport = createTransport(transportOptions);
    return {
      async sendMail(mail) {
        const info = await transport.sendMail(mail) as {
          envelope: { from: string; to: string[] };
          message: Buffer | string;
        };
        captured.push({ options, envelope: info.envelope, message: info.message.toString() });
        // SMTP 서버가 없으므로 수락 목록은 조립된 envelope 수신자로 대신한다.
        return { accepted: [...info.envelope.to], rejected: [], envelope: info.envelope };
      },
    };
  };
}

describe('회사 SMTP — 실제 nodemailer 로 조립한 메시지', () => {
  it('streamTransport 원문의 헤더·수신자·본문이 9.x 기준과 같다', async () => {
    const captured: Captured[] = [];
    await sendCompanySmtpMessage({
      config: CONFIG,
      message: MESSAGE,
      createTransport: realTransportFactory({ streamTransport: true, buffer: true, newline: 'unix' }, captured),
    });

    expect(captured).toHaveLength(1);
    const [sent] = captured;
    expect(sent.options).toEqual({
      host: 'smtp.example.com',
      port: 587,
      secure: false,
      requireTLS: true,
      auth: { user: 'ops@silla.example', pass: 'unused-no-network' },
      tls: { rejectUnauthorized: true, servername: 'smtp.example.com', minVersion: 'TLSv1.2' },
      connectionTimeout: 15_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
    });
    expect(sent.envelope).toEqual({ from: 'ops@silla.example', to: ['ceo@silla.example'] });
    expect(sent.message).toMatch(/^Message-ID: <[^>\s]+@silla\.example>$/m);
    expect(sent.message).toMatch(/^Date: [A-Z][a-z]{2}, \d{2} [A-Z][a-z]{2} \d{4} \d{2}:\d{2}:\d{2} \+0000$/m);
    const normalized = sent.message
      .replace(/^Message-ID: <[^>]+>$/m, 'Message-ID: <MID>')
      .replace(/^Date: .+$/m, 'Date: <DATE>');
    expect(normalized).toBe(EXPECTED_RFC822);
    expect(normalized).not.toMatch(/^(Cc|Bcc):/m);
    expect(Buffer.from('7LKrIOykhArrkZjsp7gg7KSEIO2VnOq4gCDrs7jrrLg=', 'base64').toString('utf8')).toBe(MESSAGE.text);
  });

  it('jsonTransport 구조화 출력의 발신자·수신자·제목·본문이 9.x 기준과 같다', async () => {
    const captured: Captured[] = [];
    await sendCompanySmtpMessage({
      config: CONFIG,
      message: MESSAGE,
      createTransport: realTransportFactory({ jsonTransport: true }, captured),
    });

    expect(captured).toHaveLength(1);
    const [sent] = captured;
    expect(sent.envelope).toEqual({ from: 'ops@silla.example', to: ['ceo@silla.example'] });
    const parsed = JSON.parse(sent.message) as Record<string, unknown>;
    expect(parsed.messageId).toMatch(/^<[^>\s]+@silla\.example>$/);
    expect({ ...parsed, messageId: '<MID>' }).toEqual({
      from: { address: 'ops@silla.example', name: '' },
      to: [{ address: 'ceo@silla.example', name: '' }],
      subject: '주간 브리핑 — 참치 시세',
      text: '첫 줄\n둘째 줄 한글 본문',
      headers: {},
      messageId: '<MID>',
    });
  });
});
