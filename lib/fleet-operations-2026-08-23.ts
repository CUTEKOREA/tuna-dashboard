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
  asOf: '2026-08-23',
  source: '태평양 선망 VDS 현황_2026.08.23.pdf',
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
      { vessel: 'S/EXP', allocated: 7.33, consumed: 6, remaining: 1.33, weekly: 1.6 },
      { vessel: 'S/PIO', allocated: 7.33, consumed: 1.5, remaining: 5.83, weekly: 0 },
      { vessel: 'S/CHA', allocated: 7.33, consumed: 4.4, remaining: 2.93, weekly: 0 },
      { vessel: 'S/HAR', allocated: 7.33, consumed: 4.6, remaining: 2.73, weekly: 0 },
      { vessel: 'S/JUP', allocated: 7.33, consumed: 4.3, remaining: 3.03, weekly: 0 },
      { vessel: 'S/SPR', allocated: 7.33, consumed: 4.6, remaining: 2.73, weekly: 0 },
    ], { allocated: 44, consumed: 25.4, remaining: 18.6, weekly: 1.6 }),
    area('미크로네시아', [
      { vessel: 'S/EXP', allocated: 8.17, consumed: 12.8, remaining: -4.63, weekly: 0 },
      { vessel: 'S/PIO', allocated: 8.17, consumed: 0.3, remaining: 7.87, weekly: 0 },
      { vessel: 'S/CHA', allocated: 8.17, consumed: 1.1, remaining: 7.07, weekly: 0 },
      { vessel: 'S/HAR', allocated: 8.17, consumed: 0, remaining: 8.17, weekly: 0 },
      { vessel: 'S/JUP', allocated: 8.17, consumed: 0.7, remaining: 7.47, weekly: 0 },
      { vessel: 'S/SPR', allocated: 8.17, consumed: 0, remaining: 8.17, weekly: 0 },
    ], { allocated: 49, consumed: 14.9, remaining: 34.1, weekly: 0 }),
    area('키리바시', [
      { vessel: 'S/EXP', allocated: 127.33, consumed: 101.5, remaining: 25.83, weekly: 1.9 },
      { vessel: 'S/PIO', allocated: 127.33, consumed: 146.6, remaining: -19.27, weekly: 4.9 },
      { vessel: 'S/CHA', allocated: 127.33, consumed: 140.4, remaining: -13.07, weekly: 4.3 },
      { vessel: 'S/HAR', allocated: 127.33, consumed: 109, remaining: 18.33, weekly: 4.6 },
      { vessel: 'S/JUP', allocated: 127.33, consumed: 99.6, remaining: 27.73, weekly: 2.8 },
      { vessel: 'S/SPR', allocated: 127.33, consumed: 142.1, remaining: -14.77, weekly: 3.4 },
    ], { allocated: 764, consumed: 739.2, remaining: 24.8, weekly: 21.9 }),
    area('투발루', [
      { vessel: 'S/EXP', allocated: 17, consumed: 12, remaining: 5, weekly: 2.4 },
      { vessel: 'S/PIO', allocated: 17, consumed: 18.7, remaining: -1.7, weekly: 0 },
      { vessel: 'S/CHA', allocated: 17, consumed: 10.3, remaining: 6.7, weekly: 0.8 },
      { vessel: 'S/HAR', allocated: 17, consumed: 14.4, remaining: 2.6, weekly: 0.3 },
      { vessel: 'S/JUP', allocated: 17, consumed: 24.9, remaining: -7.9, weekly: 0 },
      { vessel: 'S/SPR', allocated: 17, consumed: 18.3, remaining: -1.3, weekly: 0.9 },
    ], { allocated: 102, consumed: 98.6, remaining: 3.4, weekly: 4.4 }),
    area('나우루', [
      { vessel: 'S/EXP', allocated: 23.67, consumed: 21.3, remaining: 2.37, weekly: 0 },
      { vessel: 'S/PIO', allocated: 23.67, consumed: 18.1, remaining: 5.57, weekly: 0 },
      { vessel: 'S/CHA', allocated: 23.67, consumed: 28.5, remaining: -4.83, weekly: 0 },
      { vessel: 'S/HAR', allocated: 23.67, consumed: 14, remaining: 9.67, weekly: 0 },
      { vessel: 'S/JUP', allocated: 23.67, consumed: 16.2, remaining: 7.47, weekly: 0 },
      { vessel: 'S/SPR', allocated: 23.67, consumed: 24.4, remaining: -0.73, weekly: 0 },
    ], { allocated: 142, consumed: 122.5, remaining: 19.5, weekly: 0 }),
    area('마샬군도', [
      { vessel: 'S/EXP', allocated: 3.75, consumed: 3.3, remaining: 0.45, weekly: 0 },
      { vessel: 'S/PIO', allocated: 0, consumed: 0, remaining: 0, weekly: 0 },
      { vessel: 'S/CHA', allocated: 0, consumed: 0, remaining: 0, weekly: 0 },
      { vessel: 'S/HAR', allocated: 3.75, consumed: 2.9, remaining: 0.85, weekly: 0 },
      { vessel: 'S/JUP', allocated: 3.75, consumed: 0.4, remaining: 3.35, weekly: 0 },
      { vessel: 'S/SPR', allocated: 3.75, consumed: 0.5, remaining: 3.25, weekly: 0 },
    ], { allocated: 15, consumed: 7.1, remaining: 7.9, weekly: 0 }),
    area('동부 공해', [
      { vessel: 'S/EXP', allocated: 8.63, consumed: 3, remaining: 5.63, weekly: 0 },
      { vessel: 'S/PIO', allocated: 8.63, consumed: 6, remaining: 2.63, weekly: 0 },
      { vessel: 'S/CHA', allocated: 8.63, consumed: 8, remaining: 0.63, weekly: 0 },
      { vessel: 'S/HAR', allocated: 8.63, consumed: 5, remaining: 3.63, weekly: 0 },
      { vessel: 'S/JUP', allocated: 8.63, consumed: 7, remaining: 1.63, weekly: 3 },
      { vessel: 'S/SPR', allocated: 8.63, consumed: 7, remaining: 1.63, weekly: 0 },
    ], { allocated: 51.75, consumed: 36, remaining: 15.75, weekly: 3 }, '소진일수에서 제외', false),
  ],
  totals: { allocated: 1_447, consumed: 1_023.8, remaining: 423.2, weekly: 27.9 },
};

