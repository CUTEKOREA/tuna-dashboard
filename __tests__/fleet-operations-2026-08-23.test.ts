import { describe, expect, it } from 'vitest';

import {
  atlanticDailyReport,
  carrierLoads,
  kiribatiVds,
  longlineDailyReport,
  nationalVds,
  pacificDailyReport,
  purseSeineCatch,
} from '@/lib/fleet-operations-2026-08-23';

describe('2026-09-13 fleet operations sources', () => {
  it('reconciles the national VDS report at vessel and area grain', () => {
    expect(nationalVds.asOf).toBe('2026-10-05');
    expect(nationalVds.vessels).toHaveLength(6);
    expect(nationalVds.areas).toHaveLength(8);
    expect(nationalVds.totals).toEqual({ allocated: 1_479.5, consumed: 1_239.1, remaining: 240.4, weekly: 28.9 });

    const kiribati = nationalVds.areas.find((area) => area.area === '키리바시');
    // 인쇄 소계를 그대로 둔다. 배정 763.98 대 764 는 1/6 반올림이지만,
    // 소진 752.5 대 752.6 은 반올림으로 생길 수 없는 0.10 차이다 — 소진일은 소수 1자리다.
    // 09-13 판부터 네 판째 같은 0.1 어긋남이 이어진다(10-05 판 행 합 752.5 · 인쇄 752.6).
    expect(kiribati?.totals).toEqual({ allocated: 764, consumed: 752.6, remaining: 11.5, weekly: -2.4 });
    expect(kiribati?.rowSums.allocated).toBeCloseTo(763.98, 2);
    expect(kiribati?.rowSums.consumed).toBeCloseTo(752.5, 2);
    // 국적 총합계 소진 1,239.1 은 수역 소계 합(1,239.2)이 아니라 선박 행을 더한 값과 맞는다
    const counted = nationalVds.areas.filter((area) => area.includedInGrandTotal);
    expect(counted.reduce((sum, area) => sum + area.rowSums.consumed, 0)).toBeCloseTo(1_239.1, 2);
    // 키리바시 주간 소모 음수 2칸(S/CHA -1.4 · S/HAR -1.0) - 지난 판 추정 소진의 되돌림
    expect(kiribati?.rowSums.weekly).toBeCloseTo(-2.4, 2);
    expect(nationalVds.areas.find((area) => area.area === '동부 공해')?.includedInGrandTotal).toBe(false);
    // 10-05 판: 솔로몬 배정이 44 → 66.5일로 늘어 S/EXP(-0.47)는 초과가 풀렸고 S/HAR 는 -0.17 → -1.72 로 커졌다. 11칸 → 10칸
    expect(nationalVds.areas.flatMap((item) => item.rows).filter((row) => row.remaining < 0)).toHaveLength(10);
  });

  it('keeps Kiribati VDS as a separate four-vessel population', () => {
    expect(kiribatiVds.asOf).toBe('2026-10-05');
    expect(kiribatiVds.vessels).toEqual(['MOAMARI', 'MOAKONA', 'NAOERO SUN', 'NAOERO STAR']);
    expect(kiribatiVds.totals).toEqual({ allocated: 767.5, consumed: 607.8, remaining: 159.7, weekly: 9.3 });
    expect(kiribatiVds.areas.find((area) => area.area === '키리바시')?.totals).toEqual({
      allocated: 431,
      consumed: 406.5,
      remaining: 24.5,
      weekly: -1.9,
    });
    expect(kiribatiVds.areas.find((area) => area.area === '파푸아뉴기니 양자')?.totals).toEqual({
      allocated: 88,
      consumed: 39.7,
      remaining: 48.3,
      weekly: 0,
    });
    expect(kiribatiVds.areas.find((area) => area.area === '투발루 양자')?.totals).toEqual({
      allocated: 85,
      consumed: 59.7,
      remaining: 25.3,
      weekly: 0,
    });
  });

  it('preserves the October first-week catch hierarchy and monthly reconciliation', () => {
    expect(purseSeineCatch.period).toEqual({ from: '2026-09-28', to: '2026-10-04' });
    expect(purseSeineCatch.summary).toEqual({
      nationalWeekly: 1_550,
      jointWeekly: 875,
      weeklyTotal: 2_425,
      nationalMonthly: 915,
      jointMonthly: 440,
      monthlyTotal: 1_355,
      nationalAnnual: 32_691,
      jointAnnual: 23_277,
      annualTotal: 55_968,
    });
    expect(purseSeineCatch.weeklyRanking).toEqual([
      { rank: 1, captain: '김형주', vessel: 'N/SUN', catchMt: 640, dailyAverageMt: 91.43 },
      { rank: 2, captain: '공준식', vessel: 'S/EXP', catchMt: 440, dailyAverageMt: 62.86 },
      { rank: 3, captain: '김승현', vessel: 'S/PIO', catchMt: 440, dailyAverageMt: 62.86 },
      { rank: 4, captain: '최용석', vessel: 'S/CHA', catchMt: 280, dailyAverageMt: 40 },
      { rank: 5, captain: '강창훈', vessel: 'S/JUP', catchMt: 260, dailyAverageMt: 37.14 },
      { rank: 6, captain: '이평규', vessel: 'KONA', catchMt: 180, dailyAverageMt: 25.71 },
      { rank: 7, captain: '오복근', vessel: 'S/HAR', catchMt: 130, dailyAverageMt: 18.57 },
      { rank: 8, captain: '이진우', vessel: 'N/STAR', catchMt: 55, dailyAverageMt: 7.86 },
      { rank: 9, captain: '김효원', vessel: 'S/SPR', catchMt: 0, dailyAverageMt: 0 },
      { rank: 10, captain: '김정훈', vessel: 'MARI', catchMt: 0, dailyAverageMt: 0 },
    ]);
    // 일평균은 주 7일 기준이다 - 조업일수가 아니라 달력 7일로 나눈 값
    for (const row of purseSeineCatch.weeklyRanking) {
      expect(Math.abs(row.catchMt / 7 - row.dailyAverageMt)).toBeLessThan(0.02);
    }
    expect(purseSeineCatch.weeklyRanking.reduce((sum, vessel) => sum + vessel.catchMt, 0)).toBe(2_425);
    const nationalVessels = new Set(nationalVds.vessels);
    expect(purseSeineCatch.weeklyRanking.filter((vessel) => nationalVessels.has(vessel.vessel)).reduce((sum, vessel) => sum + vessel.catchMt, 0)).toBe(1_550);
    expect(purseSeineCatch.weeklyRanking.filter((vessel) => !nationalVessels.has(vessel.vessel)).reduce((sum, vessel) => sum + vessel.catchMt, 0)).toBe(875);
    // 월별 계열은 아직 8월 넷째주 판이다. 10월 첫째주 보고의 월별 그래프도 스택 막대 이미지뿐이라
    // 월별 칸을 다 못 읽는다. 다만 선박별 연간 라벨 합은 인쇄 연간과 맞는다(국적 6척 32,691 · 합작 4척 23,277).
    expect(purseSeineCatch.monthlySeriesAsOf).toBe('2026-08-30');
    expect(purseSeineCatch.monthlyByVessel.every((v) => v.monthlyMt.length === 8)).toBe(true);
    expect(purseSeineCatch.monthlyByVessel.reduce((sum, vessel) => sum + vessel.totalMt, 0))
      .toBeLessThan(purseSeineCatch.summary.annualTotal);
    expect(purseSeineCatch.seasonAverageDailyMt).toBe(19.5);
    expect([...purseSeineCatch.seasonRanking].sort((a, b) => a.rank - b.rank)[0]).toMatchObject({ captain: '김효원', vessel: 'S/SPR', dailyCatchMt: 25.7, rank: 1 });
    // 현어기 일어획량 = 어획량 ÷ 어기일수. 원문 반올림 폭 안에서만 허용한다
    for (const row of purseSeineCatch.seasonRanking) {
      expect(Math.abs(row.catchMt / row.seasonDays - row.dailyCatchMt)).toBeLessThan(0.06);
    }
    // 지난주(9/21~9/27) 누계 + 이번 주 어획 = 이번 주 누계, 어기일수는 모두 +7
    expect(purseSeineCatch.seasonRanking.find((row) => row.vessel === 'S/EXP')?.leaderDeltaMt).toBe(-9.4);
    expect(purseSeineCatch.seasonRanking.find((row) => row.vessel === 'N/STAR')).toMatchObject({
      captain: '이진우', boardingDate: '2026-08-19', seasonDays: 47, catchMt: 500, dailyCatchMt: 10.6, rank: 10,
    });
  });

  it('captures the latest daily report and carrier loading snapshot without mixing dates', () => {
    expect(longlineDailyReport.asOf).toBe('2026-08-19');
    expect(longlineDailyReport.vessels.map((vessel) => vessel.name)).toEqual(['TAIHO MARU', 'P-501', 'SY 56']);
    expect(pacificDailyReport).toMatchObject({ asOf: '2026-08-19', dailyCatchMt: 50, monthlyCatchMt: 2_384, annualCatchMt: 47_216.8 });
    expect(pacificDailyReport.vessels.map((vessel) => vessel.name)).toEqual([
      'S/EXP', 'S/PIO', 'S/CHA', 'S/HAR', 'S/JUP', 'S/SPR', 'MOAMARI', 'MOAKONA', 'NAOERO SUN', 'NAOERO STAR',
    ]);
    // 어획이 있는 배만 추린다. 보고서에서 «-» 인 칸을 0 으로 옮겼는지 여기서 드러난다.
    expect(pacificDailyReport.vessels.filter((vessel) => vessel.catchMt > 0).map(({ name, catchMt }) => ({ name, catchMt }))).toEqual([
      { name: 'NAOERO SUN', catchMt: 50 },
    ]);
    // 선박별 합이 보고서가 선언한 일간 총계와 맞아야 한다 — 옮겨 적기의 검산이다.
    expect(pacificDailyReport.vessels.reduce((sum, vessel) => sum + vessel.catchMt, 0)).toBe(50);
    expect(atlanticDailyReport.asOf).toBe('2026-08-19');
    expect(atlanticDailyReport).toMatchObject({ dailyCatchMt: 315, monthlyCatchMt: 3_425, annualCatchMt: 30_150 });
    expect(atlanticDailyReport.vessels.reduce((sum, vessel) => sum + vessel.catchMt, 0)).toBe(315);
    expect(carrierLoads.asOf).toBe('2026-08-19');
    expect(carrierLoads.loadedTotalMt).toBeCloseTo(11_492.3, 1);
    expect(carrierLoads.expectedRemainingMt).toBeCloseTo(6_317.7, 1);
    expect(carrierLoads.vessels.reduce((sum, vessel) => sum + vessel.loadedMt, 0)).toBeCloseTo(11_492.3, 1);
    expect(carrierLoads.vessels.reduce((sum, vessel) => sum + vessel.expectedRemainingMt, 0)).toBeCloseTo(6_317.7, 1);
    expect(carrierLoads.vessels.filter((vessel) => !vessel.name.includes('컨테이너'))).toHaveLength(6);
    expect(carrierLoads.vessels.find((vessel) => vessel.name === 'HIKARI 1')?.loadedMt).toBeCloseTo(2_929.17, 2);
  });
});
