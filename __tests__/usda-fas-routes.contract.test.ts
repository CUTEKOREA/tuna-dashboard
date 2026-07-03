import { afterEach, describe, expect, it, vi } from 'vitest';
import { UsdaFasRouteResponse } from '../lib/contracts/usda-fas';

type RouteModule = {
  GET: (request: Request) => Promise<Response>;
};

const routes = [
  {
    label: '/api/beef/usda-fas',
    importRoute: () => import('../app/api/beef/usda-fas/route') as Promise<RouteModule>,
    url: 'http://localhost/api/beef/usda-fas?year=2025',
    commodityCode: '1701',
  },
  {
    label: '/api/cashew/usda-fas',
    importRoute: () => import('../app/api/cashew/usda-fas/route') as Promise<RouteModule>,
    url: 'http://localhost/api/cashew/usda-fas?year=2025&country=US',
    commodityCode: '0577400',
  },
  {
    label: '/api/chicken/usda-fas',
    importRoute: () => import('../app/api/chicken/usda-fas/route') as Promise<RouteModule>,
    url: 'http://localhost/api/chicken/usda-fas?year=2025&country=US',
    commodityCode: '0115000',
  },
  {
    label: '/api/salmon/usda-fas',
    importRoute: () => import('../app/api/salmon/usda-fas/route') as Promise<RouteModule>,
    url: 'http://localhost/api/salmon/usda-fas?year=2025',
    commodityCode: '0312',
  },
  {
    label: '/api/shrimp/usda-fas',
    importRoute: () => import('../app/api/shrimp/usda-fas/route') as Promise<RouteModule>,
    url: 'http://localhost/api/shrimp/usda-fas?year=2025',
    commodityCode: '0306',
  },
  {
    label: '/api/tuna/usda-fas',
    importRoute: () => import('../app/api/tuna/usda-fas/route') as Promise<RouteModule>,
    url: 'http://localhost/api/tuna/usda-fas?year=2025',
    commodityCode: '0303',
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

describe('USDA FAS route fallback contracts', () => {
  it.each(routes)('$label returns honest fallback contract when USDA FAS is unavailable', async (route) => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('Service unavailable', { status: 503 })));

    const mod = await route.importRoute();
    const parsed = UsdaFasRouteResponse.parse(await jsonOf(await mod.GET(new Request(route.url))));

    expect(parsed.isLive).toBe(false);
    expect(parsed.marketYear).toBe('2025');
    expect(parsed.commodityCode).toBe(route.commodityCode);
    expect(parsed.records).toEqual([]);
    expect(parsed.source.toLowerCase()).toContain('fallback');
    expect(parsed.apiHealth).toMatchObject({ ok: false, reason: 'HTTP 503' });
  });
});
