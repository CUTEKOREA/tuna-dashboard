import { describe, expect, it } from 'vitest';
import { isUncertainMailSendResponse } from '../lib/mail/send-response';

describe('메일 발송 응답 불확실성 판정', () => {
  it('본문이 유실된 409를 fail-closed 불확실 상태로 판정한다', () => {
    expect(isUncertainMailSendResponse(409, undefined)).toBe(true);
    expect(isUncertainMailSendResponse(409, 'unexpected_code')).toBe(true);
    expect(isUncertainMailSendResponse(409, 'mail_send_status_unknown')).toBe(true);
  });

  it('명확한 발송 전 거부와 서버 실패를 구분한다', () => {
    expect(isUncertainMailSendResponse(409, 'gmail_not_connected')).toBe(false);
    expect(isUncertainMailSendResponse(400, undefined)).toBe(false);
    expect(isUncertainMailSendResponse(403, 'invalid_gmail_scope')).toBe(false);
    expect(isUncertainMailSendResponse(415, 'invalid_content_type')).toBe(false);
    expect(isUncertainMailSendResponse(429, 'mail_send_rate_limited')).toBe(false);
    expect(isUncertainMailSendResponse(502, undefined)).toBe(true);
  });
});
