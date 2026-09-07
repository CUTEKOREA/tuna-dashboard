import { describe, expect, it } from 'vitest';

import type { FleetDailyDetailPayload } from '@/lib/contracts/fleet-daily-api';
import {
  buildFleetRoster,
  formatFleetDailyDelta,
  formatFleetDailyNote,
  formatReportedMt,
} from '@/lib/fleet-daily-presentation';
import {
  fleetDailyPublic,
  fleetDailyPublicDeltas,
  fleetDailyPublicLatest,
} from '@/lib/data/fleet-daily-public';

const DETAIL: FleetDailyDetailPayload = {
  reportDate: '2026-08-14',
  asOf: '2026-08-13',
  pacific: {
    asOf: '2026-08-13',
    dailyMt: 130,
    monthlyMt: 1_947,
    annualMt: 46_779.8,
    vessels: [{
      name: 'TEST PACIFIC',
      position: 'N0100 W16000 (H)',
      catchMt: null,
      loadedMt: 100,
      note: 'X-MAS 시험 위치',
    }],
  },
  atlantic: {
    asOf: '2026-08-13',
    dailyMt: 205,
    monthlyMt: 2_010,
    annualMt: 28_735,
    vessels: [{
      name: 'TEST ATLANTIC',
      position: 'S0100 W01000 (H)',
      catchMt: 5,
      loadedMt: null,
      note: 'TEMA 시험 위치',
    }],
  },
  carrier: {
    loadedTotalMt: 1_000,
    expectedRemainingMt: 500,
    vessels: [
      {
        name: 'TEST CARRIER (1000)',
        displayName: 'TEST CARRIER',
        capacityMt: 1_000,
        entityType: 'vessel',
        loadedMt: 600,
        expectedRemainingMt: 400,
        loadPlan: '-',
        note: 'BKK 시험 위치',
      },
      {
        name: 'TEST CARGO 컨테이너',
        displayName: 'TEST CARGO 컨테이너',
        capacityMt: null,
        entityType: 'container',
        loadedMt: 400,
        expectedRemainingMt: 100,
        loadPlan: '-',
        note: 'GENSAN 시험 위치',
      },
    ],
  },
  longline: {
    vessels: [{ name: 'TEST LONGLINE', loadedMt: null, note: 'TAHITI 시험 위치' }],
  },
};

describe('fleet daily bounded intake', () => {
  it('exposes only the current public aggregate and quality counts', () => {
    expect(fleetDailyPublic._meta).toEqual({
      schemaVersion: 1,
      reportCount: 150,
      firstReportDate: '2026-01-16',
      latestReportDate: '2026-09-07',
      latestAsOf: '2026-09-06',
      detailSha256: expect.stringMatching(/^[a-f0-9]{64}$/),
      detailSha256Compat: [expect.stringMatching(/^[a-f0-9]{64}$/)],
    });
    expect(fleetDailyPublicLatest.pacific).toMatchObject({
      dailyMt: 100,
      monthlyMt: 790,
      annualMt: 49_030.8,
    });
    expect(fleetDailyPublicLatest.atlantic).toMatchObject({
      dailyMt: 75,
      monthlyMt: 990,
      annualMt: 34_450,
    });
    expect(fleetDailyPublicLatest.carrier).toEqual({
      loadedTotalMt: 6_854.1,
      expectedRemainingMt: 4_751.7,
    });
    expect(fleetDailyPublic.quality.counts).toMatchObject({
      reconciliationChecks: 600,
      reconciliationCompleteChecks: 600,
      reconciliationUnavailableChecks: 0,
      reconciliationUnavailableDocuments: 0,
      reconciliationIssues: 20,
      reconciliationDocuments: 18,
      reconciliationPartialDifferences: 20,
      reconciliationPartialDifferenceDocuments: 18,
      duplicateVesselRows: 4,
      coordinateFormatIssues: 6,
      longlineSectionMissing: 13,
    });
  });

  it('renders a dash amount as zero tons', () => {
    expect(formatReportedMt(null)).toBe('0');
    expect(formatReportedMt(0)).toBe('0');
    expect(formatReportedMt(130)).toBe('130');
  });

  it('formats signed deltas and reported port names without changing source values', () => {
    expect(fleetDailyPublicDeltas).toEqual({
      pacificDailyMt: -55,
      atlanticDailyMt: -40,
      totalDailyMt: -95,
    });
    expect(formatFleetDailyDelta(20)).toBe('+20');
    expect(formatFleetDailyDelta(-20)).toBe('-20');
    expect(formatFleetDailyNote('BKK / X-MAS / RABAUL / TEMA / TAHITI')).toBe(
      '방콕 / 크리스마스섬 / 라바울 / 테마 / 타히티',
    );
  });

  it('keeps container records while excluding them from physical map rows', () => {
    const roster = buildFleetRoster(DETAIL);

    expect(roster.pacific).toHaveLength(1);
    expect(roster.atlantic).toHaveLength(1);
    expect(roster.longline).toHaveLength(1);
    expect(roster.carrier).toHaveLength(2);
    expect(roster.carrier.filter((row) => row.entityType === 'container')).toEqual([
      expect.objectContaining({ displayName: 'TEST CARGO 컨테이너', location: '젠산' }),
    ]);
    expect(roster.carrierPhysical).toHaveLength(1);
    expect(roster.carrierPhysical[0]).toMatchObject({
      displayName: 'TEST CARRIER',
      position: 'BKK',
      location: '방콕',
    });
  });
});
