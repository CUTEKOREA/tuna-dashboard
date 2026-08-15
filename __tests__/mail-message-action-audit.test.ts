import type { SupabaseClient } from '@supabase/supabase-js';
import { describe, expect, it, vi } from 'vitest';
import { recordMailTrashOutcome, reserveMailTrashRequest } from '../lib/mail/message-action-audit';

function mockClient(data: unknown, error: unknown = null): SupabaseClient {
  return { rpc: vi.fn(async () => ({ data, error })) } as unknown as SupabaseClient;
}

describe('메일 휴지통 이동 중복 방지와 감사 기록', () => {
  it('신규·완료·미확정·제한 결정을 안전한 상태로 정규화한다', async () => {
    await expect(reserveMailTrashRequest(mockClient([{ decision: 'reserved', existing_status: 'pending' }]), 'user-1', 'request-1', 'message-1'))
      .resolves.toEqual({ decision: 'reserved' });
    await expect(reserveMailTrashRequest(mockClient([{ decision: 'existing', existing_status: 'completed' }]), 'user-1', 'request-1', 'message-1'))
      .resolves.toEqual({ decision: 'completed' });
    await expect(reserveMailTrashRequest(mockClient([{ decision: 'existing', existing_status: 'unknown' }]), 'user-1', 'request-1', 'message-1'))
      .resolves.toEqual({ decision: 'pending_or_unknown' });
    await expect(reserveMailTrashRequest(mockClient([{ decision: 'rate_limited', existing_status: null }]), 'user-1', 'request-1', 'message-1'))
      .resolves.toEqual({ decision: 'rate_limited' });
  });

  it('예약 시 UUID를 Gmail 메시지 ID hash에 결속하고 원문은 RPC에 전달하지 않는다', async () => {
    const client = mockClient([{ decision: 'reserved', existing_status: 'pending' }]);
    await reserveMailTrashRequest(client, 'user-1', 'request-1', 'private-gmail-message-id');
    expect(client.rpc).toHaveBeenCalledWith('reserve_mail_message_action', {
      p_user_id: 'user-1',
      p_request_id: 'request-1',
      p_gmail_message_id_hash: expect.stringMatching(/^[a-f0-9]{64}$/),
    });
    expect(JSON.stringify(vi.mocked(client.rpc).mock.calls)).not.toContain('private-gmail-message-id');
  });

  it('완료 기록에는 Gmail 메시지 ID 원문 대신 SHA-256만 전달한다', async () => {
    const client = mockClient(true);
    await recordMailTrashOutcome(client, {
      userId: 'user-1',
      requestId: 'request-1',
      status: 'completed',
    });

    expect(client.rpc).toHaveBeenCalledWith('complete_mail_message_action', {
      p_user_id: 'user-1',
      p_request_id: 'request-1',
      p_status: 'completed',
    });
  });

  it('unknown 상태에는 메시지 ID hash를 저장하지 않는다', async () => {
    const client = mockClient(true);
    await recordMailTrashOutcome(client, {
      userId: 'user-1',
      requestId: 'request-1',
      status: 'unknown',
    });
    expect(client.rpc).toHaveBeenCalledWith('complete_mail_message_action', {
      p_user_id: 'user-1',
      p_request_id: 'request-1',
      p_status: 'unknown',
    });
  });
});
