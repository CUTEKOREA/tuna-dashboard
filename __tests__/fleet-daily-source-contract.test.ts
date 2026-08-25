import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { validateFleetDailySourcePayload } from '@/lib/contracts/fleet-daily-source';

const PRIVATE_SOURCE = join(process.cwd(), 'lib', 'data', 'generated', 'fleet-daily-private.json');

const PACIFIC_ROW = {
  name: 'TEST PACIFIC',
  position: 'N0100 E00100 (QA)',
  catchMt: 20,
  catchMtRaw: '20',
  catchMtParenthetical: null,
  loadedMt: 10,
  loadedMtRaw: '10',
  loadedMtParenthetical: null,
  note: '시험 비고',
};

const ATLANTIC_ROW = {
  ...PACIFIC_ROW,
  name: 'TEST ATLANTIC',
  position: 'S0100 W00100 (QA)',
  catchMt: 30,
  catchMtRaw: '30',
};

const CARRIER_ROW = {
  name: 'TEST CARRIER',
  entityType: 'vessel' as const,
  loadedMt: 100,
  loadedMtRaw: '100',
  loadedMtParenthetical: null,
  expectedRemainingMt: 50,
  expectedRemainingMtRaw: '50',
  expectedRemainingParentheticalMt: null,
  loadPlan: '시험 일정',
  note: '시험 비고',
};

function daily(reportDate: string, asOf: string) {
  return {
    reportDate,
    asOf,
    pacific: { dailyMt: 20, monthlyMt: 100, annualMt: 1_000 },
    atlantic: { dailyMt: 30, monthlyMt: 200, annualMt: 2_000 },
    carrier: {
      loadedTotalMt: 100,
      loadedTotalMtRaw: '100',
      loadedTotalParentheticalMt: null,
      expectedRemainingMt: 50,
      expectedRemainingMtRaw: '50',
      expectedRemainingParentheticalMt: null,
    },
  };
}

function checks(reportDate: string) {
  return [
    { reportDate, field: 'pacific.dailyMt', reportedMt: 20, knownRowsMt: 20, missingCount: 0, status: 'completeMatch' },
    { reportDate, field: 'atlantic.dailyMt', reportedMt: 30, knownRowsMt: 30, missingCount: 0, status: 'completeMatch' },
    { reportDate, field: 'carrier.loadedMt', reportedMt: 100, knownRowsMt: 100, missingCount: 0, status: 'completeMatch' },
    { reportDate, field: 'carrier.expectedRemainingMt', reportedMt: 50, knownRowsMt: 50, missingCount: 0, status: 'completeMatch' },
  ];
}

function validPayload() {
  const first = daily('2026-08-13', '2026-08-12');
  const latest = daily('2026-08-14', '2026-08-13');
  return {
    _meta: {
      schemaVersion: 1,
      reportCount: 2,
      firstReportDate: first.reportDate,
      latestReportDate: latest.reportDate,
      latestAsOf: latest.asOf,
    },
    latest: {
      reportDate: latest.reportDate,
      asOf: latest.asOf,
      pacific: { asOf: latest.asOf, ...latest.pacific, vessels: [PACIFIC_ROW] },
      atlantic: { asOf: latest.asOf, ...latest.atlantic, vessels: [ATLANTIC_ROW] },
      carrier: { ...latest.carrier, vessels: [CARRIER_ROW] },
      longline: {
        vessels: [{
          name: 'TEST LONGLINE',
          loadedMt: 338.699 as number | null,
          loadedMtRaw: '(338.699톤(TEST-A,TEST-B))',
          loadedMtParenthetical: null,
          note: '시험 일정',
        }],
      },
    },
    previous: first,
    daily: [first, latest],
    quality: {
      reconciliationChecks: [...checks(first.reportDate), ...checks(latest.reportDate)],
      duplicateVesselRows: [],
      coordinateFormatIssues: [],
      longlineSectionMissing: [],
      counts: {
        reconciliationChecks: 8,
        reconciliationCompleteChecks: 8,
        reconciliationUnavailableChecks: 0,
        reconciliationUnavailableDocuments: 0,
        reconciliationIssues: 0,
        reconciliationDocuments: 0,
        reconciliationPartialDifferences: 0,
        reconciliationPartialDifferenceDocuments: 0,
        duplicateVesselRows: 0,
        coordinateFormatIssues: 0,
        longlineSectionMissing: 0,
      },
    },
  };
}

