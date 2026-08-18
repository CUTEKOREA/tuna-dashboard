export type VdsRow = {
  vessel: string;
  allocated: number;
  consumed: number;
  remaining: number;
  weekly: number;
};

export type VdsTotals = Omit<VdsRow, 'vessel'>;

export type VdsArea = {
  area: string;
  note?: string;
  rows: VdsRow[];
  rowSums: VdsTotals;
  totals: VdsTotals;
  includedInGrandTotal: boolean;
};

const totalVdsRows = (rows: VdsRow[]): VdsTotals => ({
  allocated: rows.reduce((sum, row) => sum + row.allocated, 0),
  consumed: rows.reduce((sum, row) => sum + row.consumed, 0),
  remaining: rows.reduce((sum, row) => sum + row.remaining, 0),
  weekly: rows.reduce((sum, row) => sum + row.weekly, 0),
});

const area = (areaName: string, rows: VdsRow[], printedTotals?: VdsTotals, note?: string, includedInGrandTotal = true): VdsArea => ({
  area: areaName,
  note,
  rows,
  rowSums: totalVdsRows(rows),
  totals: printedTotals ?? totalVdsRows(rows),
  includedInGrandTotal,
});

export const nationalVds = {
  asOf: '2026-08-09',
  source: '태평양 선망 VDS 현황_2026.08.09.pdf',
  vessels: ['S/EXP', 'S/PIO', 'S/CHA', 'S/HAR', 'S/JUP', 'S/SPR'],
  areas: [
    area('파푸아뉴기니', [
      { vessel: 'S/EXP', allocated: 55.17, consumed: 10, remaining: 45.17, weekly: 0 },
      { vessel: 'S/PIO', allocated: 55.17, consumed: 0.4, remaining: 54.77, weekly: 0 },
      { vessel: 'S/CHA', allocated: 55.17, consumed: 0.8, remaining: 54.37, weekly: 0 },
      { vessel: 'S/HAR', allocated: 55.17, consumed: 2.5, remaining: 52.67, weekly: 0 },
      { vessel: 'S/JUP', allocated: 55.17, consumed: 2.4, remaining: 52.77, weekly: 0 },
      { vessel: 'S/SPR', allocated: 55.17, consumed: 0, remaining: 55.17, weekly: 0 },
    ], { allocated: 331, consumed: 16.1, remaining: 314.9, weekly: 0 }),
    area('솔로몬제도', [
      { vessel: 'S/EXP', allocated: 7.33, consumed: 4.4, remaining: 2.93, weekly: 0 },
      { vessel: 'S/PIO', allocated: 7.33, consumed: 1.5, remaining: 5.83, weekly: 0 },
      { vessel: 'S/CHA', allocated: 7.33, consumed: 4.4, remaining: 2.93, weekly: 0 },
      { vessel: 'S/HAR', allocated: 7.33, consumed: 4.6, remaining: 2.73, weekly: 0 },
      { vessel: 'S/JUP', allocated: 7.33, consumed: 4.3, remaining: 3.03, weekly: 0 },
      { vessel: 'S/SPR', allocated: 7.33, consumed: 4.6, remaining: 2.73, weekly: 0 },
    ], { allocated: 44, consumed: 23.8, remaining: 20.2, weekly: 0 }),
    area('미크로네시아', [
      { vessel: 'S/EXP', allocated: 8.17, consumed: 12.8, remaining: -4.63, weekly: 0 },
      { vessel: 'S/PIO', allocated: 8.17, consumed: 0.3, remaining: 7.87, weekly: 0 },
      { vessel: 'S/CHA', allocated: 8.17, consumed: 1.1, remaining: 7.07, weekly: 0 },
      { vessel: 'S/HAR', allocated: 8.17, consumed: 0, remaining: 8.17, weekly: 0 },
      { vessel: 'S/JUP', allocated: 8.17, consumed: 0.7, remaining: 7.47, weekly: 0 },
      { vessel: 'S/SPR', allocated: 8.17, consumed: 0, remaining: 8.17, weekly: 0 },
    ], { allocated: 49, consumed: 14.9, remaining: 34.1, weekly: 0 }),
    area('키리바시', [
      { vessel: 'S/EXP', allocated: 122.33, consumed: 96.3, remaining: 26.03, weekly: 2.6 },
      { vessel: 'S/PIO', allocated: 122.33, consumed: 137.1, remaining: -14.77, weekly: 1.6 },
      { vessel: 'S/CHA', allocated: 122.33, consumed: 131.7, remaining: -9.37, weekly: 0.6 },
      { vessel: 'S/HAR', allocated: 122.33, consumed: 97.4, remaining: 24.93, weekly: 6.2 },
      { vessel: 'S/JUP', allocated: 122.33, consumed: 92.2, remaining: 30.13, weekly: 0.7 },
      { vessel: 'S/SPR', allocated: 122.33, consumed: 131.7, remaining: -9.37, weekly: 6.7 },
    ], { allocated: 734, consumed: 686.4, remaining: 47.6, weekly: 18.2 }),
    area('투발루', [
      { vessel: 'S/EXP', allocated: 17, consumed: 9.6, remaining: 7.4, weekly: 0 },
      { vessel: 'S/PIO', allocated: 17, consumed: 18.7, remaining: -1.7, weekly: 0 },
      { vessel: 'S/CHA', allocated: 17, consumed: 9.5, remaining: 7.5, weekly: 0 },
      { vessel: 'S/HAR', allocated: 17, consumed: 14.1, remaining: 2.9, weekly: 0 },
      { vessel: 'S/JUP', allocated: 17, consumed: 24.9, remaining: -7.9, weekly: 0 },
      { vessel: 'S/SPR', allocated: 17, consumed: 17.4, remaining: -0.4, weekly: 0 },
    ], { allocated: 102, consumed: 94.2, remaining: 7.8, weekly: 0 }),
    area('나우루', [
      { vessel: 'S/EXP', allocated: 23.67, consumed: 21.3, remaining: 2.37, weekly: 0 },
      { vessel: 'S/PIO', allocated: 23.67, consumed: 18.1, remaining: 5.57, weekly: 0 },
      { vessel: 'S/CHA', allocated: 23.67, consumed: 28.5, remaining: -4.83, weekly: 0 },
      { vessel: 'S/HAR', allocated: 23.67, consumed: 14, remaining: 9.67, weekly: 0 },
      { vessel: 'S/JUP', allocated: 23.67, consumed: 16.2, remaining: 7.47, weekly: 0 },
      { vessel: 'S/SPR', allocated: 23.67, consumed: 24.4, remaining: -0.73, weekly: 0 },
    ], { allocated: 142, consumed: 122.5, remaining: 19.5, weekly: 0 }),
    area('마샬군도', [
      { vessel: 'S/EXP', allocated: 5, consumed: 3.3, remaining: 1.7, weekly: 0 },
      { vessel: 'S/PIO', allocated: 0, consumed: 0, remaining: 0, weekly: 0 },
      { vessel: 'S/CHA', allocated: 0, consumed: 0, remaining: 0, weekly: 0 },
      { vessel: 'S/HAR', allocated: 5, consumed: 2.9, remaining: 2.1, weekly: 0 },
      { vessel: 'S/JUP', allocated: 0, consumed: 0.4, remaining: -0.4, weekly: 0.4 },
      { vessel: 'S/SPR', allocated: 5, consumed: 0.5, remaining: 4.5, weekly: 0 },
    ], { allocated: 15, consumed: 7.1, remaining: 7.9, weekly: 0.4 }),
    area('동부 공해', [
      { vessel: 'S/EXP', allocated: 8.63, consumed: 3, remaining: 5.63, weekly: 0 },
      { vessel: 'S/PIO', allocated: 8.63, consumed: 4, remaining: 4.63, weekly: 2 },
      { vessel: 'S/CHA', allocated: 8.63, consumed: 7, remaining: 1.63, weekly: 4 },
      { vessel: 'S/HAR', allocated: 8.63, consumed: 5, remaining: 3.63, weekly: 0 },
      { vessel: 'S/JUP', allocated: 8.63, consumed: 2, remaining: 6.63, weekly: 1 },
      { vessel: 'S/SPR', allocated: 8.63, consumed: 7, remaining: 1.63, weekly: 0 },
    ], { allocated: 51.75, consumed: 28, remaining: 23.75, weekly: 7 }, '소진일수에서 제외', false),
  ],
  totals: { allocated: 1_417, consumed: 965, remaining: 452, weekly: 18.8 },
};

