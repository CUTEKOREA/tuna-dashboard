import { describe, expect, it } from 'vitest';

type RouteModule = {
  GET: (request: Request) => Promise<Response>;
};

async function jsonOf(res: Response) {
  expect(res.status).toBe(200);
  return res.json();
}

describe('/api/cross-commodity-intelligence', () => {
  it('returns the market intelligence model with static telemetry metadata', async () => {
    const mod = await import('../app/api/cross-commodity-intelligence/route') as RouteModule;
    const parsed = await jsonOf(await mod.GET(new Request('http://localhost/api/cross-commodity-intelligence')));

    expect(parsed.isLive).toBe(false);
    expect(parsed._metadata).toMatchObject({
      isLive: false,
      status: 'STATIC',
      source: 'lib/data/cross-commodity-intelligence.ts',
    });
    expect(parsed.substitutionSignals.length).toBeGreaterThanOrEqual(4);
    expect(parsed.riskFactors.length).toBeGreaterThanOrEqual(5);
    expect(parsed.portfolioCandidates.length).toBeGreaterThanOrEqual(5);
    expect(parsed.anomalyAlerts.length).toBeGreaterThanOrEqual(3);
    expect(parsed.anomalyAlerts.every((alert: { breached: boolean }) => alert.breached)).toBe(true);
    expect(parsed.headline.topAlert).toBe(parsed.anomalyAlerts[0].title);
  });
});
