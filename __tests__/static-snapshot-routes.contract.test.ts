import { describe, expect, it } from 'vitest';
import { StaticSnapshotResponse } from '../lib/contracts/static-snapshot';

type RouteModule = {
  GET: (request: Request) => Promise<Response>;
};

const routes = [
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
