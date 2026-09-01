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

const DETAIL_WITH_CAPACITY = {
  ...DETAIL,
  pacific: {
    ...DETAIL.pacific,
    vessels: DETAIL.pacific.vessels.map((vessel, index) => {
      if (index === 0) return {
        ...vessel,
        holdCapacity: { value: 1_300, unit: 'MT', source: 'FFA VRST', asOf: '2026-08-14' },
      };
      if (index === 1) return {
        ...vessel,
        loadedMt: 950,
        holdCapacity: { value: 1_000, unit: 'MT', source: 'FFA VRST', asOf: '2026-08-14' },
      };
      return vessel;
    }),
  },
  atlantic: {
    ...DETAIL.atlantic,
    vessels: DETAIL.atlantic.vessels.map((vessel, index) => index === 0 ? {
      ...vessel,
      holdCapacity: { value: 3_114.85, unit: '㎥', source: 'ICCAT', asOf: '2026-08-21' },
    } : vessel),
  },
} as FleetDailyDetailPayload;

describe('fleet protected daily detail rendering', () => {
  it('renders minimized detail only after an authorized state is supplied', () => {
    const operations = renderToStaticMarkup(
      React.createElement(FleetDailyOperations, { detailState: { status: 'ready', detail: DETAIL } }),
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

  it('shows hold capacity and a numeric utilization without mixing MT and cubic metres', () => {
    const roster = renderToStaticMarkup(React.createElement(FleetRosterGrid, { detail: DETAIL_WITH_CAPACITY }));

    expect(roster).toContain('어창 용량');
    expect(roster).toContain('1,300');
    expect(roster).toContain('적재율 0.8%');
    expect(roster).toContain('만재 임박');
    expect(roster).toContain('role="progressbar"');
    expect(roster).toContain('aria-valuenow="0.8"');
    expect(roster).toContain('3,114.85');
    expect(roster).toContain('㎥');
    expect(roster).toContain('적재율 미산출');
    expect(roster).toContain('적재량 MT와 어창 용량 ㎥의 단위가 다릅니다');
    expect(roster).toContain('어창 용량 미확인');

    // 태평양 일간은 국적 6척과 합작 4척으로 갈라 표기한다. 월간·연간 누계는 행 합계와 달라 나누지 않는다.
    expect(roster).toContain('일간 내역 · 국적');
    expect(roster).toContain('합작');
    expect(roster).toContain('= 합계');
  });
});
