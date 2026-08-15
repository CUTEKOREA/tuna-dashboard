import type { SupabaseClient } from '@supabase/supabase-js';
import { describe, expect, it, vi } from 'vitest';
import { recordMailSendOutcome, reserveMailSendRequest } from '../lib/mail/send-audit';

function mockClient(data: unknown, error: unknown = null): SupabaseClient {
  return { rpc: vi.fn(async () => ({ data, error })) } as unknown as SupabaseClient;
}

describe('메일 발송 중복 방지와 감사 기록', () => {
  it('신규·완료·미확정·제한 결정을 안전한 상태로 정규화한다', async () => {
    await expect(reserveMailSendRequest(mockClient([
      { decision: 'reserved', existing_status: 'pending' },
    ]), 'user-1', '00000000-0000-4000-8000-000000000001')).resolves.toEqual({ decision: 'reserved' });
    await expect(reserveMailSendRequest(mockClient([
      { decision: 'existing', existing_status: 'sent' },
    ]), 'user-1', '00000000-0000-4000-8000-000000000001')).resolves.toEqual({ decision: 'sent' });
    await expect(reserveMailSendRequest(mockClient([
      { decision: 'existing', existing_status: 'unknown' },
    ]), 'user-1', '00000000-0000-4000-8000-000000000001')).resolves.toEqual({ decision: 'pending_or_unknown' });
    await expect(reserveMailSendRequest(mockClient([
      { decision: 'rate_limited', existing_status: null },
    ]), 'user-1', '00000000-0000-4000-8000-000000000001')).resolves.toEqual({ decision: 'rate_limited' });
  });

  it('발송 결과에는 상태와 Gmail ID만 기록하고 수신자·제목·본문을 받지 않는다', async () => {
    const client = mockClient(true);
    await recordMailSendOutcome(client, {
      userId: 'user-1',
      requestId: '00000000-0000-4000-8000-000000000001',
      status: 'sent',
      gmailMessageId: 'gmail-message-1',
    });

    expect(client.rpc).toHaveBeenCalledWith('complete_mail_send_request', {
      p_user_id: 'user-1',
      p_request_id: '00000000-0000-4000-8000-000000000001',
      p_status: 'sent',
      p_gmail_message_id: 'gmail-message-1',
    });
  });

  it('알 수 없는 RPC 응답과 기록 실패를 거부한다', async () => {
    await expect(reserveMailSendRequest(mockClient([]), 'user-1', 'request-1')).rejects.toThrow('예약');
    await expect(recordMailSendOutcome(mockClient(false), {
      userId: 'user-1',
      requestId: 'request-1',
      status: 'unknown',
    })).rejects.toThrow('기록');
  });
});
