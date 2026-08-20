import raw from '@/public/data/companies/frinsa_v1.json';

/**
 * Frinsa 기업 해부 인테이크 (신라교역 사내 조사보고서, 2026-08).
 *
 * 스페인 갈리시아 Ribeira 의 캔참치 가공사다. 이 회사가 대시보드에 필요한 이유는
 * 경쟁자여서가 아니라 **원어를 사는 쪽**이기 때문이다 — 보고서 09장의 결론이다.
 *
 * ⚠ **출처 한계.** 원본 보고서는 「확인불가」·「추정」 표기가 없고 출처 언급도 5회뿐이다.
 *   칸별 근거가 얇으므로 인용할 때 원문 표를 함께 확인해야 하고, 이 인테이크는
 *   원본에 없는 근거를 만들어 넣지 않는다.
 *
 * ⚠ **측정 경계.** 매출·순이익은 그룹 연결 유로 기준이고, 한국→스페인 수출은 관세청
 *   통관 기준이다. 회사 구매량(톤)과 통관 수출량은 범위가 달라 직접 견줄 수 없다.
 */

export type PriceRung = {
  층: string; 제품: string; 규격: string; 소비자가: number; eurPerKg: number; 채널: string;
};
export type FinancialRow = { 연도: number; 매출: number; 순이익: number; 비고: string };
export type GaliciaRow = {
  기업: string; y2020: number; y2023: number; y2024: number; y2025: number | null;
};
export type SourcingRow = { 구분: string; 톤: number };
export type SustainabilityRow = { 축: string; 구분: string; 비중: number };
export type KoreaExportRow = { 연도: number; kg: number; usd: number };
export type TariffRow = { 품목: string; 코드: string; mfn: string; 조건: string };
export type SubsidiaryRow = { 국가: string; 법인: string; 세전이익: number };

const data = raw as unknown as {
  _meta: { 회사: string; 국가: string; 업종: string; 출처: string; 출처한계: string; 측정경계: string; 갱신방법: string };
  profile: [string, string][];
  priceLadder: PriceRung[];
  financials: FinancialRow[];
  galiciaThree: GaliciaRow[];
  sourcing: SourcingRow[];
  sustainability: SustainabilityRow[];
  koreaExport: KoreaExportRow[];
  tariff: TariffRow[];
  subsidiaryProfit: SubsidiaryRow[];
};

export const frinsaMeta = data._meta;
export const frinsaProfile = data.profile;
export const frinsaPriceLadder = data.priceLadder;
export const frinsaFinancials = data.financials;
export const frinsaGalicia = data.galiciaThree;
export const frinsaSourcing = data.sourcing;
export const frinsaSustainability = data.sustainability;
export const frinsaKoreaExport = data.koreaExport;
export const frinsaTariff = data.tariff;
export const frinsaSubsidiaries = data.subsidiaryProfit;

/** 최신 회계연도. 2025 는 미공표라 2024 가 마지막 확정치다. */
export function latestFinancial(): FinancialRow {
  return data.financials[data.financials.length - 1];
}

/** 그룹이 한 해 사들이는 참치 원어(톤). 선단 0척으로 이만큼을 산다. */
export function tunaPurchasedMt(): number {
  return data.sourcing.find((r) => r.구분 === '그룹 참치 원어 합계')?.톤 ?? 0;
}

/**
 * 지속가능성 축별 구성. 「어디에도 해당 없음」을 빼지 않는다 —
 * 공급사 기준으로 70.8% 가 그 칸이고, 그것이 이 표의 요지다.
 */
export function sustainabilityBy(axis: string): SustainabilityRow[] {
  return data.sustainability.filter((r) => r.축 === axis);
}

/** 순이익률(%). 매출과 순이익이 같은 회계연도라 나눌 수 있다. */
export function marginSeries(): { 연도: number; 매출: number; 순이익률: number }[] {
  return data.financials.map((r) => ({
    연도: r.연도,
    매출: r.매출,
    순이익률: Number(((r.순이익 / r.매출) * 100).toFixed(2)),
  }));
}
