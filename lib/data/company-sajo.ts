import raw from '@/public/data/companies/sajo_v1.json';

/**
 * 기업집단 「사조」 기업 해부 인테이크 (신라교역 사내 조사보고서 ⅩⅢ, 2026-09).
 *
 * 계열 42사(상장 6 · 비상장 36). 맨 위는 **비상장 ㈜사조시스템즈**이고 사조산업 지분 29.94%를
 * 단독 보유한다. 수치는 각 사 제55기·해당기 사업보고서(2026-03 제출)와 공정위 의결서 원문이다.
 *
 * ⚠ **다섯 회사 표를 세로로 더하지 마라.** 연결 둘(사조산업·사조씨푸드)과 별도 셋이 섞여 있고,
 *   사조씨푸드는 사조산업 연결 안에 이미 들어 있다. 사조동아원은 연결대상 종속기업이 없어
 *   연결재무제표 자체가 없다. 그룹 합계가 아니다.
 * ⚠ **「33.09%」의 분모는 부문 단순합계 849,057,407천원**이다. 연결매출 706,210,125로 나눈
 *   39.79%가 아니고, 동원산업 3.54%(연결 **외부수익** 기준)와 같은 자로 잰 것도 아니다.
 * ⚠ **「어획이 적자」로 좁히지 마라.** 수산사업부문에는 상품(참치·명태·대구) 거래가 함께 있고
 *   어획 손익과 상품 손익이 갈라져 있지 않다.
 * ⚠ **「담합 중이던 회사를 사서 담합이 터졌다」로 쓰지 마라.** 전분당 담합은 2018-05 시작이고
 *   지분 양수 종결은 2024-02-01 이다. 순서가 반대다.
 * ⚠ **인수대금과 과징금이 비슷한 것은 우연이다.** 한 회사 취득가(3,840억)와 **두 회사** 과징금
 *   합(3,832억)을 맞춘 것이고, 취득 사업의 가치가 사라졌다는 증거는 없다.
 * ⚠ **「원양 적자는 사조 고유」로 쓰지 마라.** 같은 해 신라교역 원양어업부문도 영업손실이고
 *   동원산업 수산사업부문은 흑자다.
 * ⚠ **「사조시스템즈가 67.59%」로 쓰지 마라.** 그것은 「외 9명」 합산이고 단독은 29.94%다.
 * ⚠ **「그룹에서 유일한 흑자」로 단정하지 마라.** 사조대림 수산부문 손익은 공시에 나뉘어 있지
 *   않고 비상장 36사는 조사 범위 밖이다.
 */

const data = raw as unknown as {
  _meta: { 회사: string; 국가: string; 업종: string; 종목: string; 출처: string; 조사일: string };
  card: { numeral: string; tagline: string };
  stats: Record<string, number>;
  segments: { 부문: string; 매출액: number; 영업이익: number }[];
  segment_total: Record<string, number>;
  group: { 회사: string; 기준: string; 수산매출: number; 전체: number; 비중: number; 부문손익: number | null }[];
  dongawon: Record<string, number>;
  ftc: { 의결: string; 사건: string; 피심인: string; 위반: string; 과징금: number; 등급: string }[];
  mill: { 피심인: string; 과징금_백만원: number; 몫: number }[];
  exportshare: { 회사: string; 천USD: number; 비율: number; 사조: boolean }[];
  export_total: number;
  fleet: { 어구: string; 사조산업연결: number | null; 내역: string; 등록부: string }[];
  purse: { 선명: string; IMO: string; 소유: string }[];
  priceladder: { 제품: string; 규격g: number; 표시단위가: number; ['원per kg']: number; 채널: string; 구분: string }[];
  strategy: { 사안: string; 말: string; 돈: string; 판정: string }[];
  ownership: { 주주: string; 주식수: number; 지분: number }[];
  ownership_total: Record<string, number>;
};

export const sajoMeta = data._meta;
export const sajoCard = data.card;
export const sajoStats = data.stats;
export const sajoSegments = data.segments;
export const sajoGroup = data.group;
export const sajoFtc = data.ftc;
export const sajoExportShare = data.exportshare;
export const sajoPriceLadder = data.priceladder;
export const sajoStrategy = data.strategy;
export const sajoPurse = data.purse;

/** 사조 세 법인의 원양 수출실적 점유 합(%). 분모는 협회 집계 387,000천$. */
export function sajoExportSharePct(): number {
  return Number(data.exportshare.filter((r) => r.사조).reduce((s, r) => s + r.비율, 0).toFixed(2));
}

/** 일곱 부문 가운데 영업손실을 낸 부문 수. */
export function lossMakingSegments(): number {
  return data.segments.filter((s) => s.영업이익 < 0).length;
}

/** 적자 부문(수산사업)보다 많이 번 부문 수 — 골프장이 그 안에 있다. */
export function segmentsBeatingLossMaker(): number {
  const worst = Math.min(...data.segments.map((s) => s.영업이익));
  return data.segments.filter((s) => s.영업이익 > worst).length;
}

/** 2026-07 두 담합 과징금 합(억원). */
export function cartelFineBillionKrw(): number {
  return Math.round(data.stats.담합_과징금_합 / 1e8);
}

/** 인그리디언 취득가와 두 과징금 합의 차(억원). ⚠ 근접은 우연이고 인과가 아니다. */
export function fineVsPurchaseGapBillionKrw(): number {
  return Math.round((data.stats.인그리디언_취득가 - data.stats.담합_과징금_합) / 1e8);
}

/** 밀가루 담합 7사 가운데 사조동아원의 몫(%). */
export function millFineSharePct(): number {
  return data.mill.find((m) => m.피심인 === '사조동아원')?.몫 ?? 0;
}

/** 「말」과 「돈」이 어긋난 전략 축의 수. */
export function strategyGapAxesSajo(): number {
  return data.strategy.filter((s) => s.판정 !== '집행됨').length;
}
export const sajoStrategyAxes = data.strategy.length;

/** 사조산업 연결 선망 척수 가운데 한국 명부로 대조된 국적선 수. */
export function purseVerifiedKoreanFlag(): number {
  return data.purse.filter((p) => p.소유 !== '사조오양').length;
}

export const sajoSourceNotes = [
  '재무·부문·지분·임원·직원 수치는 사조산업㈜ 제55기와 사조오양㈜·사조씨푸드㈜·㈜사조대림·사조동아원㈜ 해당기 사업보고서(2026-03 제출) 원문이다.',
  '선박 등록은 WCPFC Record of Fishing Vessels·IATTC Regional Vessel Register 2026-08-17 수집분이다.',
  '인증은 ISSF ProActive Vessel Register 2026-08-20, Earth Island Institute Dolphin Safe 2026-05-30, MSC Sustainable Tuna Yearbook 2026이다.',
  '공정거래 처분은 공정거래위원회 의결서·결정문 원문이고, 전분당 건만 보도 기준이다.',
  '소매가는 이마트몰 값표의 단위가격 표시이고 조회일은 2026-09-06이다. 전부 순중량 기준이며 고형량은 공개되지 않는다.',
  '개인 실명은 등기임원에 한해 적었다.',
];
