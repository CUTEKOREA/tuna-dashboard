export type CanneryReport = {
  location: 'BANGKOK' | 'SONGKHLA';
  name: string;
  maxProduction: number;
  currentProduction: number;
  storageCapacity: number;
  currentStock: number;
  processingDays: number;
};

const monthlyReceipts = [
  { month: '1월', FCF: 26344, ITOCHU: 6907, 'TRI MARINE': 3770, direct: 18929, Maldives: 0, total: 55950 },
  { month: '2월', FCF: 14155, ITOCHU: 0, 'TRI MARINE': 9486, direct: 19840, Maldives: 0, total: 43481 },
  { month: '3월', FCF: 11700, ITOCHU: 4915, 'TRI MARINE': 2113, direct: 11925, Maldives: 0, total: 30653 },
  { month: '4월', FCF: 14206, ITOCHU: 9963, 'TRI MARINE': 13933, direct: 22181, Maldives: 0, total: 60283 },
  { month: '5월', FCF: 32638, ITOCHU: 3371, 'TRI MARINE': 9413, direct: 3485, Maldives: 0, total: 48907 },
  { month: '6월', FCF: 13749, ITOCHU: 2924, 'TRI MARINE': 9465, direct: 23719, Maldives: 0, total: 49857 },
  { month: '7월', FCF: 4100, ITOCHU: 3711, 'TRI MARINE': 8283, direct: 3059, Maldives: 0, total: 19153 },
  { month: '8월', FCF: 3951, ITOCHU: 4940, 'TRI MARINE': 0, direct: 0, Maldives: 0, total: 8891 },
] as const;

const bangkokCanneries: CanneryReport[] = [
  { location: 'BANGKOK', name: 'THAI UNION', maxProduction: 1300, currentProduction: 900, storageCapacity: 62000, currentStock: 62000, processingDays: 69 },
  { location: 'BANGKOK', name: 'SEA VALUE', maxProduction: 1000, currentProduction: 700, storageCapacity: 55000, currentStock: 40000, processingDays: 57 },
  { location: 'BANGKOK', name: 'GOLDEN PRIZE', maxProduction: 350, currentProduction: 300, storageCapacity: 25000, currentStock: 6000, processingDays: 20 },
  { location: 'BANGKOK', name: 'PATAYA FOOD', maxProduction: 250, currentProduction: 150, storageCapacity: 15000, currentStock: 1900, processingDays: 13 },
  { location: 'BANGKOK', name: 'SPA', maxProduction: 200, currentProduction: 150, storageCapacity: 4000, currentStock: 4000, processingDays: 27 },
  { location: 'BANGKOK', name: 'MMP', maxProduction: 200, currentProduction: 140, storageCapacity: 5000, currentStock: 4400, processingDays: 31 },
  { location: 'BANGKOK', name: 'AAI', maxProduction: 180, currentProduction: 80, storageCapacity: 7000, currentStock: 700, processingDays: 9 },
  { location: 'BANGKOK', name: 'DIAMOND', maxProduction: 100, currentProduction: 40, storageCapacity: 1500, currentStock: 200, processingDays: 5 },
  { location: 'BANGKOK', name: 'R. MONKHON', maxProduction: 90, currentProduction: 30, storageCapacity: 2000, currentStock: 200, processingDays: 7 },
  { location: 'BANGKOK', name: 'R.S CANNERY', maxProduction: 100, currentProduction: 40, storageCapacity: 4000, currentStock: 500, processingDays: 13 },
  { location: 'BANGKOK', name: 'SK FOODS', maxProduction: 120, currentProduction: 60, storageCapacity: 7000, currentStock: 700, processingDays: 12 },
  { location: 'BANGKOK', name: 'KINGFISHER', maxProduction: 200, currentProduction: 20, storageCapacity: 15000, currentStock: 200, processingDays: 10 },
  { location: 'BANGKOK', name: 'GLOBAL FROZEN', maxProduction: 50, currentProduction: 40, storageCapacity: 5000, currentStock: 1500, processingDays: 38 },
];

const songkhlaCanneries: CanneryReport[] = [
  { location: 'SONGKHLA', name: 'CMC', maxProduction: 300, currentProduction: 150, storageCapacity: 10000, currentStock: 2000, processingDays: 13 },
  { location: 'SONGKHLA', name: 'SCC', maxProduction: 250, currentProduction: 50, storageCapacity: 7000, currentStock: 900, processingDays: 18 },
  { location: 'SONGKHLA', name: 'SIAM', maxProduction: 200, currentProduction: 60, storageCapacity: 5000, currentStock: 600, processingDays: 12 },
  { location: 'SONGKHLA', name: 'TRP', maxProduction: 150, currentProduction: 70, storageCapacity: 5000, currentStock: 1000, processingDays: 13 },
];

export const logisticsWeeklyReport = {
  source: {
    file: '20260805 Bangkok Office Weekly Report.docx',
    reportDate: '2026-08-05',
    sha256: '2ddb233def797ab6b0cd04dd3180b33e55ef88223a658039e0413acd47e249b1',
  },
  traderReceipts: {
    monthly: monthlyReceipts,
    august: monthlyReceipts[7],
    traders: [
      { key: 'FCF', label: 'FCF', total: 120843 },
      { key: 'ITOCHU', label: 'ITOCHU', total: 36731 },
      { key: 'TRI MARINE', label: 'TRI MARINE', total: 56463 },
      { key: 'direct', label: '직거래', total: 103138 },
      { key: 'Maldives', label: '몰디브', total: 0 },
    ],
    total: 317175,
    reconciliationNote: 'TRI MARINE 누계 56,463MT 정정 확인. 월별 합계와 일치.',
  },
  canneries: {
    bangkok: bangkokCanneries,
    songkhla: songkhlaCanneries,
  },
  unloading: {
    vessels: [
      { trader: 'FCF', name: 'SEA STAR V', amount: 3951 },
      { trader: 'ITO', name: 'SEIN PRINCESS', amount: 4940 },
      { trader: 'TRI', name: 'LAKE PEARL', amount: 4873 },
    ],
    currentTotal: { vessels: 3, amount: 13764 },
    monthToDate: { vessels: 2, amount: 8891 },
    incoming: [
      {
        name: 'SEIN VENUS',
        estimatedArrival: '2026-08-05',
        confirmationStatus: '하역 완료 확인',
        confirmationDate: '2026-08-22',
        confirmationEvidence: '하역 원장 2026.08.07~08.22',
      },
      {
        name: 'HENG HONG 9',
        estimatedArrival: '2026-08-06',
        confirmationStatus: '입항·배분 보고 확인',
        confirmationDate: '2026-08-06',
        confirmationEvidence: '31·32주차 운반선 배분 보고',
      },
    ],
  },
  market: {
    rawMaterialPriceUsdPerMt: 1930,
    reportDate: '2026-08-05',
    basis: '트레이더-통조림 공장 협의 가격',
  },
  qualityIssues: [
    { category: '고반려', cannery: 'TUG', vessels: 'DINOK·SHIN FUJI', remainingAmount: 923.092 },
    { category: '고반려', cannery: 'CMC', vessels: 'BAO LUCKY', remainingAmount: 109.767 },
    { category: '고반려', cannery: 'UC', vessels: 'BAO LUCKY', remainingAmount: 218.277 },
    { category: '고염도', cannery: 'TUM', vessels: 'BAO LUCKY·SHIN FUJI', affectedAmount: 217.103, claimUsd: 6493.44 },
  ],
} as const;
