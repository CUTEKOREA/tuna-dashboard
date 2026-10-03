import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({ dataGo: vi.fn() }));
vi.mock('@/app/api/_shared/datago', () => ({ fetchDataGo: mocks.dataGo }));
import { POST as mofPost, GET as mofGet } from '../app/api/mof-fishery/route';
import { POST as witsPost } from '../app/api/wits/route';

const post = (path: string, body: unknown, signal?: AbortSignal) => new NextRequest(`https://dashboard.example${path}`, { method: 'POST', body: JSON.stringify(body), signal });
beforeEach(() => {
  vi.clearAllMocks();
  mocks.dataGo.mockResolvedValue({ ok: true, total: 1, rows: [{ year: '2024.01', seaimexTrnpCst: 1 }] });
  vi.stubGlobal('fetch', vi.fn(async () => new Response('<root/>', { status: 200 })));
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

describe('조회 배열의 작업량 경계', () => {
  it.each([Array(1000).fill('consignment_sales'), 'consignment_sales', ['constructor'], ['__proto__'], [42], [null]])('MOF의 잘못된 배열은 외부 요청 전 거부한다', async (endpoints) => {
    expect((await mofPost(post('/api/mof-fishery', { endpoints }))).status).toBe(400);
    expect(mocks.dataGo).not.toHaveBeenCalled();
  });
  it('MOF 기본 4종과 중복 제거, 단일 조회를 유지한다', async () => {
    expect((await mofPost(post('/api/mof-fishery', {}))).status).toBe(200);
    expect(mocks.dataGo).toHaveBeenCalledTimes(4);
    mocks.dataGo.mockClear();
    expect((await mofPost(post('/api/mof-fishery', { endpoints: ['consignment_sales', 'consignment_sales'] }))).status).toBe(200);
    expect(mocks.dataGo).toHaveBeenCalledTimes(1);
    mocks.dataGo.mockClear();
    expect((await mofPost(post('/api/mof-fishery', { endpoint: 'consignment_sales' }))).status).toBe(200);
    expect(mocks.dataGo).toHaveBeenCalledTimes(1);
  });
  it('MOF의 단일 이름·본문·중복 필드도 검증한 뒤 조회한다', async () => {
    for (const body of [null, [], { endpoint: 'constructor' }, { endpoint: 42 }, { endpoint: 'consignment_sales', endpoints: Array(1000).fill('consignment_sales') }]) {
      expect((await mofPost(post('/api/mof-fishery', body))).status).toBe(400);
    }
    expect(mocks.dataGo).not.toHaveBeenCalled();
  });
  it('MOF 특수 항로 GET의 6개 고정 조회를 유지한다', async () => {
    expect((await mofGet(new NextRequest('https://dashboard.example/api/mof-fishery?endpoint=shipping_cost_all&endYymm=202401'))).status).toBe(200);
    expect(mocks.dataGo).toHaveBeenCalledTimes(6);
  });
  it.each([Array(1000).fill('2024'), '2024'.repeat(1000), {}, [], ['2024', 2025], ['../../private'], ['2024', null], ['2024\n']])('WITS의 잘못된 연도는 외부 요청 전 거부한다', async (years) => {
    expect((await witsPost(post('/api/wits', { commodity: '030389', years }))).status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });
  it('WITS 기본 5년과 정상 연도 순서·폴백 응답을 유지한다', async () => {
    const response = await witsPost(post('/api/wits', { commodity: '030389' }));
    expect(response.status).toBe(200);
    expect(fetch).toHaveBeenCalledTimes(6);
    expect(await response.json()).toMatchObject({ meta: { queryYears: ['2020', '2021', '2022', '2023', '2024'] } });
  });
  it('WITS 10년 상한과 중복 제거 후 호출 수가 제한된다', async () => {
    const years = Array.from({ length: 10 }, (_, i) => String(2015 + i));
    expect((await witsPost(post('/api/wits', { commodity: '030389', years }))).status).toBe(200);
    expect(fetch).toHaveBeenCalledTimes(11);
    vi.mocked(fetch).mockClear();
    const response = await witsPost(post('/api/wits', { commodity: '030389', years: ['2024', '2024'] }));
    expect(await response.json()).toMatchObject({ meta: { queryYears: ['2024'] } });
    expect(fetch).toHaveBeenCalledTimes(2);
  });
  it('WITS 클라이언트 취소는 외부 호출 없이 종료한다', async () => {
    const controller = new AbortController(); controller.abort();
    expect((await witsPost(post('/api/wits', { commodity: '030389' }, controller.signal))).status).toBe(408);
    expect(fetch).not.toHaveBeenCalled();
  });
  it('WITS 진행 중 취소는 현재 요청과 이후 연도 조회를 중단한다', async () => {
    const controller = new AbortController();
    vi.stubGlobal('fetch', vi.fn((_url, init) => new Promise<Response>((_resolve, reject) => {
      init?.signal?.addEventListener('abort', () => reject(init.signal.reason), { once: true });
      controller.abort();
    })));
    expect((await witsPost(post('/api/wits', { commodity: '030389' }, controller.signal))).status).toBe(408);
    expect(fetch).toHaveBeenCalledTimes(1);
  });
  it('WITS 정상 XML 조회는 live 수치와 연도를 유지한다', async () => {
    vi.mocked(fetch).mockImplementation(async () => new Response('<generic:Value id="TIME_PERIOD" value="2024"/><generic:ObsValue value="123.5"/>'));
    const response = await witsPost(post('/api/wits', { commodity: '030389', years: ['2024'] }));
    expect(await response.json()).toMatchObject({
      meta: { source: 'WITS_LIVE', apiStatus: 'live', queryYears: ['2024'] },
      tariff: { ahsWeightedAvg: 123.5, year: '2024' },
      tradeFlow: [{ year: '2024', importValueUSD: 123.5, source: 'WITS_LIVE' }],
    });
    expect(fetch).toHaveBeenCalledTimes(2);
  });
  it('WITS 전체 30초 예산 뒤에는 추가 조회 없이 기존 폴백을 제공한다', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('fetch', vi.fn((_url, init) => new Promise<Response>((_resolve, reject) => {
      const signal = init?.signal;
      if (signal?.aborted) reject(signal.reason);
      else signal?.addEventListener('abort', () => reject(signal.reason), { once: true });
    })));
    const responsePromise = witsPost(post('/api/wits', { commodity: '030389' }));
    await vi.advanceTimersByTimeAsync(30_000);
    const response = await responsePromise;
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      meta: { source: 'WITS_FALLBACK', apiStatus: 'fallback' },
      tariff: { mfn: '10%', source: 'KCS', year: '2024' },
    });
    expect(fetch).toHaveBeenCalledTimes(3);
  });
});
