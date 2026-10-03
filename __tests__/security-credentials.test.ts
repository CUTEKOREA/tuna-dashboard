import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GET as galchiTariffs } from '../app/api/galchi/tariffs/route';
import { GET as tariffStatus, POST as tariffs } from '../app/api/tariffs/route';
import { GET as diagnostic } from '../app/api/tuna/test-proxy/route';

beforeEach(() => {
  vi.stubEnv('DATA_GO_KR_NEW_KEY', 'synthetic-data-go-secret');
  vi.stubEnv('TARIFFS_API_KEY', '');
  vi.stubEnv('ENABLE_PROXY_DIAGNOSTICS', '0');
  vi.stubEnv('KOREA_API_PROXY_URL', 'https://proxy.example.invalid');
  vi.stubEnv('PROXY_SECRET', 'synthetic-proxy-secret');
  vi.stubGlobal('fetch', vi.fn(async () => new Response('{"data":[]}', { status: 200, headers: { 'content-type': 'application/json' } })));
});
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
const tariffRequest = () => new Request('https://dashboard.example/api/tariffs', { method: 'POST', body: JSON.stringify({ origin: 'CN', destination: 'KR', hsCode: '0304' }) });

describe('서비스별 API 키 경계', () => {
  it('공공데이터 키만 있으면 관세 API를 호출하지 않는다', async () => {
    expect((await galchiTariffs()).status).toBe(200);
    expect((await tariffs(tariffRequest())).status).toBe(200);
    expect(await (await tariffStatus()).json()).toMatchObject({ status: 'fallback_only', tokenConfigured: false });
    expect(fetch).not.toHaveBeenCalled();
  });
  it('두 관세 route는 전용 키만 외부로 전달한다', async () => {
    vi.stubEnv('TARIFFS_API_KEY', 'synthetic-tariffs-secret');
    expect((await galchiTariffs()).status).toBe(200);
    expect((await tariffs(tariffRequest())).status).toBe(200);
    expect(fetch).toHaveBeenCalledTimes(2);
    for (const [, init] of vi.mocked(fetch).mock.calls) {
      expect(new Headers(init?.headers).get('authorization')).toBe('Bearer synthetic-tariffs-secret');
      expect(JSON.stringify(init)).not.toContain('synthetic-data-go-secret');
    }
    expect(await (await tariffStatus()).json()).toMatchObject({ tokenConfigured: true });
  });
  it('전용 키만 있는 live 조회와 upstream 실패 폴백을 유지한다', async () => {
    vi.stubEnv('DATA_GO_KR_NEW_KEY', '');
    vi.stubEnv('TARIFFS_API_KEY', 'synthetic-tariffs-secret');
    expect(await (await galchiTariffs()).json()).toMatchObject({ isLive: true });
    vi.mocked(fetch).mockResolvedValue(new Response('unavailable', { status: 503 }));
    expect(await (await galchiTariffs()).json()).toMatchObject({ isLive: false });
    expect(await (await tariffs(tariffRequest())).json()).toMatchObject({ meta: { source: 'TARIFFS_FALLBACK' } });
  });
});

describe('진단 응답은 자격증명이 섞인 원문을 반사하지 않는다', () => {
  it('알 수 없는 진단 대상은 외부 요청 전 거부한다', async () => {
    vi.stubEnv('ENABLE_PROXY_DIAGNOSTICS', '1');
    expect((await diagnostic(new Request('https://dashboard.example/api/tuna/test-proxy?type=constructor'))).status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });
  it('기본 비활성은 404이며 외부 요청이 없다', async () => {
    expect((await diagnostic(new Request('https://dashboard.example/api/tuna/test-proxy'))).status).toBe(404);
    expect(fetch).not.toHaveBeenCalled();
  });
  it.each(['abc', 'secret/with spaces?and#symbols'])('경로·인코딩·본문 잘림 경계에 있는 키 %s가 노출되지 않는다', async (key) => {
    vi.stubEnv('ENABLE_PROXY_DIAGNOSTICS', '1');
    vi.stubEnv('ECOS_API_KEY', key);
    vi.mocked(fetch).mockResolvedValue(new Response('x'.repeat(995) + key + encodeURIComponent(key) + encodeURIComponent(encodeURIComponent(key)), { status: 200 }));
    const response = await diagnostic(new Request('https://dashboard.example/api/tuna/test-proxy?type=ecos'));
    const body = await response.json();
    expect(body).toMatchObject({ status: 200, ok: true, target: 'https://ecos.bok.or.kr' });
    expect(JSON.stringify(body)).not.toContain(key);
    expect(JSON.stringify(body)).not.toContain(encodeURIComponent(key));
    expect(body.body).not.toContain('xxxxx');
  });
  it('예외 메시지에 포함된 키도 응답하지 않는다', async () => {
    vi.stubEnv('ENABLE_PROXY_DIAGNOSTICS', '1');
    vi.stubEnv('ECOS_API_KEY', 'synthetic-ecos-key');
    vi.mocked(fetch).mockRejectedValue(new Error('failed /synthetic-ecos-key?secret=synthetic-proxy-secret'));
    const body = await (await diagnostic(new Request('https://dashboard.example/api/tuna/test-proxy?type=ecos'))).json();
    expect(JSON.stringify(body)).not.toContain('synthetic-ecos-key');
    expect(JSON.stringify(body)).not.toContain('synthetic-proxy-secret');
  });
  it.each(['kamis', 'kcs'])('정상 %s 진단은 HTTP 상태와 대상 origin을 유지한다', async (type) => {
    vi.stubEnv('ENABLE_PROXY_DIAGNOSTICS', '1');
    vi.stubEnv('KAMIS_CERT_KEY', 'synthetic-kamis-secret');
    vi.stubEnv('KAMIS_CERT_ID', 'synthetic-id');
    const body = await (await diagnostic(new Request(`https://dashboard.example/api/tuna/test-proxy?type=${type}`))).json();
    expect(body).toMatchObject({ status: 200, ok: true });
    expect(JSON.stringify(body)).not.toContain('synthetic-');
  });
});
