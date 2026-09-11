import raw from '@/public/data/companies/cnfc_v1.json';

/**
 * 中水集团远洋(CNFC Overseas Fisheries) 기업 해부 인테이크 (신라교역 사내 조사보고서 ⅩⅩⅩ, 2026-09).
 *
 * 중국 국유 원양어업 그룹 中国农业发展集团의 상장 자회사. 대시보드 캔공장 표에 올랐지만 연보에 캔이 없다.
 *
 * ⚠ **등록부 척수를 67·65로 쓰지 마라.** 기구 간 중복을 빼면 61척이다.
 * ⚠ **「보조금이 없으면 적자」로 쓰지 마라.** 회사는 보조금을 경상 손익으로 분류한다 — 두 숫자를 나란히만 놓는다.
 * ⚠ **NGO의 「CNFC」를 상장사로 옮기지 마라.** 대개 모그룹 中国水产 단위이고 편입(2023-07-31) 전 자료다.
 * ⚠ Atuna의 참치 매출 3.77억 위안은 7.77억의 오기다.
 */

const data = raw as unknown as {
  _meta: { 회사: string; 국가: string; 업종: string; 종목: string; 출처: string; 조사일: string };
  card: { numeral: string; tagline: string };
  stats: Record<string, number>;
  sourcenotes: string[];
};

export const cnfcMeta = data._meta;
export const cnfcCard = data.card;
export const cnfcStats = data.stats;
export const cnfcSourceNotes = data.sourcenotes;

/** 2025 연결 매출 중 참치 몫. */
export function tunaSharePct(): number {
  const s = data.stats;
  return Number(((s.참치_매출_2025_cny / s.연결_매출_2025_cny) * 100).toFixed(2));
}

/** 2025 참치 원가가 매출을 넘은 금액(만 위안). */
export function tunaLossWan(): number {
  const s = data.stats;
  return Math.round((s.참치_원가_2025_cny - s.참치_매출_2025_cny) / 1e4);
}

/** 수익 관련 보조금 ÷ 연결 순이익(2025, 배). */
export function subsidyToProfit(): number {
  const s = data.stats;
  return Number((s.보조금_수익관련_2025_cny / s.순이익_2025_cny).toFixed(2));
}
