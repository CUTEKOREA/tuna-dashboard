import raw from '@/public/data/companies/albacora_v1.json';

/**
 * Albacora 기업 해부 인테이크 (신라교역 사내 조사보고서, 2026-08).
 *
 * 앞의 두 회사와 성격이 다르다. Frinsa 와 Thai Union 은 **원어를 팔 상대**였다 —
 * 접근 창구와 요구 조건이 관심사였다. 알바코라는 **같은 어법으로 같은 어장에서 조업하고
 * 같은 캐너리에 파는 경쟁자**다. 한국 선망선사(신라교역·동원·사조)와 사업이 정면으로 겹친다.
 * 거래 상대가 아니라 벤치마크로 읽는 회사다.
 *
 * ⚠ **비상장 가족기업이라 매출 절대액이 공개되지 않는다.** 확인된 것은 경영진이 밝힌
 *   2023년 그룹 연결 약 5.0억 유로와 가공 3사 합계(약 250 M€)뿐이다.
 *   2025년 «매출 +5% · EBITDA −65%»는 신용정보 기관의 **방향치**이지 절대액이 아니다.
 * ⚠ **선단 12척은 등록부 확인분**이다. 회사는 18척이라 밝힌다 —
 *   나머지 6척은 4개 기구 등록부에 없어 비운 채로 뒀다. 추정으로 메우지 않았다.
 * ⚠ **EMAS 물량은 스페인 2공장만**이다. 매출의 74%를 내는 에콰도르 Posorja 는 EMAS 대상이
 *   아니라 물량이 없다 — SIA·SAC 톤수를 그룹 처리량으로 읽으면 틀린다.
 */

export type ProfileRow = [string, string];
export type CompareRow = { 항목: string; frinsa: string; thaiunion: string; albacora: string };
export type HistoryRow = { 연도: string; 사건: string };
export type SuccessionRow = { 시점: string; 변동: string };
export type AffiliateRow = { 법인: string; 내용: string };
export type FleetRow = { 선명: string; gt: number; 선적: string; 기구: string; 소유사: string };
export type CatchRow = { 연도: number; 톤: number };
export type SalesDestRow = { 판매처: string; 비중: number; 비고: string };
export type MonitoringRow = { 장치: string; 내용: string };
export type PlantRow = {
  플랜트: string; 직원: number; y2025: number; y2024: number; 품목: string; 주시장: string;
};
export type SiaTonnageRow = { 연도: number; 톤: number; 전년비: number | null };
export type SacYieldRow = { 연도: number; 원료: number; 제품: number; 수율: number };
export type BrandRow = { 브랜드: string; 성격: string };
export type CamposPriceRow = { 제품: string; 가격: number; 축: string };
export type CertRow = { 플랜트: string; msc: string; apr: string; brc: string; ifs: string };
export type MscUnitRow = { 유닛: string; 상태: string };
export type SustainRow = { 항목: string; 내용: string };
export type FinancialRow = { 항목: string; 값: string; 기준: string; 등급: string };
export type SafetyRow = { 지표: string; 여성: number; 남성: number };
export type RiskRow = { 시점: string; 건: string; 내용: string };
export type TradeThreatRow = { 회사: string; 위협: string; 대응: string };
export type OverlapRow = { 번호: number; 축: string; 내용: string };
export type OpenQuestionRow = { 물음: string; 왜: string };
export type LimitRow = { 항목: string; 상태: string };

const data = raw as unknown as {
  _meta: {
    회사: string; 국가: string; 업종: string; 출처: string;
    출처한계: string; 측정경계: string; 갱신방법: string;
  };
  profile: ProfileRow[];
  compare: CompareRow[];
  history: HistoryRow[];
  succession: SuccessionRow[];
  affiliates: AffiliateRow[];
  fleet: FleetRow[];
  catch: CatchRow[];
  salesDest: SalesDestRow[];
  monitoring: MonitoringRow[];
  plants: PlantRow[];
  siaTonnage: SiaTonnageRow[];
  sacYield: SacYieldRow[];
  brands: BrandRow[];
  camposPrices: CamposPriceRow[];
  certs: CertRow[];
  mscUnits: MscUnitRow[];
  sustain: SustainRow[];
  financials: FinancialRow[];
  safety: SafetyRow[];
  risks: RiskRow[];
  tradeThreat: TradeThreatRow[];
  overlap: OverlapRow[];
  openQuestions: OpenQuestionRow[];
  limits: LimitRow[];
};

