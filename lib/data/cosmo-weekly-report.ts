/**
 * COSMO 35주차 Word 업무보고에서 엑셀에 없는 운영 문장만 정규화한다.
 * 수주·판매·생산·구매·재고·현금 수치는 cosmo_2026.json이 정본이다.
 */
export const cosmoWeeklyReport = {
  source: {
    file: '2026.9.2_COSMO 주간보고 (35주차).docx',
    sha256: '49dddff739c221a5fb97f19ac292d8fec4da01f8b09e32d2a85a36507c6803a6',
    period: '2026-08-24~2026-08-30',
  },
  market: {
    productionSecuredThrough: '2026년 11월 셋째 주 생산분',
    summary: '원어 가격 상승분이 제품 판매가격에 점진적으로 반영되는 추세입니다.',
    rawFishPressure: '일부 바이어가 물량 확보에 나섰으나 높아진 오퍼 가격 탓에 구매 협상이 어렵고, 에콰도르·필리핀 공급업체의 납품 지연과 계약 불이행으로 영국 Booker와 Country Range가 대체 공급처와 Spot 물량을 찾고 있습니다.',
  },
  litigation: {
    case: '아프리카 스타',
    amountUsd: 540_000,
    status: '재심리 재판 진행 중',
  },
  operations: {
    qualityFocus: 'MSC 선박 출항 일정이 사전 공지 없이 바뀌어 컨테이너 출고가 지연되고 있습니다.',
    audit: {
      name: '식품안전 불시 심사(BRC/IFS)',
      start: '2026-08-24',
      end: '2026-08-28',
      result: 'A+ 등급 유지',
    },
    unloading: {
      active: 'P/DIS',
      activeSince: '2026-08-29',
      next: null,
      nextDate: null,
      completed: [
        { vessel: 'P/MAS', skjMt: 575, ggMt: 6, totalMt: 581 },
        { vessel: 'P/DIS', skjMt: 620, ggMt: 8, totalMt: 628 },
      ],
    },
  },
  nextActions: [
    '주 5일 생산',
    '8월 결산 업무 진행',
  ],
} as const;
