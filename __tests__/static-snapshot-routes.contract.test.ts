import { describe, expect, it } from 'vitest';
import { StaticSnapshotResponse } from '../lib/contracts/static-snapshot';

type RouteModule = {
  GET: (request: Request) => Promise<Response>;
};

const routes = [
  {
    label: '/api/bni-global',
    importRoute: () => import('../app/api/bni-global/route') as Promise<RouteModule>,
    url: 'http://localhost/api/bni-global',
    source: 'data/bni_global_dashboard.json',
  },
  {
    label: '/api/carrot/fao',
    importRoute: () => import('../app/api/carrot/fao/route') as Promise<RouteModule>,
    url: 'http://localhost/api/carrot/fao?type=production',
    source: 'data/carrot/carrot_fao/carrot_fao_w1_production.json',
  },
  {
    label: '/api/carrot/w1-spread',
    importRoute: () => import('../app/api/carrot/w1-spread/route') as Promise<RouteModule>,
    url: 'http://localhost/api/carrot/w1-spread',
    source: 'data/carrot_w1_hegemony.json',
  },
  {
    label: '/api/carrot/w20-phyto',
    importRoute: () => import('../app/api/carrot/w20-phyto/route') as Promise<RouteModule>,
    url: 'http://localhost/api/carrot/w20-phyto',
    source: 'data/carrot_w20_phyto_risk.json',
  },
  {
    label: '/api/cold-storage/widget',
    importRoute: () => import('../app/api/cold-storage/widget/route') as Promise<RouteModule>,
    url: 'http://localhost/api/cold-storage/widget?id=w01',
    source: 'cold_storage/cold_storage_w01.json',
  },
  {
    label: '/api/garlic/widget',
    importRoute: () => import('../app/api/garlic/widget/route') as Promise<RouteModule>,
    url: 'http://localhost/api/garlic/widget?id=w1',
    source: 'garlic_w1_hegemony.json',
  },
  {
    label: '/api/tuna-extract',
    importRoute: () => import('../app/api/tuna-extract/route') as Promise<RouteModule>,
    url: 'http://localhost/api/tuna-extract',
    source: 'data/tuna_extract_dashboard.json',
    expectedHealth: false,
  },
  {
    label: '/api/jukkumi-intelligence',
    importRoute: () => import('../app/api/jukkumi-intelligence/route') as Promise<RouteModule>,
    url: 'http://localhost/api/jukkumi-intelligence',
    source: 'public/data/jukkumi_real_data_v1.json',
  },
  {
    label: '/api/petfood',
    importRoute: () => import('../app/api/petfood/route') as Promise<RouteModule>,
    url: 'http://localhost/api/petfood',
    source: 'public/data/petfood_dashboard.json',
  },
] as const;

async function jsonOf(res: Response) {
  expect(res.status).toBe(200);
  return res.json();
}

describe('static snapshot route contracts', () => {
  it.each(routes)('$label returns L-12 static telemetry metadata', async (route) => {
    const mod = await route.importRoute();
    const parsed = StaticSnapshotResponse.parse(await jsonOf(await mod.GET(new Request(route.url))));

    expect(parsed.isLive).toBe(false);
    expect(parsed._metadata).toMatchObject({
      isLive: false,
      status: 'STATIC',
    });
    expect(parsed._metadata.source).toContain(route.source);
    if ('expectedHealth' in route) {
      expect(parsed._metadata.apiHealth?.ok).toBe(route.expectedHealth);
    }
  });
});