export const albacoraMeta = data._meta;
export const albacoraProfile = data.profile;
export const albacoraCompare = data.compare;
export const albacoraHistory = data.history;
export const albacoraSuccession = data.succession;
export const albacoraAffiliates = data.affiliates;
export const albacoraFleet = data.fleet;
export const albacoraCatch = data.catch;
export const albacoraSalesDest = data.salesDest;
export const albacoraMonitoring = data.monitoring;
export const albacoraPlants = data.plants;
export const albacoraSiaTonnage = data.siaTonnage;
export const albacoraSacYield = data.sacYield;
export const albacoraBrands = data.brands;
export const albacoraCamposPrices = data.camposPrices;
export const albacoraCerts = data.certs;
export const albacoraMscUnits = data.mscUnits;
export const albacoraSustain = data.sustain;
export const albacoraFinancials = data.financials;
export const albacoraSafety = data.safety;
export const albacoraRisks = data.risks;
export const albacoraTradeThreat = data.tradeThreat;
export const albacoraOverlap = data.overlap;
export const albacoraOpenQuestions = data.openQuestions;
export const albacoraLimits = data.limits;

/** 회사가 공표하는 선단 규모. 등록부 확인분(12척)과 구분해 쓴다. */
export const ALBACORA_CLAIMED_VESSELS = 18;

/** 등록부로 확인된 선단 합계 톤수(GT). 회사 공표 18척 중 12척분이다. */
export function fleetGtTotal(): number {
  return data.fleet.reduce((a, v) => a + v.gt, 0);
}

/** 최신 연도 어획량(톤). 2025년 약 20만 톤 — 프린사 구매량(13.5만)을 웃돈다. */
export function latestCatch(): CatchRow {
  return data.catch[data.catch.length - 1];
}

/** 가공 3사 2025 매출 합계(M€). EINF 공시분. */
export function plantRevenueTotal(): number {
  return Number(data.plants.reduce((a, p) => a + p.y2025, 0).toFixed(1));
}

/**
 * 에콰도르 매출 비중(%). «몸통은 에콰도르에 있다»를 한 숫자로 —
 * 스페인 본토는 본사가 있는 곳이지 생산이 일어나는 곳이 아니다.
 */
export function ecuadorRevenueShare(): number {
  const sae = data.plants.find((p) => p.플랜트.startsWith('SAE'));
  if (!sae) return 0;
  return Number(((sae.y2025 / plantRevenueTotal()) * 100).toFixed(1));
}

/** 기국별 선박 수. 스페인 8 · 파나마 2 · 모리셔스 2 로 갈려 있다. */
export function flagCounts(): { 선적: string; 척수: number; gt: number }[] {
  const m = new Map<string, { 선적: string; 척수: number; gt: number }>();
  for (const v of data.fleet) {
    const cur = m.get(v.선적) ?? { 선적: v.선적, 척수: 0, gt: 0 };
    cur.척수 += 1;
    cur.gt += v.gt;
    m.set(v.선적, cur);
  }
  return [...m.values()].sort((a, b) => b.척수 - a.척수);
}

/**
 * SIA 베르메오 물량 최대 낙폭(%). 04절의 요지 —
 * 같은 기간 매출은 2.7% 줄었는데 실물 투입은 이만큼 빠졌다.
 */
export function siaVolumeDrop(): number {
  const drop = data.siaTonnage.find((r) => r.전년비 !== null && r.전년비 < 0);
  return drop?.전년비 ?? 0;
}
