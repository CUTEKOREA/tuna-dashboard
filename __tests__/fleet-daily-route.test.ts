import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  authorize: vi.fn(),
  getDetail: vi.fn(),
}));

vi.mock('@/lib/fleet/request-auth', () => ({
  authorizeFleetRequest: mocks.authorize,
}));
vi.mock('@/lib/data/fleet-daily-detail', () => ({
  getFleetDailyDetail: mocks.getDetail,
}));

import { GET } from '@/app/api/fleet/daily/route';

const DETAIL = {
  reportDate: '2026-08-14',
  asOf: '2026-08-13',
  pacific: { asOf: '2026-08-13', dailyMt: 130, monthlyMt: 1_947, annualMt: 46_779.8, vessels: [] },
  atlantic: { asOf: '2026-08-13', dailyMt: 205, monthlyMt: 2_010, annualMt: 28_735, vessels: [] },
  carrier: { loadedTotalMt: 9_922.3, expectedRemainingMt: 7_887.7, vessels: [] },
  longline: { vessels: [] },
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.authorize.mockResolvedValue({
    ok: true,
    userId: 'fleet-user-1',
    email: 'operator@example.com',
  });
  mocks.getDetail.mockReturnValue(DETAIL);
});

describe('/api/fleet/daily GET', () => {
  it.each([
    [401, 'authentication_required'],
    [403, 'fleet_access_required'],
  ] as const)('returns %s %s without loading private data', async (status, code) => {
    mocks.authorize.mockResolvedValue({ ok: false, status, code });

    const response = await GET();

    expect(response.status).toBe(status);
    expect(response.headers.get('cache-control')).toBe('private, no-store, max-age=0');
    expect(response.headers.get('vary')).toContain('Cookie');
    await expect(response.json()).resolves.toEqual({ ok: false, code });
    expect(mocks.getDetail).not.toHaveBeenCalled();
  });

  it('returns only the minimized detail DTO to an allowlisted Google user', async () => {
    const response = await GET();

    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store, max-age=0');
    expect(response.headers.get('x-content-type-options')).toBe('nosniff');
    await expect(response.json()).resolves.toEqual({ ok: true, detail: DETAIL });
    expect(mocks.getDetail).toHaveBeenCalledTimes(1);
  });

  it('fails closed when the protected DTO is absent or invalid', async () => {
    mocks.getDetail.mockImplementation(() => {
      throw new Error('missing private detail');
    });

    const response = await GET();

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({ ok: false, code: 'fleet_data_unavailable' });
  });
});
