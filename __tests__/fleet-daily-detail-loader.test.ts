import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import {
  fleetDailyDetailSha256,
  getFleetDailyDetail,
  parseFleetDailyDetailSource,
} from '@/lib/data/fleet-daily-detail';
import {
  fleetDailyPublicDetailSha256Compat,
  fleetDailyPublicDetailSha256,
  fleetDailyPublicLatest,
} from '@/lib/data/fleet-daily-public';
import type { FleetDailyDetailPayload } from '@/lib/contracts/fleet-daily-api';

const ORIGINAL_DETAIL = process.env.FLEET_DAILY_DETAIL_JSON;
const PRIVATE_DETAIL = join(process.cwd(), 'artifacts', 'fleet-daily-detail.json');
const VALID_DETAIL = {
  reportDate: '2026-08-14',
  asOf: '2026-08-13',
  pacific: {
    asOf: '2026-08-13',
    dailyMt: 130,
    monthlyMt: 1_947,
    annualMt: 46_779.8,
    vessels: [{ name: 'TEST PACIFIC', position: 'N0100 W16000 (H)', catchMt: null, loadedMt: 10, note: '-' }],
  },
  atlantic: {
    asOf: '2026-08-13',
    dailyMt: 205,
    monthlyMt: 2_010,
    annualMt: 28_735,
    vessels: [],
  },
  carrier: {
    loadedTotalMt: 9_922.3,
    expectedRemainingMt: 7_887.7,
    vessels: [],
  },
  longline: { vessels: [] },
};

afterEach(() => {
  if (ORIGINAL_DETAIL === undefined) delete process.env.FLEET_DAILY_DETAIL_JSON;
  else process.env.FLEET_DAILY_DETAIL_JSON = ORIGINAL_DETAIL;
});

describe('fleet daily protected detail loader', () => {
  it('keeps the currently deployed detail digest valid during the schema transition', () => {
    /* 2026-10-08: 기대값을 8-27 배포 해시 d50fbd4b… 에서 지금 main(10/8 보고) 배포 해시 216ae7aa… 로 갱신.
     * 그 사이 일일보고가 쌓여 d50fbd4b… 는 더 이상 배포값이 아니다. 로더는 detailSha256 또는
     * detailSha256Compat(50b886c9…) 에 든 digest 를 받으므로 둘을 합친 집합에서 확인한다. */
    expect([fleetDailyPublicDetailSha256, ...fleetDailyPublicDetailSha256Compat]).toContain(
      '216ae7aa78cfde8fbf61290d0d7d1e5439e62b9814644695933dfd69112a8dc0',
    );
  });

  it('accepts a strict current DTO from the server environment', () => {
    const source = JSON.stringify(VALID_DETAIL);
    expect(parseFleetDailyDetailSource(source, {
      latest: VALID_DETAIL,
      detailSha256: fleetDailyDetailSha256(VALID_DETAIL),
    })).toEqual(VALID_DETAIL);
  });

  it('accepts exactly one previous digest during a coordinated detail migration', () => {
    const currentDetail: FleetDailyDetailPayload = {
      ...VALID_DETAIL,
      pacific: {
        ...VALID_DETAIL.pacific,
        vessels: VALID_DETAIL.pacific.vessels.map((vessel) => ({
          ...vessel,
          holdCapacity: { value: 1_300, unit: 'MT', source: 'FFA VRST', asOf: '2026-08-14' },
        })),
      },
    };
    const previousSha = fleetDailyDetailSha256(VALID_DETAIL);

    expect(parseFleetDailyDetailSource(JSON.stringify(VALID_DETAIL), {
      latest: VALID_DETAIL,
      detailSha256: fleetDailyDetailSha256(currentDetail),
      detailSha256Compat: [previousSha],
    })).toEqual(VALID_DETAIL);

    expect(() => parseFleetDailyDetailSource(JSON.stringify(VALID_DETAIL), {
      latest: VALID_DETAIL,
      detailSha256: fleetDailyDetailSha256(currentDetail),
      detailSha256Compat: ['f'.repeat(64)],
    })).toThrow('digest does not match');
  });

  it('rejects missing, malformed, oversized, unknown, and stale detail values', () => {
    delete process.env.FLEET_DAILY_DETAIL_JSON;
    expect(() => getFleetDailyDetail()).toThrow('unavailable');

    process.env.FLEET_DAILY_DETAIL_JSON = '{';
    expect(() => getFleetDailyDetail()).toThrow('invalid');

    process.env.FLEET_DAILY_DETAIL_JSON = ' '.repeat(65 * 1_024);
    expect(() => getFleetDailyDetail()).toThrow('unavailable');

    process.env.FLEET_DAILY_DETAIL_JSON = JSON.stringify({ ...VALID_DETAIL, daily: [] });
    expect(() => getFleetDailyDetail()).toThrow();

    process.env.FLEET_DAILY_DETAIL_JSON = JSON.stringify({
      ...VALID_DETAIL,
      pacific: { ...VALID_DETAIL.pacific, dailyMt: 131 },
    });
    expect(() => getFleetDailyDetail()).toThrow('does not match public aggregate');

    const coordinatedReplacement = {
      ...VALID_DETAIL,
      pacific: { ...VALID_DETAIL.pacific, vessels: [] },
    };
    expect(() => parseFleetDailyDetailSource(JSON.stringify(coordinatedReplacement), {
      latest: VALID_DETAIL,
      detailSha256: fleetDailyDetailSha256(VALID_DETAIL),
    })).toThrow('digest does not match');
  });

  it.runIf(existsSync(PRIVATE_DETAIL))('accepts the ignored Drive-derived detail bound to the public digest', () => {
    const source = readFileSync(PRIVATE_DETAIL, 'utf8');
    expect(parseFleetDailyDetailSource(source, {
      latest: fleetDailyPublicLatest,
      detailSha256: fleetDailyPublicDetailSha256,
    })).toEqual(JSON.parse(source));
  });
});
