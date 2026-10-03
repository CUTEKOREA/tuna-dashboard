import { createHmac, timingSafeEqual } from 'node:crypto';

export const SENSITIVE_API_PATHS = new Set([
  '/api/fleet/daily', '/api/unloading-db', '/api/unloading-history',
  '/api/atuna-daily', '/api/atuna-prices',
  '/api/mail/gmail/messages', '/api/mail/gmail/message',
]);

export type SecuritySignal = {
  kind: 'auth_denied' | 'sensitive_read_request';
  actorHash: string;
  routeGroup: 'protected_api' | 'sensitive_api';
};

export function classifySecurityRequest(input: {
  path: string;
  method: string;
  access: { ok: boolean; status?: number; subject?: string };
  key: string;
  day: string;
}): SecuritySignal | null {
  if (input.key.length < 32) return null;
  if (!input.access.ok) {
    if (![401, 403].includes(input.access.status ?? 0) || !input.path.startsWith('/api/')) return null;
    // 익명 요청은 고정 집계로 묶어 공격자가 행 수를 늘리지 못하게 한다.
    return { kind: 'auth_denied', actorHash: '0'.repeat(64), routeGroup: 'protected_api' };
  }
  if (input.method !== 'GET' || !SENSITIVE_API_PATHS.has(input.path) || !input.access.subject) return null;
  return {
    kind: 'sensitive_read_request',
    actorHash: createHmac('sha256', input.key)
      .update('security-read:' + input.day + ':' + input.access.subject).digest('hex'),
    routeGroup: 'sensitive_api',
  };
}

export function validSharedSecret(received: string, expected: string): boolean {
  if (expected.length < 32) return false;
  const a = Buffer.from(received);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function validWebhookSignature(raw: Uint8Array, signature: string, secret: string): boolean {
  if (secret.length < 16 || !/^[a-f0-9]{40}$/i.test(signature)) return false;
  const expected = createHmac('sha1', secret).update(raw).digest();
  return timingSafeEqual(Buffer.from(signature, 'hex'), expected);
}

export function parseFirewallEvent(value: unknown, projectId: string, teamId: string, now: number) {
  if (!value || typeof value !== 'object') return null;
  const e = value as Record<string, unknown>;
  if (!['firewall.attack', 'firewall.system-rule-anomaly', 'firewall.custom-rule-anomaly'].includes(String(e.type))) return null;
  if (typeof e.id !== 'string' || e.id.length < 1 || e.id.length > 200) return null;
  const created = typeof e.createdAt === 'number' ? e.createdAt
    : typeof e.createdAt === 'string' ? Date.parse(e.createdAt) : NaN;
  if (!Number.isFinite(created) || created > now + 300_000 || created < now - 86_400_000) return null;
  if (!e.payload || typeof e.payload !== 'object') return null;
  const p = e.payload as Record<string, unknown>;
  const project = p.project as { id?: unknown } | undefined;
  const team = p.team as { id?: unknown } | undefined;
  // 전용 webhook secret은 단일 projectIds 구독에 바인딩한다.
  // 플랫폼 이벤트마다 scope 필드 유무가 다르므로 존재하는 값의 불일치만 거부한다.
  const projectScope = project?.id ?? p.projectId;
  const teamScope = team?.id ?? p.teamId;
  if ((projectScope !== undefined && projectScope !== projectId)
    || (teamScope !== undefined && teamScope !== teamId)) return null;
  return { id: e.id, kind: e.type === 'firewall.attack' ? 'firewall_attack' : 'firewall_rule_anomaly' };
}
