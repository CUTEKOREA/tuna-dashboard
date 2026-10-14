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
  /** 어종별 처리량 없이 문장만 적힌 행의 원문 그대로 */
  note?: string;
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
  { month: '10월', FCF: 4840, ITOCHU: 0, 'TRI MARINE': 0, direct: 0, Maldives: 0, total: 4840 },
] as const;

const bangkokCanneries: CanneryReport[] = [
  { location: 'BANGKOK', name: 'THAI UNION', maxProduction: 1300, currentProduction: 600, storageCapacity: 62000, currentStock: 39000, processingDays: 65 },
  { location: 'BANGKOK', name: 'SEA VALUE', maxProduction: 1000, currentProduction: 500, storageCapacity: 55000, currentStock: 22000, processingDays: 44 },
  { location: 'BANGKOK', name: 'GOLDEN PRIZE', maxProduction: 350, currentProduction: 180, storageCapacity: 25000, currentStock: 5500, processingDays: 31 },
  { location: 'BANGKOK', name: 'PATAYA FOOD', maxProduction: 250, currentProduction: 80, storageCapacity: 15000, currentStock: 900, processingDays: 11 },
  { location: 'BANGKOK', name: 'SPA', maxProduction: 200, currentProduction: 120, storageCapacity: 4000, currentStock: 3300, processingDays: 28 },
  { location: 'BANGKOK', name: 'MMP', maxProduction: 200, currentProduction: 100, storageCapacity: 5000, currentStock: 3200, processingDays: 32 },
  { location: 'BANGKOK', name: 'AAI', maxProduction: 180, currentProduction: 60, storageCapacity: 7000, currentStock: 400, processingDays: 7 },
  { location: 'BANGKOK', name: 'DIAMOND', maxProduction: 100, currentProduction: 40, storageCapacity: 1500, currentStock: 200, processingDays: 5 },
  { location: 'BANGKOK', name: 'R. MONKHON', maxProduction: 90, currentProduction: 20, storageCapacity: 2000, currentStock: 150, processingDays: 8 },
  { location: 'BANGKOK', name: 'R.S CANNERY', maxProduction: 100, currentProduction: 30, storageCapacity: 4000, currentStock: 300, processingDays: 10 },
  { location: 'BANGKOK', name: 'SK FOODS', maxProduction: 120, currentProduction: 50, storageCapacity: 7000, currentStock: 400, processingDays: 8 },
  { location: 'BANGKOK', name: 'KINGFISHER', maxProduction: 200, currentProduction: 20, storageCapacity: 15000, currentStock: 200, processingDays: 10 },
  { location: 'BANGKOK', name: 'GLOBAL FROZEN', maxProduction: 50, currentProduction: 40, storageCapacity: 5000, currentStock: 500, processingDays: 13 },
];

const songkhlaCanneries: CanneryReport[] = [
  { location: 'SONGKHLA', name: 'CMC', maxProduction: 300, currentProduction: 100, storageCapacity: 10000, currentStock: 1300, processingDays: 13 },
  { location: 'SONGKHLA', name: 'SCC', maxProduction: 250, currentProduction: 50, storageCapacity: 7000, currentStock: 900, processingDays: 18 },
  { location: 'SONGKHLA', name: 'SIAM', maxProduction: 200, currentProduction: 50, storageCapacity: 5000, currentStock: 400, processingDays: 8 },
  { location: 'SONGKHLA', name: 'TRP', maxProduction: 150, currentProduction: 70, storageCapacity: 5000, currentStock: 800, processingDays: 11 },
];

const highRejections: HighRejection[] = [
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
      { species: 'SKJ', mt: 86.266, ratePct: 3.33 },
      { species: 'YF', mt: 1.292, ratePct: 17.08, thresholdPct: 8.66 },
    ],
    quantityMt: 90.744, balanceMt: 3.186,
  },
  {
    carrier: 'HIKARI 1', sourceVessel: 'N/STAR', cannery: 'CMC',
    items: [],
    quantityMt: 316.55, balanceMt: 305.868,
    note: 'All rejection 1.99 by negotiation',
  },
  {
    carrier: 'CONTAINER FROM BUSAN', sourceVessel: 'N/STAR', cannery: 'ISA',
    items: [{ species: 'SKJ', mt: 1.496, ratePct: 2.78 }],
    quantityMt: 142.63, balanceMt: 141.134,
  },
];