export const kiribatiVds = {
  asOf: '2026-08-23',
  source: 'KFC 태평양 선망 VDS 현황_2026.08.23.pdf',
  vessels: ['MOAMARI', 'MOAKONA', 'NAOERO SUN', 'NAOERO STAR'],
  areas: [
    area('미크로네시아 협정', [
      { vessel: 'MOAMARI', allocated: 9.5, consumed: 5.2, remaining: 4.3, weekly: 0 },
      { vessel: 'MOAKONA', allocated: 9.5, consumed: 7.6, remaining: 1.9, weekly: 0 },
    ], { allocated: 19, consumed: 12.8, remaining: 6.2, weekly: 0 }),
    area('키리바시', [
      { vessel: 'MOAMARI', allocated: 95.25, consumed: 99.9, remaining: -4.65, weekly: 0.1 },
      { vessel: 'MOAKONA', allocated: 95.25, consumed: 90.7, remaining: 4.55, weekly: 4.6 },
      { vessel: 'NAOERO SUN', allocated: 95.25, consumed: 68.2, remaining: 27.05, weekly: 0 },
      { vessel: 'NAOERO STAR', allocated: 95.25, consumed: 94, remaining: 1.25, weekly: 1.8 },
    ], { allocated: 381, consumed: 352.7, remaining: 28.2, weekly: 6.5 }),
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
      { vessel: 'MOAMARI', allocated: 27, consumed: 0, remaining: 27, weekly: 0 },
      { vessel: 'MOAKONA', allocated: 27, consumed: 23.7, remaining: 3.3, weekly: 0 },
      { vessel: 'NAOERO SUN', allocated: 27, consumed: 7.9, remaining: 19.1, weekly: 0 },
      { vessel: 'NAOERO STAR', allocated: 27, consumed: 8.1, remaining: 18.9, weekly: 0 },
    ], { allocated: 108, consumed: 39.7, remaining: 68.3, weekly: 0 }),
    area('솔로몬제도 양자', [
      { vessel: 'MOAMARI', allocated: 3.5, consumed: 3.6, remaining: -0.1, weekly: 0 },
      { vessel: 'MOAKONA', allocated: 3.5, consumed: 2.8, remaining: 0.7, weekly: 0 },
      { vessel: 'NAOERO SUN', allocated: 3.5, consumed: 3.2, remaining: 0.3, weekly: 0 },
      { vessel: 'NAOERO STAR', allocated: 3.5, consumed: 2, remaining: 1.5, weekly: 0 },
    ], { allocated: 14, consumed: 11.6, remaining: 2.4, weekly: 0 }),
    area('투발루 양자', [
      { vessel: 'MOAMARI', allocated: 23.75, consumed: 18.2, remaining: 5.55, weekly: 0 },
      { vessel: 'MOAKONA', allocated: 23.75, consumed: 9.3, remaining: 14.45, weekly: 0 },
      { vessel: 'NAOERO SUN', allocated: 23.75, consumed: 8, remaining: 15.75, weekly: 0 },
      { vessel: 'NAOERO STAR', allocated: 23.75, consumed: 24.2, remaining: -0.45, weekly: 0 },
    ], { allocated: 95, consumed: 59.7, remaining: 35.3, weekly: 0 }),
    // 공해는 원문이 「소진일수에서 제외」라 적었다. 총계 750일에 들어가지 않는다 —
    // 더하면 배정일이 972일로 불어난다.
    area('공해', [
      { vessel: 'MOAMARI', allocated: 50, consumed: 50, remaining: 0, weekly: 0 },
      { vessel: 'MOAKONA', allocated: 51, consumed: 51, remaining: 0, weekly: 0 },
      { vessel: 'NAOERO SUN', allocated: 70, consumed: 70, remaining: 0, weekly: 5 },
      { vessel: 'NAOERO STAR', allocated: 51, consumed: 51, remaining: 0, weekly: 3 },
    ], { allocated: 222, consumed: 222, remaining: 0, weekly: 8 }, '소진일수에서 제외', false),
  ],
  totals: { allocated: 750, consumed: 543, remaining: 207, weekly: 6.5 },
};


