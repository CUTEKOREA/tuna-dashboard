import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { KcsMonthlyDestResponse, assertDestSharesSaneish } from '../lib/contracts/kcs';

/**
 * 김 통관 라우트 계약 테스트 (P0 안전망 flagship)
 *
 * fetch를 강제 실패시켜 fallback 경로를 결정론적으로 검증한다(네트워크 무의존).
 * 검증: L-12 isLive boolean, 단위(월 volume 톤/value 천USD 유한·양수),
 *      dest 비중 합 ~100%, hsCode 표기 — 이번 세션 김 버그류 재발 차단.
 */
async function invoke(mod: { GET: (req?: Request) => Promise<Response> }) {
  const res = await mod.GET(new Request('http://localhost/test'));
  expect(res.status).toBe(200);
  return res.json();
}

beforeEach(() => {
  // 외부 KCS API 강제 실패 → fallback 경로 (결정론적)
  vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('network disabled in test'))));
});
afterEach(() => vi.unstubAllGlobals());

describe('/api/kim/customs (마른김)', () => {
  it('fallback 응답이 KCS 계약을 만족', async () => {
    const mod = await import('../app/api/kim/customs/route');
    const json = await invoke(mod);
    const parsed = KcsMonthlyDestResponse.parse(json); // throw on 계약 위반
    expect(parsed.isLive).toBe(false);      // fetch 실패 → 정직 STATIC
    expect(parsed.hsCode).toContain('1212.21');
    const { ok, sum } = assertDestSharesSaneish(parsed.dest);
    expect(ok, `dest 합 ${sum}%`).toBe(true);
  });
});

describe('/api/kim/customs-seasoned (조미김)', () => {
  it('fallback 응답이 KCS 계약을 만족 + HS 2008.99.50.10', async () => {
    const mod = await import('../app/api/kim/customs-seasoned/route');
    const json = await invoke(mod);
    const parsed = KcsMonthlyDestResponse.parse(json);
    expect(parsed.isLive).toBe(false);
    expect(parsed.hsCode).toContain('2008.99.50.10');
    const { ok, sum } = assertDestSharesSaneish(parsed.dest);
    expect(ok, `dest 합 ${sum}%`).toBe(true);
    // 조미김은 미국 우위 (fallback 실측 스냅샷)
    expect(parsed.dest[0].name).toBe('미국');
  });
});
