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
  asOf: '2026-10-05',
  source: '태평양 선망 VDS 현황_2026.10.05.pdf',
  vessels: ['S/EXP', 'S/PIO', 'S/CHA', 'S/HAR', 'S/JUP', 'S/SPR'],
  areas: [
    area('파푸아뉴기니', [
      { vessel: 'S/EXP', allocated: 55.17, consumed: 42.4, remaining: 12.77, weekly: 3.4 },
      { vessel: 'S/PIO', allocated: 55.17, consumed: 32.1, remaining: 23.07, weekly: 2.6 },
      { vessel: 'S/CHA', allocated: 55.17, consumed: 37.4, remaining: 17.77, weekly: 4.9 },
      { vessel: 'S/HAR', allocated: 55.17, consumed: 18.5, remaining: 36.67, weekly: 2.3 },
      { vessel: 'S/JUP', allocated: 55.17, consumed: 26.3, remaining: 28.87, weekly: 3.7 },
      { vessel: 'S/SPR', allocated: 55.17, consumed: 19.4, remaining: 35.77, weekly: 0 },
    ], { allocated: 331, consumed: 176.1, remaining: 154.9, weekly: 16.9 }),
    area('솔로몬제도', [
      // 10-05 판: 척당 배정 7.33 → 11.08일(44 → 66.5). 같은 판 키리코레 솔로몬 양자가 34 → 11.5일로 22.5일 줄어 옮겨 온 몫으로 읽힌다
      { vessel: 'S/EXP', allocated: 11.08, consumed: 10.5, remaining: 0.58, weekly: 2.7 },
      { vessel: 'S/PIO', allocated: 11.08, consumed: 3.4, remaining: 7.68, weekly: 1.9 },
      { vessel: 'S/CHA', allocated: 11.08, consumed: 7.4, remaining: 3.68, weekly: 3 },
      { vessel: 'S/HAR', allocated: 11.08, consumed: 12.8, remaining: -1.72, weekly: 5.3 },
      { vessel: 'S/JUP', allocated: 11.08, consumed: 8.8, remaining: 2.28, weekly: 1.5 },
      { vessel: 'S/SPR', allocated: 11.08, consumed: 4.6, remaining: 6.48, weekly: 0 },
    ], { allocated: 66.5, consumed: 47.5, remaining: 19, weekly: 14.4 }),
    area('미크로네시아', [
      { vessel: 'S/EXP', allocated: 8.17, consumed: 14.4, remaining: -6.23, weekly: 0 },
      { vessel: 'S/PIO', allocated: 8.17, consumed: 2.2, remaining: 5.97, weekly: 0 },
      { vessel: 'S/CHA', allocated: 8.17, consumed: 1.4, remaining: 6.77, weekly: 0 },
      { vessel: 'S/HAR', allocated: 8.17, consumed: 0.1, remaining: 8.07, weekly: 0 },
      { vessel: 'S/JUP', allocated: 8.17, consumed: 3.8, remaining: 4.37, weekly: 0 },
      { vessel: 'S/SPR', allocated: 8.17, consumed: 2.7, remaining: 5.47, weekly: 0 },
    ], { allocated: 49, consumed: 24.6, remaining: 24.4, weekly: 0 }),
    area('키리바시', [
      // 소모 음수 2칸(S/CHA -1.4 · S/HAR -1.0) - 지난 판 추정 소진이 되돌려졌다(원문 각주: VMS 항적 기반 추정)
      { vessel: 'S/EXP', allocated: 127.33, consumed: 101.5, remaining: 25.83, weekly: 0 },
      { vessel: 'S/PIO', allocated: 127.33, consumed: 149.1, remaining: -21.77, weekly: 0 },
      { vessel: 'S/CHA', allocated: 127.33, consumed: 139.2, remaining: -11.87, weekly: -1.4 },
      { vessel: 'S/HAR', allocated: 127.33, consumed: 115.7, remaining: 11.63, weekly: -1 },
      { vessel: 'S/JUP', allocated: 127.33, consumed: 102.4, remaining: 24.93, weekly: 0 },
      { vessel: 'S/SPR', allocated: 127.33, consumed: 144.6, remaining: -17.27, weekly: 0 },
    ], { allocated: 764, consumed: 752.6, remaining: 11.5, weekly: -2.4 }),
    area('투발루', [
      { vessel: 'S/EXP', allocated: 18.67, consumed: 12, remaining: 6.67, weekly: 0 },
      { vessel: 'S/PIO', allocated: 18.67, consumed: 18.7, remaining: -0.03, weekly: 0 },
      { vessel: 'S/CHA', allocated: 18.67, consumed: 10.3, remaining: 8.37, weekly: 0 },
      { vessel: 'S/HAR', allocated: 18.67, consumed: 19, remaining: -0.33, weekly: 0 },
      { vessel: 'S/JUP', allocated: 18.67, consumed: 28.3, remaining: -9.63, weekly: 0 },
      { vessel: 'S/SPR', allocated: 18.67, consumed: 18.5, remaining: 0.17, weekly: 0 },
    ], { allocated: 112, consumed: 106.8, remaining: 5.2, weekly: 0 }),
    area('나우루', [
      { vessel: 'S/EXP', allocated: 23.67, consumed: 21.3, remaining: 2.37, weekly: 0 },
      { vessel: 'S/PIO', allocated: 23.67, consumed: 19, remaining: 4.67, weekly: 0 },
      { vessel: 'S/CHA', allocated: 23.67, consumed: 28.5, remaining: -4.83, weekly: 0 },
      { vessel: 'S/HAR', allocated: 23.67, consumed: 14.8, remaining: 8.87, weekly: 0 },
      { vessel: 'S/JUP', allocated: 23.67, consumed: 16.2, remaining: 7.47, weekly: 0 },
      { vessel: 'S/SPR', allocated: 23.67, consumed: 25.1, remaining: -1.43, weekly: 0 },
    ], { allocated: 142, consumed: 124.9, remaining: 17.1, weekly: 0 }),
    area('마샬군도', [
      { vessel: 'S/EXP', allocated: 3.75, consumed: 3.3, remaining: 0.45, weekly: 0 },
      { vessel: 'S/PIO', allocated: 0, consumed: 0, remaining: 0, weekly: 0 },
      { vessel: 'S/CHA', allocated: 0, consumed: 0, remaining: 0, weekly: 0 },
      { vessel: 'S/HAR', allocated: 3.75, consumed: 2.9, remaining: 0.85, weekly: 0 },
      { vessel: 'S/JUP', allocated: 3.75, consumed: 0, remaining: 3.75, weekly: 0 },
      { vessel: 'S/SPR', allocated: 3.75, consumed: 0.5, remaining: 3.25, weekly: 0 },
    ], { allocated: 15, consumed: 6.7, remaining: 8.3, weekly: 0 }),
    area('동부 공해', [
      { vessel: 'S/EXP', allocated: 8.63, consumed: 3, remaining: 5.63, weekly: 0 },
      { vessel: 'S/PIO', allocated: 8.63, consumed: 6, remaining: 2.63, weekly: 0 },
      { vessel: 'S/CHA', allocated: 8.63, consumed: 8, remaining: 0.63, weekly: 0 },
      { vessel: 'S/HAR', allocated: 8.63, consumed: 5, remaining: 3.63, weekly: 0 },
      { vessel: 'S/JUP', allocated: 8.63, consumed: 7, remaining: 1.63, weekly: 0 },
      { vessel: 'S/SPR', allocated: 8.63, consumed: 7, remaining: 1.63, weekly: 0 },
    ], { allocated: 51.75, consumed: 36, remaining: 15.75, weekly: 0 }, '소진일수에서 제외', false),
  ],
  totals: { allocated: 1_479.5, consumed: 1_239.1, remaining: 240.4, weekly: 28.9 },
};

