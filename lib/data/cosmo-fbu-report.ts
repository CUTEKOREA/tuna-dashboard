import { weeks } from './cosmo';

/**
 * FBU(로인 가공) 월간 현황 보고 — 주간보고·월별 손익에 없는 것만 담는다:
 * 인원 구성, 품목별 재고와 재고가치, 원어 입고·반품(RETURN)·매입비용, 월 가공 수율, 수출 INVOICE, 현안.
 *
 * 원문 표의 합계는 모두 행 합과 맞는다 - 테스트가 고정한다.
 * 개인 이름은 저장소에 남기지 않는다(작성자는 직급으로). 판매처는 법인명이라 그대로 둔다.
 * 원문 현안 1) EUCC(어획증명) 처리 문제는 싣지 않았다 - 법무·경영 사안이라 보고서에서 빼기로 한 선(2026-10-01)을 따랐다. 싣기로 하면 여기 추가.
 */
export const cosmoFbuReport = {
  source: {
    file: 'FBU - 월간 업무현황 (2026년 9월).pdf',
    sha256: '159c0d7ae71b8e1c22c1d0e4bbb55391be82af682a483d370b83a058220a3ca1',
    reportDate: '2026-09-30',
    author: '과장급 담당자',
  },
  /** 직원 현황 (명) */
  staff: {
    total: 120,
    hod: 1,
    groups: [
      { name: '제품생산', count: 81, detail: '정규직 14 · 계약직 16 · 일용직 51' },
      { name: '생산지원', count: 22, detail: '지게차 2 · 품질관리 3 · 위생 15 · 출입 2' },
      { name: '기술직', count: 7, detail: '냉동 3 · 전기 3 · 정비 1' },
      { name: '일반관리', count: 9, detail: '자금·구매 1 · 재고관리 6 · 물류 2' },
    ],
  },
  /** 재고 (9/30, MT) - 현지용 부산물·미선별 원어 제외. 재고가치는 원어·로인만 인쇄(벨리·EU-MEAT 는 부산물 정산). */
  inventory: {
    asOf: '2026-09-30',
    rows: [
      { species: '황다랑어', raw: 6.466, loin: 136.0328, belly: 20.23, euMeat: 0.09 },
      { species: '눈다랑어', raw: 52.29, loin: 216.9524, belly: 21.95, euMeat: 0 },
    ],
    total: { raw: 58.756, loin: 352.9852, belly: 42.18, euMeat: 0.09 },
    valueUsd: { raw: 103_124.45, loin: 1_856_336.34 },
  },
  /** 원어 입고 (MT · USD). 9월분은 P/DIS 하역 중이라 최종 입고량·매입비용 미확정. */
  intake: {
    janAug: { unloadedMt: 1653.748, returnMt: 267.739, finalMt: 1386.009, costUsd: 2_724_453.41 },
    sep: { unloadedMt: 14.629, returnMt: null, finalMt: null, costUsd: null },
    total: { unloadedMt: 1668.377, returnMt: 267.739, finalMt: 1386.009, costUsd: 2_724_453.41 },
    note: '9/29 하역을 시작한 P/DIS 는 9/30 기준 14.629톤 하역 중 - 10월 초 하역을 마치고 선별·반품을 거쳐 입고량이 확정된다(어가 협의 미완료).',
  },
  /** 제품 가공 (MT). 누계는 재가공 물량 포함 - 원문 각주. */
  processing: {
    sep: { days: 17, rawMt: 195.395, loinMt: 84.4776, yieldPct: 43.23 },
    ytd: { days: 140, rawMt: 1851.614, loinMt: 826.1188 },
  },
  /** 9월 수출(출고) INVOICE */
  exports: {
    rows: [
      { order: 'SNB26-394', product: '눈다랑어 로인', mt: 23.928, dest: '한국', usd: 116_312.81, buyer: 'SNB' },
      { order: 'SNB26-513', product: '눈다랑어 로인', mt: 23.712, dest: '한국', usd: 109_567.22, buyer: 'SNB' },
      { order: 'SNB26-528', product: '황다랑어 로인', mt: 23.7782, dest: '이탈리아', usd: 123_483.76, buyer: 'ITTICA' },
      { order: 'SNB26-434(3)', product: '황다랑어 쿼터 로인·벨리', mt: 23.3332, dest: '이탈리아', usd: 87_495.53, buyer: 'CALLIPO' },
    ],
    total: { mt: 94.7514, containers: 4, usd: 436_859.32 },
    ytd: { mt: 847.1336, containers: 36, usd: 3_891_417.49 },
  },
  issues: [
    {
      title: 'GG(로인용) 원어 반입 저조 - 10월 가공 중단 가능성',
      lines: [
        '대서양 어장에서 소형어 어획이 이어져 CBU 통조림용 원어 재고는 포화돼 추가 구매가 어렵지만, FBU GG 원어(로인용)는 어획·반입이 적어 재고가 모자란다.',
        '9월 말 P/DIS 1척분을 확보해 하역 중이나 GG 원어는 약 20톤 안팎으로 예상된다.',
        '9/30 원어 재고 58톤으로 10월 중 소진되면 추가 원어 확보 전까지 일정 기간 가공이 멈출 수 있다.',
      ],
    },
    {
      title: '9월 운영경비 미지급 통보 (SNB)',
      lines: [
        'SNB 가 원어 반입 저조와 재고 부족을 이유로 9월 운영경비 $100,000 미지급을 통보하고, 같은 기간 가공비를 톤당 $200 → $500 으로 올리겠다고 제안했다.',
        '9월 가공량 195톤은 2026년 월평균 207톤과 큰 차이가 없어 재검토를 요청하고 협의 중이다.',
        '미지급이 확정되면 가공비를 조정해도 $44,000 손실이 남는다.',
      ],
    },
    {
      title: '가나 수출화물 검사 강화 - 프랑스행 로인 지연',
      lines: [
        '9월 가나발 프랑스행 폐플라스틱 컨테이너에서 코카인 3.9톤이 적발돼 가나 정부가 범정부 대응반을 꾸리고 수출화물 검사를 강화했다.',
        '9월 말 예정이던 프랑스행 황다랑어 로인 수출도 세관·국가정보기관 검사 대상으로 지정돼 일정이 밀렸다.',
        '앞으로는 가나 식약청 제품 등록·수출 라벨 점검·배치 번호 발급이 필요하며, 절차를 마쳐 10/5부터 수출을 재개할 예정이다.',
      ],
    },
  ],
} as const;

