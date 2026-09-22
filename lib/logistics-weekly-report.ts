export type CanneryReport = {
  location: 'BANGKOK' | 'SONGKHLA';
  name: string;
  maxProduction: number;
  currentProduction: number;
  storageCapacity: number;
  currentStock: number;
  processingDays: number;
};

export type RejectionItem = {
  species: 'SKJ' | 'YF';
  mt: number;
  ratePct: number;
  /** 원문이 「6.99% > 5.50%」처럼 기준선을 함께 적은 경우에만 있다 */
  thresholdPct?: number;
};

export type HighRejection = {
  carrier: string;
  sourceVessel: string;
  cannery: string;
  items: RejectionItem[];
  quantityMt: number;
  /** 원문 인쇄값. 항목 합을 뺀 값과 어긋나는 행이 있어 계산으로 덮지 않는다 */
  balanceMt: number;
};

const monthlyReceipts = [
  { month: '1월', FCF: 26344, ITOCHU: 6907, 'TRI MARINE': 3770, direct: 18929, Maldives: 0, total: 55950 },
  { month: '2월', FCF: 14155, ITOCHU: 0, 'TRI MARINE': 9486, direct: 19840, Maldives: 0, total: 43481 },
  { month: '3월', FCF: 11700, ITOCHU: 4915, 'TRI MARINE': 2113, direct: 11925, Maldives: 0, total: 30653 },
  { month: '4월', FCF: 14206, ITOCHU: 9963, 'TRI MARINE': 13933, direct: 22181, Maldives: 0, total: 60283 },
  { month: '5월', FCF: 32638, ITOCHU: 3371, 'TRI MARINE': 9413, direct: 3485, Maldives: 0, total: 48907 },
  { month: '6월', FCF: 13749, ITOCHU: 2924, 'TRI MARINE': 9465, direct: 23719, Maldives: 0, total: 49857 },
  { month: '7월', FCF: 4100, ITOCHU: 3711, 'TRI MARINE': 8283, direct: 3059, Maldives: 0, total: 19153 },
  { month: '8월', FCF: 15710, ITOCHU: 4940, 'TRI MARINE': 0, direct: 4564, Maldives: 0, total: 25214 },
  { month: '9월', FCF: 14539, ITOCHU: 0, 'TRI MARINE': 0, direct: 11947, Maldives: 0, total: 26486 },
] as const;

const bangkokCanneries: CanneryReport[] = [
  { location: 'BANGKOK', name: 'THAI UNION', maxProduction: 1300, currentProduction: 700, storageCapacity: 62000, currentStock: 45000, processingDays: 64 },
  { location: 'BANGKOK', name: 'SEA VALUE', maxProduction: 1000, currentProduction: 550, storageCapacity: 55000, currentStock: 27000, processingDays: 49 },
  { location: 'BANGKOK', name: 'GOLDEN PRIZE', maxProduction: 350, currentProduction: 220, storageCapacity: 25000, currentStock: 6400, processingDays: 29 },
  { location: 'BANGKOK', name: 'PATAYA FOOD', maxProduction: 250, currentProduction: 120, storageCapacity: 15000, currentStock: 1500, processingDays: 13 },
  { location: 'BANGKOK', name: 'SPA', maxProduction: 200, currentProduction: 150, storageCapacity: 4000, currentStock: 4000, processingDays: 27 },
  { location: 'BANGKOK', name: 'MMP', maxProduction: 200, currentProduction: 120, storageCapacity: 5000, currentStock: 3800, processingDays: 32 },
  { location: 'BANGKOK', name: 'AAI', maxProduction: 180, currentProduction: 80, storageCapacity: 7000, currentStock: 600, processingDays: 8 },
  { location: 'BANGKOK', name: 'DIAMOND', maxProduction: 100, currentProduction: 40, storageCapacity: 1500, currentStock: 400, processingDays: 10 },
  { location: 'BANGKOK', name: 'R. MONKHON', maxProduction: 90, currentProduction: 30, storageCapacity: 2000, currentStock: 150, processingDays: 5 },
  { location: 'BANGKOK', name: 'R.S CANNERY', maxProduction: 100, currentProduction: 40, storageCapacity: 4000, currentStock: 600, processingDays: 15 },
  { location: 'BANGKOK', name: 'SK FOODS', maxProduction: 120, currentProduction: 60, storageCapacity: 7000, currentStock: 800, processingDays: 13 },
  { location: 'BANGKOK', name: 'KINGFISHER', maxProduction: 200, currentProduction: 20, storageCapacity: 15000, currentStock: 200, processingDays: 10 },
  { location: 'BANGKOK', name: 'GLOBAL FROZEN', maxProduction: 50, currentProduction: 40, storageCapacity: 5000, currentStock: 800, processingDays: 20 },
];

const songkhlaCanneries: CanneryReport[] = [
  { location: 'SONGKHLA', name: 'CMC', maxProduction: 300, currentProduction: 150, storageCapacity: 10000, currentStock: 2500, processingDays: 17 },
  { location: 'SONGKHLA', name: 'SCC', maxProduction: 250, currentProduction: 50, storageCapacity: 7000, currentStock: 900, processingDays: 18 },
  { location: 'SONGKHLA', name: 'SIAM', maxProduction: 200, currentProduction: 60, storageCapacity: 5000, currentStock: 800, processingDays: 13 },
  { location: 'SONGKHLA', name: 'TRP', maxProduction: 150, currentProduction: 70, storageCapacity: 5000, currentStock: 1400, processingDays: 20 },
];

