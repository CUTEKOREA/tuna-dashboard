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
  return payload.data.hikari;
}

describe('HIKARI 1 Bangkok unloading plan', () => {
  it('keeps capacity, total cargo, and the FCF discharge target on separate bases', async () => {
    const vessel = await loadHikari();

    expect(vessel).toMatchObject({
      name: 'M/V HIKARI 1',
      location: '방콕, 태국',
      buyer: 'FCF CO.,LTD',
      status: '하역대기',
      reportedTotal: 2929,
      actualTotal: 0,
      surplus: -2929,
    });
    expect(vessel.timeline.at(-1).quality).toContain('정격 3,700 MT');
    expect(vessel.timeline.at(-1).quality).toContain('총 적재 3,214 MT');
    expect(vessel.timeline.at(-1).quality).toContain('FCF 방콕 하역대상 2,929 MT');
    expect(vessel.timeline.at(-1).quality).toContain('#2-A 별도 배정 285 MT');
  });

  it('publishes loading records without turning them into discharge results', async () => {
    const vessel = await loadHikari();

    expect(vessel.timeline.map((entry: { date: string }) => entry.date)).toEqual([
      '7/2~7/4',
      '7/14~7/15',
      '7/17~7/19',
      '7/17~7/20',
    ]);
    expect(vessel.timeline.every((entry: { dailyAmount: number }) => entry.dailyAmount === 0)).toBe(true);
    expect(vessel.timeline.every((entry: { cumAmount: number }) => entry.cumAmount === 0)).toBe(true);
    expect(vessel.timeline[0].quality).toContain('FCF 670 MT');
    expect(vessel.timeline[0].quality).toContain('황다랑어 96 MT 별도 배정');
    expect(vessel.timeline[1].quality).toContain('FCF 314 MT');
    expect(vessel.timeline[1].quality).toContain('황다랑어 114 MT 별도 배정');
    expect(vessel.timeline[2].quality).toContain('940 MT 전량 FCF');
    expect(vessel.timeline[3].quality).toContain('1,005 MT 전량 FCF');
  });

  it('matches the FCF breakdown by species and source vessel', async () => {
    const vessel = await loadHikari();

    expect(vessel.species).toEqual([
      expect.objectContaining({ id: 'SJ', name: '가다랑어', reported: 2515, actual: 0 }),
      expect.objectContaining({ id: 'YF', name: '황다랑어', reported: 358, actual: 0 }),
      expect.objectContaining({ id: 'BE', name: '눈다랑어', reported: 56, actual: 0 }),
    ]);
    expect(vessel.species.reduce((sum: number, item: { reported: number }) => sum + item.reported, 0)).toBe(2929);
    expect(vessel.motherVessel).toBe('S/SPR 670 · MOAKONA 314 · MOAMARI 940 · NAOERO STAR 1,005 MT');
  });

  it('maps only the FCF target to holds and leaves missing discharge temperatures unknown', async () => {
    const vessel = await loadHikari();
    const holds = parseVesselHoldData('hikari', vessel.timeline, vessel.reportedTotal);

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
    expect(Object.values(holds).every((hold) => hold.lastTemperature === null)).toBe(true);
  });

  it('shows an awaiting vessel as pending instead of completed or zero-day work', () => {
    expect(getVesselStatusKind('하역대기')).toBe('waiting');
    expect(getVesselStatusKind('하역중')).toBe('progress');
    expect(getVesselStatusKind('하역완료')).toBe('completed');
    expect(getUnloadingEtaLabel('하역대기', 2929, 0)).toBe('하역 실적 대기');
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
    expect(getVesselCargoBasis('hikari')).toEqual({
      sourceDate: '2026.07.20',
      capacity: 3700,
      totalLoaded: 3214,
      dischargeTarget: 2929,
      excludedCargo: 285,
    });
    expect(getVesselCargoBasis('sein-venus')).toBeNull();
  });
});
