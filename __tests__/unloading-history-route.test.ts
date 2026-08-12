import { Buffer } from 'node:buffer';
import { describe, expect, it, vi } from 'vitest';
import {
  UnloadingHistoryPublicResponseSchema,
} from '../lib/unloading-history/schema';

type RouteModule = {
  GET: () => Promise<Response>;
};

type ResponseModule = {
  buildUnloadingHistoryResponse: (
    load?: () => unknown,
  ) => Response;
};

describe('/api/unloading-history', () => {
  it('returns the validated public snapshot without internal source details', async () => {
    const { GET } = await vi.importActual<RouteModule>(
      '../app/api/unloading-history/route',
    );

    const response = await GET();

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('application/json');
    const data = UnloadingHistoryPublicResponseSchema.parse(await response.json());
    expect(data).toMatchObject({
      success: true,
      isLive: false,
      snapshotStatus: 'SYNCED',
      _metadata: {
        isLive: false,
        status: 'STATIC',
        source: 'lib/unloading-history/history_2021_2025.json',
      },
    });
    expect(data.voyages).toHaveLength(98);

    const serialized = JSON.stringify(data);
    expect(serialized).not.toMatch(/\/Users\/|GoogleDrive-|@gmail\.com|[a-f0-9]{64}/i);
    expect(Buffer.byteLength(serialized, 'utf8')).toBeLessThan(2_000_000);
  });

  it('isolates loader failures behind a stable Korean 500 response', async () => {
    const { buildUnloadingHistoryResponse } = await vi.importActual<ResponseModule>(
      '../lib/unloading-history/response',
    );

    const response = buildUnloadingHistoryResponse(() => {
      throw new Error('private loader detail');
    });

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: '과거 하역 이력을 불러오지 못했습니다.',
    });
  });

  it('rejects malformed loader output before unexpected fields can be exposed', async () => {
    const { buildUnloadingHistoryResponse } = await vi.importActual<ResponseModule>(
      '../lib/unloading-history/response',
    );

    const response = buildUnloadingHistoryResponse(() => ({
      success: true,
      voyages: [],
      unexpectedInternalDetail: 'not public',
    }));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: '과거 하역 이력을 불러오지 못했습니다.',
    });
  });
});
