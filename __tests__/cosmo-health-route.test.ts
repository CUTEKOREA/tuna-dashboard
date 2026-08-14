import { afterEach, describe, expect, it, vi } from 'vitest';
import { GET } from '../app/api/cosmo-health/route';

const COSMO_URL = 'https://cosmo-dashboard-cutekorea-3280s-projects.vercel.app/';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Cosmo availability route', () => {
  it('reports the protected 401 deployment as unavailable without caching', async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => new Response(null, { status: 401 }));
    vi.stubGlobal('fetch', fetchMock);

    const response = await GET();

    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(await response.json()).toEqual({ available: false });
    expect(fetchMock).toHaveBeenCalledWith(COSMO_URL, expect.objectContaining({
      method: 'HEAD',
      cache: 'no-store',
    }));
  });

  it('reports the iframe target as available only after a successful response', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>(async () => new Response(null, { status: 200 })));

    const response = await GET();

    expect(await response.json()).toEqual({ available: true });
  });
});
