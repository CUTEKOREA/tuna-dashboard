import { describe, expect, it } from 'vitest';

import {
  fleetDailyPublic,
  fleetDailyPublicDeltas,
  fleetDailyPublicLatest,
  fleetDailyPublicReconciliation,
} from '@/lib/data/fleet-daily-public';
import {
  validateFleetDailyDetailPayload,
  type FleetDailyDetailPayload,
} from '@/lib/contracts/fleet-daily-api';

const VALID_DETAIL: FleetDailyDetailPayload = {
  reportDate: '2026-08-14',
  asOf: '2026-08-13',
  pacific: {
    asOf: '2026-08-13',
    dailyMt: 130,
    monthlyMt: 1_947,
    annualMt: 46_779.8,
    vessels: [{ name: '보호 선박', position: 'N0100 E00100', catchMt: null, loadedMt: 10, note: '-' }],
  },
  atlantic: {
    asOf: '2026-08-13',
    dailyMt: 205,
    monthlyMt: 2_010,
    annualMt: 28_735,
    vessels: [{ name: '보호 합작선', position: 'S0100 W00100', catchMt: 5, loadedMt: null, note: '-' }],
  },
  carrier: {
    loadedTotalMt: 9_922.3,
    expectedRemainingMt: 7_887.7,
    vessels: [{
      name: '보호 운반선',
      displayName: '보호 운반선',
      capacityMt: 3_700,
      entityType: 'vessel',
      loadedMt: 1_000,
      expectedRemainingMt: 2_700,
      loadPlan: '-',
      note: '방콕 시험 상태',
    }],
  },
  longline: {
    vessels: [{ name: '보호 연승선', loadedMt: null, note: '-' }],
  },
};

function collectKeys(value: unknown, keys = new Set<string>()): Set<string> {
  if (!value || typeof value !== 'object') return keys;
  if (Array.isArray(value)) {
    for (const item of value) collectKeys(item, keys);
    return keys;
  }
  for (const [key, child] of Object.entries(value)) {
    keys.add(key);
    collectKeys(child, keys);
  }
  return keys;
}

describe('fleet daily public and private DTO boundary', () => {
  it('publishes only aggregate values and derived quality counts', () => {
    expect(fleetDailyPublic).toEqual({
      _meta: {
        schemaVersion: 1,
        reportCount: 143,
        firstReportDate: '2026-01-16',
        latestReportDate: '2026-08-27',
        latestAsOf: '2026-08-26',
        detailSha256: expect.stringMatching(/^[a-f0-9]{64}$/),
      },
      latest: {
        reportDate: '2026-08-27',
        asOf: '2026-08-26',
        pacific: { asOf: '2026-08-26', dailyMt: 65, monthlyMt: 2_878, annualMt: 47_710.8 },
        atlantic: { asOf: '2026-08-26', dailyMt: 165, monthlyMt: 5_295, annualMt: 32_020 },
        carrier: { loadedTotalMt: 8_763.3, expectedRemainingMt: 5_771.7 },
      },
      deltas: { pacificDailyMt: 40, atlanticDailyMt: -25, totalDailyMt: 15 },
      reconciliation: {
        pacificDaily: { reportedMt: 65, rowsMt: 65, matches: true, missingCount: 0 },
        atlanticDaily: { reportedMt: 165, rowsMt: 165, matches: true, missingCount: 0 },
        carrierLoaded: { reportedMt: 8_763.3, rowsMt: 8_763.3, matches: true, missingCount: 0 },
        carrierExpectedRemaining: { reportedMt: 5_771.7, rowsMt: 5_771.7, matches: true, missingCount: 0 },
        valid: true,
        unavailableCount: 0,
        issueCount: 0,
      },
      quality: {
        counts: {
          reconciliationChecks: 572,
          reconciliationCompleteChecks: 572,
          reconciliationUnavailableChecks: 0,
          reconciliationUnavailableDocuments: 0,
          reconciliationIssues: 14,
          reconciliationDocuments: 12,
          reconciliationPartialDifferences: 14,
          reconciliationPartialDifferenceDocuments: 12,
          duplicateVesselRows: 4,
          coordinateFormatIssues: 6,
          longlineSectionMissing: 13,
        },
        incompletePartialDifferences: 0,
        incompletePartialDifferenceDocuments: 0,
      },
    });

    expect(fleetDailyPublicLatest).toBe(fleetDailyPublic.latest);
    expect(fleetDailyPublicDeltas).toBe(fleetDailyPublic.deltas);
    expect(fleetDailyPublicReconciliation).toBe(fleetDailyPublic.reconciliation);

    const keys = collectKeys(fleetDailyPublic);
    for (const forbidden of [
      'vessels', 'name', 'position', 'note', 'loadPlan', 'daily',
      'catchMtRaw', 'loadedMtRaw',
      'catchMtParenthetical', 'loadedMtParenthetical',
    ]) {
      expect(keys.has(forbidden), forbidden).toBe(false);
    }
    expect(Array.isArray((fleetDailyPublic.quality as Record<string, unknown>).reconciliationChecks)).toBe(false);
  });

  it('accepts only the minimized latest detail DTO and rejects source-only fields', () => {
    expect(validateFleetDailyDetailPayload(VALID_DETAIL)).toEqual(VALID_DETAIL);

    const withRaw = structuredClone(VALID_DETAIL) as FleetDailyDetailPayload & Record<string, unknown>;
    (withRaw.pacific.vessels[0] as unknown as Record<string, unknown>).catchMtRaw = '-';
    expect(() => validateFleetDailyDetailPayload(withRaw)).toThrow();

    const withHistory = structuredClone(VALID_DETAIL) as FleetDailyDetailPayload & Record<string, unknown>;
    withHistory.daily = [];
    expect(() => validateFleetDailyDetailPayload(withHistory)).toThrow();

    const withQualityEvidence = structuredClone(VALID_DETAIL) as FleetDailyDetailPayload & Record<string, unknown>;
    withQualityEvidence.reconciliationChecks = [];
    expect(() => validateFleetDailyDetailPayload(withQualityEvidence)).toThrow();
  });
});