const highRejections: HighRejection[] = [
  {
    carrier: 'BAO LUCKY', sourceVessel: 'S/CHAL', cannery: 'CMC',
    items: [
      { species: 'SKJ', mt: 152.504, ratePct: 6.99, thresholdPct: 5.5 },
      { species: 'YF', mt: 20.834, ratePct: 3.05, thresholdPct: 1.85 },
    ],
    quantityMt: 205.406, balanceMt: 108.25,
  },
  {
    carrier: 'HIKARI 1', sourceVessel: 'S/SPR', cannery: 'AAI',
    items: [{ species: 'SKJ', mt: 43.139, ratePct: 2.58 }],
    quantityMt: 431.3, balanceMt: 388.161,
  },
  {
    carrier: 'SHIN FUJI', sourceVessel: 'S/EXP', cannery: 'TUG',
    items: [{ species: 'SKJ', mt: 172.039, ratePct: 2.25, thresholdPct: 2.19 }],
    quantityMt: 256.55, balanceMt: 83.48,
  },
  {
    carrier: 'HIKARI 1', sourceVessel: 'N/STAR', cannery: 'CMC',
    items: [{ species: 'YF', mt: 0.409, ratePct: 17.08 }],
    quantityMt: 90.744, balanceMt: 90.335,
  },
  {
    carrier: 'HIKARI 1', sourceVessel: 'N/STAR', cannery: 'CMC',
    items: [
      { species: 'SKJ', mt: 6.404, ratePct: 3.95 },
      { species: 'YF', mt: 4.728, ratePct: 8.95 },
    ],
    quantityMt: 316.55, balanceMt: 305.868,
  },
];

/**
 * 방콕사무소 주간보고 2026-09-23 판.
 *
 * 원문에 오류가 있어 반영 전에 문서와 마스터 엑셀(`데이터 정리.xlsx`)을 고쳤다. 아래 수치는
 * **정정본** 기준이고, `source.corrections` 가 무엇을 고쳤는지 들고 있다. sha256 도 정정본의 것이다.
 */
export const logisticsWeeklyReport = {
  source: {
    file: '20260923 Bangkok Office Weekly Report.docx',
    reportDate: '2026-09-23',
    sha256: 'eab43fa3777620eaab20289138d83b3fc04cadcadbdd7e7fffa7279ea0ce8e43',
    corrections: [
      '입항표에서 빠져 있던 SEIN QUEEN(2,902MT·FCF)·ZHONG YU MARINE(5,025MT·직거래)을 되살리고 합계를 5척 17,111MT → 7척 26,486MT 로 고쳤다.',
      '2026년 월별표 9월 행이 전주 값(5척 21,150MT)으로 남아 있어 4척 14,539MT·3척 11,947MT·계 7척 26,486MT 로 고쳤다. 합계행은 이미 갱신돼 있었다.',
      '2023년 합계 627,248MT → 616,440MT(2022년 소계를 잘못 옮긴 값), 2025년 FCF 214,135 → 241,235MT·ITOCHU 127,276 → 127,006MT·합계 615,865 → 615,695MT.',
      '9/16 부터 「6. High SALT」 절이 빠져 번호가 5 → 7 로 건너뛰던 것을 6. Other 로 당겼다.',
    ],
  },
  traderReceipts: {
    monthly: monthlyReceipts,
    latestMonth: monthlyReceipts[8],
    traders: [
      { key: 'FCF', label: 'FCF', total: 147141 },
      { key: 'ITOCHU', label: 'ITOCHU', total: 36731 },
      { key: 'TRI MARINE', label: 'TRI MARINE', total: 56463 },
      { key: 'direct', label: '직거래', total: 119649 },
      { key: 'Maldives', label: '몰디브', total: 0 },
    ],
    total: 359984,
    reconciliationNote: '9월 행 정정 후 월별 합산이 원문 합계행 359,984MT와 일치합니다.',
  },
  canneries: {
    bangkok: bangkokCanneries,
    songkhla: songkhlaCanneries,
  },
  unloading: {
    /** 9월 방콕 반입 운반선 - 원문 B. Incoming Vessels(정정본) */
    vessels: [
      { trader: 'FCF', name: 'FONG KUO 818', amount: 4880 },
      { trader: 'FCF', name: 'SEIN QUEEN', amount: 2902 },
      { trader: 'FCF', name: 'FONG KUO 819', amount: 4911 },
      { trader: 'FCF', name: 'SEIN GALAXY', amount: 1846 },
      { trader: 'DIRECT', name: 'SEITA MARU', amount: 3432 },
      { trader: 'DIRECT', name: 'ZHONG YU MARINE', amount: 5025 },
      { trader: 'DIRECT', name: 'RYOMA', amount: 3490 },
    ],
    currentTotal: { vessels: 7, amount: 26486 },
    monthToDate: { vessels: 7, amount: 26486 },
    /** 원문 「Unloading Vessel: BANGKOK 5」 - 보고 시점에 방콕에서 하역 중인 척수 */
    unloadingNow: { port: '방콕', vessels: 5 },
  },
  market: {
    rawMaterialPriceUsdPerMt: 2300,
    reportDate: '2026-09-23',
    basis: '트레이더-통조림 공장 협의 가격',
  },
  /** 원문 5. High Rejection. 「6. High SALT」 절은 9/16 판부터 원문에서 빠졌다 */
  highRejections,
} as const;
