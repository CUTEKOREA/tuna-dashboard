import raw from '@/public/data/companies/bolton_v1.json';

/**
 * Bolton Group 기업 해부 인테이크 (신라교역 사내 조사보고서, 2026-08).
 *
 * 이 시리즈에서 처음으로 **참치가 사업의 3분의 2인 회사**다. 나머지 3분의 1은
 * 접착제(UHU)·세제(WC Net)·화장품(Borotalco)이다 — 참치 사이클과 상관없는 매출이
 * 32.7% 있다는 뜻이고, 그래서 원어값이 튀어도 그룹이 버틴다.
 *
 * 통합 방향이 앞의 회사들과 반대다. FCF는 상류에서 하류로 내려왔고 Thai Union은
 * 브랜드를 옆으로 사 모았다. **Bolton은 브랜드에서 시작해 상류로 올라갔다** —
 * 1999년 Saupiquet 선단·공장, 2013·2019년 Tri Marine 2단계 인수.
 *
 * ⚠ **참치 단독 매출은 공개되지 않는다.** 최소 공개 단위가 Food 카테고리(2,382 M€)이고
 *   그 안에 캔참치·수산캔·육류캔·소스가 전부 들어 있다.
 * ⚠ **조달 740,310 t 은 Bolton Food 원료와 Tri Marine 트레이딩의 합이다.**
 *   2024년 +26% 급증분에 트레이딩 증가 +144,000 t 이 섞여 있다 — 브랜드가 쓴 양이 아니다.
 * ⚠ **선단은 연도와 등록부를 붙여야 한다.** 공개 선박명단 399척(2024)은 조달 선단이고,
 *   자사 보유는 IATTC 4척뿐이며 ICCAT 3척은 전부 비활성이다.
 */

export type ProfileRow = [string, string];
export type CompareRow = {
  항목: string; thaiunion: string; fcf: string; itochu: string; bolton: string;
};
export type CategoryRow = {
  카테고리: string; y2024: number; y2025: number; 비중: number; 브랜드: number;
};
export type RegionRow = {
  지역: string; y2019: number | null; y2022: number | null; y2024: number; y2025: number;
};
export type SourcingRow = { 연도: number; 톤: number; 전년비: number | null };
export type SpeciesRow = { 어종: string; y2024: number; y2025: number; 비중: number; 증감: number };
export type GearRow = { 어법: string; y2024: number; y2025: number; 비중: number };
export type VesselListRow = {
  연도: number; 총척수: number; 한국선: number; 비중: number; 구성: string;
};
export type FinancialRow = {
  연도: number; 매출: string; ebitda: number | null; 순이익: number | null;
};
export type OwnFleetRow = { 등록부: string; 척수: number; 상태: string; 내역: string };
export type KoreaRow = { 항목: string; 값: string; 기준: string };

const data = raw as unknown as {
  _meta: {
    회사: string; 국가: string; 업종: string; 출처: string;
    출처한계: string; 측정경계: string; 갱신방법: string;
  };
  profile: ProfileRow[];
  compare: CompareRow[];
  categories: CategoryRow[];
  regions: RegionRow[];
  sourcing: SourcingRow[];
  species: SpeciesRow[];
  gear: GearRow[];
  vesselList: VesselListRow[];
  financials: FinancialRow[];
  ownFleet: OwnFleetRow[];
  korea: KoreaRow[];
  stats: {
    매출_백만유로: number; 조달_톤: number; food_비중: number; 비참치_비중: number;
    브랜드수: number; 명단선박: number; 한국선: number; 한국선_비중: number;
    자사선_iattc: number; 자사선_wcpfc: number; 선망_비중: number; green_비중: number;
  };
};

export const boltonMeta = data._meta;
export const boltonProfile = data.profile;
export const boltonCompare = data.compare;
export const boltonCategories = data.categories;
export const boltonRegions = data.regions;
export const boltonSourcing = data.sourcing;
export const boltonSpecies = data.species;
export const boltonGear = data.gear;
export const boltonVesselList = data.vesselList;
export const boltonFinancials = data.financials;
export const boltonOwnFleet = data.ownFleet;
export const boltonKorea = data.korea;
export const boltonStats = data.stats;

/** 2025년 순매출(M€). 카테고리 합계와 같아야 한다 — 빌드 스크립트가 잰다. */
export function netSales(): number {
  return data.categories.reduce((a, r) => a + r.y2025, 0);
}

/** 참치 사이클 밖의 매출 비중(%). 이 회사를 앞의 다섯과 가르는 수치다. */
export function nonTunaShare(): number {
  return Math.round((100 - data.stats.food_비중) * 10) / 10;
}

/** 자사 보유 선박 — 활성 등록부만. 조달 선단 399척과 혼동하지 않는다. */
export function activeOwnVessels(): number {
  return data.ownFleet
    .filter((r) => r.상태.startsWith('활성'))
    .reduce((a, r) => a + r.척수, 0);
}

/** 공개 선박명단의 최신 연도 행. */
export function latestVesselList(): VesselListRow {
  return data.vesselList[data.vesselList.length - 1];
}

/** 한국 국적선 비중이 가장 높았던 해. 총 척수가 줄면서 비중은 올라갔다. */
export function koreaSharePeak(): VesselListRow {
  return data.vesselList.reduce((a, r) => (r.비중 > a.비중 ? r : a));
}

/** 조달량 최신값(t). */
export function sourcingLatest(): SourcingRow {
  return data.sourcing[data.sourcing.length - 1];
}

/** 2025년에 가장 크게 늘어난 어종. 가다랑어가 내려앉은 자리를 무엇이 채웠는지. */
export function fastestGrowingSpecies(): SpeciesRow {
  return data.species.reduce((a, r) => (r.증감 > a.증감 ? r : a));
}