describe('fleet daily full-source contract', () => {
  it('accepts a strict source-faithful payload', () => {
    const payload = validPayload();
    expect(validateFleetDailySourcePayload(payload)).toEqual(payload);
  });

  it('preserves an empty amount cell as unreported instead of zero', () => {
    const payload = validPayload();
    payload.latest.longline.vessels[0].loadedMt = null;
    payload.latest.longline.vessels[0].loadedMtRaw = '';
    payload.latest.longline.vessels[0].loadedMtParenthetical = null;

    expect(validateFleetDailySourcePayload(payload)).toEqual(payload);
  });

  it('accepts an explicitly approximate source amount without dropping its numeric value', () => {
    const payload = validPayload();
    payload.latest.longline.vessels[0].loadedMt = 300;
    payload.latest.longline.vessels[0].loadedMtRaw = '(약 300톤)';
    payload.latest.longline.vessels[0].loadedMtParenthetical = null;

    expect(validateFleetDailySourcePayload(payload)).toEqual(payload);
  });

  it('rejects amount raw, value, parenthetical, and unknown-key drift', () => {
    const rawDrift = validPayload();
    rawDrift.latest.pacific.vessels[0].catchMtRaw = '21';
    expect(() => validateFleetDailySourcePayload(rawDrift)).toThrow();

    const parentheticalDrift = validPayload();
    parentheticalDrift.latest.pacific.vessels[0].catchMtRaw = '20(2)';
    expect(() => validateFleetDailySourcePayload(parentheticalDrift)).toThrow();

    const unknownKey = validPayload() as ReturnType<typeof validPayload> & { unexpected?: boolean };
    unknownKey.unexpected = true;
    expect(() => validateFleetDailySourcePayload(unknownKey)).toThrow();
  });

  it('rejects missing coverage, unknown dates, status drift, and reported-total drift', () => {
    const duplicate = validPayload();
    duplicate.quality.reconciliationChecks[7] = structuredClone(duplicate.quality.reconciliationChecks[0]);
    expect(() => validateFleetDailySourcePayload(duplicate)).toThrow();

    const unknownDate = validPayload();
    unknownDate.quality.reconciliationChecks[0].reportDate = '2026-08-12';
    expect(() => validateFleetDailySourcePayload(unknownDate)).toThrow();

    const statusDrift = validPayload();
    statusDrift.quality.reconciliationChecks[0].status = 'completeMismatch';
    expect(() => validateFleetDailySourcePayload(statusDrift)).toThrow();

    const reportedDrift = validPayload();
    reportedDrift.quality.reconciliationChecks[0].reportedMt = 21;
    reportedDrift.quality.reconciliationChecks[0].knownRowsMt = 21;
    expect(() => validateFleetDailySourcePayload(reportedDrift)).toThrow();
  });

  it('rejects coordinated count changes and latest detail-check drift', () => {
    const countDrift = validPayload();
    countDrift.quality.counts.reconciliationCompleteChecks -= 1;
    countDrift.quality.counts.reconciliationUnavailableChecks += 1;
    expect(() => validateFleetDailySourcePayload(countDrift)).toThrow();

    const detailDrift = validPayload();
    detailDrift.quality.reconciliationChecks[4].knownRowsMt = 19;
    detailDrift.quality.reconciliationChecks[4].status = 'completeMismatch';
    detailDrift.quality.counts.reconciliationIssues = 1;
    detailDrift.quality.counts.reconciliationDocuments = 1;
    detailDrift.quality.counts.reconciliationPartialDifferences = 1;
    detailDrift.quality.counts.reconciliationPartialDifferenceDocuments = 1;
    expect(() => validateFleetDailySourcePayload(detailDrift)).toThrow();
  });

  it.runIf(existsSync(PRIVATE_SOURCE))('validates the complete ignored Drive-derived source locally', () => {
    const payload = JSON.parse(readFileSync(PRIVATE_SOURCE, 'utf8'));
    const parsed = validateFleetDailySourcePayload(payload);
    expect(parsed._meta.reportCount).toBe(139);
    expect(parsed.quality.reconciliationChecks).toHaveLength(556);
  });
});
