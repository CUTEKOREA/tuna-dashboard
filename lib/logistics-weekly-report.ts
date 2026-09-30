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
  { month: '9월', FCF: 14539, ITOCHU: 3415, 'TRI MARINE': 0, direct: 11747, Maldives: 0, total: 29701 },
] as const;

const bangkokCanneries: CanneryReport[] = [
  { location: 'BANGKOK', name: 'THAI UNION', maxProduction: 1300, currentProduction: 700, storageCapacity: 62000, currentStock: 43000, processingDays: 61 },
  { location: 'BANGKOK', name: 'SEA VALUE', maxProduction: 1000, currentProduction: 550, storageCapacity: 55000, currentStock: 26000, processingDays: 47 },
  { location: 'BANGKOK', name: 'GOLDEN PRIZE', maxProduction: 350, currentProduction: 220, storageCapacity: 25000, currentStock: 6000, processingDays: 27 },
  { location: 'BANGKOK', name: 'PATAYA FOOD', maxProduction: 250, currentProduction: 100, storageCapacity: 15000, currentStock: 1300, processingDays: 13 },
  { location: 'BANGKOK', name: 'SPA', maxProduction: 200, currentProduction: 150, storageCapacity: 4000, currentStock: 4000, processingDays: 27 },
  { location: 'BANGKOK', name: 'MMP', maxProduction: 200, currentProduction: 120, storageCapacity: 5000, currentStock: 3800, processingDays: 32 },
  { location: 'BANGKOK', name: 'AAI', maxProduction: 180, currentProduction: 80, storageCapacity: 7000, currentStock: 600, processingDays: 8 },
  { location: 'BANGKOK', name: 'DIAMOND', maxProduction: 100, currentProduction: 40, storageCapacity: 1500, currentStock: 300, processingDays: 8 },
  { location: 'BANGKOK', name: 'R. MONKHON', maxProduction: 90, currentProduction: 30, storageCapacity: 2000, currentStock: 200, processingDays: 7 },
  { location: 'BANGKOK', name: 'R.S CANNERY', maxProduction: 100, currentProduction: 40, storageCapacity: 4000, currentStock: 500, processingDays: 13 },
  { location: 'BANGKOK', name: 'SK FOODS', maxProduction: 120, currentProduction: 60, storageCapacity: 7000, currentStock: 700, processingDays: 12 },
  { location: 'BANGKOK', name: 'KINGFISHER', maxProduction: 200, currentProduction: 20, storageCapacity: 15000, currentStock: 200, processingDays: 10 },
  { location: 'BANGKOK', name: 'GLOBAL FROZEN', maxProduction: 50, currentProduction: 40, storageCapacity: 5000, currentStock: 700, processingDays: 18 },
];

