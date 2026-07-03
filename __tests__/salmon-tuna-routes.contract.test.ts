import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  SalmonComtradeResponse,
  SalmonKamisResponse,
  SalmonKcsFallbackResponse,
  SalmonKcsOriginPoint,
  SalmonKcsProductPoint,
  TunaTickerResponse,
  assertSharePctSaneish,
} from '../lib/contracts/market';

async function jsonOf(res: Response) {
  expect(res.status).toBe(200);
  return res.json();
}

beforeEach(() => {
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('network disabled in test'))));
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('/api/tuna/ticker', () => {
  it('외부 API 실패 시 5개 ticker fallback 계약을 만족', async () => {
    const mod = await import('../app/api/tuna/ticker/route');
    const parsed = TunaTickerResponse.parse(await jsonOf(await mod.GET()));

    expect(parsed.meta.liveApis).toBe(0);
    expect(parsed.meta.totalApis).toBe(5);
    expect(parsed.ticker).toHaveLength(5);
    expect(parsed.ticker.every((item) => item.isLive === false)).toBe(true);
    expect(parsed.ticker.map((item) => item.id)).toEqual([
      'kcs_import_price',
      'ecos_fx',
      'kamis_retail',
      'fred_cpi',
      'wti_crude',
    ]);
  });
});

describe('/api/salmon/kcs', () => {
  it('timeseries fallback 응답이 연도·수량·단가 계약을 만족', async () => {
    const mod = await import('../app/api/salmon/kcs/route');
    const parsed = SalmonKcsFallbackResponse.parse(
      await jsonOf(await mod.POST(new Request('http://localhost/api/salmon/kcs', {
        method: 'POST',
        body: JSON.stringify({ type: 'timeseries' }),
      })))
    );

    expect(parsed.isLive).toBe(false);
    expect(parsed.status).toBe('fallback');
    expect(Array.isArray(parsed.data)).toBe(true);
    const rows = parsed.data as Array<{ year: string; qty_tonnes: number; unit_price: number }>;
    expect(rows.at(-1)?.year).toBe('2023');
    expect(rows.at(-1)?.qty_tonnes).toBeGreaterThan(0);
    expect(rows.at(-1)?.unit_price).toBeGreaterThan(0);
  });

  it('origin/product fallback share 합이 100% 근방을 유지', async () => {
    const mod = await import('../app/api/salmon/kcs/route');
    const origin = SalmonKcsFallbackResponse.parse(
      await jsonOf(await mod.POST(new Request('http://localhost/api/salmon/kcs', {
        method: 'POST',
        body: JSON.stringify({ type: 'by_origin' }),
      })))
    );
    const product = SalmonKcsFallbackResponse.parse(
      await jsonOf(await mod.POST(new Request('http://localhost/api/salmon/kcs', {
        method: 'POST',
        body: JSON.stringify({ type: 'by_product' }),
      })))
    );

    const originRows = SalmonKcsOriginPoint.array().parse(origin.data);
    const productRows = SalmonKcsProductPoint.array().parse(product.data);
    expect(assertSharePctSaneish(originRows).ok).toBe(true);
    expect(assertSharePctSaneish(productRows).ok).toBe(true);
  });
});

describe('/api/salmon/kamis', () => {
  it('fallback 응답이 commodity 가격·프리미엄 지수 계약을 만족', async () => {
    const mod = await import('../app/api/salmon/kamis/route');
    const parsed = SalmonKamisResponse.parse(await jsonOf(await mod.GET()));

    expect(parsed.isLive).toBe(false);
    expect(parsed.status).toBe('fallback');
    expect(parsed.commodities.find((item) => item.id === 'salmon_fresh')?.currentPrice).toBeGreaterThan(0);
    expect(parsed.historicalSpread.length).toBeGreaterThanOrEqual(3);
    expect(parsed.salmonPremiumIndex.vs_chicken).toBeGreaterThan(1);
  });
});

describe('/api/salmon/comtrade', () => {
  it('export ranking fallback 응답이 국가·금액·연도 계약을 만족', async () => {
    const mod = await import('../app/api/salmon/comtrade/route');
    const parsed = SalmonComtradeResponse.parse(
      await jsonOf(await mod.POST(new Request('http://localhost/api/salmon/comtrade', {
        method: 'POST',
        body: JSON.stringify({ type: 'export_ranking' }),
      })))
    );

    expect(parsed.isLive).toBe(false);
    expect(parsed.status).toBe('fallback');
    expect(parsed.data[0]).toMatchObject({ name: '노르웨이', year: '2025' });
  });

  it('korea timeseries fallback 응답이 연도별 수입량·수입액 계약을 만족', async () => {
    const mod = await import('../app/api/salmon/comtrade/route');
    const parsed = SalmonComtradeResponse.parse(
      await jsonOf(await mod.POST(new Request('http://localhost/api/salmon/comtrade', {
        method: 'POST',
        body: JSON.stringify({ type: 'korea_timeseries' }),
      })))
    );

    expect(parsed.isLive).toBe(false);
    expect(parsed.status).toBe('fallback');
    expect(parsed.data.at(-1)).toMatchObject({ year: '2023', importQty: 74000, importVal: 510 });
  });
});
