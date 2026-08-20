import raw from '@/public/data/companies/frinsa_v1.json';

/**
 * Frinsa 기업 해부 인테이크 (Frinsa 조사 아카이브, 2026-08-19~20).
 *
 * 스페인 갈리시아 Ribeira 의 캔참치 가공사다. 이 회사가 대시보드에 필요한 이유는
 * 경쟁자여서가 아니라 **원어를 사는 쪽**이기 때문이다 — 선단 0척으로 한 해
 * 참치 원어 135,289톤(회사 EINF SAP 집계)을 사들인다.
 *
 * ⚠ **출처.** 아카이브는 칸별 출처·등급(A/B)을 단다 — A = 인증서·EINF·등기 원본,
 *   B = 주요매체 교차확인. 미확인 항목(2025 매출·PL 비중·ISSF 개별 준수등급)은
 *   추정으로 메우지 않았다.
 *
 * ⚠ **측정 경계.** 매출·순이익은 그룹 연결 유로. 한국→스페인 수출은 UN Comtrade
 *   스페인 신고 기준(2025년은 미완연도). 회사 구매량(톤)과 통관 수출량은 범위가
 *   달라 직접 견줄 수 없다.
 */

export type PriceRung = {
  층: string; 제품: string; 규격: string; 소비자가: number; eurPerKg: number; 채널: string;
};
export type FinancialRow = { 연도: number; 매출: number; 순이익: number; 비고: string };
export type RegionalRow = { 시장: string; 매출: number; 비고: string };
export type GaliciaRow = {
  기업: string; y2020: number; y2023: number; y2024: number; y2025: number | null;
};
export type SourcingRow = { 구분: string; 톤: number };
export type SustainabilityRow = { 축: string; 구분: string; 비중: number };
export type KoreaExportRow = { 연도: number; kg: number; usd: number };
export type TariffRow = { 품목: string; 코드: string; mfn: string; 조건: string };
export type BaiRow = { 국가: string; 세전이익: number };
export type BrandRow = { 브랜드: string; 시장: string; 포지션: string; 채널: string };
export type CertRow = { 인증: string; 번호: string; 상태: string; 유효: string };
export type CogenRow = { 연도: number; 발전MWh: number };

const data = raw as unknown as {
  _meta: { 회사: string; 국가: string; 업종: string; 출처: string; 출처한계: string; 측정경계: string; 갱신방법: string };
  profile: [string, string][];
  priceLadder: PriceRung[];
  financials: FinancialRow[];
  regional2024: RegionalRow[];
  galiciaThree: GaliciaRow[];
  sourcing: SourcingRow[];
  sustainability: SustainabilityRow[];
  koreaExport: KoreaExportRow[];
  tariff: TariffRow[];
  bai2024: BaiRow[];
  bai2024Total: number;
  brands: BrandRow[];
  certs: CertRow[];
  cogen: CogenRow[];
};

export const frinsaMeta = data._meta;
export const frinsaProfile = data.profile;
export const frinsaPriceLadder = data.priceLadder;
export const frinsaFinancials = data.financials;
export const frinsaRegional2024 = data.regional2024;
export const frinsaGalicia = data.galiciaThree;
export const frinsaSourcing = data.sourcing;
export const frinsaSustainability = data.sustainability;
export const frinsaKoreaExport = data.koreaExport;
export const frinsaTariff = data.tariff;
export const frinsaBai2024 = data.bai2024;
export const frinsaBai2024Total = data.bai2024Total;
export const frinsaBrands = data.brands;
export const frinsaCerts = data.certs;
export const frinsaCogen = data.cogen;

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
