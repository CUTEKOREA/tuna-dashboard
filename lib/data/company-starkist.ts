import raw from '@/public/data/companies/starkist_v1.json';

/**
 * StarKist Co. 기업 해부 인테이크 (신라교역 사내 조사보고서, 2026-09).
 *
 * 미국 캔참치 1위 브랜드이고 동원산업 100% 자회사다. 비상장이라 자체 재무제표를
 * 내지 않으므로 여기 재무는 전부 **모회사 연결 종속회사 요약재무**다.
 *
 * ⚠ **「공시가 형사사건을 적지 않는다」로 쓰지 마라.** 동원산업 39건 + 구 지주
 *   동원엔터프라이즈 20건, **정기공시 59건 전수검색으로 반증됐다.** Sherman Act 라는
 *   법명·법정 상한·충당액·확정액·5년 분할상환 일정까지 2018~2020 공시에 있다.
 *   사라지는 것은 2021년부터이고, 그것도 확정 벌금이 우발부채에서 기타채무로
 *   옮겨간 정상 처리다.
 * ⚠ **US$219M 을 2024년 단년 비용으로 쓰지 마라.** 기초 79,776 + 전입 216,899 =
 *   296,675백만원이라야 그 금액에 닿는 누적 인식액이다. 공시가 인과를 직접 적으므로
 *   인과 서술은 가능하되 **금액 역산은 금지**다.
 * ⚠ **원화 매출로 추세를 읽지 마라.** 3년 통산 원화 +5.6%, 달러 −3.1%로 방향이 반대다.
 * ⚠ **원료 의존도를 3% 단일값으로 쓰지 마라.** 2021-01 시점 소송당사자 주장이고,
 *   같은 자료를 매입 기준으로 계산하면 12~13% 가 나온다. 범위로만 쓴다.
 * ⚠ **파고파고 고용을 두 천 명대 구간으로 쓰지 마라.** 네 기준이 섞였다. 기준이
 *   명시된 유일한 값은 1,700명이고 그 값은 인용 구간 밖에 있다.
 * ⚠ **관할을 섞지 마라.** 형사 N.D. Cal. · 민사 MDL S.D. Cal. · 환경 W.D. Pa. 다.
 */

export interface StarkistFinancial {
  연도: number;
  매출: number;
  순이익: number;
  등급: string;
}

export interface StarkistClaim {
  건: string;
  관할: string;
  usd_m: number;
}

const data = raw as unknown as {
  _meta: {
    회사: string; 국가: string; 업종: string; 출처: string;
    출처한계: string; 측정경계: string; 갱신방법: string;
  };
  card: {
    numeral: string; name: string; country: string; tagline: string;
    stats: { label: string; value: string }[];
  };
  financials: StarkistFinancial[];
  currency: { 연도: number; krw: number; usd_k: number }[];
  productmix: { 기간: string; 통조림: number; 파우치: number; 기타: number; 합계: number }[];
  production: { 공장: string; 품목: string; 능력: number; y2023: number | null; y2024: number; y2025: number }[];
  priceladder: { 브랜드: string; 등급: string; 개당: number; kg_drained: number }[];
  strategy: { 축: string; 말: string; 돈: string; 판정: string }[];
  provision: { 시점: string; 항목: string; usd_m: number; 비고: string }[];
  sweep: { 문서: string; sherman: number; 형사: number; 벌금: number }[];
  claims: StarkistClaim[];
  entities: { 법인: string; 설립: string; 관할: string; 역할: string }[];
  registries: { 명부: string; 결과: string; 대조군: string }[];
  stats: Record<string, number>;
};

export const starkistMeta = data._meta;
export const starkistCard = data.card;
export const starkistFinancials = data.financials;
export const starkistCurrency = data.currency;
export const starkistProductMix = data.productmix;
export const starkistProduction = data.production;
export const starkistPriceLadder = data.priceladder;
export const starkistStrategy = data.strategy;
export const starkistProvision = data.provision;
export const starkistSweep = data.sweep;
export const starkistClaims = data.claims;
export const starkistEntities = data.entities;
export const starkistRegistries = data.registries;
export const starkistStats = data.stats;

