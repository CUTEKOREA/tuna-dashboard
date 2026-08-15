import type { SupabaseClient } from '@supabase/supabase-js';

export type MailSendReservation =
  | { decision: 'reserved' }
  | { decision: 'sent' }
  | { decision: 'pending_or_unknown' }
  | { decision: 'rate_limited' }
  | { decision: 'invalid' };

export async function reserveMailSendRequest(
  client: SupabaseClient,
  userId: string,
  requestId: string,
): Promise<MailSendReservation> {
  const { data, error } = await client.rpc('reserve_mail_send_request', {
    p_user_id: userId,
    p_request_id: requestId,
  });
  if (error || !Array.isArray(data) || data.length !== 1) {
    throw new Error('메일 발송 요청을 예약하지 못했습니다');
  }

  const row = data[0] as { decision?: unknown; existing_status?: unknown };
  if (row.decision === 'reserved') return { decision: 'reserved' };
  if (row.decision === 'rate_limited') return { decision: 'rate_limited' };
  if (row.decision === 'invalid') return { decision: 'invalid' };
  if (row.decision === 'existing' && row.existing_status === 'sent') return { decision: 'sent' };
  if (row.decision === 'existing' && (row.existing_status === 'pending' || row.existing_status === 'unknown')) {
    return { decision: 'pending_or_unknown' };
  }
  throw new Error('메일 발송 예약 응답을 확인하지 못했습니다');
}

export async function recordMailSendOutcome(
  client: SupabaseClient,
  options: {
    userId: string;
    requestId: string;
    status: 'sent' | 'unknown';
    gmailMessageId?: string;
  },
): Promise<void> {
  const { data, error } = await client.rpc('complete_mail_send_request', {
    p_user_id: options.userId,
    p_request_id: options.requestId,
    p_status: options.status,
    p_gmail_message_id: options.gmailMessageId ?? null,
  });
  if (error || data !== true) throw new Error('메일 발송 결과를 기록하지 못했습니다');
}
