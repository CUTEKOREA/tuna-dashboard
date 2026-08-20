import { describe, expect, it } from 'vitest';

import { GET } from '@/app/api/unloading-db/route';
import {
  getAnalyticsStatus,
  getTemperatureEvidenceLabel,
} from '@/components/UnloadingAnalytics';
import {
  getUnloadingEtaLabel,
  getVesselCargoBasis,
  getVesselStatusKind,
  parseVesselHoldData,
} from '@/components/UnloadingStatus';

async function loadHikari() {
  const response = await GET();
  const payload = await response.json();

  expect(response.status).toBe(200);
  expect(payload.success).toBe(true);
  return payload.data['hikari-bangkok-2026-07'];
}

describe('HIKARI 1 Bangkok unloading plan and daily report', () => {
  it('uses a voyage-specific ID so the completed Gensan HIKARI voyage is not overwritten', async () => {
    const response = await GET();
    const payload = await response.json();

    expect(payload.data['hikari-bangkok-2026-07']).toMatchObject({
      name: 'M/V HIKARI 1',
      status: '하역중',
      reportedTotal: 2929,
    });
  });

  it('keeps capacity, total cargo, and the FCF discharge target on separate bases', async () => {
    const vessel = await loadHikari();

    expect(vessel).toMatchObject({
      name: 'M/V HIKARI 1',
      location: '방콕, 태국',
      buyer: 'FCF CO.,LTD',
      status: '하역중',
      reportedTotal: 2929,
      actualTotal: 297.06,
      surplus: -2631.94,
    });
    const loadingPlan = vessel.timeline.find((entry: { date: string }) => entry.date === '7/17~7/20');
    expect(loadingPlan.quality).toContain('정격 3,700 MT');
    expect(loadingPlan.quality).toContain('총 적재 3,214 MT');
    expect(loadingPlan.quality).toContain('FCF 방콕 하역대상 2,929 MT');
    expect(loadingPlan.quality).toContain('#2-A 별도 배정 285 MT');
  });

  it('publishes loading records without turning them into discharge results', async () => {
    const vessel = await loadHikari();

    const loadingRecords = vessel.timeline.filter((entry: { date: string }) => entry.date.startsWith('7/'));
    expect(loadingRecords.map((entry: { date: string }) => entry.date)).toEqual([
      '7/2~7/4',
      '7/14~7/15',
      '7/17~7/19',
      '7/17~7/20',
    ]);
    expect(loadingRecords.every((entry: { dailyAmount: number }) => entry.dailyAmount === 0)).toBe(true);
    expect(loadingRecords.every((entry: { cumAmount: number }) => entry.cumAmount === 0)).toBe(true);
    expect(loadingRecords[0].quality).toContain('FCF 670 MT');
    expect(loadingRecords[0].quality).toContain('황다랑어 96 MT 별도 배정');
    expect(loadingRecords[1].quality).toContain('FCF 314 MT');
    expect(loadingRecords[1].quality).toContain('황다랑어 114 MT 별도 배정');
    expect(loadingRecords[2].quality).toContain('940 MT 전량 FCF');
    expect(loadingRecords[3].quality).toContain('1,005 MT 전량 FCF');
  });

  it('publishes the structured August 20 discharge without duplicating the date', async () => {
    const vessel = await loadHikari();
    const dischargeReports = vessel.timeline.filter((entry: { dailyAmount: number }) => entry.dailyAmount > 0);

    expect(dischargeReports).toHaveLength(1);
    expect(dischargeReports[0]).toMatchObject({
      date: '8/20',
      time: '10:00 ~ 15:20',
      targetHol: 'N/STAR(#3-A:104.240,#1-A:69.800), MOAMARI(#4-A:123.020)',
      consignee: 'MMP · GFF',
      dailyAmount: 297.06,
      cumAmount: 297.06,
      remainingAmount: 2631.94,
      speciesAmounts: { SJ: 146.14, YF: 150.92 },
      nextDay: {
        kind: 'work',
        date: '8/21',
        reason: null,
        resumeDate: null,
        plannedMt: '490',
      },
    });
    expect(dischargeReports[0].allocations).toEqual([
      {
        consignee: 'MMP',
        amount: 174.04,
        loads: [
          { sourceVessel: 'N/STAR', hatch: '#3-A', amount: 104.24 },
          { sourceVessel: 'N/STAR', hatch: '#1-A', amount: 69.8 },
        ],
      },
      {
        consignee: 'GFF',
        amount: 123.02,
        loads: [
          { sourceVessel: 'MOAMARI', hatch: '#4-A', amount: 123.02 },
        ],
      },
    ]);
    expect(dischargeReports[0].observations).toEqual([
      { sourceVessel: 'N/STAR', hatch: '#3-A', temperaturesC: [-22] },
      { sourceVessel: 'N/STAR', hatch: '#1-A', temperaturesC: [-20] },
      { sourceVessel: 'MOAMARI', hatch: '#4-A', temperaturesC: [-20] },
    ]);
  });

  it('matches the FCF breakdown by species and source vessel', async () => {
    const vessel = await loadHikari();

    expect(vessel.species).toEqual([
      expect.objectContaining({ id: 'SJ', name: '가다랑어', reported: 2515, actual: 146.14 }),
      expect.objectContaining({ id: 'YF', name: '황다랑어', reported: 358, actual: 150.92 }),
      expect.objectContaining({ id: 'BE', name: '눈다랑어', reported: 56, actual: 0 }),
    ]);
    expect(vessel.species.reduce((sum: number, item: { reported: number }) => sum + item.reported, 0)).toBe(2929);
    expect(vessel.species.reduce((sum: number, item: { actual: number }) => sum + item.actual, 0)).toBeCloseTo(297.06, 6);
    expect(vessel.motherVessel).toBe('S/SPR 670 · MOAKONA 314 · MOAMARI 940 · NAOERO STAR 1,005 MT');
  });

  it('maps only the FCF target to holds and applies observed discharge temperatures', async () => {
    const vessel = await loadHikari();
    const holds = parseVesselHoldData('hikari-bangkok-2026-07', vessel.timeline, vessel.reportedTotal);

    expect(Object.fromEntries(Object.entries(holds).map(([id, hold]) => [id, hold.nominalCapacity]))).toEqual({
      '#4-A': 137,
      '#4-B': 390,
      '#4-C': 314,
      '#3-A': 165,
      '#3-B': 360,
      '#3-C': 413,
      '#2-A': 0,
      '#2-B': 340,
      '#2-C': 330,
      '#1-A': 280,
      '#1-B': 200,
      '#1-C': 0,
    });
    expect(Object.values(holds).reduce((sum, hold) => sum + hold.nominalCapacity, 0)).toBe(2929);
    expect(holds['#2-A'].shippers).toEqual(['별도 배정 황다랑어 285 MT']);
    expect(holds['#4-A'].shippers).toEqual(['MOAMARI']);
    expect(holds['#2-B'].shippers).toEqual(['SHILLA SPRINTER']);
    expect(holds['#1-A'].shippers).toEqual(['NAOERO STAR']);
    expect(holds['#3-A'].lastTemperature).toBe(-22);
    expect(holds['#1-A'].lastTemperature).toBe(-20);
    expect(holds['#4-A'].lastTemperature).toBe(-20);
    expect(holds['#2-B'].lastTemperature).toBeNull();
  });

  it('shows the vessel as active after the first discharge', () => {
    expect(getVesselStatusKind('하역대기')).toBe('waiting');
    expect(getVesselStatusKind('하역중')).toBe('progress');
    expect(getVesselStatusKind('하역완료')).toBe('completed');
    expect(getUnloadingEtaLabel('하역중', 2631.94, 9)).toBe('+9일 필요');
    expect(getAnalyticsStatus('하역대기')).toEqual({
      kind: 'waiting',
      label: '하역대기',
      comparable: false,
      completed: false,
    });
    expect(getAnalyticsStatus('하역중')).toEqual({
      kind: 'progress',
      label: '하역중',
      comparable: true,
      completed: false,
    });
    expect(getAnalyticsStatus('하역완료')).toEqual({
      kind: 'completed',
      label: '하역완료',
      comparable: true,
      completed: true,
    });
    expect(getTemperatureEvidenceLabel(0, true)).toBe('하역 온도 실적 대기');
    expect(getTemperatureEvidenceLabel(3, true)).toBe('전 기간 어창 온도 -18℃ 이하 유지');
    expect(getTemperatureEvidenceLabel(3, false)).toBe('일부 어창 -18℃ 이상 관찰');
  });

  it('provides the four cargo bases used by the HIKARI detail summary', () => {
    expect(getVesselCargoBasis('hikari-bangkok-2026-07')).toEqual({
      sourceDate: '2026.07.20',
      capacity: 3700,
      totalLoaded: 3214,
      dischargeTarget: 2929,
      excludedCargo: 285,
    });
    expect(getVesselCargoBasis('sein-venus')).toBeNull();
  });
});
