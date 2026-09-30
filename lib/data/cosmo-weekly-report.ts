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
    file: '2026.9.30_COSMO 주간보고 (39주차).docx',
    sha256: '02a02d6d0758661de3a4e7e6d044f042048a126cd76292c90bd90bdf149126bc',
    period: '2026-09-21~2026-09-27',
  },
  market: {
    productionSecuredThrough: '2026년 생산분',
    summary: '연말까지 생산 물량을 모두 확보해 신규 오퍼는 당분간 자제하고, 10월 중순부터 2027년 선적 물량 오퍼를 재개할 예정입니다. 독일 REWE 입찰 오퍼를 준비 중이며 에콰도르 오퍼 수준을 확인한 뒤 비슷한 가격대로 제출할 계획입니다.',
    rawFishPressure:
      '이번 주 보고에는 원어 어가·수급 서술이 없습니다. '
      + '원어구매 비중은 PANOFI 99.8%입니다.',
  },
  litigation: {
    case: '아프리카 스타',
    amountUsd: 540_000,
    status: '재심리 재판 진행 중',
  },
  operations: {
    qualityFocus: '3분기 결산 업무를 진행했습니다.',
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
      headline: '3분기 결산 업무',
      // 출고 19컨·CY 66컨은 38주차 보고와 같은 숫자다 - 원문 그대로 싣고 같다는 사실을 밝힌다
      detail: '39주차 공장 출고 19컨 · CY 선적대기 66컨(38주차 보고와 같은 숫자) · 원어구매 비중 PANOFI 99.8%',
    },
  },
  nextActions: [
    '주 5일 생산',
    '10월 중순부터 2027년 선적 물량 오퍼 재개',
  ],
} as const;
