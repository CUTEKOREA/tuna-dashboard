/**
 * COSMO 34주차 Word 업무보고에서 엑셀에 없는 운영 문장만 정규화한다.
 * 수주·판매·생산·구매·재고·현금 수치는 cosmo_2026.json이 정본이다.
 */
export const cosmoWeeklyReport = {
  source: {
    file: '2026.8.27_COSMO 주간보고 (34주차).docx',
    sha256: '6a0d61f15f28732766e926d2e19e1469f314a8a98f71272fe2caece8b7f0a5eb',
    period: '2026-08-17~2026-08-23',
  },
  market: {
    productionSecuredThrough: '2026년 11월 둘째 주 생산분',
    summary: '추가 구매 수요는 이어지지만 원어 확보가 어렵고 처리량도 낮아 신규 제안을 신중히 검토 중입니다.',
    rawFishPressure: '에콰도르와 필리핀의 높은 어가로 일부 업체가 신규 제안을 멈추고 기존 계약의 납기도 지연되고 있습니다.',
  },
  litigation: {
    case: '아프리카 스타',
    amountUsd: 540_000,
    status: '재심리 재판 진행 중',
  },
  operations: {
    qualityFocus: '클리닝 품질을 개선하면서 생산성과 수율 저하를 최소화하도록 관리 중입니다.',
    audit: {
      name: '식품안전 불시 심사(BRC/IFS)',
      start: '2026-08-24',
      end: '2026-08-28',
    },
    unloading: {
      active: 'P/MAS',
      activeSince: '2026-08-23',
      next: 'P/DIS',
      nextDate: '2026-08-29',
    },
  },
  nextActions: [
    'P/DIS 하역 진행',
    '8월 결산 업무 진행',
  ],
} as const;
