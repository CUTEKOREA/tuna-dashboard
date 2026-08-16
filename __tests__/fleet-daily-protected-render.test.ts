import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import type { FleetDailyDetailPayload } from '@/lib/contracts/fleet-daily-api';
import FleetDailyOperations from '@/components/FleetDailyOperations';
import FleetRosterGrid from '@/components/FleetRosterGrid';

const PACIFIC_NOTES = ['X-MAS 시험 위치', 'RABAUL 시험 위치', '-', '-', '-', '-', '-', '-', '-', '-'];
const ATLANTIC_NOTES = ['TEMA 시험 위치', 'TAHITI 시험 위치', '-', '-', '-', '-', '-'];
const CARRIER_NOTES = ['BKK 시험 위치', 'GENSAN 시험 위치', '-', '-', '-', '-', '-'];

const DETAIL: FleetDailyDetailPayload = {
  reportDate: '2026-08-14',
  asOf: '2026-08-13',
  pacific: {
    asOf: '2026-08-13',
    dailyMt: 130,
    monthlyMt: 1_947,
    annualMt: 46_779.8,
    vessels: PACIFIC_NOTES.map((note, index) => ({
      name: `TEST PACIFIC ${index + 1}`,
      position: `N0${String(index + 1).padStart(3, '0')} W16000 (H)`,
      catchMt: index === 0 ? null : index,
      loadedMt: 10 + index,
      note,
    })),
  },
  atlantic: {
    asOf: '2026-08-13',
    dailyMt: 205,
    monthlyMt: 2_010,
    annualMt: 28_735,
    vessels: ATLANTIC_NOTES.map((note, index) => ({
      name: `TEST ATLANTIC ${index + 1}`,
      position: `S0${String(index + 1).padStart(3, '0')} W01000 (H)`,
      catchMt: 5 + index,
      loadedMt: index === 0 ? null : 20 + index,
      note,
    })),
  },
  carrier: {
    loadedTotalMt: 1_000,
    expectedRemainingMt: 500,
    vessels: CARRIER_NOTES.map((note, index) => ({
      name: index === 6 ? 'TEST CARGO 컨테이너' : `TEST CARRIER ${index + 1}`,
      displayName: index === 6 ? 'TEST CARGO 컨테이너' : `TEST CARRIER ${index + 1}`,
      capacityMt: index === 6 ? null : 1_000,
      entityType: index === 6 ? 'container' as const : 'vessel' as const,
      loadedMt: 100 + index,
      expectedRemainingMt: 50 + index,
      loadPlan: '-',
      note,
    })),
  },
  longline: {
    vessels: [
      { name: 'TEST LONGLINE 1', loadedMt: null, note: 'TAHITI 시험 위치' },
      { name: 'TEST LONGLINE 2', loadedMt: 20, note: '-' },
    ],
  },
};

describe('fleet protected daily detail rendering', () => {
  it('renders minimized detail only after an authorized state is supplied', () => {
    const operations = renderToStaticMarkup(
      React.createElement(FleetDailyOperations, { detailState: { status: 'ready', detail: DETAIL }, onRetry: () => undefined }),
    );
    const roster = renderToStaticMarkup(React.createElement(FleetRosterGrid, { detail: DETAIL }));

    expect(operations).toContain('보고 당시 상태·예정');
    expect(operations).toContain('크리스마스섬 시험 위치');
    expect(operations).toContain('타히티 시험 위치');
    expect(operations).not.toContain('선박 상세 보호');

    expect(roster).toContain('10척 보고');
    expect(roster).toContain('7척 보고');
    expect(roster).toContain('2척 보고');
    expect(roster).toContain('7건');
    expect(roster).toContain('젠산');
    expect(roster).toContain('data-carrier-entity="container"');
    expect(roster).not.toContain('척 운항');
    for (const code of ['BKK', 'GENSAN', 'X-MAS', 'RABAUL', 'TEMA', 'TAHITI']) {
      expect(`${operations}${roster}`).not.toContain(code);
    }
  });
});