export const kiribatiVds = {
  asOf: '2026-08-09',
  source: 'KFC 태평양 선망 VDS 현황_2026.08.09.pdf',
  vessels: ['MOAMARI', 'MOAKONA', 'NAOERO SUN', 'NAOERO STAR'],
  areas: [
    area('미크로네시아 협정', [
      { vessel: 'MOAMARI', allocated: 9.5, consumed: 5.2, remaining: 4.3, weekly: 0 },
      { vessel: 'MOAKONA', allocated: 9.5, consumed: 7.6, remaining: 1.9, weekly: 0 },
    ], { allocated: 19, consumed: 12.8, remaining: 6.2, weekly: 0 }),
    area('키리바시', [
      { vessel: 'MOAMARI', allocated: 95.25, consumed: 95.3, remaining: -0.05, weekly: 7 },
      { vessel: 'MOAKONA', allocated: 95.25, consumed: 80.6, remaining: 14.65, weekly: 7 },
      { vessel: 'NAOERO SUN', allocated: 95.25, consumed: 65.8, remaining: 29.45, weekly: 2.6 },
      { vessel: 'NAOERO STAR', allocated: 95.25, consumed: 89.9, remaining: 5.35, weekly: 3.7 },
    ], { allocated: 381, consumed: 331.6, remaining: 49.4, weekly: 20.3 }),
    area('미크로네시아 양자', [
      { vessel: 'MOAMARI', allocated: 8.75, consumed: 4, remaining: 4.75, weekly: 0 },
      { vessel: 'MOAKONA', allocated: 8.75, consumed: 3.5, remaining: 5.25, weekly: 0 },
      { vessel: 'NAOERO SUN', allocated: 8.75, consumed: 21.1, remaining: -12.35, weekly: 0 },
      { vessel: 'NAOERO STAR', allocated: 8.75, consumed: 6.3, remaining: 2.45, weekly: 0 },
    ], { allocated: 35, consumed: 34.9, remaining: 0.1, weekly: 0 }),
    area('나우루 양자', [
      { vessel: 'MOAMARI', allocated: 24, consumed: 7.8, remaining: 16.2, weekly: 0 },
      { vessel: 'MOAKONA', allocated: 24, consumed: 10.8, remaining: 13.2, weekly: 0 },
      { vessel: 'NAOERO SUN', allocated: 25, consumed: 2.5, remaining: 22.5, weekly: 0 },
      { vessel: 'NAOERO STAR', allocated: 25, consumed: 10.4, remaining: 14.6, weekly: 0 },
    ], { allocated: 98, consumed: 31.5, remaining: 66.5, weekly: 0 }),
    area('파푸아뉴기니 양자', [
      { vessel: 'MOAMARI', allocated: 32, consumed: 0, remaining: 32, weekly: 0 },
      { vessel: 'MOAKONA', allocated: 32, consumed: 23.7, remaining: 8.3, weekly: 0 },
      { vessel: 'NAOERO SUN', allocated: 32, consumed: 7.9, remaining: 24.1, weekly: 0 },
      { vessel: 'NAOERO STAR', allocated: 32, consumed: 8.1, remaining: 23.9, weekly: 0 },
    ], { allocated: 128, consumed: 39.7, remaining: 88.3, weekly: 0 }),
    area('솔로몬제도 양자', [
      { vessel: 'MOAMARI', allocated: 3.5, consumed: 3.6, remaining: -0.1, weekly: 0 },
      { vessel: 'MOAKONA', allocated: 3.5, consumed: 2.8, remaining: 0.7, weekly: 0 },
      { vessel: 'NAOERO SUN', allocated: 3.5, consumed: 3.2, remaining: 0.3, weekly: 0 },
      { vessel: 'NAOERO STAR', allocated: 3.5, consumed: 2, remaining: 1.5, weekly: 0 },
    ], { allocated: 14, consumed: 11.6, remaining: 2.4, weekly: 0 }),
    area('투발루 양자', [
      { vessel: 'MOAMARI', allocated: 18.75, consumed: 18.2, remaining: 0.55, weekly: 0 },
      { vessel: 'MOAKONA', allocated: 18.75, consumed: 9.3, remaining: 9.45, weekly: 0 },
      { vessel: 'NAOERO SUN', allocated: 18.75, consumed: 8, remaining: 10.75, weekly: 0 },
      { vessel: 'NAOERO STAR', allocated: 18.75, consumed: 24.2, remaining: -5.45, weekly: 0 },
    ], { allocated: 75, consumed: 59.7, remaining: 15.3, weekly: 0 }),
    area('공해', [
      { vessel: 'MOAMARI', allocated: 47, consumed: 47, remaining: 0, weekly: 0 },
      { vessel: 'MOAKONA', allocated: 51, consumed: 51, remaining: 0, weekly: 0 },
      { vessel: 'NAOERO SUN', allocated: 62, consumed: 62, remaining: 0, weekly: 5 },
      { vessel: 'NAOERO STAR', allocated: 44, consumed: 44, remaining: 0, weekly: 1 },
    ], { allocated: 204, consumed: 204, remaining: 0, weekly: 6 }, '소진일수에서 제외', false),
  ],
  totals: { allocated: 750, consumed: 521.8, remaining: 228.2, weekly: 20.3 },
};

