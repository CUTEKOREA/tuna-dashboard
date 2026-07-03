import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  KcsImportSummaryResponse,
  assertOriginSharesSaneish,
} from '../lib/contracts/kcs';

type RouteModule = {
  GET: (request: Request) => Promise<Response>;
};

const routes = [
  {
    label: '/api/cashew/kcs',
    importRoute: () => import('../app/api/cashew/kcs/route') as Promise<RouteModule>,
    url: 'http://localhost/api/cashew/kcs?year=2024&hs=kernel',
    hs: '0801320000',
    mainOrigin: '베트남',
    mainShare: 78.4,
    mainKey: 'vnPct',
  },
  {
    label: '/api/jukkumi/kcs',
    importRoute: () => import('../app/api/jukkumi/kcs/route') as Promise<RouteModule>,
    url: 'http://localhost/api/jukkumi/kcs?year=2024',
    hs: '0307599000',
    mainOrigin: '중국',
    mainShare: 40,
    mainKey: 'cnPct',
  },
  {
    label: '/api/octopus/kcs',
    importRoute: () => import('../app/api/octopus/kcs/route') as Promise<RouteModule>,
    url: 'http://localhost/api/octopus/kcs?year=2024&hs=frozen',
    hs: '0307521000',
    mainOrigin: '베트남',
    mainShare: 40,
    mainKey: 'vnPct',
  },
  {
    label: '/api/whelk/kcs',
    importRoute: () => import('../app/api/whelk/kcs/route') as Promise<RouteModule>,
    url: 'http://localhost/api/whelk/kcs?year=2024&hs=frozen',
    hs: '0307600000',
    mainOrigin: '영국',
    mainShare: 60,
    mainKey: 'gbPct',
  },
  {
    label: '/api/flatfish/kcs',
    importRoute: () => import('../app/api/flatfish/kcs/route') as Promise<RouteModule>,
    url: 'http://localhost/api/flatfish/kcs?year=2024&hs=frozen',
    hs: '0303330000',
    mainOrigin: '중국',
    mainShare: 60,
    mainKey: 'cnPct',
  },
] as const;

async function jsonOf(res: Response) {
  expect(res.status).toBe(200);
  return res.json();
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('KCS import route fallback contracts', () => {
  it.each(routes)('$label fallback keeps summary, origin shares, HS code and honest isLive=false', async (route) => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(
      '<response><header><resultCode>03</resultCode></header><body><items /></body></response>',
      { status: 200 },
    )));

    const mod = await route.importRoute();
    const parsed = KcsImportSummaryResponse.parse(await jsonOf(await mod.GET(new Request(route.url))));

    expect(parsed.isLive).toBe(false);
    expect(parsed.hs).toBe(route.hs);
    expect(parsed.source).toContain('fallback');
    expect(parsed.summary.totalWgt).toBeGreaterThan(0);
    expect(parsed.summary.totalDlr).toBeGreaterThan(0);
    expect(parsed.summary.cifPerKg).toBeGreaterThan(0);
    expect(parsed.summary[route.mainKey]).toBe(route.mainShare);
    expect(parsed.byOrigin[0].origin).toBe(route.mainOrigin);
    expect(parsed.byOrigin[0].share).toBe(route.mainShare);
    expect(parsed.byOrigin.some((origin) => origin.origin.includes('냉동'))).toBe(false);

    const { ok, sum } = assertOriginSharesSaneish(parsed.byOrigin);
    expect(ok, `${route.label} byOrigin 합 ${sum}%`).toBe(true);
  });
});
