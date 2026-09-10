import raw from '@/public/data/companies/princes_v1.json';

/**
 * Princes Group plc 기업 해부 인테이크 (신라교역 사내 조사보고서 ⅩⅩⅡ, 2026-09).
 *
 * 스물한 편이 잡는 회사·만드는 회사·쥔 회사를 덮는 동안 **영국 매대가 비어 있었다.**
 * 이 편의 1차 자료는 회사가 영국 등기소에 낸 FY2025 그룹 계정 151쪽이다.
 *
 * ⚠ **「미쓰비시가 1파운드에 팔았다」로 쓰지 마라.** 지분 대가와 기업가치(£700m)는 층위가 다르다.
 * ⚠ **「상장으로 £8.3억을 조달했다」로 쓰지 마라.** 절반(£429,699,000)은 모회사 대여금 상계다.
 * ⚠ **「Princes 참치 100% MSC」로 쓰지 마라.** 브랜드 한정이고 전 조달 기준은 68.6% 다.
 * ⚠ **「영국 캔참치 1위」로 쓰지 마라.** 회사 자칭은 상온 생선 시장 2위다.
 * ⚠ **「Fish = 참치」로 쓰지 마라.** 부문 정의에 고등어·연어가 함께 들어간다.
 * ⚠ **「지분 51% 가 두 공장」으로 쓰지 마라.** 마린로드는 Indico Canning 간접 68% 다.
 * ⚠ **12개월과 9개월을 나눠 증감률을 만들지 마라.** 결산월 변경으로 비교열이 9개월이다.
 * ⚠ **「우리 물량이 닿지 않는다」로 쓰지 마라.** 직수출 한 세번만 확인했고 수입자는 미확인이다.
 */

const data = raw as unknown as {
  _meta: { 회사: string; 국가: string; 업종: string; 종목: string; 출처: string; 조사일: string };
  card: { numeral: string; tagline: string };
  stats: Record<string, number>;
  sourcenotes: string[];
};

export const princesMeta = data._meta;
export const princesCard = data.card;
export const princesStats = data.stats;
export const princesSourceNotes = data.sourcenotes;

/** 상장 발행 총액에서 모회사 대여금 상계가 차지하는 몫. 시장 현금은 나머지다. */
export function ipoOffsetSharePct(): number {
  const { 모회사대여금_상계_파운드: a, 상장발행_총액_파운드: b } = data.stats;
  return Number(((a / b) * 100).toFixed(2));
}

/** 참치가 든 Fish 부문이 그룹 매출에서 차지하는 몫. */
export function fishRevenueSharePct(): number {
  const { fish_매출_천파운드: a, 매출_천파운드: b } = data.stats;
  return Number(((a / b) * 100).toFixed(2));
}

/**
 * 같은 부문이 그룹 EBITDA 에서 차지하는 몫.
 *
 * ⚠ 이 값은 **이익 몫이 아니라 EBITDA 몫**이다. 영업이익 기준으로 재면 다른 값이 나온다.
 */
export function fishEbitdaSharePct(): number {
  const { fish_EBITDA_천파운드: a, EBITDA_천파운드: b } = data.stats;
  return Number(((a / b) * 100).toFixed(2));
}

/**
 * Fish 부문 EBITDA 마진.
 *
 * ⚠ 분자는 소수주주지분을 뺀 값이고 분모는 100% 매출이다. 100% 기준으로 맞추려면
 * 소수지분 조정 4,657 을 분자에 되돌린다.
 */
export function fishMarginPct(full = false): number {
  const { fish_EBITDA_천파운드: e, fish_소수지분조정_천파운드: nci, fish_매출_천파운드: r } = data.stats;
  return Number((((full ? e + nci : e) / r) * 100).toFixed(2));
}

/** 매입채무 회전일수가 소유주 교체 전후로 몇 배가 됐나. */
export function dpoMultiple(): number {
  const { DPO_2025_12_일: a, DPO_2024_03_일: b } = data.stats;
  return Number((a / b).toFixed(2));
}

/** 모리셔스 법인 하나가 Fish 부문 매출에서 차지하는 몫. */
export function mauritiusRevenueSharePct(): number {
  const { PTM_매출_천파운드: a, fish_매출_천파운드: b } = data.stats;
  return Number(((a / b) * 100).toFixed(2));
}

/** 영국 매대에서 브랜드가 소매 자체상표의 몇 배인가 (물뺀중량이 같은 4캔 기준). */
export function brandPremiumMultiple(): number {
  const { 소매_4팩_파운드: a, 소매_PB4팩_파운드: b } = data.stats;
  return Number((a / b).toFixed(2));
}

/**
 * 한국의 대(對)모리셔스 냉동 가다랑어 수출이 한국 세계 수출에서 차지하는 몫.
 *
 * ⚠ 분모는 **한국의 수출 중량**이지 어획량이 아니고, 수입자가 이 회사 공장인지는 미확인이다.
 */
export function koreaMauritiusSharePct(): number {
  const { 한국수출_모리셔스_톤: a, 한국수출_세계_톤: b } = data.stats;
  return Number(((a / b) * 100).toFixed(2));
}