const monthlyRows = [
  ['S/EXP', [927, 875, 465, 679, 319, 185, 484, 5]],
  ['S/PIO', [620, 585, 560, 475, 1205, 881, 308, 86]],
  ['S/CHA', [320, 700, 640, 250, 805, 380, 690, 260]],
  ['S/HAR', [1095, 935, 1120, 435, 575, 0, 551, 88]],
  ['S/JUP', [0, 175, 595, 855, 310, 845, 135, 265]],
  ['S/SPR', [806, 485, 1065, 1555, 1234, 970, 407, 112]],
  ['MARI', [975, 660, 525, 350, 1060, 900, 955, 460]],
  ['KONA', [722, 330, 659, 430, 596, 681, 439, 348]],
  ['N/SUN', [665, 310, 0, 502, 528, 820, 230, 255]],
  ['N/STAR', [675, 880, 515, 1105, 415, 1165, 1240, 370]],
] as const;

const weeklyRanking = [
  { rank: 1, captain: '강창훈', vessel: 'S/JUP', catchMt: 265, dailyAverageMt: 37.86 },
  { rank: 2, captain: '김형주', vessel: 'N/SUN', catchMt: 195, dailyAverageMt: 27.86 },
  { rank: 3, captain: '조태연', vessel: 'N/STAR', catchMt: 140, dailyAverageMt: 20 },
  { rank: 4, captain: '최용석', vessel: 'S/CHA', catchMt: 105, dailyAverageMt: 15 },
  { rank: 5, captain: '김정훈', vessel: 'MARI', catchMt: 100, dailyAverageMt: 14.29 },
  { rank: 6, captain: '김승현', vessel: 'S/PIO', catchMt: 66, dailyAverageMt: 9.43 },
  { rank: 7, captain: '김효원', vessel: 'S/SPR', catchMt: 42, dailyAverageMt: 6 },
  { rank: 8, captain: '이평규', vessel: 'KONA', catchMt: 16, dailyAverageMt: 2.29 },
  { rank: 9, captain: '공준식', vessel: 'S/EXP', catchMt: 0, dailyAverageMt: 0 },
  { rank: 10, captain: '오복근', vessel: 'S/HAR', catchMt: 0, dailyAverageMt: 0 },
] as const;