const monthlyRows = [
  ['S/EXP', [927, 875, 465, 679, 319, 185, 484, 85]],
  ['S/PIO', [620, 585, 560, 475, 1205, 881, 308, 86]],
  ['S/CHA', [320, 700, 640, 250, 805, 380, 690, 260]],
  ['S/HAR', [1095, 935, 1120, 435, 575, 551, 0, 109]],
  ['S/JUP', [175, 595, 855, 310, 845, 135, 0, 315]],
  ['S/SPR', [806, 485, 1065, 1555, 1234, 970, 407, 219]],
  ['MARI', [975, 660, 525, 350, 1060, 900, 955, 460]],
  ['KONA', [722, 330, 659, 430, 596, 681, 439, 364]],
  ['N/SUN', [665, 310, 502, 528, 820, 230, 0, 385]],
  ['N/STAR', [675, 880, 515, 1105, 415, 1165, 1240, 385]],
] as const;

const weeklyRanking = [
  { rank: 1, captain: '김형주', vessel: 'N/SUN', catchMt: 130, dailyAverageMt: 18.57 },
  { rank: 2, captain: '김효원', vessel: 'S/SPR', catchMt: 107, dailyAverageMt: 15.29 },
  { rank: 3, captain: '공준식', vessel: 'S/EXP', catchMt: 80, dailyAverageMt: 11.43 },
  { rank: 4, captain: '강창훈', vessel: 'S/JUP', catchMt: 50, dailyAverageMt: 7.14 },
  { rank: 5, captain: '오복근', vessel: 'S/HAR', catchMt: 21, dailyAverageMt: 3 },
  { rank: 6, captain: '이평규', vessel: 'KONA', catchMt: 16, dailyAverageMt: 2.29 },
  { rank: 7, captain: '이진우', vessel: 'N/STAR', catchMt: 15, dailyAverageMt: 2.14 },
  { rank: 8, captain: '김승현', vessel: 'S/PIO', catchMt: 0, dailyAverageMt: 0 },
  { rank: 9, captain: '최용석', vessel: 'S/CHA', catchMt: 0, dailyAverageMt: 0 },
  { rank: 10, captain: '김정훈', vessel: 'MARI', catchMt: 0, dailyAverageMt: 0 },
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
  period: { from: '2026-08-17', to: '2026-08-23' },
  source: '주간 실적 현황 (26.08.17~08.23) - 8월 셋째주',
  summary: {
    nationalWeekly,
    jointWeekly,
    weeklyTotal: nationalWeekly + jointWeekly,
    nationalMonthly: 1_074,
    jointMonthly: 1_594,
    monthlyTotal,
    nationalAnnual: 27_575,
    jointAnnual: 19_926,
    annualTotal,
  },
  weeklyRanking,
  monthlyByVessel,
  seasonAverageDailyMt: 19.4,
  seasonRanking: [
    { captain: '공준식', vessel: 'S/EXP', boardingDate: '2026-06-14', seasonDays: 71, catchMt: 754, dailyCatchMt: 10.6, rank: 9, leaderDeltaMt: -16.63, averageDeltaMt: -8.80 },
    { captain: '김승현', vessel: 'S/PIO', boardingDate: '2026-01-22', seasonDays: 214, catchMt: 4_180, dailyCatchMt: 19.5, rank: 3, leaderDeltaMt: -7.72, averageDeltaMt: 0.11 },
    { captain: '최용석', vessel: 'S/CHA', boardingDate: '2026-01-04', seasonDays: 232, catchMt: 4_045, dailyCatchMt: 17.4, rank: 5, leaderDeltaMt: -9.81, averageDeltaMt: -1.98 },
    { captain: '오복근', vessel: 'S/HAR', boardingDate: '2026-06-28', seasonDays: 57, catchMt: 660, dailyCatchMt: 11.6, rank: 8, leaderDeltaMt: -15.67, averageDeltaMt: -7.84 },
    { captain: '강창훈', vessel: 'S/JUP', boardingDate: '2025-06-10', seasonDays: 440, catchMt: 7_410, dailyCatchMt: 16.8, rank: 6, leaderDeltaMt: -10.41, averageDeltaMt: -2.58 },
    { captain: '김효원', vessel: 'S/SPR', boardingDate: '2025-09-27', seasonDays: 331, catchMt: 9_019, dailyCatchMt: 27.3, rank: 1, leaderDeltaMt: -0, averageDeltaMt: 7.83 },
    { captain: '김정훈', vessel: 'MARI', boardingDate: '2025-04-17', seasonDays: 494, catchMt: 11_485, dailyCatchMt: 23.3, rank: 2, leaderDeltaMt: -4.00, averageDeltaMt: 3.83 },
    { captain: '이평규', vessel: 'KONA', boardingDate: '2026-03-11', seasonDays: 166, catchMt: 3_019, dailyCatchMt: 18.2, rank: 4, leaderDeltaMt: -9.06, averageDeltaMt: -1.23 },
    { captain: '김형주', vessel: 'N/SUN', boardingDate: '2025-10-20', seasonDays: 308, catchMt: 4_425, dailyCatchMt: 14.4, rank: 7, leaderDeltaMt: -12.88, averageDeltaMt: -5.05 },
    { captain: '이진우', vessel: 'N/STAR', boardingDate: '2026-08-19', seasonDays: 5, catchMt: 15, dailyCatchMt: 3, rank: 10, leaderDeltaMt: -24.25, averageDeltaMt: -16.42 },
  ],
};

