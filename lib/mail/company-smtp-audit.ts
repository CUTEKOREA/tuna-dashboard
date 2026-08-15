import { createHash } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { CompanySmtpMessage } from './company-smtp';

export type CompanySmtpSendReservation =
  | { decision: 'reserved' }
  | { decision: 'sent' }
  | { decision: 'pending_or_unknown' }
  | { decision: 'rate_limited' }
  | { decision: 'invalid' };

export async function reserveCompanySmtpSendRequest(
  client: SupabaseClient,
  userId: string,
  requestId: string,
  message: CompanySmtpMessage,
): Promise<CompanySmtpSendReservation> {
  const payloadHash = createHash('sha256').update(JSON.stringify(message)).digest('hex');
  const { data, error } = await client.rpc('reserve_company_smtp_send_request', {
    p_user_id: userId,
    p_request_id: requestId,
    p_payload_hash: payloadHash,
  });
  if (error || !Array.isArray(data) || data.length !== 1) {
    throw new Error('회사 SMTP 발송 요청을 예약하지 못했습니다');
  }
  const row = data[0] as { decision?: unknown; existing_status?: unknown };
  if (row.decision === 'reserved') return { decision: 'reserved' };
  if (row.decision === 'rate_limited') return { decision: 'rate_limited' };
  if (row.decision === 'invalid') return { decision: 'invalid' };
  if (row.decision === 'existing' && row.existing_status === 'sent') return { decision: 'sent' };
  if (row.decision === 'existing' && (row.existing_status === 'pending' || row.existing_status === 'unknown')) {
    return { decision: 'pending_or_unknown' };
  }
  throw new Error('회사 SMTP 발송 예약 응답을 확인하지 못했습니다');
}

export async function recordCompanySmtpSendOutcome(
  client: SupabaseClient,
  options: { userId: string; requestId: string; status: 'sent' | 'unknown' },
): Promise<void> {
  const { data, error } = await client.rpc('complete_company_smtp_send_request', {
    p_user_id: options.userId,
    p_request_id: options.requestId,
    p_status: options.status,
  });
  if (error || data !== true) throw new Error('회사 SMTP 발송 결과를 기록하지 못했습니다');
}
