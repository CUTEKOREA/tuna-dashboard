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

  /** 같은 7월 업무보고의 나중 판본(docx). 월별 원어 처리량·컨테이너 출고 표는 pptx 3쪽 표와
   *  숫자가 완전히 같고, 유동성·재고자산 표는 pptx 에만 있다. 달라진 것은 서술뿐이다 —
   *  pptx 의 「클리닝 품질개선 집중 → 생산성·수율 저하 최소화」가 docx 에서
   *  「OTTO FRANCK 품질불량 클레임 대책수립 후 실행 중(보고파일 첨부)」으로 구체화됐고,
   *  BRC/IFS 심사가 예정에서 완료·A+ 로 확정됐다. */
  docSource: {
    file: 'COSMO 2026 07 업무보고.docx',
    sha256: 'f89ee979f7389ff7cd3ff4bfcda0a51c29813be2405c35e09536a5a61802ac5b',
    received: '2026-09-04',
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
    /** 9월은 월별 표(21일 × 120톤 = 2,520 MT)를 따른다. docx 와 pptx 3쪽 표가 같은 값이다.
     *  pptx 5쪽 「참고) 8월 생산 계획」 슬라이드만 9월 달력에 «21일 × 110톤 = 2,310톤»으로 적어
     *  같은 문서의 3쪽 표와 어긋난다. 2,310 을 쓰면 12개월 합이 25,908 이 되어
     *  두 판본이 함께 인쇄한 연간 개정치 26,118 과도 맞지 않는다. 2,310 은 8월 변경치와 같은 값이다.
     *  (그 슬라이드는 제목이 «8월»인데 달력과 캡션은 9월이라 제목도 함께 어긋나 있다.) */
    september: { days: 21, dailyMt: 120, totalMt: 2520 },
    /** pptx 5쪽 슬라이드의 값. 정본이 아니라 원문 내부 모순의 기록이다. */
    septemberPptxRaw: { days: 21, dailyMt: 110, totalMt: 2310 },
  },

  /** 월별 원어 처리량 (MT). 실적/변경 행은 1~6월이 실적, 7월 이후는 변경계획이다.
   *  원문 「차이」의 «-» 는 계획과 같다는 뜻(0)이라 여기서는 두 행의 차로 계산한다.
   *  일 처리량은 원문 인쇄값(정수 반올림)이며 처리량÷일수와 1톤 안에서 맞는다. */
  rawThroughput: {
    actualThrough: 6,
    plan: [2375, 2500, 2570, 1875, 1750, 2860, 2860, 2730, 2520, 2640, 2520, 1800],
    revised: [1540, 2191, 2126, 2128, 1640, 2364, 2414, 2310, 2520, 2640, 2520, 1725],
    days: [16.5, 20, 19, 18, 14, 21.5, 21, 21, 21, 22, 21, 15],
    dailyMt: [93, 110, 112, 118, 117, 110, 115, 110, 120, 120, 120, 115],
    annual: { planMt: 29000, revisedMt: 26118, days: 230, dailyMt: 113 },
  },

  /** 컨테이너 출고 (FCL). CBU 는 계획 대비 On Board, FBU 는 계획 구분 없이 한 행이다. */
  containers: {
    actualThrough: 6,
    cbuPlan: [85, 89, 92, 67, 62, 102, 102, 98, 90, 94, 90, 65],
    cbuOnBoard: [63, 75, 63, 49, 106, 76, 93, 95, 88, 84, 80, 62],
    fbu: [4, 2, 1, 6, 6, 8, 2, 5, 4, 3, 4, 3],
    annual: { cbuPlan: 1036, cbuOnBoard: 934, cbuGap: -102, fbu: 48 },
  },

  /** 클리너 인원 — 전년 7월 평균 713명 대비 110명 감소. 상세는 품질개선 보고에 있다. */
  cleaners: { basis: '7월 평균', y2025: 713, y2026: 603, delta: -110 },

  /** 수주 단가 인상 — 어가 상승분 반영, 인상 단가로 수주 진행 중. 리테일 Tender 참여는 당분간 자제. */
  orderPrice: { fromUsd: 46.0, toUsd: 49.5, basis: '$2kg 기준' },

  panofiPayable: { asOf: '7/31', usd10k: 1864 },

  rawStock: { asOf: '8/21', sjMt: 3396, yfMt: 26, mixMt: 620 },

  /** 기타 진행 사항 — docx 판본 기준. pptx 판본에서 «예정»이던 BRC/IFS 심사는 완료·A+ 로 확정됐다. */
  agenda: [
    'BRC/IFS Unannounced Audit 실시 완료 (8/24~8/28) - A+ 등급 유지',
    '필리핀 QC 담당 채용(8/10 업무 시작) - 9월부터 2nd Shift 관리',
    '대만 SK은행 3년 약정 대출 갱신 완료 (기존 동일 조건)',
  ],
} as const
