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
    file: '2026.10.07_COSMO 주간보고 (40주차).docx',
    sha256: 'c63587a802ee7bcf193dbaf1081ff0484a8277aca94ad81dd7542d395865a497',
    period: '2026-09-28~2026-10-04',
  },
  market: {
    productionSecuredThrough: '2026년 생산분',
    summary: '2027년 1분기 물량 오퍼를 준비 중이며 차주부터 본격적으로 오퍼를 낼 예정입니다. 바이어 구매 문의와 수요는 이어지고 있으나, 어가 하락 가능성을 내다보고 구매 결정에는 다소 신중한 분위기입니다.',
    rawFishPressure:
      '에콰도르 캐너리는 원어 어가가 여전히 $2,350/MT 수준인데도 향후 어가 하락을 미리 반영해 지난주부터 제품 오퍼 가격을 내리고 있습니다. '
      + '원어구매 비중은 PANOFI 99.8%입니다.',
  },
  litigation: {
    case: '아프리카 스타',
    amountUsd: 540_000,
    status: '재심리 재판 진행 중',
  },
  operations: {
    qualityFocus: '3분기 결산 업무와 2025년 사업연도 GRA 세무조사가 진행 중입니다.',
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
      headline: '2025년 GRA 세무조사',
      detail: '40주차 공장 출고 18컨 · CY 선적대기 38컨 · CBU 제품 재고 564만불(공장 321만 + CY 243만) · 원어구매 비중 PANOFI 99.8%',
    },
  },
  nextActions: [
    '과장급 파리 SIAL 박람회 참석 출장(10/12~10/22, 런던·파리)',
    '2027년 1분기 물량 오퍼 본격 진행',
  ],
} as const;
