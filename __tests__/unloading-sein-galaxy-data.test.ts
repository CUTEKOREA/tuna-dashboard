import { describe, expect, it } from 'vitest';

import { GET } from '@/app/api/unloading-db/route';
import { getUnloadingEtaLabel, getVesselStatusKind } from '@/lib/unloading-operations';
import { getVesselCargoBasis } from '@/components/UnloadingStatus';
import { reportDateMs } from '@/components/UnloadingVoyageGantt';

const VESSEL_ID = 'sein-galaxy-bangkok-2026-09';

async function loadSeinGalaxy() {
  const response = await GET();
  const payload = await response.json();

  expect(response.status).toBe(200);
  expect(payload.success).toBe(true);
  return payload.data[VESSEL_ID];
}

describe('SEIN GALAXY 방콕 항차 (접안 예정)', () => {
  it('접안 예정일과 전재 원선을 실적 없이 대기 상태로 싣는다', async () => {
    const vessel = await loadSeinGalaxy();

    expect(vessel).toMatchObject({
      name: 'M/V SEIN GALAXY',
      location: '방콕, 태국',
      buyer: 'FCF CO.,LTD',
      status: '하역대기',
      reportedTotal: 1_846,
      motherVessel: 'MOAKONA 956 · MOAMARI 890 MT',
    });
    expect(vessel.dateRange).toContain('2026.09.17');
    // 하역 보고가 시작되기 전이므로 실적은 0 이다 - 0 을 «하역 완료» 로 읽지 않게 상태로 가른다.
    expect(vessel.actualTotal).toBe(0);
    expect(getVesselStatusKind(vessel.status)).toBe('waiting');
    expect(getUnloadingEtaLabel(vessel.status, vessel.reportedTotal, 5)).toBe('하역 실적 대기');
  });

  it('어종 물량이 선적서류 합계와 맞는다', async () => {
    const vessel = await loadSeinGalaxy();
    const byId = Object.fromEntries(vessel.species.map((s: { id: string; reported: number }) => [s.id, s.reported]));

    // NOAA Form 370 초안 2부(MOAKONA·MOAMARI)의 kg 표기를 톤으로 옮긴 값이다.
    expect(byId).toEqual({ SJ: 1_306, YF: 508, BE: 32 });
    expect(vessel.species.reduce((sum: number, s: { reported: number }) => sum + s.reported, 0))
      .toBe(vessel.reportedTotal);
    for (const species of vessel.species) expect(species.actual).toBe(0);
  });

  it('적하계획의 어창 배치가 원선별 물량과 맞는다', async () => {
    const vessel = await loadSeinGalaxy();
    const holdTotal = (vesselName: string) => {
      const entry = vessel.timeline.find((row: { targetHol: string }) => row.targetHol.startsWith(vesselName));
      expect(entry, vesselName).toBeDefined();
      return [...entry.targetHol.matchAll(/:(\d+(?:\.\d+)?)/g)]
        .reduce((sum, match) => sum + Number(match[1]), 0);
    };

    expect(vessel.timeline).toHaveLength(2);
    /* 선적은 6월, 접안은 9월이라 항차 시작 연도로 보정하면 2027 년으로 밀린다.
     * 보고에 연도를 명시해 간트와 «최신 보고» 라벨이 2026.06.15 로 읽게 한다. */
    for (const row of vessel.timeline) expect(row.reportYear).toBe(2026);
    // 선적기록이라 일일 하역량은 0 이다 - 하역 실적 차트에 잡히면 안 된다.
    for (const row of vessel.timeline) expect(row.dailyAmount).toBe(0);
    expect(holdTotal('MOAKONA')).toBe(956);
    expect(holdTotal('MOAMARI')).toBe(890);
    expect(holdTotal('MOAKONA') + holdTotal('MOAMARI')).toBe(vessel.reportedTotal);
  });

  it('접안 전 선적기록을 다음 해로 밀지 않는다', () => {
    const range = '2026.09.17 방콕 접안 예정 · 하역실적 대기';

    // 연도를 안 적으면 항차 시작 월(9월)보다 이른 6월은 다음 해 보고로 본다 - 원래 해넘이 항차용 규칙이다.
    expect(reportDateMs(range, '6/12~6/15')).toBe(Date.UTC(2027, 5, 15));
    expect(reportDateMs(range, '6/12~6/15', 2026)).toBe(Date.UTC(2026, 5, 15));
    // 해를 넘기는 항차에서는 연도가 없을 때의 보정이 그대로 살아 있어야 한다.
    expect(reportDateMs('2025.12.18 ~ 2026.01.13', '1/13')).toBe(Date.UTC(2026, 0, 13));
  });

  it('타사 화물을 하역 목표에서 갈라 둔다', () => {
    const basis = getVesselCargoBasis(VESSEL_ID)!;

    // 9/14 일일업무보고: 선적 3,442 MT 중 우리 몫은 1,846 MT, 타사 1,596 MT 는 하역 대상이 아니다.
    expect(basis).toEqual({
      sourceDate: '2026.09.14',
      capacity: 3_500,
      totalLoaded: 3_442,
      dischargeTarget: 1_846,
      excludedCargo: 1_596,
    });
    expect(basis.dischargeTarget + basis.excludedCargo).toBe(basis.totalLoaded);
    expect(basis.totalLoaded).toBeLessThanOrEqual(basis.capacity);
  });
});
