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
    file: '2026.10.14_COSMO 주간보고 (41주차).docx',
    sha256: 'fcbfe5d62a16563649fcdb7b28124d8960f2a7a3c6d8e3fba16a1a6073a6ba17',
    period: '2026-10-05~2026-10-11',
  },
  market: {
    productionSecuredThrough: '2026년 생산분',
    summary: '2027년 1분기 생산 물량에 대한 오퍼를 시작했습니다. 2026년 생산분은 이미 확보했습니다.',
    rawFishPressure:
      '어가가 하락세로 전환되면서 시장 내 오퍼 가격도 내려가고 있습니다. '
      + '원어구매 비중은 PANOFI 99.8%입니다.',
  },
  litigation: {
    case: '아프리카 스타',
    amountUsd: 540_000,
    status: '재심리 재판 진행 중',
  },
  operations: {
    qualityFocus: '2025년 사업연도 GRA 세무조사가 진행 중입니다.',
    /** 그 주에 심사가 없으면 null. 지난 심사를 이번 주 일처럼 내보내지 않는다. */
    audit: null as null | { name: string; start: string; end: string; result?: string },
    /** 그 주에 하역이 없으면 null. */
    unloading: {
      active: null,
      activeSince: null,
      next: null,
      nextDate: null,
      // 41주차 원문은 YF 를 따로 적었다(SJ + YF + GG = 합계)
      completed: [
        { vessel: 'P/FORE', skjMt: 603, yfMt: 73, ggMt: 19, totalMt: 695 },
        { vessel: 'P/QUEEN', skjMt: 334, yfMt: 44, ggMt: 29, totalMt: 407 },
      ],
    } as null | {
      active: string | null;
      activeSince: string | null;
      next: string | null;
      nextDate: string | null;
      completed: ReadonlyArray<{ vessel: string; skjMt: number; yfMt?: number; ggMt: number; totalMt: number }>;
    },
    /** 심사·하역이 없는 주에 브리핑 카드를 채우는 그 주의 물류 현황. */
    logistics: {
      headline: '2025년 GRA 세무조사',
      // 원문 「CBU 제품 재고 653만불 (공장 321만불 + CY 243만불)」의 내역은 40주 값 그대로라 합이 564만이다 - 내역은 싣지 않는다
      detail: '41주차 공장 출고 17컨 · CY 선적대기 50컨 · CBU 제품 재고 653만불 · 원어구매 비중 PANOFI 99.8%',
    },
  },
  nextActions: [
    '과장급 파리 SIAL 박람회 참석 출장 중(10/12~10/22, 런던·파리)',
    '2027년 1분기 생산 물량 오퍼 진행',
  ],
} as const;
