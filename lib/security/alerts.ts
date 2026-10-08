import 'server-only';
import { getCompanySmtpConfig } from '@/lib/mail/server-env';
import { parseCompanySmtpMessage, sendCompanySmtpMessage } from '@/lib/mail/company-smtp';
import { createSecurityClient } from './events';

const TITLES: Record<string, string> = {
  auth_denied: '반복된 접근 거부',
  sensitive_read_request: '민감 자료 요청 증가',
  firewall_attack: '방화벽 공격 탐지',
  firewall_rule_anomaly: '방화벽 이상 트래픽',
};

export async function dispatchSecurityAlert(): Promise<'disabled' | 'empty' | 'sent' | 'unknown'> {
  if (process.env.SECURITY_ALERTS_ENABLED !== '1') return 'disabled';
  // 설정 오류일 때는 예약을 소비하지 않는다.
  const config = getCompanySmtpConfig();
  const recipient = parseCompanySmtpMessage({
    to: process.env.SECURITY_ALERT_EMAIL ?? '', subject: '보안 알림', text: '설정 확인',
  }).to;
  const client = createSecurityClient();
  const { data, error } = await client.rpc('claim_dashboard_security_alert');
  if (error) throw new Error('security_alert_claim_failed');
  if (!Array.isArray(data) || data.length === 0) return 'empty';
  if (data.length !== 1) throw new Error('security_alert_claim_invalid');
  const row = data[0];
  if (!TITLES[row.kind] || typeof row.id !== 'string'
      || !Number.isInteger(row.event_count) || !Number.isInteger(row.related_alerts)) {
    throw new Error('security_alert_claim_invalid');
  }
  const time = new Date(row.occurred_at).toISOString();
  let status: 'sent' | 'unknown' = 'unknown';
  try {
    await sendCompanySmtpMessage({ config, message: {
      to: recipient,
      subject: '[참치왕국 보안] ' + TITLES[row.kind],
      text: [
        '대시보드에서 보안 확인이 필요한 신호를 감지했습니다.',
        '유형: ' + TITLES[row.kind],
        '감지 시각(UTC): ' + time,
        (row.kind.startsWith('firewall_') ? '플랫폼 경보 건수: ' : '대표 경보의 요청 수: ') + row.event_count,
        '함께 묶인 경보 수: ' + row.related_alerts,
        '',
        '접근 거부는 10분 30회, 인증된 민감 자료 GET 요청은 10분 300회부터 알립니다.',
        '요청 횟수이며 실제 자료 유출이나 공격 성공을 의미하지 않습니다.',
        '알림은 전체 합산 시간당 최대 1회입니다. 방화벽이 먼저 차단한 요청은 앱 집계에 포함되지 않습니다.',
        '로그와 계정 활동을 확인하고 필요하면 계정 접근을 차단하십시오.',
        'https://vercel.com/cutekorea-3280s-projects/tuna-dashboard/firewall',
        '',
        '이 메일에는 IP, 이메일 계정 목록, 인증 토큰, 자료 원문을 포함하지 않습니다.',
      ].join('\n'),
    } });
    status = 'sent';
  } catch {
    console.error('[security] smtp_delivery_unknown');
  }
  const completed = await client.rpc('complete_dashboard_security_alert', { p_id: row.id, p_status: status });
  if (completed.error || completed.data !== true) throw new Error('security_alert_completion_failed');
  return status;
}
