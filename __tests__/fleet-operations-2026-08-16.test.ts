import { describe, expect, it } from 'vitest';

import {
  atlanticDailyReport,
  carrierLoads,
  kiribatiVds,
  longlineDailyReport,
  nationalVds,
  pacificDailyReport,
  purseSeineCatch,
} from '@/lib/fleet-operations-2026-08-16';

describe('2026-08-16 fleet operations sources', () => {
  it('reconciles the national VDS report at vessel and area grain', () => {
    expect(nationalVds.asOf).toBe('2026-08-23');
    expect(nationalVds.vessels).toHaveLength(6);
    expect(nationalVds.areas).toHaveLength(8);
    expect(nationalVds.totals).toEqual({ allocated: 1_447, consumed: 1_023.8, remaining: 423.2, weekly: 27.9 });

    const kiribati = nationalVds.areas.find((area) => area.area === '키리바시');
    expect(kiribati?.totals).toEqual({ allocated: 764, consumed: 739.2, remaining: 24.8, weekly: 21.9 });
    expect(kiribati?.rowSums.allocated).toBeCloseTo(763.98, 2);
    expect(kiribati?.rowSums.weekly).toBeCloseTo(21.9, 2);
    expect(nationalVds.areas.find((area) => area.area === '동부 공해')?.includedInGrandTotal).toBe(false);
    expect(nationalVds.areas.flatMap((item) => item.rows).filter((row) => row.remaining < 0)).toHaveLength(9);
  });

  it('keeps Kiribati VDS as a separate four-vessel population', () => {
    expect(kiribatiVds.asOf).toBe('2026-08-23');
    expect(kiribatiVds.vessels).toEqual(['MOAMARI', 'MOAKONA', 'NAOERO SUN', 'NAOERO STAR']);
    expect(kiribatiVds.totals).toEqual({ allocated: 750, consumed: 543, remaining: 207, weekly: 6.5 });
    expect(kiribatiVds.areas.find((area) => area.area === '키리바시')?.totals).toEqual({
      allocated: 381,
      consumed: 352.7,
      remaining: 28.2,
      weekly: 6.5,
    });
    expect(kiribatiVds.areas.find((area) => area.area === '파푸아뉴기니 양자')?.totals).toEqual({
      allocated: 108,
      consumed: 39.7,
      remaining: 68.3,
      weekly: 0,
    });
    expect(kiribatiVds.areas.find((area) => area.area === '투발루 양자')?.totals).toEqual({
      allocated: 95,
      consumed: 59.7,
      remaining: 35.3,
      weekly: 0,
    });
  });

  it('preserves the August second-week catch hierarchy and monthly reconciliation', () => {
    expect(purseSeineCatch.period).toEqual({ from: '2026-08-10', to: '2026-08-16' });
    expect(purseSeineCatch.summary).toEqual({
      nationalWeekly: 478,
      jointWeekly: 451,
      weeklyTotal: 929,
      nationalMonthly: 816,
      jointMonthly: 1_433,
      monthlyTotal: 2_249,
      nationalAnnual: 27_317,
      jointAnnual: 19_765,
      annualTotal: 47_082,
    });
    expect(purseSeineCatch.weeklyRanking.slice(0, 2)).toEqual([
      { rank: 1, captain: '강창훈', vessel: 'S/JUP', catchMt: 265, dailyAverageMt: 37.86 },
      { rank: 2, captain: '김형주', vessel: 'N/SUN', catchMt: 195, dailyAverageMt: 27.86 },
    ]);
    expect(purseSeineCatch.weeklyRanking.reduce((sum, vessel) => sum + vessel.catchMt, 0)).toBe(929);
    const nationalVessels = new Set(nationalVds.vessels);
    expect(purseSeineCatch.weeklyRanking.filter((vessel) => nationalVessels.has(vessel.vessel)).reduce((sum, vessel) => sum + vessel.catchMt, 0)).toBe(478);
    expect(purseSeineCatch.weeklyRanking.filter((vessel) => !nationalVessels.has(vessel.vessel)).reduce((sum, vessel) => sum + vessel.catchMt, 0)).toBe(451);
    expect(purseSeineCatch.monthlyByVessel.reduce((sum, vessel) => sum + vessel.monthlyMt[7], 0)).toBe(2_249);
    expect(purseSeineCatch.monthlyByVessel.reduce((sum, vessel) => sum + vessel.totalMt, 0)).toBe(47_082);
    expect([...purseSeineCatch.seasonRanking].sort((a, b) => a.rank - b.rank)[0]).toMatchObject({ captain: '조태연', vessel: 'N/STAR', dailyCatchMt: 34.3, rank: 1 });
    expect(purseSeineCatch.seasonRanking.find((row) => row.vessel === 'S/EXP')?.leaderDeltaMt).toBe(-23.71);
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