/**
 * 주간 원장(FBU 원어 처리 누계)과 월간보고 누계를 나란히 놓는다.
 * 기준이 다르다 - 원장은 주차 말일(9/27)까지, 월간보고는 9/30까지이고 재가공 물량을 포함한다.
 */
export function fbuLedgerComparison() {
  /* 월간보고 마감일(9/30) 이전에 끝난 마지막 주만 고른다. 최신 주를 고르면 40주(9/28~10/4)처럼
   * 다음 달 날짜가 섞인 누계와 대조해 차이가 기준 차이가 아니게 된다. periodEnd 는 「M/D」 표기다. */
  const [ry, rm, rd] = cosmoFbuReport.source.reportDate.split('-').map(Number);
  const reportKey = rm * 100 + rd;
  const endKey = (w: (typeof weeks)[number]) => {
    const [m, d] = String(w.periodEnd ?? '').split('/').map(Number);
    return Number(w.year ?? ry) === ry && m && d ? m * 100 + d : Number.POSITIVE_INFINITY;
  };
  const last = [...weeks].reverse().find((w) => w.production?.FBU?.cumRawMt != null && endKey(w) <= reportKey);
  const fbu = last?.production?.FBU;
  const ledgerRawMt = Number(fbu?.cumRawMt ?? 0);
  const ledgerDays = Number(fbu?.cumDays ?? 0);
  return {
    ledgerWeek: last?.week ?? null,
    ledgerEnd: last?.periodEnd ?? null,
    ledgerRawMt,
    ledgerDays,
    reportRawMt: cosmoFbuReport.processing.ytd.rawMt,
    reportDays: cosmoFbuReport.processing.ytd.days,
    gapMt: cosmoFbuReport.processing.ytd.rawMt - ledgerRawMt,
    gapDays: cosmoFbuReport.processing.ytd.days - ledgerDays,
  };
}
