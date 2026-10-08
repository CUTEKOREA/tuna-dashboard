import raw from '@/public/data/companies/thaiunion_v1.json';

/**
 * Thai Union 기업 해부 인테이크 (신라교역 사내 조사보고서, 2026-08).
 *
 * 세계 최대 참치 가공사다. 대시보드에 필요한 이유는 Frinsa 와 같다 —
 * **한국 냉동참치 수출의 54.1%(중량)가 태국으로 가고**, 그 최대 구매자가 이 회사다.
 * 동시에 미국 매대에서는 동원(StarKist)의 직접 경쟁자다. 보고서 09장의 결론이다.
 *
 * ⚠ **4층 함정.** 연결/개별 × 당기순이익/지배주주 귀속. 개별 순이익(102.6억 밧)이
 *   연결(56.5억 밧)보다 크다 — 모회사가 자회사 배당 125.1억 밧을 개별 손익에 잡는다.
 *   기준 없이 «타이유니온 순이익»을 인용하면 두 배 가까이 틀린다.
 * ⚠ **측정 경계.** 한국→태국 수출은 Comtrade 통관 기준이라 회사 매입량과 직접 못 견준다.
 *   2023년 연결 매출·EBITDA 는 보고서 표에 없어 null 이다 — 추정으로 메우지 않았다.
 */

export type SegmentRow = {
  카테고리: string; 매출: number; 비중: number; yoy: number; gpm: number; 브랜드비중: number | null;
};
export type FinancialRow = {
  연도: number; 매출: number | null; gpm: number; ebitda: number | null;
  지배주주순이익: number | null; eps: number | null; 비고: string;
};
export type ConVsSepRow = { 항목: string; 연결: number; 개별: number };
export type MscTrendRow = { 연도: number; msc: number; 심사중: number; fip: number; 무관계: number };
export type Tc25Row = { 약속: string; 실적: number };
export type CapacityRow = { 품목: string; 톤: number };
export type KoreaExportRow = { 연도: number; 톤: number; usd: number };
export type KoreaImportRow = { 원산지: string; usd: number; 비중: number; 관세: string };
export type UsTariffRow = { 품목: string; 부담: string; 비고: string };
export type ShareholderRow = { 순위: number; 주주: string; 지분: number };
export type HistoryRow = { 연도: string; 사건: string };
export type RegionRow = { 카테고리: string; 미국: number; 유럽: number; 아시아기타: number };
/** 인수 연도는 담지 않는다 — 보고서 03절 표가 정본이다(손으로 적었더니 정정을 못 따라왔다). */
export type BrandRow = { 브랜드: string; 국가: string; sku: number | null; 축: string };
export type JwLadderRow = { 층: string; 규격: string; 가격: number; perKg: number };
export type RetailPriceRow = { 브랜드: string; 제품: string; 가격: string; 단가: string; 소매처: string };
export type CapacityUtilRow = { 유형: string; 캐파: number; 가동률: number };
export type FactoryRow = { 지역: string; 거점: string; 품목: string };
export type GhgScopeRow = { 연도: number; s1: number; s2: number; s3: number | null };
export type SeachangeRow = { 목표: string; 실적: number; 상태: string };
export type RedLobsterRow = { 층: string; 시점: string; 내용: string };
export type BalanceRow = { 항목: string; y2025: number; y2024: number };
export type MfdsMixRow = { 품목: string; 건수: number };


const data = raw as unknown as {
  _meta: {
    회사: string; 국가: string; 업종: string; 출처: string;
    출처한계: string; 측정경계: string; 갱신방법: string;
  };
  profile: [string, string][];
  segments: SegmentRow[];
  financials: FinancialRow[];
  conVsSep: ConVsSepRow[];
  mscTrend: MscTrendRow[];
  tc25: Tc25Row[];
  capacity: CapacityRow[];
  koreaExport: KoreaExportRow[];
  koreaImport: KoreaImportRow[];
  usTariff: UsTariffRow[];
  shareholders: ShareholderRow[];
  history: HistoryRow[];
  regions: RegionRow[];
  brands: BrandRow[];
  jwLadder: JwLadderRow[];
  retailPrices: RetailPriceRow[];
  capacityUtil: CapacityUtilRow[];
  factories: FactoryRow[];
  ghgScopes: GhgScopeRow[];
  seachange: SeachangeRow[];
  redLobster: RedLobsterRow[];
  balance: BalanceRow[];
  mfdsMix: MfdsMixRow[];
};

export const thaiUnionMeta = data._meta;
export const thaiUnionProfile = data.profile;
export const thaiUnionSegments = data.segments;
export const thaiUnionFinancials = data.financials;
export const thaiUnionConVsSep = data.conVsSep;
export const thaiUnionMscTrend = data.mscTrend;
export const thaiUnionTc25 = data.tc25;
export const thaiUnionCapacity = data.capacity;
export const thaiUnionKoreaExport = data.koreaExport;
export const thaiUnionKoreaImport = data.koreaImport;
export const thaiUnionUsTariff = data.usTariff;
export const thaiUnionShareholders = data.shareholders;
export const thaiUnionHistory = data.history;
export const thaiUnionRegions = data.regions;
export const thaiUnionBrands = data.brands;
export const thaiUnionJwLadder = data.jwLadder;
export const thaiUnionRetailPrices = data.retailPrices;
export const thaiUnionCapacityUtil = data.capacityUtil;
export const thaiUnionFactories = data.factories;
export const thaiUnionGhgScopes = data.ghgScopes;
export const thaiUnionSeachange = data.seachange;
export const thaiUnionRedLobster = data.redLobster;
export const thaiUnionBalance = data.balance;
export const thaiUnionMfdsMix = data.mfdsMix;

/** 브랜드 실측 SKU 합계 — «최대한 많은 정보» 지시의 커버리지 지표. */
export function totalBrandSku(): number {
  return data.brands.reduce((a, r) => a + (r.sku ?? 0), 0);
}

/** 최신 확정 회계연도(2025). 연결 기준이다. */
export function latestTuFinancial(): FinancialRow {
  return data.financials[data.financials.length - 1];
}

/** 그룹 참치 캐파(톤/년). 선단 0척으로 이만큼을 처리한다. */
export function tunaCapacityMt(): number {
  return data.capacity.find((r) => r.품목 === '참치')?.톤 ?? 0;
}

/** 한국→태국 냉동참치 최신 연도 수출(톤). Comtrade 통관 기준. */
export function latestKoreaExport(): KoreaExportRow {
  return data.koreaExport[data.koreaExport.length - 1];
}

/**
 * 개별-연결 순이익 역전 폭(배). 4층 함정의 요지를 한 숫자로 —
 * 1 을 넘으면 «개별이 연결보다 크다»는 비정상 배치가 실재한다는 뜻이다.
 */
export function sepOverConRatio(): number {
  const row = data.conVsSep.find((r) => r.항목 === '당기순이익');
  if (!row) return 0;
  return Number((row.개별 / row.연결).toFixed(2));
}
