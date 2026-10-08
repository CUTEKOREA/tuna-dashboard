import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
vi.mock('@/lib/mail/server-env', () => ({ getSupabaseServiceConfig: () => ({
  url: 'https://database.example.invalid', serviceRoleKey: 'synthetic-service-key',
}) }));
import { recordSecuritySignal } from '../lib/security/events';
const signal = { kind: 'auth_denied' as const, actorHash: '0'.repeat(64), routeGroup: 'protected_api' as const };
beforeEach(() => {
  vi.useFakeTimers();
  vi.spyOn(AbortSignal, 'timeout').mockImplementation(ms => {
    const controller = new AbortController();
    setTimeout(() => controller.abort(new DOMException('timed out', 'TimeoutError')), ms);
    return controller.signal;
  });
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.useRealTimers(); });

describe('보안 집계 저장 통신', () => {
  it('3.5초 걸리는 저장 응답은 버리지 않는다', async () => {
    vi.stubGlobal('fetch', vi.fn((_url, init) => new Promise<Response>((resolve, reject) => {
      const timer = setTimeout(() => resolve(new Response('true', { headers: { 'content-type': 'application/json' } })), 3500);
      init.signal.addEventListener('abort', () => { clearTimeout(timer); reject(init.signal.reason); }, { once: true });
    })));
    const result = recordSecuritySignal(signal).then(() => true, () => false);
    await vi.advanceTimersByTimeAsync(3500);
    expect(await result).toBe(true);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(vi.mocked(fetch).mock.calls[0][1]?.cache).toBe('no-store');
  });
  it('8초 제한은 유지하고 실패 유형만 반환하며 재시도하지 않는다', async () => {
    vi.stubGlobal('fetch', vi.fn((_url, init) => new Promise<Response>((_resolve, reject) => {
      init.signal.addEventListener('abort', () => reject(init.signal.reason), { once: true });
    })));
    const result = recordSecuritySignal(signal).catch(error => error);
    await vi.advanceTimersByTimeAsync(8000);
    expect(await result).toMatchObject({ message: 'security_event_record_failed', reason: 'timeout' });
    expect(fetch).toHaveBeenCalledTimes(1);
  });
  it('RPC 오류의 비밀 문구를 오류 메시지에 반사하지 않는다', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ message: 'private-token-secret', code: '42501' }), { status: 403, headers: { 'content-type': 'application/json' } })));
    const result = await recordSecuritySignal(signal).catch(error => error);
    expect(result).toMatchObject({ message: 'security_event_record_failed', reason: 'rpc_error' });
    expect(JSON.stringify(result)).not.toContain('private-token-secret');
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