export const kiribatiVds = {
  asOf: '2026-10-05',
  source: 'KFC 태평양 선망 VDS 현황_2026.10.05.pdf',
  vessels: ['MOAMARI', 'MOAKONA', 'NAOERO SUN', 'NAOERO STAR'],
  areas: [
    area('미크로네시아 협정', [
      { vessel: 'MOAMARI', allocated: 9.5, consumed: 7.5, remaining: 2, weekly: 2.3 },
      { vessel: 'MOAKONA', allocated: 9.5, consumed: 7.6, remaining: 1.9, weekly: 0 },
    ], { allocated: 19, consumed: 15.1, remaining: 3.9, weekly: 2.3 }),
    area('키리바시', [
      /* 10-05 판: 척당 배정 102.75 → 107.75일(411 → 431). 예인 중이던 MOAMARI 의 키리바시 소진이 104.3 → 99.9 로
       * 4.4일 되돌려져 초과(-1.55)가 풀렸다 - 통과 소진 정정으로 읽힌다. 원문 각주대로 추정치라 그대로 싣는다. */
      { vessel: 'MOAMARI', allocated: 107.75, consumed: 99.9, remaining: 7.85, weekly: -4.4 },
      { vessel: 'MOAKONA', allocated: 107.75, consumed: 120.8, remaining: -13.05, weekly: 0.2 },
      { vessel: 'NAOERO SUN', allocated: 107.75, consumed: 71.7, remaining: 36.05, weekly: -0.3 },
      { vessel: 'NAOERO STAR', allocated: 107.75, consumed: 114.1, remaining: -6.35, weekly: 2.6 },
    ], { allocated: 431, consumed: 406.5, remaining: 24.5, weekly: -1.9 }),
    area('미크로네시아 양자', [
      // 주간 소모 8.9 는 09-27 판과 같은 값이고 소진 누계(12.9)도 그대로다 - 원문이 지난 판 값을 이어 적은 것으로 읽힌다
      { vessel: 'MOAMARI', allocated: 8.75, consumed: 12.9, remaining: -4.15, weekly: 8.9 },
      { vessel: 'MOAKONA', allocated: 8.75, consumed: 3.5, remaining: 5.25, weekly: 0 },
      { vessel: 'NAOERO SUN', allocated: 8.75, consumed: 21.1, remaining: -12.35, weekly: 0 },
      { vessel: 'NAOERO STAR', allocated: 8.75, consumed: 6.3, remaining: 2.45, weekly: 0 },
    ], { allocated: 35, consumed: 43.8, remaining: -8.8, weekly: 8.9 }),
    area('나우루 양자', [
      { vessel: 'MOAMARI', allocated: 24, consumed: 7.8, remaining: 16.2, weekly: 0 },
      { vessel: 'MOAKONA', allocated: 24, consumed: 10.8, remaining: 13.2, weekly: 0 },
      { vessel: 'NAOERO SUN', allocated: 25, consumed: 2.5, remaining: 22.5, weekly: 0 },
      { vessel: 'NAOERO STAR', allocated: 25, consumed: 10.4, remaining: 14.6, weekly: 0 },
    ], { allocated: 98, consumed: 31.5, remaining: 66.5, weekly: 0 }),
    area('파푸아뉴기니 양자', [
      { vessel: 'MOAMARI', allocated: 22, consumed: 0, remaining: 22, weekly: 0 },
      { vessel: 'MOAKONA', allocated: 22, consumed: 23.7, remaining: -1.7, weekly: 0 },
      { vessel: 'NAOERO SUN', allocated: 22, consumed: 7.9, remaining: 14.1, weekly: 0 },
      { vessel: 'NAOERO STAR', allocated: 22, consumed: 8.1, remaining: 13.9, weekly: 0 },
    ], { allocated: 88, consumed: 39.7, remaining: 48.3, weekly: 0 }),
    area('솔로몬제도 양자', [
      // 10-05 판: 척당 8.5 → 2.88일(34 → 11.5). 줄어든 22.5일은 같은 판 국적선 솔로몬 배정 증가분(44 → 66.5)과 같다
      { vessel: 'MOAMARI', allocated: 2.88, consumed: 3.5, remaining: -0.63, weekly: 0 },
      { vessel: 'MOAKONA', allocated: 2.88, consumed: 2.8, remaining: 0.08, weekly: 0 },
      { vessel: 'NAOERO SUN', allocated: 2.88, consumed: 3.2, remaining: -0.33, weekly: 0 },
      { vessel: 'NAOERO STAR', allocated: 2.88, consumed: 2, remaining: 0.88, weekly: 0 },
    ], { allocated: 11.5, consumed: 11.5, remaining: 0, weekly: 0 }),
    area('투발루 양자', [
      { vessel: 'MOAMARI', allocated: 21.25, consumed: 18.2, remaining: 3.05, weekly: 0 },
      { vessel: 'MOAKONA', allocated: 21.25, consumed: 9.3, remaining: 11.95, weekly: 0 },
      { vessel: 'NAOERO SUN', allocated: 21.25, consumed: 8, remaining: 13.25, weekly: 0 },
      { vessel: 'NAOERO STAR', allocated: 21.25, consumed: 24.2, remaining: -2.95, weekly: 0 },
    ], { allocated: 85, consumed: 59.7, remaining: 25.3, weekly: 0 }),
    /* 공해는 원문이 「소진일수에서 제외」라 적었다. 총계 767.5일에 들어가지 않는다.
     * 09-27 판보다 배정·소진이 함께 늘었다(271 → 284) — 공해 조업이 이어진 만큼 배정도 따라 올린다. */
    area('공해', [
      { vessel: 'MOAMARI', allocated: 50, consumed: 50, remaining: 0, weekly: 0 },
      { vessel: 'MOAKONA', allocated: 58, consumed: 58, remaining: 0, weekly: 4 },
      { vessel: 'NAOERO SUN', allocated: 104, consumed: 104, remaining: 0, weekly: 5 },
      { vessel: 'NAOERO STAR', allocated: 72, consumed: 72, remaining: 0, weekly: 4 },
    ], { allocated: 284, consumed: 284, remaining: 0, weekly: 13 }, '소진일수에서 제외', false),
  ],
  // 원문 TOTAL 행. 공해는 「소진일수에서 제외」라 배정 767.5 에 들어가지 않는다.
  totals: { allocated: 767.5, consumed: 607.8, remaining: 159.7, weekly: 9.3 },
};

