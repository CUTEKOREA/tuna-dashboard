import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { classifySecurityRequest, parseFirewallEvent, validWebhookSignature } from '../lib/security/policy';
import { isPublicDashboardPath } from '../lib/auth/owner-policy';

const key = 'synthetic-security-hash-secret-00000000';
const base = { path: '/api/fleet/daily', method: 'GET', key, day: '2026-10-03' };
describe('보안 집계 개인정보와 분류', () => {
  it('익명 거부는 제한된 고정 버킷만 사용한다', () => {
    const signal = classifySecurityRequest({ ...base, access: { ok: false, status: 401 } });
    expect(signal).toEqual({ kind: 'auth_denied', actorHash: '0'.repeat(64), routeGroup: 'protected_api' });
    expect(classifySecurityRequest({ ...base, path: '/api/arbitrary-secret-name', access: { ok: false, status: 403 } })).toEqual(signal);
  });
  it('민감 요청만 날짜별 계정 HMAC으로 식별한다', () => {
    const signal = classifySecurityRequest({ ...base, access: { ok: true, subject: 'private-user-id' } });
    expect(signal?.actorHash).toMatch(/^[a-f0-9]{64}$/);
    expect(JSON.stringify(signal)).not.toContain('private-user-id');
    expect(classifySecurityRequest({ ...base, day: '2026-10-04', access: { ok: true, subject: 'private-user-id' } })).not.toEqual(signal);
    expect(classifySecurityRequest({ ...base, path: '/api/stock', access: { ok: true, subject: 'private-user-id' } })).toBeNull();
  });
  it('설정 장애·일반 페이지·HEAD·키 누락은 공격/자료 읽기로 세지 않는다', () => {
    expect(classifySecurityRequest({ ...base, access: { ok: false, status: 503 } })).toBeNull();
    expect(classifySecurityRequest({ ...base, path: '/', access: { ok: false, status: 401 } })).toBeNull();
    expect(classifySecurityRequest({ ...base, method: 'HEAD', access: { ok: true, subject: 'id' } })).toBeNull();
    expect(classifySecurityRequest({ ...base, key: '', access: { ok: false, status: 401 } })).toBeNull();
  });
  it('신규 공개 예외는 정확한 두 경로에 한정한다', () => {
    expect(isPublicDashboardPath('/api/webhooks/security')).toBe(true);
    expect(isPublicDashboardPath('/api/cron/security-alerts')).toBe(true);
    for (const path of ['/api/webhooks/security/extra', '/api/cron/security-alerts/extra', '/api/security/admin']) {
      expect(isPublicDashboardPath(path)).toBe(false);
    }
  });
});

describe('방화벽 웹훅 서명과 scope', () => {
  const now = Date.now();
  const event = { id: 'event-123', type: 'firewall.attack', createdAt: now, payload: { project: { id: 'prj_expected' }, team: { id: 'team_expected' } } };
  it('원문 바이트에만 서명이 유효하다', () => {
    const raw = Buffer.from(JSON.stringify(event));
    const signature = createHmac('sha1', key).update(raw).digest('hex');
    expect(validWebhookSignature(raw, signature, key)).toBe(true);
    expect(validWebhookSignature(Buffer.concat([raw, Buffer.from(' ')]), signature, key)).toBe(false);
    expect(validWebhookSignature(raw, signature, 'wrong-key-12345678')).toBe(false);
    expect(validWebhookSignature(raw, 'invalid', key)).toBe(false);
  });
  it('프로젝트·팀·시각·이벤트를 제한한다', () => {
    expect(parseFirewallEvent(event, 'prj_expected', 'team_expected', now)).toEqual({ id: 'event-123', kind: 'firewall_attack' });
    expect(parseFirewallEvent({ ...event, payload: {} }, 'prj_expected', 'team_expected', now)).toEqual({ id: 'event-123', kind: 'firewall_attack' });
    for (const e of [
      { ...event, type: 'deployment.created' }, { ...event, id: '' },
      { ...event, createdAt: now - 86_400_001 }, { ...event, createdAt: now + 300_001 },
      { ...event, payload: { projectId: 'prj_other', teamId: 'team_expected' } },
      { ...event, payload: { projectId: 'prj_expected', teamId: 'team_other' } },
    ]) expect(parseFirewallEvent(e, 'prj_expected', 'team_expected', now)).toBeNull();
  });
});