export const pacificDailyReport = {
  asOf: '2026-08-19',
  source: '해양수산본부 일일 업무보고-260820',
  dailyCatchMt: 50,
  monthlyCatchMt: 2_384,
  annualCatchMt: 47_216.8,
  vessels: [
    { name: 'S/EXP', position: 'S0432 W17818 (KI)', catchMt: 0, loadedMt: 0, note: '' },
    { name: 'S/PIO', position: 'N0313 W16159 (KI)', catchMt: 0, loadedMt: 275, note: '' },
    { name: 'S/CHA', position: 'S0546 W16636 (KI)', catchMt: 0, loadedMt: 260, note: '' },
    { name: 'S/HAR', position: 'N0236 W16324 (H)', catchMt: 0, loadedMt: 639, note: '' },
    { name: 'S/JUP', position: 'N0231 W15855 (KI)', catchMt: 0, loadedMt: 265, note: '' },
    { name: 'S/SPR', position: 'S0002 W16248 (US)', catchMt: 0, loadedMt: 591, note: '' },
    { name: 'MOAMARI', position: 'X-MAS', catchMt: 0, loadedMt: 760, note: '8/17 15:30 X-MAS 입항, SEIN KASAMA편 약 760톤 전재. 프로펠러 사고 수습 후 8/28 출항 예정' },
    { name: 'MOAKONA', position: 'S0040 W15634 (KI)', catchMt: 0, loadedMt: 543, note: '' },
    { name: 'NAOERO SUN', position: 'S0554 W16215 (H)', catchMt: 50, loadedMt: 535, note: '' },
    { name: 'NAOERO STAR', position: 'N0223 W15641 (KI)', catchMt: 0, loadedMt: 0, note: '8/17 07:00 X-MAS 입항, SEIN KASAMA편 약 810톤 전재. 선장 교대(조태연→이진우) 후 8/19 17:20 출항 완료' },
  ],
};