const monthlyRows = [
  ['S/EXP', [927, 875, 465, 679, 319, 185, 484, 215]],
  ['S/PIO', [620, 585, 560, 475, 1205, 881, 308, 146]],
  ['S/CHA', [320, 700, 640, 250, 805, 380, 690, 285]],
  ['S/HAR', [1095, 935, 1120, 435, 575, 551, 0, 214]],
  ['S/JUP', [175, 595, 855, 310, 845, 135, 0, 315]],
  ['S/SPR', [806, 485, 1065, 1555, 1234, 970, 407, 359]],
  ['MARI', [975, 660, 525, 350, 1060, 900, 955, 460]],
  ['KONA', [722, 330, 659, 430, 596, 681, 439, 379]],
  ['N/SUN', [665, 310, 502, 528, 820, 230, 0, 530]],
  ['N/STAR', [675, 880, 515, 1105, 415, 1165, 1240, 410]],
] as const;

/* 선장 실명은 이 표에만 남긴다(2026-09-14 사용자 확인). 선장별 순위가 표의 목적이라
 * 직함·선박명으로 바꾸면 표가 성립하지 않는다. 다른 원자료의 인명은 그대로 직함·역할로만 옮긴다 —
 * PANOFI 주간동향 작성자, 코스모 차주 계획 출장자, 일일보고 비고가 그렇다. */
