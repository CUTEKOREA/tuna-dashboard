/**
 * COSMO 주간 Word 업무보고에서 엑셀에 없는 운영 문장만 정규화한다.
 * 수주·판매·생산·구매·재고·현금 수치는 cosmo_2026.json이 정본이다.
 *
 * 주마다 보고되는 항목이 다르다. 36주차에는 품질 심사도 하역도 없었는데,
 * 이 계약이 35주차 값을 그대로 들고 있으면 화면이 지난주 사건을
 * 「36주차 업무 브리핑」으로 내보낸다(2026-09-10 실측). 그래서 그 두 항목은
 * nullable 이고, 없는 주에는 그 주가 실제 보고한 물류·차주 계획이 대신 들어간다.
 *
 * 개인 이름은 저장소에 남기지 않는다 — 원문의 인명은 직급·역할로 바꾼다.
 */
export const cosmoWeeklyReport = {
  source: {
    file: '2026.9.23_COSMO 주간보고 (38주차).docx',
    sha256: '595f26550aa70f355c6afb040598ff88c5fa63b3241d2c91e803aaae78a60d98',
    period: '2026-09-14~2026-09-20',
  },
  market: {
    productionSecuredThrough: '2026년 생산분',
    summary: '바이어들이 현 제품 가격에 부담을 느껴 소량 구매가 이어지고 있습니다. 독일 REWE·EDEKA 입찰 참여를 검토 중이며 예상 물량은 약 700 FCL, 전량 MSC 제품입니다.',
    rawFishPressure:
      '에콰도르의 높은 어가와 가다랑어 원료 부족으로 선적 지연이 발생하고 있습니다. '
      + '2027년 선적분은 현재 오퍼 중이라는 것이 이번 주 보고의 상태입니다.',
  },
  litigation: {
    case: '아프리카 스타',
    amountUsd: 540_000,
    status: '재심리 재판 진행 중',
  },
  operations: {
    qualityFocus: '9/21 가나 공휴일로 주 4일만 생산했습니다.',
    /** 그 주에 심사가 없으면 null. 지난 심사를 이번 주 일처럼 내보내지 않는다. */
    audit: null as null | { name: string; start: string; end: string; result?: string },
    /** 그 주에 하역이 없으면 null. */
    unloading: null as null | {
      active: string | null;
      activeSince: string | null;
      next: string | null;
      nextDate: string | null;
      completed: ReadonlyArray<{ vessel: string; skjMt: number; ggMt: number; totalMt: number }>;
    },
    /** 심사·하역이 없는 주에 브리핑 카드를 채우는 그 주의 물류 현황. */
    logistics: {
      headline: '가나 공휴일로 주 4일 생산',
      detail: '9/21 가나 공휴일 · 38주차 공장 출고 19컨 · CY 선적대기 66컨(전주 74컨) · 원어구매 비중 PANOFI 99.8%',
    },
  },
  nextActions: [
    '3분기 결산을 위한 재고 조사 실시',
    '독일 REWE·EDEKA 입찰 참여 검토 (약 700 FCL, 전량 MSC)',
  ],
} as const;
