import { createHash } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';

export type MailTrashReservation =
  | { decision: 'reserved' }
  | { decision: 'completed' }
  | { decision: 'pending_or_unknown' }
  | { decision: 'rate_limited' }
  | { decision: 'invalid' };

export async function reserveMailTrashRequest(
  client: SupabaseClient,
  userId: string,
  requestId: string,
  gmailMessageId: string,
): Promise<MailTrashReservation> {
  const gmailMessageIdHash = createHash('sha256').update(gmailMessageId).digest('hex');
  const { data, error } = await client.rpc('reserve_mail_message_action', {
    p_user_id: userId,
    p_request_id: requestId,
    p_gmail_message_id_hash: gmailMessageIdHash,
  });
  if (error || !Array.isArray(data) || data.length !== 1) {
    throw new Error('메일 휴지통 이동 요청을 예약하지 못했습니다');
  }
  const row = data[0] as { decision?: unknown; existing_status?: unknown };
  if (row.decision === 'reserved') return { decision: 'reserved' };
  if (row.decision === 'rate_limited') return { decision: 'rate_limited' };
  if (row.decision === 'invalid') return { decision: 'invalid' };
  if (row.decision === 'existing' && row.existing_status === 'completed') return { decision: 'completed' };
  if (row.decision === 'existing' && (row.existing_status === 'pending' || row.existing_status === 'unknown')) {
    return { decision: 'pending_or_unknown' };
  }
  throw new Error('메일 휴지통 이동 예약 응답을 확인하지 못했습니다');
}

export async function recordMailTrashOutcome(
  client: SupabaseClient,
  options: {
    userId: string;
    requestId: string;
    status: 'completed' | 'unknown';
  },
): Promise<void> {
  const { data, error } = await client.rpc('complete_mail_message_action', {
    p_user_id: options.userId,
    p_request_id: options.requestId,
    p_status: options.status,
  });
  if (error || data !== true) throw new Error('메일 휴지통 이동 결과를 기록하지 못했습니다');
}