/**
 * 통화별 매출 증감률(%). **원화와 달러의 부호가 반대**라 어느 쪽으로 읽느냐가
 * 결론을 바꾼다. 미국 시장에서 달러로 파는 회사이므로 크기는 달러가 말한다.
 */
export function revenueTrendPct(cur: 'krw' | 'usd'): number {
  const [a] = data.currency;
  const z = data.currency[data.currency.length - 1];
  const key = cur === 'krw' ? 'krw' : 'usd_k';
  return Number(((z[key] / a[key] - 1) * 100).toFixed(1));
}

/**
 * 미국 규제·소송 청구서 합계(US$ 백만). ⚠ **여러 해에 걸친 기간 합산**이다 —
 * 단년 부담으로 읽으면 안 된다.
 */
export function totalClaimsUsdM(): number {
  return Number(data.claims.reduce((s, c) => s + c.usd_m, 0).toFixed(1));
}

/**
 * 회사가 공시한 법정 상한 대비 회사가 쌓은 충당액의 비율(%).
 * 이 편의 축이 이 한 값에 걸려 있다 — 절반을 쌓았고, 그 절반이 이듬해 법정에서
 * 스스로 요청한 액수와 같다.
 */
export function provisionVsCapPct(): number {
  const { 충당_2018_usd_m: p, 법정상한_공시_usd_m: cap } = data.stats;
  return Math.round((p / cap) * 100);
}

/** 형사벌금 언급이 사라지는 해. 전수검색이 실제로 그 해를 가리키는지 데이터에서 읽는다. */
export function sweepSilenceFrom(): string {
  const gone = data.sweep.find((r) => r.형사 === 0 && r.벌금 === 0 && r.sherman === 0);
  return gone ? gone.문서 : '—';
}

/** 파우치 생산에서 에콰도르가 미국령 사모아의 몇 배인가. */
export function pouchEcuadorMultiple(): number {
  const { 파우치_에콰도르_mt: ec, 파우치_사모아_mt: as } = data.stats;
  return Number((ec / as).toFixed(1));
}

/**
 * 파우치 매출 비중의 연간 변화(포인트). **음수다** — 회사가 성장 축이라 말하는 품목이
 * 실제로는 줄었다. 이 편의 전략 절이 이 한 값에 걸려 있다.
 */
export function pouchShareChangePct(): number {
  const { 파우치비중_2024_pct: a, 파우치비중_2025_pct: b } = data.stats;
  return Number((b - a).toFixed(2));
}

/** 「말」과 「돈」이 어긋나는 전략 축의 수. 일치하는 축은 세지 않는다. */
export function strategyGapCount(): number {
  return data.strategy.filter((r) => r.판정 !== '일치').length;
}

/**
 * 자체브랜드(월마트 Great Value) 대비 브랜드 프리미엄 배수, 같은 5 oz 물캔 물뺀 기준.
 * ⚠ **순중량으로 나누지 마라** — 캔참치는 drained 가 net 의 80% 안팎이라 배수가 달라진다.
 */
export function pbPremiumMultiple(grade: 'Chunk Light' | 'Solid White'): number {
  const sk = data.priceladder.find((r) => r.브랜드 === 'StarKist' && r.등급 === grade);
  const pb = data.priceladder.find((r) => r.브랜드 === 'Great Value' && r.등급 === grade);
  if (!sk || !pb) return 0;
  return Number((sk.kg_drained / pb.kg_drained).toFixed(2));
}

/** 자료 출처와 한계. 조사 아카이브 메타를 그대로 옮긴다. */
export const starkistSourceNotes: string[] = [
  data._meta.출처,
  data._meta.출처한계,
  data._meta.측정경계,
];