/**
 * 방콕사무소 주간보고 2026-10-14 판.
 *
 * 이번 주 원문도 수정 전 서식 위에 작성돼 지난주까지의 정정분이 되돌아가 있었고, 방콕 캐너리 표에 새 오류가 있었다.
 * 반영 전에 문서와 마스터 엑셀(`데이터 정리.xlsx`)을 고쳤다(원본은 같은 폴더 `…backup_before_fix.docx`·
 * `…backup_20261014.xlsx`). 아래 수치는 **정정본** 기준이고 sha256 도 정정본의 것이다.
 */
export const logisticsWeeklyReport = {
  source: {
    file: '20261014 Bangkok Office Weekly Report.docx',
    reportDate: '2026-10-14',
    sha256: 'f34cc5e62ce93282d9efc77e69fd8d1b58816f6bf18e60870661f233ccc40aa1',
    corrections: [
      '원문이 수정 전 서식 위에 작성돼 되돌아간 정정분을 다시 고쳤다 — 2023년 합계 627,248 → 616,440MT·선박 218 → 213척, 2025년 FCF 214,135 → 241,235·ITOCHU 127,276 → 127,006·합계 615,865 → 615,695MT.',
      'RYOMA 3,490 → 3,290MT(TTA 39주차)로 되돌아간 9월 직거래 11,947 → 11,747·9월 합계 29,901 → 29,701MT, 2026 직거래 119,649 → 119,449·총계 368,239 → 368,039MT.',
      '방콕 캐너리 SUM(1,840MT·44%)과 가동률·가공가능일수 칸은 갱신됐는데 생산량 두 칸이 지난주 값이라 SEA VALUE 550 → 500·R.S CANNERY 40 → 30MT 로 맞췄다. 본문 가동률 44%(방콕만) → 42%(태국 전체 2,110 ÷ 5,040).',
      'SHIN FUJI 잔량 83.480 → 84.511MT(반입 256.550 − 처리 172.039, 9/30 정정분이 다시 되돌아감). 원어 협의가 $2,360 은 원문 그대로 둔다.',
    ],
  },
  traderReceipts: {
    monthly: monthlyReceipts,
    latestMonth: monthlyReceipts[monthlyReceipts.length - 1],
    traders: [
      { key: 'FCF', label: 'FCF', total: 151981 },
      { key: 'ITOCHU', label: 'ITOCHU', total: 40146 },
      { key: 'TRI MARINE', label: 'TRI MARINE', total: 56463 },
      { key: 'direct', label: '직거래', total: 119449 },
      { key: 'Maldives', label: '몰디브', total: 0 },
    ],
    total: 368039,
    reconciliationNote: '10월 행(HUA FU 107 4,840MT)을 더하고 9월 RYOMA 를 3,290MT 로 유지한 월별 합산은 368,039MT입니다.',
  },
  canneries: {
    bangkok: bangkokCanneries,
    songkhla: songkhlaCanneries,
  },
  unloading: {
    /** 원문 A. 하역 중 운반선 표(정정본). 9/30 판부터 하역 중인 배만 적는다 - 9월 입항분이 섞인다 */
    vessels: [
      { trader: 'FCF', name: 'HUA FU 107', amount: 4840 },
    ],
    currentTotal: { vessels: 1, amount: 4840 },
    /** 원문 「The cumulative number of carriers was 1 … 4,840 MT in OCT」 - 월별표 10월 행과 같다 */
    monthToDate: { vessels: 1, amount: 4840 },
    /** 원문 「Unloading Vessel: BANGKOK 1」 - 보고 시점에 방콕에서 하역 중인 척수 */
    unloadingNow: { port: '방콕', vessels: 1 },
    /** 관제판 「반입 누계 정정 반영」 설명 - 주마다 경위가 달라 계약이 든다 */
    correctionNote: '9월 직거래에 다시 나타난 RYOMA 3,490MT 를 TTA 39주차 기준 3,290MT 로 내려 월별표와 맞췄습니다. 이번 주 하역 중인 배는 HUA FU 107 한 척입니다.',
  },
  market: {
    rawMaterialPriceUsdPerMt: 2360,
    reportDate: '2026-10-14',
    basis: '트레이더-통조림 공장 협의 가격',
  },
  /** 원문 5. High Rejection. 「6. High SALT」 절(10/14 판 SEIN GALAXY 1건 $1,532.60)은 /bangkok-office 의 소금 클레임 계열로만 싣는다 */
  highRejections,
} as const;
