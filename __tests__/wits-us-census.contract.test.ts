import { afterEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

type WitsRouteModule = {
  GET: () => Promise<Response>;
  POST: (request: Request) => Promise<Response>;
};

type UsCensusRouteModule = {
  GET: () => Promise<Response>;
  POST: (request: Request) => Promise<Response>;
};

const WitsHealthResponse = z.object({
  service: z.literal('WITS API Pipeline'),
  status: z.literal('operational'),
  availableCommodities: z.array(z.object({
    name: z.string(),
    hsCode: z.string().regex(/^\d{6}$/),
    description: z.string().min(1),
    category: z.string().min(1),
  })).min(1),
  availableCountries: z.array(z.object({
    name: z.string(),
    iso3: z.string().regex(/^\d{3}$/),
  })).min(1),
});

const WitsQueryResponse = z.object({
  meta: z.object({
    commodity: z.string(),
    hsCode: z.string().regex(/^\d{6}$/),
    reporterISO3: z.string().regex(/^\d{3}$/),
    source: z.enum(['WITS_LIVE', 'WITS_FALLBACK']),
    apiStatus: z.string().min(1),
    reliability: z.object({
      score: z.number(),
      grade: z.string(),
      label: z.string(),
    }),
  }),
  tariff: z.unknown().nullable(),
  tradeFlow: z.array(z.object({
    year: z.string(),
    importValueUSD: z.number().optional(),
    exportValueUSD: z.number().optional(),
    importWeightMT: z.number().optional(),
    exportWeightMT: z.number().optional(),
    source: z.string(),
  })),
  unitPrice: z.array(z.object({
    year: z.string(),
    pricePerKg: z.number(),
  })),
  allTariffs: z.record(z.string(), z.unknown()),
});

const UsCensusHealthResponse = z.object({
  service: z.string().includes('U.S. Census Bureau'),
  prefetchAvailable: z.boolean(),
  prefetchCoverage: z.array(z.string()),
  modes: z.array(z.enum(['trend', 'breakdown', 'raw'])),
});

const UsCensusTrendResponse = z.object({
  meta: z.object({
    source: z.literal('CENSUS_PREFETCH'),
    hsCode: z.string().regex(/^\d{6,10}$/),
    mode: z.literal('trend'),
    coverage: z.object({
      start: z.string(),
      end: z.string(),
    }),
    reliability: z.object({
      score: z.number(),
      grade: z.string(),
      label: z.string(),
    }),
  }),
  monthly: z.array(z.object({
    time: z.string(),
    valueUSD: z.number(),
    qtyKg: z.number(),
    unitPriceUSDperKg: z.number(),
  })).min(1),
  annualValueUSD: z.number().positive(),
  annualQtyKg: z.number().positive(),
  avgUnitPriceUSDperKg: z.number().positive(),
});

async function jsonOf(res: Response) {
  expect(res.status).toBe(200);
  return res.json();
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('/api/wits', () => {
  it('GET exposes shared commodity HS map and country lookup', async () => {
    const mod = await import('../app/api/wits/route') as WitsRouteModule;
    const parsed = WitsHealthResponse.parse(await jsonOf(await mod.GET()));

    expect(parsed.availableCommodities).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: '새우', hsCode: '030617' }),
        expect.objectContaining({ name: '참치통조림', hsCode: '160414' }),
      ]),
    );
    expect(parsed.availableCountries).toEqual(
      expect.arrayContaining([expect.objectContaining({ iso3: '410' })]),
    );
  });

  it('POST returns deterministic fallback trade data when WITS is unavailable', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('Service unavailable', { status: 503 })));

    const mod = await import('../app/api/wits/route') as WitsRouteModule;
    const parsed = WitsQueryResponse.parse(await jsonOf(await mod.POST(new Request('http://localhost/api/wits', {
      method: 'POST',
      body: JSON.stringify({ commodity: '새우', reporter: '한국', years: ['2024'] }),
    }))));

    expect(parsed.meta).toMatchObject({
      commodity: '새우',
      hsCode: '030617',
      reporterISO3: '410',
      source: 'WITS_FALLBACK',
      apiStatus: 'fallback',
    });
    expect(parsed.tradeFlow.length).toBeGreaterThan(0);
    expect(parsed.allTariffs).toHaveProperty('410');
  });
});

describe('/api/us-census', () => {
  it('GET reports prefetch coverage and supported modes', async () => {
    const mod = await import('../app/api/us-census/route') as UsCensusRouteModule;
    const parsed = UsCensusHealthResponse.parse(await jsonOf(await mod.GET()));

    expect(parsed.prefetchAvailable).toBe(true);
    expect(parsed.prefetchCoverage).toEqual(expect.arrayContaining(['160414']));
    expect(parsed.modes).toEqual(expect.arrayContaining(['trend', 'breakdown', 'raw']));
  });

  it('POST trend returns positive monthly totals from the Census prefetch', async () => {
    const mod = await import('../app/api/us-census/route') as UsCensusRouteModule;
    const parsed = UsCensusTrendResponse.parse(await jsonOf(await mod.POST(new Request('http://localhost/api/us-census', {
      method: 'POST',
      body: JSON.stringify({ hsCode: '160414', mode: 'trend', year: '2024' }),
    }))));

    expect(parsed.meta).toMatchObject({
      source: 'CENSUS_PREFETCH',
      hsCode: '160414',
      mode: 'trend',
    });
    expect(parsed.monthly[0].time).toMatch(/^2024-/);
  });
});
