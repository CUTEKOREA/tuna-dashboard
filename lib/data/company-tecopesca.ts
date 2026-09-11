import raw from '@/public/data/companies/tecopesca_v1.json';

/**
 * Tecopesca 기업 해부 인테이크 (신라교역 사내 조사보고서 ⅩⅩⅦ, 2026-09).
 *
 * 에콰도르 하라미호(만타 옆)의 배 없는 참치 캐너리. 원료 매입처와 판로에 앞 편 회사 다섯이 걸린다.
 *
 * ⚠ **주석 25 를 「관계회사」로 쓰지 마라.** 원문은 특수관계자(partes relacionadas)이고 상대별 근거가 없다.
 *   2018년 감사는 동원·Albacora 를 제3자 해외 공급사 목록에 넣었다. 지분 관계로 읽지 않는다.
 * ⚠ **2019 톤수를 쓰지 마라.** 2019 경영자 보고서의 50,542 t·47,105 t·19,065 t 은 2018 보고서 복제다.
 * ⚠ **2014 「Grupo Económico」 표를 Tecopesca 자회사 지분으로 쓰지 마라.** 같은 지배주주 아래 그룹 합산 표다.
 * ⚠ **Tunalia 를 「280만 달러에 매각」으로 쓰지 마라.** 계약가 250만 달러+세금, 280만은 채권이다.
 * ⚠ 2020 순위 원자료 순이익 −1억 1,623만 달러는 자본 증가와 모순 — 쓰지 않는다.
 */

const data = raw as unknown as {
  _meta: { 회사: string; 국가: string; 업종: string; 종목: string; 출처: string; 조사일: string };
  card: { numeral: string; tagline: string };
  stats: Record<string, number>;
  sourcenotes: string[];
};

export const tecopescaMeta = data._meta;
export const tecopescaCard = data.card;
export const tecopescaStats = data.stats;
export const tecopescaSourceNotes = data.sourcenotes;

/** 2019 특수관계자 원료 매입 중 이 시리즈 회사(Tri Marine·동원) 몫. */
export function seriesSupplierSharePct(): number {
  const s = data.stats;
  return Number(((s.시리즈_매입_2019_usd / s.특수관계_원료매입_2019_usd) * 100).toFixed(1));
}

/** 2018 특수관계자 원료 매입 / 2018 원료 매입액(같은 해 금액끼리). */
export function relatedPurchaseShare2018Pct(): number {
  const s = data.stats;
  return Number(((s.특수관계_원료매입_2018_usd / s.원료_매입_2018_usd) * 100).toFixed(1));
}

/** 2023 → 2024 매출 증가율(순위 원자료). */
export function salesGrowth2024Pct(): number {
  const s = data.stats;
  return Number(((s.매출_2024_usd / s.매출_2023_usd - 1) * 100).toFixed(1));
}

/** 2018 원료 톤수 중 가다랑어 몫. */
export function skipjackShare2018Pct(): number {
  const s = data.stats;
  return Number(((s.가다랑어_2018_kg / s.원료_매입_2018_kg) * 100).toFixed(1));
}