const songkhlaCanneries: CanneryReport[] = [
  { location: 'SONGKHLA', name: 'CMC', maxProduction: 300, currentProduction: 150, storageCapacity: 10000, currentStock: 2200, processingDays: 15 },
  { location: 'SONGKHLA', name: 'SCC', maxProduction: 250, currentProduction: 50, storageCapacity: 7000, currentStock: 900, processingDays: 18 },
  { location: 'SONGKHLA', name: 'SIAM', maxProduction: 200, currentProduction: 60, storageCapacity: 5000, currentStock: 700, processingDays: 12 },
  { location: 'SONGKHLA', name: 'TRP', maxProduction: 150, currentProduction: 70, storageCapacity: 5000, currentStock: 1200, processingDays: 17 },
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
    quantityMt: 256.55, balanceMt: 84.511,
  },
  {
    carrier: 'HIKARI 1', sourceVessel: 'N/STAR', cannery: 'CMC',
    items: [
      { species: 'SKJ', mt: 6.581, ratePct: 2.24 },
      { species: 'YF', mt: 0.409, ratePct: 17.08 },
    ],
    quantityMt: 90.744, balanceMt: 83.754,
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
 * 방콕사무소 주간보고 2026-09-30 판.
 *
 * 원문이 9/23 **수정 전** 서식으로 작성돼 지난주 정정분이 되돌아가 있었고, 이번 주에 새로 생긴 오류도 있었다.
 * 반영 전에 문서를 고쳤다(원본은 같은 폴더 `…backup_before_fix.docx`). 아래 수치는 **정정본** 기준이고
 * sha256 도 정정본의 것이다. 마스터 엑셀(`데이터 정리.xlsx`)에는 CHERRY STAR 가 아직 없다.
 */
export const logisticsWeeklyReport = {
  source: {
    file: '20260930 Bangkok Office Weekly Report .docx',
    reportDate: '2026-09-30',
    sha256: '4c68e365c346e874acc60dbc63a8dbf416a976d44ee2c2bcc3f7126a6eeb30a7',
    corrections: [
      '원문이 9/23 수정 전 서식으로 작성돼 되돌아간 지난주 정정분을 다시 고쳤다 — 2023년 합계 627,248 → 616,440MT·선박 218 → 213척, 2025년 FCF 214,135 → 241,235·ITOCHU 127,276 → 127,006·합계 615,865 → 615,695MT, BAO LUCKY 행 SKJ 표기, 7. Other → 6. Other.',
      'RYOMA 원문 3,490MT → 3,290MT(TTA 운반선 주간동향, 9/24 확인). 하역 중 표 합계 11,785 → 11,585MT, 9월 직거래 11,947 → 11,747·9월 합계 29,901 → 29,701MT, 2026 직거래 119,649 → 119,449·총계 363,399 → 363,199MT.',
      '캐너리 재고 SUM 이 행 합계와 달라 방콕 86,600 → 87,300MT(가공가능일수 40 → 41일)·송클라 5,100 → 5,000MT 로 고쳤고, 본문 저장률 「방콕 44%·송클라 21%」(지난주 값)를 42%·19% 로 갱신했다.',
      'SHIN FUJI 잔량 83.480 → 84.511MT(반입 256.550 − 처리 172.039, 9/16 판부터 1.031MT 어긋남).',
    ],
  },
  traderReceipts: {
    monthly: monthlyReceipts,
    latestMonth: monthlyReceipts[8],
    traders: [
      { key: 'FCF', label: 'FCF', total: 147141 },
      { key: 'ITOCHU', label: 'ITOCHU', total: 40146 },
      { key: 'TRI MARINE', label: 'TRI MARINE', total: 56463 },
      { key: 'direct', label: '직거래', total: 119449 },
      { key: 'Maldives', label: '몰디브', total: 0 },
    ],
    total: 363199,
    reconciliationNote: '9월 행(CHERRY STAR 3,415MT 포함)과 RYOMA(3,490 → 3,290MT) 정정 후 월별 합산은 363,199MT입니다.',
  },
  canneries: {
    bangkok: bangkokCanneries,
    songkhla: songkhlaCanneries,
  },
  unloading: {
    /** 원문 A. 하역 중 운반선 표(정정본). 9/23 판은 9월 누계 전체를 적었고 9/30 판은 하역 중인 3척만 적는다 */
    vessels: [
      { trader: 'FCF', name: 'FONG KUO 818', amount: 4880 },
      { trader: 'ITOCHU', name: 'CHERRY STAR', amount: 3415 },
      { trader: 'DIRECT', name: 'RYOMA', amount: 3290 },
    ],
    currentTotal: { vessels: 3, amount: 11585 },
    /** 원문 「The cumulative number of carriers was 8 … 29,701 MT in SEP」(정정본) - 월별표 9월 행과 같다 */
    monthToDate: { vessels: 8, amount: 29701 },
    /** 원문 「Unloading Vessel: BANGKOK 3」 - 보고 시점에 방콕에서 하역 중인 척수 */
    unloadingNow: { port: '방콕', vessels: 3 },
    /** 관제판 「반입 누계 정정 반영」 설명 - 주마다 경위가 달라 계약이 든다 */
    correctionNote: '수정 전 서식에서 되살아난 RYOMA 3,490MT 를 TTA 기준 3,290MT 로 다시 내리고, 새로 들어온 CHERRY STAR(ITOCHU 3,415MT)를 더해 월별표와 맞췄습니다.',
  },
  market: {
    rawMaterialPriceUsdPerMt: 2300,
    reportDate: '2026-09-30',
    basis: '트레이더-통조림 공장 협의 가격',
  },
  /** 원문 5. High Rejection. 「6. High SALT」 절은 9/16 판부터 원문에서 빠졌다 */
  highRejections,
} as const;
