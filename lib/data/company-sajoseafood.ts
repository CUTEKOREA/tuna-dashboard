import raw from '@/public/data/companies/sajoseafood_v1.json';

/**
 * 사조씨푸드 기업 해부 인테이크 (신라교역 사내 조사보고서 ⅩⅩⅩⅣ, 2026-09).
 *
 * 유가증권시장 014710. 참치 매출 1,466억을 설비 3억 6천만 원짜리 부문이 내는 회사다.
 *
 * ⚠ **「3억짜리 라인이 1,466억을 만든다」로 쓰지 마라.** 라인 산출은 가공품 822억 8,654만이고
 *    상품 508억은 사서 되파는 것, 수산부문 134억은 배가 잡아 넘긴 원어다.
 * ⚠ **「사조오양과 상호보유한다」(현재형) 금지.** 2026년 상반기에 3.41% 전량을 매도했다.
 * ⚠ **「계열 매입이 계속 올랐다」가 아니다.** 2022·2023년과 2026년 상반기에 내려갔다.
 * ⚠ **「원어 단가가 7,856원에서 13,046원으로 급등」 금지.** 2024년이 여섯 해 중 유일한 저점이다.
 * ⚠ **「화성 물류센터를 취득했다」(완료형) 금지.** 잔금이 2026-11-26이다.
 * ⚠ **「연승 32척」·「캔참치 10% 인상」을 이 회사 것으로 쓰지 마라.** 32척은 사조그룹 소계이고
 *    캔을 만드는 것은 사조대림이다 — 이 회사는 캔을 만들지 않는다.
 */

const data = raw as unknown as {
  _meta: { 회사: string; 국가: string; 업종: string; 종목: string; 출처: string; 조사일: string };
  card: { numeral: string; tagline: string };
  stats: Record<string, number>;
  sourcenotes: string[];
};

export const sajoseafoodMeta = data._meta;
export const sajoseafoodCard = data.card;
export const sajoseafoodStats = data.stats;
export const sajoseafoodSourceNotes = data.sourcenotes;

/** 라인을 거치는 가공품 매출이 그 부문 설비 장부가의 몇 배인가. */
export function processedToAssetRatio(): number {
  const s = data.stats;
  return Number((s.가공품_매출_2025 / s.부문_설비_장부가_2025).toFixed(1));
}

/** 가공용 원어 매입 가운데 계열(사조산업·사조오양) 몫(%). */
export function affiliateShare2025(): number {
  const s = data.stats;
  return Number((
    ((s.사조산업_원어_매입_2025 + s.사조오양_원어_매입_2025) / s.부문_원재료_매입_2025) * 100
  ).toFixed(1));
}