const monthlyByVessel = monthlyRows.map(([vessel, monthlyMt]) => ({
  vessel,
  monthlyMt: [...monthlyMt],
  totalMt: monthlyMt.reduce<number>((sum, value) => sum + value, 0),
}));

const nationalVesselNames = new Set(nationalVds.vessels);
const nationalWeekly = weeklyRanking
  .filter((vessel) => nationalVesselNames.has(vessel.vessel))
  .reduce((sum, vessel) => sum + vessel.catchMt, 0);
const jointWeekly = weeklyRanking
  .filter((vessel) => !nationalVesselNames.has(vessel.vessel))
  .reduce((sum, vessel) => sum + vessel.catchMt, 0);
const monthlyTotal = monthlyByVessel.reduce((sum, vessel) => sum + vessel.monthlyMt[7], 0);
const annualTotal = monthlyByVessel.reduce((sum, vessel) => sum + vessel.totalMt, 0);

export const purseSeineCatch = {
  period: { from: '2026-08-10', to: '2026-08-16' },
  source: '주간 실적 현황 (26.08.10~08.16) - 8월 둘째주',
  summary: {
    nationalWeekly,
    jointWeekly,
    weeklyTotal: nationalWeekly + jointWeekly,
    nationalMonthly: 816,
    jointMonthly: 1_433,
    monthlyTotal,
    nationalAnnual: 27_317,
    jointAnnual: 19_765,
    annualTotal,
  },
  weeklyRanking,
  monthlyByVessel,
  seasonAverageDailyMt: 20.2,
  seasonRanking: [
    { captain: '공준식', vessel: 'S/EXP', boardingDate: '2026-06-14', seasonDays: 64, catchMt: 674, dailyCatchMt: 10.5, rank: 10, leaderDeltaMt: -23.71, averageDeltaMt: -9.61 },
    { captain: '김승현', vessel: 'S/PIO', boardingDate: '2026-01-22', seasonDays: 207, catchMt: 4_180, dailyCatchMt: 20.2, rank: 4, leaderDeltaMt: -14.06, averageDeltaMt: 0.04 },
    { captain: '최용석', vessel: 'S/CHA', boardingDate: '2026-01-04', seasonDays: 225, catchMt: 4_045, dailyCatchMt: 18, rank: 6, leaderDeltaMt: -16.27, averageDeltaMt: -2.17 },
    { captain: '오복근', vessel: 'S/HAR', boardingDate: '2026-06-28', seasonDays: 50, catchMt: 639, dailyCatchMt: 12.8, rank: 9, leaderDeltaMt: -21.47, averageDeltaMt: -7.37 },
    { captain: '강창훈', vessel: 'S/JUP', boardingDate: '2025-06-10', seasonDays: 433, catchMt: 7_360, dailyCatchMt: 17, rank: 7, leaderDeltaMt: -17.25, averageDeltaMt: -3.15 },
    { captain: '김효원', vessel: 'S/SPR', boardingDate: '2025-09-27', seasonDays: 324, catchMt: 8_912, dailyCatchMt: 27.5, rank: 2, leaderDeltaMt: -6.75, averageDeltaMt: 7.35 },
    { captain: '김정훈', vessel: 'MARI', boardingDate: '2025-04-17', seasonDays: 487, catchMt: 11_485, dailyCatchMt: 23.6, rank: 3, leaderDeltaMt: -10.67, averageDeltaMt: 3.43 },
    { captain: '이평규', vessel: 'KONA', boardingDate: '2026-03-11', seasonDays: 159, catchMt: 3_003, dailyCatchMt: 18.9, rank: 5, leaderDeltaMt: -15.36, averageDeltaMt: -1.26 },
    { captain: '김형주', vessel: 'N/SUN', boardingDate: '2025-10-20', seasonDays: 301, catchMt: 4_295, dailyCatchMt: 14.3, rank: 8, leaderDeltaMt: -19.98, averageDeltaMt: -5.88 },
    { captain: '조태연', vessel: 'N/STAR', boardingDate: '2026-06-25', seasonDays: 53, catchMt: 1_815, dailyCatchMt: 34.3, rank: 1, leaderDeltaMt: 0, averageDeltaMt: 14.1 },
  ],
};

