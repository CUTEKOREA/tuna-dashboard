import raw from '@/public/data/companies/bumblebee_v1.json';

/**
 * Bumble Bee Foods, LLC 기업 해부 인테이크 (신라교역 사내 조사보고서 ⅩⅣ, 2026-09).
 *
 * 비상장이고 FCF Co., Ltd.(대만)가 다섯 단을 거쳐 간접 100% 보유한다. 수치는 델라웨어
 * 파산법원 19-12502 도켓 원문(Doc 12·16·17·31·31-2·326)과 3:25-cv-00583 Doc 22-1이다.
 *
 * ⚠ **「$928M을 현금으로 냈다」로 쓰지 마라.** 계약서에 없는 숫자다. Dkt. 17 ¶66이 대금을
 *   현금 275,000,000 + 롤오버 텀론 633,600,000 + DOJ 벌금 인수 17,000,000 = 925,600,000으로
 *   쪼개 적는다. **현금 비중은 29.71%다.**
 * ⚠ **「FCF가 자기 대출로 상계했다」로 쓰지 마라.** 상계 상대는 **개시전 담보 텀론 대주단**이고
 *   FCF·Tonos는 DIP 대주가 아니었다. DIP 텀 한도는 80,000,000뿐인데 상계 대상은 633,000,000이다.
 * ⚠ **「이미 지배주주였다」로 쓰지 마라.** Dkt. 17 ¶65가 「passive, minority … 이사 지명권 0 …
 *   strictly arms'-length」라 적는다. 쓸 수 있는 말은 「의결권 없는 약 23% 간접 조합원 지분」까지다.
 * ⚠ **「경쟁 없이 넘어갔다」로 쓰지 마라.** 190사 접촉 · 비밀유지약정 65 · 관심표명서 11 ·
 *   2라운드 7 · 최종 응찰 3이었다.
 * ⚠ **「매대 최고가」·「브랜드 프리미엄」으로 쓰지 마라.** Chicken of the Sea 알바코어 단품이
 *   직판에 없어 비교집합에서 빠져 있다. 「직판 단품 셋 가운데」로 한정한다.
 * ⚠ **미국 연매출을 역산하지 마라.** Dkt. 17 ¶30에 2018년 미국 순매출 722,200,000이 있다.
 * ⚠ **81,500,000을 이 회사 벌금표에 넣지 마라.** Big Catch Cayman L.P.의 별개 조건부 의무다.
 * ⚠ **개인 실명을 싣지 마라.** 소송 원고와 형사 피고인은 사건번호와 직위로만 부른다.
 */

const data = raw as unknown as {
  _meta: { 회사: string; 국가: string; 업종: string; 종목: string; 출처: string; 조사일: string };
  card: { numeral: string; tagline: string };
  stats: Record<string, number>;
  price: Record<string, number>;
  capital: { 항목: string; 값: number; 구분: string; 근사: boolean }[];
  dip: Record<string, number>;
  fin2018: Record<string, number>;
  share: { 부문: string; 점유: number }[];
  supply: Record<string, number>;
  fine: Record<string, number>;
  process: { 단계: string; 수: number }[];
  chain: { 층: number; 법인: string }[];
  debtors: { 채무자: string; 납세번호끝4: string; 현재표제: string | null }[];
  priceladder: { 브랜드: string; 제품: string; itemId: string; oz: number; usd: number; 본사: boolean; ['원per kg']: number }[];
  strategy: { 사안: string; 말: string; 돈: string; 판정: string }[];
};

export const bumblebeeMeta = data._meta;
export const bumblebeeCard = data.card;
export const bumblebeeStats = data.stats;
export const bumblebeePrice = data.price;
export const bumblebeeCapital = data.capital;
export const bumblebeeShare = data.share;
export const bumblebeeProcess = data.process;
export const bumblebeeChain = data.chain;
export const bumblebeeDebtors = data.debtors;
export const bumblebeePriceLadder = data.priceladder;
export const bumblebeeStrategy = data.strategy;

/** 총 기업가치에서 현금이 차지한 몫(%). 나머지는 채권을 갈아타거나 채무를 떠안은 것이다. */
export function cashSharePct(): number {
  return data.stats.현금_비중;
}

/** 접촉한 회사 수 대비 최종 응찰 수 — 경쟁 절차의 크기. */
export function bidFunnel(): { 접촉: number; 최종: number } {
  return { 접촉: data.stats.접촉, 최종: data.stats.최종응찰 };
}

/** 알바코어가 라이트미트의 몇 배인가 — 같은 브랜드·같은 규격 기준. */
export function albacoreMultiple(): number {
  const a = data.priceladder.find((r) => r.본사 && r.제품.startsWith('Solid White'));
  const l = data.priceladder.find((r) => r.본사 && r.제품 === 'Chunk Light');
  if (!a || !l) return 0;
  return Number((a.usd / l.usd).toFixed(2));
}

/** 파산 신청일에 남아 있던 형사벌금(US$). 매수인이 이를 승계했다. */
export function outstandingFine(): number {
  return data.fine.신청일_잔액;
}

/** 「말」과 「돈」이 어긋난 전략 축의 수. */
export function strategyGapAxesBB(): number {
  return data.strategy.filter((s) => s.판정 !== '집행됨').length;
}
export const bumblebeeStrategyAxes = data.strategy.length;

export const bumblebeeSourceNotes = [
  '파산·매각·자본구조·공급관계 수치는 델라웨어 파산법원 19-12502 도켓 원문이다 — 첫날 진술서(Doc 17), 운전자금 신청(Doc 12), 해외공급업체 신청(Doc 16), 매각신청과 매매계약(Doc 31·31-2), 매각명령(Doc 326).',
  '지주 사슬은 3:25-cv-00583(S.D. Cal.) Doc 22-1 각주 1이고, 담합 민사 서면은 3:15-md-02670 관련 제출물이다.',
  '사건번호·제소일은 무료 판례 데이터베이스 조회 결과이며 명부 필드임을 본문에 밝혔다.',
  '인증은 ISSF ProActive Vessel Register, Earth Island Institute Dolphin Safe, MSC 연감이고 앞 편들이 모아 둔 수집분이다.',
  '소매가는 Walmart 상품 상세이고 조회일은 2026-09-06, 상품 식별번호를 함께 적었다. 순중량 기준이며 고형량은 값표에 없다.',
  '법정 규격은 미국 연방규정 21 CFR 161.190 전문이다.',
  '개인 실명은 어디에도 적지 않았다 — 소송 원고와 형사 피고인은 사건번호와 직위로만 부른다.',
];
