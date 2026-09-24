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
    // 9/18 242.490 + 9/19 329.240 + 9/21 150.510 + 9/22 165.450 + 9/23 286.440
    expect(vessel.actualTotal).toBeCloseTo(1_174.13, 6);
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

  it('9/19 하역(K GROUP Report No.2)과 일요일 휴무·9/21 재개 계획을 싣는다', async () => {
    const vessel = await loadSeinGalaxy();
    const [day] = vessel.timeline.filter((entry: { date: string }) => entry.date === '9/19');

    expect(day).toMatchObject({ time: '08:50 ~ 16:20', dailyAmount: 329.24, consignee: 'ISA · UC · RMK' });
    expect(day.cumAmount).toBeCloseTo(571.73, 6);
    expect(day.allocations).toEqual([
      { consignee: 'ISA', amount: 29.1, loads: [{ sourceVessel: 'MOAKONA', hatch: '#2-B', amount: 29.1 }] },
      { consignee: 'UC', amount: 138.98, loads: [{ sourceVessel: 'MOAMARI', hatch: '#3-B', amount: 138.98 }] },
      { consignee: 'RMK', amount: 161.16, loads: [{ sourceVessel: 'MOAKONA', hatch: '#1-C', amount: 161.16 }] },
    ]);
    expect(day.observations.map((o: { hatch: string; temperaturesC: number[] }) => [o.hatch, o.temperaturesC]))
      .toEqual([['#2-B', [-21, -22]], ['#3-B', [-25, -26]], ['#1-C', [-23, -24]]]);
    // 결과보고 XLS 09-19 시트: YF 49.10 (MOAKONA 30.60 + MOAMARI 18.50) · SJ 280.14
    expect(day.speciesAmounts).toEqual({ SJ: 280.14, YF: 49.1 });
    expect(day.remainingAmount).toBeCloseTo(1_274.27, 6);
    expect(day.remainingAmount + day.cumAmount).toBeCloseTo(vessel.reportedTotal, 6);
    // 9/20 은 일요일 - 9/21 UN 150 MT 로 재개
    expect(day.nextDay).toEqual({ kind: 'no_work', date: '9/20', reason: '일요일', resumeDate: '9/21', plannedMt: '150' });
    expect(day.quality).toContain('TOTAL 22 TRUCKS');
    expect(day.quality).toContain('K GROUP BALANCE +16.180');
    expect(day.quality).toContain('9/21 UN/H4B1(MOAMARI) 150 MT 09:00');
    // 원선별 합계가 최신 결과보고 XLS 누계와 맞는다 - 09-23 시트 MOAKONA 528.30 · MOAMARI 645.83
    const bySource = (name: string) => vessel.timeline
      .flatMap((entry: { allocations: { loads: { sourceVessel: string; amount: number }[] }[] }) => entry.allocations)
      .flatMap((allocation: { loads: { sourceVessel: string; amount: number }[] }) => allocation.loads)
      .filter((load: { sourceVessel: string }) => load.sourceVessel === name)
      .reduce((sum: number, load: { amount: number }) => sum + load.amount, 0);
    expect(bySource('MOAKONA')).toBeCloseTo(528.3, 6);
    expect(bySource('MOAMARI')).toBeCloseTo(645.83, 6);
  });

  it('9/21 하역(K GROUP Report No.3) - 반나절 단일 어창, 9/22 계획 180 MT', async () => {
    const vessel = await loadSeinGalaxy();
    const [day] = vessel.timeline.filter((entry: { date: string }) => entry.date === '9/21');

    expect(day).toMatchObject({ time: '08:00 ~ 12:00', dailyAmount: 150.51, consignee: 'UC' });
    expect(day.cumAmount).toBeCloseTo(722.24, 6);
    expect(day.allocations).toEqual([
      { consignee: 'UC', amount: 150.51, loads: [{ sourceVessel: 'MOAMARI', hatch: '#3-B', amount: 150.51 }] },
    ]);
    // 결과보고 XLS 09-21 시트: YF 20.40 · SJ 130.11 (전부 MOAMARI)
    expect(day.speciesAmounts).toEqual({ SJ: 130.11, YF: 20.4 });
    expect(day.remainingAmount).toBeCloseTo(1_123.76, 6);
    expect(day.remainingAmount + day.cumAmount).toBeCloseTo(vessel.reportedTotal, 6);
    // 9/22 계획은 원자료에 없어 사용자가 따로 전달했다: UN/H3B1->3C2->2B1(MOAMARI+MOAKONA) 180 MT
    expect(day.nextDay).toEqual({ kind: 'work', date: '9/22', reason: null, resumeDate: null, plannedMt: '180' });
    expect(day.quality).toContain('UN/H3B1->3C2->2B1(MOAMARI+MOAKONA) 180 MT 08:00');
    expect(day.quality).toContain('105.510 MT가 남았습니다');
  });

  it('9/22 하역(K GROUP Report No.4) - UC 의 MOAMARI 배정이 B/L 보다 16.72 MT 넘게 마감됐다', async () => {
    const vessel = await loadSeinGalaxy();
    const [day] = vessel.timeline.filter((entry: { date: string }) => entry.date === '9/22');

    expect(day).toMatchObject({ time: '08:00 ~ 13:20', dailyAmount: 165.45, consignee: 'UC' });
    expect(day.cumAmount).toBeCloseTo(887.69, 6);
    expect(day.allocations).toEqual([{
      consignee: 'UC',
      amount: 165.45,
      loads: [
        { sourceVessel: 'MOAMARI', hatch: '#3-B', amount: 15.09 },
        { sourceVessel: 'MOAMARI', hatch: '#3-C', amount: 107.14 },
        { sourceVessel: 'MOAKONA', hatch: '#2-B', amount: 43.22 },
      ],
    }]);
    expect(day.observations.map((o: { hatch: string; temperaturesC: number[] }) => [o.hatch, o.temperaturesC]))
      .toEqual([['#3-B', [-22, -23]], ['#3-C', [-22, -23]], ['#2-B', [-20, -21]]]);
    // 결과보고 XLS 09-22 시트: YF 23.10 (MOAKONA 8.20 + MOAMARI 14.90) · SJ 142.35
    expect(day.speciesAmounts).toEqual({ SJ: 142.35, YF: 23.1 });
    expect(day.remainingAmount).toBeCloseTo(958.31, 6);
    // 9/23 계획: UN 200 + CMC 90(송클라)
    expect(day.nextDay).toEqual({ kind: 'work', date: '9/23', reason: null, resumeDate: null, plannedMt: '290' });
    expect(day.quality).toContain('B/L 대비 +16.720 MT');
    // 9/22 계획은 메시지(180)와 현황 XLSX(150)가 달랐다 - 한쪽만 적지 않는다
    expect(day.quality).toContain('180 MT 대비 -14.550 MT');
    expect(day.quality).toContain('150 MT 대비 +15.450 MT');
    expect(day.quality).toContain('CMC/H4C1(MOAMARI) 90 MT 08:00(송클라)');

    // UC 의 MOAMARI 몫 누계 = 9/19 138.98 + 9/21 150.51 + 9/22 122.23 = 411.72
    const ucMoamari = vessel.timeline
      .flatMap((entry: { allocations: { consignee: string; loads: { sourceVessel: string; amount: number }[] }[] }) => entry.allocations)
      .filter((a: { consignee: string }) => a.consignee === 'UC')
      .flatMap((a: { loads: { sourceVessel: string; amount: number }[] }) => a.loads)
      .filter((l: { sourceVessel: string }) => l.sourceVessel === 'MOAMARI')
      .reduce((sum: number, l: { amount: number }) => sum + l.amount, 0);
    expect(ucMoamari).toBeCloseTo(411.72, 6);
  });

  it('9/23 하역(K GROUP Report No.5) - UC·CMC 두 화주가 하루에 붙었다', async () => {
    const vessel = await loadSeinGalaxy();
    const [day] = vessel.timeline.filter((entry: { date: string }) => entry.date === '9/23');

    expect(day).toMatchObject({ time: '08:00 ~ 15:20', dailyAmount: 286.44, consignee: 'UC · CMC' });
    expect(day.cumAmount).toBeCloseTo(1_174.13, 6);
    expect(day.allocations).toEqual([
      { consignee: 'UC', amount: 192.8, loads: [{ sourceVessel: 'MOAKONA', hatch: '#2-B', amount: 192.8 }] },
      { consignee: 'CMC', amount: 93.64, loads: [{ sourceVessel: 'MOAMARI', hatch: '#3-C', amount: 93.64 }] },
    ]);
    // 결과보고 XLS 09-23 시트: YF 73.40 · SJ 213.04
    expect(day.speciesAmounts).toEqual({ SJ: 213.04, YF: 73.4 });
    expect(day.remainingAmount).toBeCloseTo(671.87, 6);
    expect(day.remainingAmount + day.cumAmount).toBeCloseTo(vessel.reportedTotal, 6);
    // 9/24 계획은 원자료에 없어 사용자가 따로 전달했다: UN 200 + CMC 90 = 290 MT
    expect(day.nextDay).toEqual({ kind: 'work', date: '9/24', reason: null, resumeDate: null, plannedMt: '290' });
    expect(day.quality).toContain('UN/H2B1+2C1(MOAKONA) 200 MT 08:00');
    expect(day.quality).toContain('CMC/H4C1(MOAMARI) 90 MT 08:00(송클라)');
    expect(day.quality).toContain('TOTAL 20 TRUCKS');
    expect(day.quality).toContain('12:00~13:00 강우');
    // 사용자 전달 계획은 어창이 #4-C 였는데 실제 작업은 #3-C 였다 - 합계만 같다
    expect(day.quality).toContain('#3-C');
  });

  it('항차 개요는 선적기록을 하역 보고로 세지 않는다', async () => {
    const response = await GET();
    const { data } = await response.json();
    const markup = renderToStaticMarkup(React.createElement(UnloadingVoyageGantt as React.ComponentType<{ vesselsById: unknown }>, { vesselsById: data }));
    const stat = (label: string) => markup.match(new RegExp(`${label}</span><span[^>]*>([^<]+)<`))?.[1];

    // 6/12~6/15 선적기록 2건을 세면 첫 하역일(9/18) 기준 보고 3회·일평균 80.8 로 실적이 1/3 로 준다.
    expect(markup).toContain('M/V SEIN GALAXY');
    // 9/20 일요일은 보고가 없다 - 휴무일 행을 만들지 않고 차트가 공백으로 처리한다
    expect(stat('보고 횟수 \\(회\\)')).toBe('5');
    // (242.49 + 329.24 + 150.51 + 165.45 + 286.44) / 5
    expect(stat('일평균 \\(MT/일\\)')).toBe('234.8');
  });

  it('어종 보고량은 선적서류, 실적은 결과보고 XLS 를 따른다', async () => {
    const vessel = await loadSeinGalaxy();
    const byId = Object.fromEntries(vessel.species.map((s: { id: string; reported: number; actual: number }) => [s.id, [s.reported, s.actual]]));

    // 보고량은 NOAA Form 370 초안 2부의 kg 표기를 톤으로 옮긴 값이다.
    // XLS 는 BE 를 SJ 에 합쳐(1,338 = 1,306 + 32) 실적도 SJ·YF 두 항목만 준다 - BE 실적은 0 으로 둔다.
    expect(byId).toEqual({ SJ: [1_306, 851.46], YF: [508, 322.67], BE: [32, 0] });
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