export const pacificDailyReport = {
  asOf: '2026-08-11',
  source: '해양수산본부 일일 업무보고-260812',
  dailyCatchMt: 176,
  monthlyCatchMt: 1_732,
  annualCatchMt: 46_564.8,
  vessels: [
    { name: 'S/EXP', position: 'X-MAS', catchMt: 0, loadedMt: 687.3, note: '8/9 09:10 X-MAS 입항, 전재·수리 후 8/12 출항 예정' },
    { name: 'S/PIO', position: 'N0351 W16734 (H)', catchMt: 26, loadedMt: 265, note: '' },
    { name: 'S/CHA', position: 'N0331 W16802 (H)', catchMt: 0, loadedMt: 255, note: '' },
    { name: 'S/HAR', position: 'S0059 W15637 (KI)', catchMt: 0, loadedMt: 639, note: '' },
    { name: 'S/JUP', position: 'N0356 W16754 (H)', catchMt: 65, loadedMt: 65, note: '' },
    { name: 'S/SPR', position: 'S0905 W15109 (KI)', catchMt: 0, loadedMt: 518, note: '' },
    { name: 'MOAMARI', position: 'N0233 W16139 (KI)', catchMt: 0, loadedMt: 660, note: '' },
    { name: 'MOAKONA', position: 'S0138 W15653 (KI)', catchMt: 0, loadedMt: 514, note: '' },
    { name: 'NAOERO SUN', position: 'N0408 W16645 (H)', catchMt: 0, loadedMt: 355, note: '' },
    { name: 'NAOERO STAR', position: 'N0342 W16559 (H)', catchMt: 85, loadedMt: 755, note: '' },
  ],
};

