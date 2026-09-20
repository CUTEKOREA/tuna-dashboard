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
    file: '2026.9.16_COSMO 주간보고 (37주차).docx',
    sha256: 'f9d19fdb62ac2eaeb3fb81f23101b7f63a29619c73dcafc33f4e03ee53239878',
    period: '2026-09-07~2026-09-13',
  },
  market: {
    productionSecuredThrough: '2026년 12월 둘째 주 생산분',
    summary: '바이어들이 물량 확보를 타진하고 있으나 어가 상승이 이어지며 구매 부담이 커져 협상이 지연되고 있습니다.',
    rawFishPressure:
      '베트남 업체들이 2027년 1월 1일부터 적용되는 면세 쿼터를 선제적으로 활용해 타 지역 대비 케이스당 $10 이상 낮은 가격으로 오퍼하고 있습니다. '
      + '현 원가 수준에서는 현실적으로 맞서기 어렵다는 것이 이번 주 보고의 판단입니다.',
  },
  litigation: {
    case: '아프리카 스타',
    amountUsd: 540_000,
    status: '재심리 재판 진행 중',
  },
  operations: {
    qualityFocus: '대만 SK은행 인터넷뱅킹 보안카드가 만료돼 가나 송금이 일시 지연됐고, 갱신 절차를 진행 중입니다.',
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
      headline: '가나 송금 일시 지연',
      detail: '대만 SK은행 인터넷뱅킹 보안카드 만료 · 갱신 절차 진행 중, 완료 즉시 송금 재개 예정 · 37주차 공장 출고 19컨 · CY 선적대기 74컨',
    },
  },
  nextActions: [
    '2025 사업연도 법인 원천세 GRA 세무조사 레터 수령 (실제 조사는 10월부터)',
    '대만 SK은행 보안카드 갱신 완료 후 가나 송금 재개',
  ],
} as const;
