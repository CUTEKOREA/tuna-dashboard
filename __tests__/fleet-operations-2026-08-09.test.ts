import { describe, expect, it } from 'vitest';

import {
  atlanticDailyReport,
  carrierLoads,
  kiribatiVds,
  longlineDailyReport,
  nationalVds,
  pacificDailyReport,
  purseSeineCatch,
} from '@/lib/fleet-operations-2026-08-09';

describe('2026-08-09 fleet operations sources', () => {
  it('reconciles the national VDS report at vessel and area grain', () => {
    expect(nationalVds.asOf).toBe('2026-08-09');
    expect(nationalVds.vessels).toHaveLength(6);
    expect(nationalVds.areas).toHaveLength(8);
    expect(nationalVds.totals).toEqual({ allocated: 1_417, consumed: 965, remaining: 452, weekly: 18.8 });

    const kiribati = nationalVds.areas.find((area) => area.area === '키리바시');
    expect(kiribati?.totals).toEqual({ allocated: 734, consumed: 686.4, remaining: 47.6, weekly: 18.2 });
    expect(kiribati?.rowSums.weekly).toBeCloseTo(18.4, 2);
    expect(nationalVds.areas.find((area) => area.area === '동부 공해')?.includedInGrandTotal).toBe(false);
    expect(nationalVds.areas.flatMap((item) => item.rows).filter((row) => row.remaining < 0)).toHaveLength(10);
  });

  it('keeps Kiribati VDS as a separate four-vessel population', () => {
    expect(kiribatiVds.asOf).toBe('2026-08-09');
    expect(kiribatiVds.vessels).toEqual(['MOAMARI', 'MOAKONA', 'NAOERO SUN', 'NAOERO STAR']);
    expect(kiribatiVds.totals).toEqual({ allocated: 750, consumed: 521.8, remaining: 228.2, weekly: 20.3 });
    expect(kiribatiVds.areas.find((area) => area.area === '키리바시')?.totals).toEqual({
      allocated: 381,
      consumed: 331.6,
      remaining: 49.4,
      weekly: 20.3,
    });
  });

  it('preserves the August first-week catch hierarchy and monthly reconciliation', () => {
    expect(purseSeineCatch.period).toEqual({ from: '2026-08-03', to: '2026-08-09' });
    expect(purseSeineCatch.summary).toEqual({
      nationalWeekly: 218,
      jointWeekly: 393,
      weeklyTotal: 611,
      nationalMonthly: 338,
      jointMonthly: 982,
      monthlyTotal: 1_320,
      nationalAnnual: 26_839,
      jointAnnual: 19_314,
      annualTotal: 46_153,
    });
    expect(purseSeineCatch.weeklyRanking.slice(0, 2)).toEqual([
      { rank: 1, captain: '이평규', vessel: 'KONA', catchMt: 183, dailyAverageMt: 26.14 },
      { rank: 2, captain: '김정훈', vessel: 'MARI', catchMt: 140, dailyAverageMt: 20 },
    ]);
    expect(purseSeineCatch.weeklyRanking.reduce((sum, vessel) => sum + vessel.catchMt, 0)).toBe(611);
    const nationalVessels = new Set(nationalVds.vessels);
    expect(purseSeineCatch.weeklyRanking.filter((vessel) => nationalVessels.has(vessel.vessel)).reduce((sum, vessel) => sum + vessel.catchMt, 0)).toBe(218);
    expect(purseSeineCatch.weeklyRanking.filter((vessel) => !nationalVessels.has(vessel.vessel)).reduce((sum, vessel) => sum + vessel.catchMt, 0)).toBe(393);
    expect(purseSeineCatch.monthlyByVessel.reduce((sum, vessel) => sum + vessel.monthlyMt[7], 0)).toBe(1_320);
    expect(purseSeineCatch.monthlyByVessel.reduce((sum, vessel) => sum + vessel.totalMt, 0)).toBe(46_153);
    expect([...purseSeineCatch.seasonRanking].sort((a, b) => a.rank - b.rank)[0]).toMatchObject({ captain: '조태연', vessel: 'N/STAR', dailyCatchMt: 36.4, rank: 1 });
    expect(purseSeineCatch.seasonRanking.find((row) => row.vessel === 'S/EXP')?.leaderDeltaMt).toBe(-24.58);
  });

  it('captures the latest daily report and carrier loading snapshot without mixing dates', () => {
    expect(longlineDailyReport).toEqual({
      asOf: '2026-08-12',
      source: '해양수산본부 일일 업무보고-260812',
      vessels: [{ name: 'TAIHO MARU', loadedMt: 338.699, loadPlan: 'P-501, P-505', note: '8/12 부산 입항, 8/21·24~25 하역 예정' }],
    });
    expect(pacificDailyReport).toMatchObject({ asOf: '2026-08-11', dailyCatchMt: 176, monthlyCatchMt: 1_732, annualCatchMt: 46_564.8 });
    expect(pacificDailyReport.vessels.map((vessel) => vessel.name)).toEqual([
      'S/EXP', 'S/PIO', 'S/CHA', 'S/HAR', 'S/JUP', 'S/SPR', 'MOAMARI', 'MOAKONA', 'NAOERO SUN', 'NAOERO STAR',
    ]);
    expect(pacificDailyReport.vessels.filter((vessel) => vessel.catchMt > 0).map(({ name, catchMt }) => ({ name, catchMt }))).toEqual([
      { name: 'S/PIO', catchMt: 26 },
      { name: 'S/JUP', catchMt: 65 },
      { name: 'NAOERO STAR', catchMt: 85 },
    ]);
    expect(pacificDailyReport.vessels.reduce((sum, vessel) => sum + vessel.catchMt, 0)).toBe(176);
    expect(atlanticDailyReport.asOf).toBe('2026-08-11');
    expect(atlanticDailyReport).toMatchObject({ dailyCatchMt: 220, monthlyCatchMt: 1_635, annualCatchMt: 28_360 });
    expect(atlanticDailyReport.vessels.reduce((sum, vessel) => sum + vessel.catchMt, 0)).toBe(220);
    expect(carrierLoads.asOf).toBe('2026-08-12');
    expect(carrierLoads.loadedTotalMt).toBeCloseTo(9_922.3, 1);
    expect(carrierLoads.expectedRemainingMt).toBeCloseTo(7_887.7, 1);
    expect(carrierLoads.vessels.reduce((sum, vessel) => sum + vessel.loadedMt, 0)).toBeCloseTo(9_922.3, 1);
    expect(carrierLoads.vessels.reduce((sum, vessel) => sum + vessel.expectedRemainingMt, 0)).toBeCloseTo(7_887.7, 1);
    expect(carrierLoads.vessels.filter((vessel) => !vessel.name.includes('컨테이너'))).toHaveLength(6);
    expect(carrierLoads.vessels.find((vessel) => vessel.name === 'HIKARI 1')?.loadedMt).toBeCloseTo(2_929.17, 2);
  });
});