export const longlineDailyReport = {
  asOf: '2026-08-12',
  source: '해양수산본부 일일 업무보고-260812',
  vessels: [
    { name: 'TAIHO MARU', loadedMt: 338.699, loadPlan: 'P-501, P-505', note: '8/12 부산 입항, 8/21·24~25 하역 예정' },
  ],
};

export const atlanticDailyReport = {
  asOf: '2026-08-11',
  source: '해양수산본부 일일 업무보고-260812',
  dailyCatchMt: 220,
  monthlyCatchMt: 1_635,
  annualCatchMt: 28_360,
  vessels: [
    { name: 'P/MAS', position: 'S0112 W01020 (H)', catchMt: 120, loadedMt: 330, note: '' },
    { name: 'P/DIS', position: 'S0051 W01651 (H)', catchMt: 40, loadedMt: 300, note: '' },
    { name: 'P/FORE', position: 'TEMA', catchMt: 0, loadedMt: 900, note: '8/8 11:00 TEMA 입항, 하역 후 8/12 출항 예정' },
    { name: 'P/PATH', position: 'S0018 W01552 (H)', catchMt: 60, loadedMt: 150, note: '' },
    { name: 'P/COM', position: 'S0003 W00946 (H)', catchMt: 0, loadedMt: 20, note: '' },
    { name: 'P/QUEEN', position: 'TEMA', catchMt: 0, loadedMt: 900, note: '8/10 16:00 TEMA 입항, 하역 후 8/13 출항 예정' },
    { name: 'P/GRACE', position: 'N0213 W00450 (C)', catchMt: 0, loadedMt: 900, note: '8/13 06:00 TEMA 입항, 하역 후 8/15 출항 예정' },
  ],
};

export const carrierLoads = {
  asOf: '2026-08-12',
  source: '해양수산본부 일일 업무보고-260812',
  loadedTotalMt: 9_922.3,
  expectedRemainingMt: 7_887.7,
  vessels: [
    { name: 'SEIN VENUS', capacityMt: 5_200, loadedMt: 3_275, expectedRemainingMt: 0, loadPlan: 'NT-1,060, NS-1,030, S-260, P-925', note: '방콕 하역 중' },
    { name: 'HIKARI 1', capacityMt: 3_700, loadedMt: 2_929.17, expectedRemainingMt: 0, loadPlan: 'S-766(96), P-75(75), MK-428(114), MI-940, NT-1,005', note: '8/13 방콕 도착 예정' },
    { name: 'HIKARI 1 PSS YF 컨테이너', capacityMt: 3_700, loadedMt: 284.83, expectedRemainingMt: 0, loadPlan: 'S-98.630, P-74.980, MK-111.220', note: '환적 컨테이너 GENSAN 대기 중' },
    { name: 'SHIN IZU', capacityMt: 2_400, loadedMt: 687.3, expectedRemainingMt: 1_712.7, loadPlan: 'E-687.3(63.3)', note: 'X-MAS 전재 중' },
    { name: 'SEIN KASAMA', capacityMt: 7_100, loadedMt: 0, expectedRemainingMt: 6_175, loadPlan: '타사-925', note: 'X-MAS 대기 중' },
    { name: 'MING RUN 17', capacityMt: 6_500, loadedMt: 900, expectedRemainingMt: 0, loadPlan: 'C-900', note: 'X-MAS 대기 중' },
    { name: 'SEIN GALAXY', capacityMt: 3_500, loadedMt: 1_846, expectedRemainingMt: 0, loadPlan: 'MK-956, MI-890, 타사-1,596', note: 'RABAUL 타사 물량 전재 중' },
  ],
};
