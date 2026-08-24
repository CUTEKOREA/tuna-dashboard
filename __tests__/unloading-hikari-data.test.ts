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
      actualTotal: 1889.36,
      surplus: -1039.64,
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

  it('keeps the structured August 20 discharge when the next report is added', async () => {
    const vessel = await loadHikari();
    const dischargeReports = vessel.timeline.filter((entry: { dailyAmount: number }) => entry.dailyAmount > 0);
    const report = dischargeReports.find((entry: { date: string }) => entry.date === '8/20');

    expect(dischargeReports).toHaveLength(5);
    expect(report).toMatchObject({
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
    expect(report?.allocations).toEqual([
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
    expect(report?.observations).toEqual([
      { sourceVessel: 'N/STAR', hatch: '#3-A', temperaturesC: [-22] },
      { sourceVessel: 'N/STAR', hatch: '#1-A', temperaturesC: [-20] },
      { sourceVessel: 'MOAMARI', hatch: '#4-A', temperaturesC: [-20] },
    ]);
  });

  it('publishes the source-backed August 21 discharge and the user-provided August 22 plan', async () => {
    const vessel = await loadHikari();
    const reports = vessel.timeline.filter((entry: { date: string }) => entry.date === '8/21');

    expect(reports).toHaveLength(1);
    expect(reports[0]).toMatchObject({
      date: '8/21',
      time: '08:10 ~ 15:00',
      targetHol: 'N/STAR(#1-A:143.330), S/SPR(#2-B:132.550), N/STAR(#3-A:62.690,#3-B:60.820), MOAMARI(#4-A:4.990,#4-B:101.600)',
      consignee: 'MMP · AAI · TUM · RMK',
      dailyAmount: 505.98,
      cumAmount: 803.04,
      remainingAmount: 2125.96,
      speciesAmounts: { SJ: 460.28, YF: 45.7 },
      nextDay: {
        kind: 'work',
        date: '8/22',
        reason: null,
        resumeDate: null,
        plannedMt: '570',
      },
    });
    expect(reports[0].allocations).toEqual([
      {
        consignee: 'MMP',
        amount: 143.33,
        loads: [{ sourceVessel: 'N/STAR', hatch: '#1-A', amount: 143.33 }],
      },
      {
        consignee: 'AAI',
        amount: 132.55,
        loads: [{ sourceVessel: 'S/SPR', hatch: '#2-B', amount: 132.55 }],
      },
      {
        consignee: 'TUM',
        amount: 123.51,
        loads: [
          { sourceVessel: 'N/STAR', hatch: '#3-A', amount: 62.69 },
          { sourceVessel: 'N/STAR', hatch: '#3-B', amount: 60.82 },
        ],
      },
      {
        consignee: 'RMK',
        amount: 106.59,
        loads: [
          { sourceVessel: 'MOAMARI', hatch: '#4-A', amount: 4.99 },
          { sourceVessel: 'MOAMARI', hatch: '#4-B', amount: 101.6 },
        ],
      },
    ]);
    expect(reports[0].observations).toEqual([
      { sourceVessel: 'N/STAR', hatch: '#1-A', temperaturesC: [-22, -23] },
      { sourceVessel: 'S/SPR', hatch: '#2-B', temperaturesC: [-23] },
      { sourceVessel: 'N/STAR', hatch: '#3-A', temperaturesC: [-19, -21] },
      { sourceVessel: 'N/STAR', hatch: '#3-B', temperaturesC: [-23, -24] },
      { sourceVessel: 'MOAMARI', hatch: '#4-A', temperaturesC: [-21] },
      { sourceVessel: 'MOAMARI', hatch: '#4-B', temperaturesC: [-23, -24] },
    ]);
    expect(reports[0].quality).toContain('#4-B 차량 대기 12:00~13:00');
    expect(reports[0].quality).toContain('#1-A 차량 대기 10:30~11:00·11:30~13:00');
    expect(reports[0].quality).toContain('TUM/H1A1+1B1(N.STAR) 180 MT 08:00');
    expect(reports[0].quality).toContain('AAI/H2B1(S.SPRINTER) 120 MT 08:00');
    expect(reports[0].quality).toContain('CMC/H3B1(N.STAR) 120 MT 08:00(BKK)');
    expect(reports[0].quality).toContain('ISA/H4B1(N.STAR) 150 MT 08:00');
  });

  it('publishes the source-backed August 22 discharge and the user-provided August 23 plan', async () => {
    const vessel = await loadHikari();
    const reports = vessel.timeline.filter((entry: { date: string }) => entry.date === '8/22');

    expect(reports).toHaveLength(1);
    expect(reports[0]).toMatchObject({
      date: '8/22',
      time: '08:10 ~ 16:50',
      targetHol: 'N/STAR(#1-A:78.540,#1-B:108.800), S/SPR(#2-B:154.610), N/STAR(#3-B:104.020), MOAMARI(#4-B:155.450)',
      consignee: 'TUM · AAI · CMC · ISA',
      dailyAmount: 601.42,
      cumAmount: 1404.46,
      remainingAmount: 1524.54,
      speciesAmounts: { SJ: 550.02, YF: 51.4 },
      nextDay: {
        kind: 'work',
        date: '8/23',
        reason: null,
        resumeDate: null,
        plannedMt: '87',
      },
    });
    expect(reports[0].allocations).toEqual([
      {
        consignee: 'TUM',
        amount: 187.34,
        loads: [
          { sourceVessel: 'N/STAR', hatch: '#1-A', amount: 78.54 },
          { sourceVessel: 'N/STAR', hatch: '#1-B', amount: 108.8 },
        ],
      },
      {
        consignee: 'AAI',
        amount: 154.61,
        loads: [{ sourceVessel: 'S/SPR', hatch: '#2-B', amount: 154.61 }],
      },
      {
        consignee: 'CMC',
        amount: 104.02,
        loads: [{ sourceVessel: 'N/STAR', hatch: '#3-B', amount: 104.02 }],
      },
      {
        consignee: 'ISA',
        amount: 155.45,
        loads: [{ sourceVessel: 'MOAMARI', hatch: '#4-B', amount: 155.45 }],
      },
    ]);
    expect(reports[0].observations).toEqual([
      { sourceVessel: 'N/STAR', hatch: '#1-A', temperaturesC: [-22] },
      { sourceVessel: 'N/STAR', hatch: '#1-B', temperaturesC: [-23] },
      { sourceVessel: 'S/SPR', hatch: '#2-B', temperaturesC: [-22, -23] },
      { sourceVessel: 'N/STAR', hatch: '#3-B', temperaturesC: [-22, -23] },
      { sourceVessel: 'MOAMARI', hatch: '#4-B', temperaturesC: [-19, -24] },
    ]);
    expect(reports[0].quality).toContain('원문 온도 표기는 #2-B·#3-B ‘-22,23’ 및 #4-B ‘-19,24’(단위: ℃)');
    expect(reports[0].quality).toContain('#3-B CMC 차량 대기 10:10~11:20');
    expect(reports[0].quality).toContain('AAI 차량 수리 15:20~16:50(70-7297)');
    expect(reports[0].quality).toContain('우천 13:00~14:00');
    expect(reports[0].quality).toContain('CMC/H3B1(N.STAR) 87 MT 08:00 (GO TO SONGKHLA)');
  });

  it('publishes the source-backed August 23 discharge and the user-provided August 24 plan', async () => {
    const vessel = await loadHikari();
    const reports = vessel.timeline.filter((entry: { date: string }) => entry.date === '8/23');

    expect(reports).toHaveLength(1);
    expect(reports[0]).toMatchObject({
      date: '8/23',
      time: '08:20 ~ 11:50',
      targetHol: 'N/STAR(#3-B:90.420)',
      consignee: 'CMC',
      dailyAmount: 90.42,
      cumAmount: 1494.88,
      remainingAmount: 1434.12,
      speciesAmounts: { SJ: 83.62, YF: 6.8 },
      nextDay: {
        kind: 'work',
        date: '8/24',
        reason: null,
        resumeDate: null,
        plannedMt: '390',
      },
    });
    expect(reports[0].allocations).toEqual([
      {
        consignee: 'CMC',
        amount: 90.42,
        loads: [{ sourceVessel: 'N/STAR', hatch: '#3-B', amount: 90.42 }],
      },
    ]);
    expect(reports[0].observations).toEqual([
      { sourceVessel: 'N/STAR', hatch: '#3-B', temperaturesC: [-22, 24] },
    ]);
    expect(reports[0].quality).toContain('원문 온도 표기는 -22,24℃');
    expect(reports[0].quality).toContain('AAI/H2B1(S.SPRINTER) 120 MT 08:00');
    expect(reports[0].quality).toContain('CMC/H3B1(N.STAR) 120 MT 08:00(GO TO SONGKHLA 1 TRUCK)');
    expect(reports[0].quality).toContain('ISA/H4B1(N.STAR) 150 MT 08:00');
  });

  it('publishes the source-backed August 24 discharge without inventing an August 25 plan', async () => {
    const vessel = await loadHikari();
    const reports = vessel.timeline.filter((entry: { date: string }) => entry.date === '8/24');

    expect(reports).toHaveLength(1);
    expect(reports[0]).toMatchObject({
      date: '8/24',
      time: '08:10 ~ 13:50',
      targetHol: 'N/STAR(#3-B:116.230), S/SPR(#2-B:77.670,#2-C:66.470), MOAMARI(#4-B:134.110)',
      consignee: 'CMC · AAI · ISA',
      dailyAmount: 394.48,
      cumAmount: 1889.36,
      remainingAmount: 1039.64,
      speciesAmounts: { SJ: 362.68, YF: 31.8 },
      nextDay: {
        kind: 'work',
        date: '8/25',
        reason: null,
        resumeDate: null,
        plannedMt: null,
      },
    });
    expect(reports[0].allocations).toEqual([
      {
        consignee: 'CMC',
        amount: 116.23,
        loads: [{ sourceVessel: 'N/STAR', hatch: '#3-B', amount: 116.23 }],
      },
      {
        consignee: 'AAI',
        amount: 144.14,
        loads: [
          { sourceVessel: 'S/SPR', hatch: '#2-B', amount: 77.67 },
          { sourceVessel: 'S/SPR', hatch: '#2-C', amount: 66.47 },
        ],
      },
      {
        consignee: 'ISA',
        amount: 134.11,
        loads: [{ sourceVessel: 'MOAMARI', hatch: '#4-B', amount: 134.11 }],
      },
    ]);
    expect(reports[0].observations).toEqual([
      { sourceVessel: 'N/STAR', hatch: '#3-B', temperaturesC: [-21] },
      { sourceVessel: 'S/SPR', hatch: '#2-B', temperaturesC: [-21, 22] },
      { sourceVessel: 'S/SPR', hatch: '#2-C', temperaturesC: [-21] },
      { sourceVessel: 'MOAMARI', hatch: '#4-B', temperaturesC: [-23, 23] },
    ]);
    expect(reports[0].quality).toContain('원문 온도 표기는 #2-B ‘-21,22’ 및 #4-B ‘-23,23’(단위: ℃)');
    expect(reports[0].quality).toContain('REEFER TRUCK #1 12.910 MT');
    expect(reports[0].quality).toContain('TOTAL 26 TRUCKS');
  });

  it('matches the FCF breakdown by species and source vessel', async () => {
    const vessel = await loadHikari();

    expect(vessel.species).toEqual([
      expect.objectContaining({ id: 'SJ', name: '가다랑어', reported: 2515, actual: 1602.74 }),
      expect.objectContaining({ id: 'YF', name: '황다랑어', reported: 358, actual: 286.62 }),
      expect.objectContaining({ id: 'BE', name: '눈다랑어', reported: 56, actual: 0 }),
    ]);
    expect(vessel.species.reduce((sum: number, item: { reported: number }) => sum + item.reported, 0)).toBe(2929);
    expect(vessel.species.reduce((sum: number, item: { actual: number }) => sum + item.actual, 0)).toBeCloseTo(1889.36, 6);
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
    expect(holds['#1-A'].lastTemperature).toBe(-22);
    expect(holds['#1-B'].lastTemperature).toBe(-23);
    expect(holds['#2-B'].lastTemperature).toBe(1);
    expect(holds['#2-C'].lastTemperature).toBe(-21);
    expect(holds['#3-A'].lastTemperature).toBe(-20);
    expect(holds['#3-B'].lastTemperature).toBe(-21);
    expect(holds['#4-A'].lastTemperature).toBe(-21);
    expect(holds['#4-B'].lastTemperature).toBe(0);
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