export const longlineDailyReport = {
  asOf: '2026-08-19',
  source: '해양수산본부 일일 업무보고-260820',
  vessels: [
    { name: 'TAIHO MARU', loadedMt: 338.699, loadPlan: 'P-501, P-505', note: '8/12 부산 입항, 8/21·24~25 하역 예정' },
    { name: 'P-501', loadedMt: 0, loadPlan: '', note: '8/19 TAHITI 휴게 입항차 입항 완료, 8/22 출항 예정' },
    { name: 'SY 56', loadedMt: 127.2, loadPlan: '', note: '8/20 SEIBU편 127.200톤 전재 중' },
  ],
};

export const atlanticDailyReport = {
  asOf: '2026-08-19',
  source: '해양수산본부 일일 업무보고-260820',
  dailyCatchMt: 315,
  monthlyCatchMt: 3_425,
  annualCatchMt: 30_150,
  vessels: [
    { name: 'P/MAS', position: 'S0050 W01404 (H)', catchMt: 65, loadedMt: 750, note: '' },
    { name: 'P/DIS', position: 'S0106 W00910 (H)', catchMt: 30, loadedMt: 640, note: '' },
    { name: 'P/FORE', position: 'S0459 W01203 (H)', catchMt: 70, loadedMt: 260, note: '' },
    { name: 'P/PATH', position: 'S0230 W02300 (H)', catchMt: 0, loadedMt: 385, note: '' },
    { name: 'P/COM', position: 'S0108 W01322 (H)', catchMt: 80, loadedMt: 455, note: '' },
    { name: 'P/QUEEN', position: 'S0408 W01212 (H)', catchMt: 70, loadedMt: 100, note: '' },
    { name: 'P/GRACE', position: 'S0014 W00624 (H)', catchMt: 0, loadedMt: 0, note: '' },
  ],
};

export const carrierLoads = {
  asOf: '2026-08-19',
  source: '해양수산본부 일일 업무보고-260820',
  loadedTotalMt: 11_492.3,
  expectedRemainingMt: 6_317.7,
  vessels: [
    { name: 'SEIN VENUS', capacityMt: 5_200, loadedMt: 3_275, expectedRemainingMt: 0, loadPlan: 'NT-1,060, NS-1,030, S-260, P-925', note: '방콕 하역 중' },
    { name: 'HIKARI 1', capacityMt: 3_700, loadedMt: 2_929.17, expectedRemainingMt: 0, loadPlan: 'S-766(96), P-75(75), MK-428(114), MI-940, NT-1,005', note: '8/20 방콕 하역 개시 예정' },
    { name: 'HIKARI 1 PSS YF 컨테이너', capacityMt: 3_700, loadedMt: 284.83, expectedRemainingMt: 0, loadPlan: 'S-98.630, P-74.980, MK-111.220', note: '8/6~8/7 GENSAN 컨테이너 환적분, 9/8 부산 도착 예정' },
    { name: 'SEIN KASAMA', capacityMt: 7_100, loadedMt: 1_570, expectedRemainingMt: 4_605, loadPlan: 'NT-810, (MI-760), 타사-925', note: 'X-MAS 전재 중' },
    { name: 'SHIN IZU', capacityMt: 2_400, loadedMt: 687.3, expectedRemainingMt: 1_712.7, loadPlan: 'E-687.3(63.3)', note: 'X-MAS 대기 중' },
    { name: 'MING RUN 17', capacityMt: 6_500, loadedMt: 900, expectedRemainingMt: 0, loadPlan: 'C-900', note: 'X-MAS 대기 중' },
    { name: 'SEIN GALAXY', capacityMt: 3_500, loadedMt: 1_846, expectedRemainingMt: 0, loadPlan: 'MK-956, MI-890, 타사-1,596', note: '8/26 GENSAN 도착 예정 (타사 하역 예정)' },
  ],
};