const weeklyRanking = [
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

export const purseSeineCatch = {
  period: { from: '2026-09-28', to: '2026-10-04' },
  source: '주간 실적 현황 (26.09.28~10.04) - 10월 첫째주',
  // 합계는 원문 인쇄값이다. 월별 계열에서 파생하면 그 계열의 기준일(8월 넷째주)에 묶인다.
  summary: {
    nationalWeekly,
    jointWeekly,
    weeklyTotal: nationalWeekly + jointWeekly,
    nationalMonthly: 915,
    jointMonthly: 440,
    monthlyTotal: 1_355,
    nationalAnnual: 32_691,
    jointAnnual: 23_277,
    annualTotal: 55_968,
  },
  /** 월별 계열은 아직 8월 넷째주 판이다(1~8월 8칸). 9월 넷째주 보고의 월별 그래프도
   *  스택 막대 이미지뿐이라 월별 칸을 읽어낼 수 없다. 선박별 연간 라벨에서 1~8월 합을 빼
   *  9월치를 파생하면 합이 5,397 이 나와 원문 인쇄값 5,302 와 95 MT 어긋난다 — 1~8월 칸도
   *  같이 손질된 것으로 보인다. 지어내지 않고 원본(xlsx 등)이 들어오면 갱신한다.
   *  요약(summary)의 월간·연간은 원문 인쇄값이라 화면 KPI 는 정확하다. */
  monthlySeriesAsOf: '2026-08-30',
  weeklyRanking,
  monthlyByVessel,
  seasonAverageDailyMt: 19.5,
  seasonRanking: [
    { captain: '공준식', vessel: 'S/EXP', boardingDate: '2026-06-14', seasonDays: 113, catchMt: 1_843, dailyCatchMt: 16.3, rank: 9, leaderDeltaMt: -9.4, averageDeltaMt: -3.22 },
    { captain: '김승현', vessel: 'S/PIO', boardingDate: '2026-01-22', seasonDays: 256, catchMt: 5_105, dailyCatchMt: 19.9, rank: 4, leaderDeltaMt: -5.77, averageDeltaMt: 0.41 },
    { captain: '최용석', vessel: 'S/CHA', boardingDate: '2026-01-04', seasonDays: 274, catchMt: 4_650, dailyCatchMt: 17, rank: 6, leaderDeltaMt: -8.74, averageDeltaMt: -2.56 },
    { captain: '오복근', vessel: 'S/HAR', boardingDate: '2026-06-28', seasonDays: 99, catchMt: 1_870, dailyCatchMt: 18.9, rank: 5, leaderDeltaMt: -6.82, averageDeltaMt: -0.64 },
    { captain: '강창훈', vessel: 'S/JUP', boardingDate: '2025-06-10', seasonDays: 482, catchMt: 8_125, dailyCatchMt: 16.9, rank: 7, leaderDeltaMt: -8.85, averageDeltaMt: -2.67 },
    { captain: '김효원', vessel: 'S/SPR', boardingDate: '2025-09-27', seasonDays: 373, catchMt: 9_591, dailyCatchMt: 25.7, rank: 1, leaderDeltaMt: -0, averageDeltaMt: 6.18 },
    { captain: '김정훈', vessel: 'MARI', boardingDate: '2025-04-17', seasonDays: 536, catchMt: 11_485, dailyCatchMt: 21.4, rank: 2, leaderDeltaMt: -4.28, averageDeltaMt: 1.9 },
    { captain: '이평규', vessel: 'KONA', boardingDate: '2026-03-11', seasonDays: 208, catchMt: 4_420, dailyCatchMt: 21.3, rank: 3, leaderDeltaMt: -4.46, averageDeltaMt: 1.72 },
    { captain: '김형주', vessel: 'N/SUN', boardingDate: '2025-10-20', seasonDays: 350, catchMt: 5_890, dailyCatchMt: 16.8, rank: 8, leaderDeltaMt: -8.88, averageDeltaMt: -2.7 },
    { captain: '이진우', vessel: 'N/STAR', boardingDate: '2026-08-19', seasonDays: 47, catchMt: 500, dailyCatchMt: 10.6, rank: 10, leaderDeltaMt: -15.07, averageDeltaMt: -8.89 },
  ],
};

/** 주간 창이 월 경계를 걸칠 때만 「주간 대 월간」 차이를 앞달에 든 날들의 몫으로 설명할 수 있다.
 *  9월 첫째주(8/31~9/6)는 하루, 10월 첫째주(9/28~10/4)는 9/28~9/30 사흘이다 — 날수와 달을 계산한다.
 *  9월 넷째주(9/21~9/27)처럼 한 달 안에 들어오는 주는 월간이 그 달 전체라 null 을 낸다. */
export const monthBoundaryDay = (() => {
  const { from, to } = purseSeineCatch.period;
  if (from.slice(0, 7) === to.slice(0, 7)) return null;
  const start = new Date(`${from}T00:00:00Z`);
  const monthEnd = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 0));
  return {
    date: from,
    endDate: monthEnd.toISOString().slice(0, 10),
    days: monthEnd.getUTCDate() - start.getUTCDate() + 1,
    /** 월간 KPI 가 가리키는 달(주간 창의 끝 달) */
    month: Number(to.slice(5, 7)),
    nationalMt: purseSeineCatch.summary.nationalWeekly - purseSeineCatch.summary.nationalMonthly,
    jointMt: purseSeineCatch.summary.jointWeekly - purseSeineCatch.summary.jointMonthly,
    totalMt: purseSeineCatch.summary.weeklyTotal - purseSeineCatch.summary.monthlyTotal,
  };
})();

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
