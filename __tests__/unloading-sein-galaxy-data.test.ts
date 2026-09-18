import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { GET } from '@/app/api/unloading-db/route';
import { getVesselStatusKind } from '@/lib/unloading-operations';
import { getVesselCargoBasis } from '@/components/UnloadingStatus';
import UnloadingVoyageGantt, { reportDateMs } from '@/components/UnloadingVoyageGantt';

const VESSEL_ID = 'sein-galaxy-bangkok-2026-09';

async function loadSeinGalaxy() {
  const response = await GET();
  const payload = await response.json();

  expect(response.status).toBe(200);
  expect(payload.success).toBe(true);
  return payload.data[VESSEL_ID];
}

describe('SEIN GALAXY 방콕 항차', () => {
  it('9/17 접안·9/18 첫 하역으로 하역중 상태가 된다', async () => {
    const vessel = await loadSeinGalaxy();

    expect(vessel).toMatchObject({
      name: 'M/V SEIN GALAXY',
      location: '방콕, 태국',
      buyer: 'FCF CO.,LTD',
      status: '하역중',
      reportedTotal: 1_846,
      motherVessel: 'MOAKONA 956 · MOAMARI 890 MT',
      dateRange: '2026.09.18 ~ 진행중',
      // K GROUP 하역보고 «ARRIVED ON SEPTEMBER 17» - 체선 계산은 접안일부터 센다.
      arrivalDate: '2026-09-17',
    });
    expect(vessel.actualTotal).toBeCloseTo(242.49, 6);
    expect(getVesselStatusKind(vessel.status)).toBe('progress');
  });

  it('9/18 하역을 화주·원선·어창별로 원문과 맞춘다', async () => {
    const vessel = await loadSeinGalaxy();
    const reports = vessel.timeline.filter((entry: { date: string }) => entry.date === '9/18');

    expect(reports).toHaveLength(1);
    const [day] = reports;
    expect(day).toMatchObject({ time: '08:30 ~ 14:40', dailyAmount: 242.49, cumAmount: 242.49, consignee: 'UC · GFF' });
    // K GROUP Report No.1 과 계근표 2장(UNICORD 102.020 · GLOBAL FROZEN FOOD 140.470)
    expect(day.allocations).toEqual([
      {
        consignee: 'UC',
        amount: 102.02,
        loads: [
          { sourceVessel: 'MOAKONA', hatch: '#1-B', amount: 44.42 },
          { sourceVessel: 'MOAKONA', hatch: '#1-C', amount: 57.6 },
        ],
      },
      {
        consignee: 'GFF',
        amount: 140.47,
        loads: [
          { sourceVessel: 'MOAMARI', hatch: '#3-A', amount: 23.08 },
          { sourceVessel: 'MOAMARI', hatch: '#3-B', amount: 117.39 },
        ],
      },
    ]);
    expect(day.observations.map((o: { hatch: string; temperaturesC: number[] }) => [o.hatch, o.temperaturesC]))
      .toEqual([['#1-B', [-24, -25]], ['#1-C', [-22, -23]], ['#3-A', [-22, -23]], ['#3-B', [-22, -23]]]);
    // 결과보고 XLS: YF 156.67 (MOAKONA 16.20 + MOAMARI 140.47) · SJ 85.82
    expect(day.speciesAmounts).toEqual({ SJ: 85.82, YF: 156.67 });
    expect(day.remainingAmount).toBeCloseTo(1_603.51, 6);
    expect(day.remainingAmount + day.cumAmount).toBeCloseTo(vessel.reportedTotal, 6);
    // 9/19 계획: RMK 150 + ISA 24 + UN 150
    expect(day.nextDay).toMatchObject({ kind: 'work', date: '9/19', plannedMt: '324' });
    expect(day.quality).toContain('TOTAL 18 TRUCKS');
    expect(day.quality).toContain('B/L 155 MT 대비 하역은 140.470 MT(-14.530 MT)');
    expect(day.quality).toContain('UN/H4B1(MOAMARI) 150 MT 08:00');
  });

  it('항차 개요는 선적기록을 하역 보고로 세지 않는다', async () => {
    const response = await GET();
    const { data } = await response.json();
    const markup = renderToStaticMarkup(React.createElement(UnloadingVoyageGantt as React.ComponentType<{ vesselsById: unknown }>, { vesselsById: data }));
    const stat = (label: string) => markup.match(new RegExp(`${label}</span><span[^>]*>([^<]+)<`))?.[1];

    // 6/12~6/15 선적기록 2건을 세면 보고 3회·일평균 80.8 로 첫 하역일 실적이 1/3 로 준다.
    expect(markup).toContain('M/V SEIN GALAXY');
    expect(stat('보고 횟수 \\(회\\)')).toBe('1');
    expect(stat('일평균 \\(MT/일\\)')).toBe('242.5');
  });

  it('어종 보고량은 선적서류, 실적은 결과보고 XLS 를 따른다', async () => {
    const vessel = await loadSeinGalaxy();
    const byId = Object.fromEntries(vessel.species.map((s: { id: string; reported: number; actual: number }) => [s.id, [s.reported, s.actual]]));

    // 보고량은 NOAA Form 370 초안 2부의 kg 표기를 톤으로 옮긴 값이다.
    // XLS 는 BE 를 SJ 에 합쳐(1,338 = 1,306 + 32) 실적도 SJ·YF 두 항목만 준다 - BE 실적은 0 으로 둔다.
    expect(byId).toEqual({ SJ: [1_306, 85.82], YF: [508, 156.67], BE: [32, 0] });
    expect(vessel.species.reduce((sum: number, s: { reported: number }) => sum + s.reported, 0))
      .toBe(vessel.reportedTotal);
    expect(vessel.species.reduce((sum: number, s: { actual: number }) => sum + s.actual, 0))
      .toBeCloseTo(vessel.actualTotal, 6);
    expect(vessel.speciesBreakdownNote).toContain('1,338 MT');
  });

  it('적하계획의 어창 배치가 원선별 물량과 맞는다', async () => {
    const vessel = await loadSeinGalaxy();
    const loading = vessel.timeline.filter((row: { time: string }) => row.time === '선적기록');
    const holdTotal = (vesselName: string) => {
      const entry = loading.find((row: { targetHol: string }) => row.targetHol.startsWith(vesselName));
      expect(entry, vesselName).toBeDefined();
      return [...entry.targetHol.matchAll(/:(\d+(?:\.\d+)?)/g)]
        .reduce((sum, match) => sum + Number(match[1]), 0);
    };

    expect(loading).toHaveLength(2);
    /* 선적은 6월, 접안은 9월이라 항차 시작 연도로 보정하면 2027 년으로 밀린다.
     * 보고에 연도를 명시해 간트와 «최신 보고» 라벨이 2026.06.15 로 읽게 한다. */
    for (const row of vessel.timeline) expect(row.reportYear).toBe(2026);
    // 선적기록이라 일일 하역량은 0 이다 - 하역 실적 차트에 잡히면 안 된다.
    for (const row of loading) expect(row.dailyAmount).toBe(0);
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
      // HIKARI 의 «#2-A 별도 배정» 이 아니다 - 같은 배에 실린 다른 회사 화물이다.
      excludedLabel: '타사 화물',
    });
    expect(basis.dischargeTarget + basis.excludedCargo).toBe(basis.totalLoaded);
    expect(basis.totalLoaded).toBeLessThanOrEqual(basis.capacity);
  });
});
