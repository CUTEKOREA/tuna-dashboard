import raw from '@/public/data/companies/dongwonfnb_v1.json';

/**
 * 동원F&B 기업 해부 인테이크 (신라교역 사내 조사보고서 ⅩⅩⅧ, 2026-09).
 *
 * 1982년 국내 첫 참치캔. 2025-07 동원산업 완전자회사·상장폐지, 사채 때문에 공시는 계속한다.
 *
 * ⚠ **35% → 47% 로 「올랐다」 쓰지 마라.** 2023 평가서 값은 연도가 없고 별도 분모가 합병으로 바뀌었다.
 * ⚠ **닐슨 점유율과 식약처 생산 톤을 한 비율로 잇지 마라.** 세는 대상이 다르다.
 * ⚠ **「위탁」으로 단정하지 마라.** 삼진물산·신진물산 생산은 품목명으로 가른 것이고 계약은 공시에 없다.
 * ⚠ 동원산업 주석의 8,126,091주는 교환 신주 4,523,902주 + 무상증자 3,602,189주의 소계다.
 */

const data = raw as unknown as {
  _meta: { 회사: string; 국가: string; 업종: string; 종목: string; 출처: string; 조사일: string };
  card: { numeral: string; tagline: string };
  stats: Record<string, number>;
  sourcenotes: string[];
};

export const dongwonfnbMeta = data._meta;
export const dongwonfnbCard = data.card;
export const dongwonfnbStats = data.stats;
export const dongwonfnbSourceNotes = data.sourcenotes;

/** 2024 동원 브랜드 캔 중 창원 자기 공장 몫(식품안전나라 생산실적 품목명 기준). */
export function ownPlantSharePct(): number {
  const s = data.stats;
  return Number(((s.창원_2024_t / s.동원브랜드_캔_2024_t) * 100).toFixed(1));
}

/** 수산물 원재료 단가 2024 → 2025 변화율. */
export function rawPriceChange2025Pct(): number {
  const s = data.stats;
  return Number(((s.수산물_원재료_2025_krw_kg / s.수산물_원재료_2024_krw_kg - 1) * 100).toFixed(1));
}

/** 일반식품 부문 영업이익 2024 → 2025 변화율. */
export function generalFoodOpChangePct(): number {
  const s = data.stats;
  return Number(((s.일반식품_영업이익_2025_krw_k / s.일반식품_영업이익_2024_krw_k - 1) * 100).toFixed(2));
}
