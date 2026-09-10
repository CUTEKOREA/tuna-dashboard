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
    file: '2026.9.9_COSMO 주간보고 (36주차).docx',
    sha256: 'fd917193bb2b3716a37ba470f735a8d6c2e4bed6550ab58ea255ed3c416602c1',
    period: '2026-08-31~2026-09-06',
  },
  market: {
    productionSecuredThrough: '2026년 11월 셋째 주 생산분',
    summary: '판매단가 상승 부담으로 바이어들이 신규 물량 구매를 최소화하며 관망세를 유지하고 있습니다.',
    rawFishPressure:
      '베트남 EU 면세 쿼터가 2027년 1월 1일부터 적용될 예정이라 베트남 업체들이 낮은 가격으로 오퍼를 시작했고(10~11월 선적분이 12월 말~1월 초 유럽 도착 예상), '
      + '모리셔스 Princes 공장은 인도양 원어 $1,800/MT를 기준으로 에콰도르 대비 약 17% 낮은 가격을 제시해 영국 Morrison’s Tender 수주 가능성이 거론됩니다. '
      + '잔여 플레이크 재고는 중국·베트남 오퍼가가 약 $20/case로 코스모보다 $10/case 이상 낮아 신규 수주가 어렵습니다.',
  },
  litigation: {
    case: '아프리카 스타',
    amountUsd: 540_000,
    status: '재심리 재판 진행 중',
  },
  operations: {
    qualityFocus: 'MPS 항만 혼잡이 심해져 선적 지연이 이어지고, 약 30개 이상 컨테이너가 Gate-in 에 실패해 다음 선박편으로 이월됐습니다.',
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
      headline: 'MPS 항만 혼잡',
      detail: '컨테이너 30개 이상 Gate-in 실패 · 다음 선박편 이월 · 8월 결산 업무 진행 중',
    },
  },
  nextActions: [
    '과장급 유럽 출장 (9/13~9/19, 독일·네덜란드·벨기에)',
    '8월 결산 업무 진행',
  ],
} as const;
