import raw from '@/public/data/companies/frabelle_v1.json';

/**
 * Frabelle Group 기업 해부 인테이크 (신라교역 사내 조사보고서, 2026-09).
 *
 * 시리즈에서 **착수 가설이 뒤집힌 첫 대상**이다. 「필리핀 최대 참치 수직통합 그룹」으로
 * 시작했으나 조사가 부인했다 — 필리핀 국내에 자사 참치 캐너리가 없고, General Santos
 * 6대 수출 캐너리(합산 700 MT/일)에도 들지 않는다. 참치를 캔에 담는 곳은 PNG Lae 한 곳이다.
 * 필리핀에서 이 회사는 캐너리에 원어를 파는 **업스트림**이다.
 *
 * ⚠ **「100척 이상」을 선단 규모로 쓰지 마라.** 그룹 전체·전 어종 기준이고 검증 경로가 없다.
 *   등록부 실체는 참치 선망선 13척에 운반 2·보조 2·용선 6이며 소유가 5개 법인에 흩어져 있다.
 * ⚠ **그룹 연결재무가 존재하지 않는다.** EMIS 증감률(FFC FY2024 매출 −34.54%)은 개별 법인
 *   기준이지 그룹 실적이 아니다.
 * ⚠ **한국 접점은 직접 지분이 아니다.** Majestic 이 FCF + Frabelle (PNG) 2자 소유이고,
 *   같은 FCF 가 신라교역과 가나 Cosmo Seafoods 를 공동소유한다 — FCF 를 매개로 한 2단계다.
 */

export interface CoverNum { value: string; label: string }
export interface CoverFact { label: string; value: string; note: string }

const data = raw as unknown as {
  _meta: {
    회사: string; 국가: string; 업종: string; 출처: string;
    출처한계: string; 측정경계: string; 갱신방법: string;
  };
  cover: { nums: CoverNum[]; facts: CoverFact[] };
  stats: Record<string, number>;
};

export const frabelleMeta = data._meta;
export const frabelleCover = data.cover;
export const frabelleStats = data.stats;

/** 등록부로 확인되는 선박 총계. 회사 표기 「100척 이상」과 구분해 쓴다. */
export function registeredVessels(): number {
  const s = data.stats;
  return s.등록부_참치선망선 + s.운반선 + s.보조선 + s.용선;
}

/** PNG Lae 실생산 범위 표기. 능력(140)과 다르다. */
export function laeOutputRange(): string {
  return `${data.stats.PNG_Lae_실생산_하한}~${data.stats.PNG_Lae_실생산_상한}`;
}
