/** COSMO 월간 업무보고 — 주간보고·월별 손익에 없는 수치만 담는다.
 *  손익(YoY·누적)은 cosmo_2026.json monthly 가 정본이므로 여기 중복하지 않는다.
 *  금액 단위는 원문 표기 그대로 «만불»(USD 1만). */
export const cosmoMonthlyReport = {
  source: {
    file: 'COSMO 월간보고 (8월).pptx',
    title: 'COSMO 7월 업무보고',
    reportDate: '2026-08-25',
    sha256: '107b9ccac5e2e554d7c741af3fe21fe8dbe7d665b7a28664e69a437b1097c78d',
  },

  /** 유동성 — begin=1.1, end=7.31. 연초 현금부족 −562 는 원문 인쇄값(행 계산은 −561, 원문 반올림). */
  liquidity: {
    asOf: '7/31',
    cash: { begin: 337, end: 493 },
    ar: { begin: 207, end: 883 },
    ap: { begin: 1105, end: 1942 },
    shortfall: { begin: -562, end: -566 },
  },

  /** 재고자산 — begin=1.1, end=7.31 */
  inventory: {
    asOf: '7/31',
    raw: { begin: 366, end: 130 },
    product: { begin: 1189, end: 1283 },
    materials: { begin: 416, end: 371 },
    total: { begin: 1971, end: 1784 },
  },

  /** 월별 생산계획 개정 — 8월부터는 실적이 아니라 «실적/변경» 행의 변경계획이다 */
  productionPlan: {
    augustPlanMt: 2730,
    augustRevisedMt: 2310,
    annualPlanMt: 29000,
    annualRevisedMt: 26118,
    september: { days: 21, dailyMt: 110, totalMt: 2310 },
  },

  /** 수주 단가 인상 — 어가 상승분 반영, 인상 단가로 수주 진행 중. 리테일 Tender 참여는 당분간 자제. */
  orderPrice: { fromUsd: 46.0, toUsd: 49.5, basis: '$2kg 기준' },

  panofiPayable: { asOf: '7/31', usd10k: 1864 },

  rawStock: { asOf: '8/21', sjMt: 3396, yfMt: 26, mixMt: 620 },

  /** 9~10월 주요 업무 — 원문 요지 */
  agenda: [
    'BRC/IFS Unannounced Audit 실시 예정 (8월 말~9월 초)',
    '필리핀 직원 채용(8/10 업무 시작) — 9월부터 2nd Shift 가동',
    '대만 SK은행 3년 약정 대출 갱신 완료 (기존 동일 조건)',
  ],
} as const
