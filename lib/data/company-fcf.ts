import raw from '@/public/data/companies/fcf_v1.json';

/**
 * FCF Co., Ltd.(豐群水產) 기업 해부 인테이크 (신라교역 사내 조사보고서, 2026-08).
 *
 * 앞의 세 회사와 또 다르다. Frinsa·Thai Union이 **사는 회사**, Albacora가 **잡는 회사**였다면
 * FCF는 **대는 회사**다. 자기 배도 없고 자기 어획도 없는데 연 50만~65만 톤이 이 회사를 거친다.
 * 파는 것은 원어가 아니라 벙커링·미끼·선무대리·전재·물류·컴플라이언스가 한 묶음으로 딸려 가는
 * **조업 패키지**다. 그래서 개별 트레이더가 통째로 대체하지 못한다.
 *
 * 신라교역에게 이 회사는 **매출의 32~46%를 사가는 단일 최대 고객**이다. 다른 세 회사가
 * 「고객 후보」·「경쟁자」였던 것과 무게가 다르다.
 *
 * ⚠ **2002년 발행정지된 비상장사라 감사 재무제표가 없다.** 매출 600억 NT$는 회장 발언이고
 *   취급 물량은 외부 추정이다. 절대액으로 인용하면 안 된다.
 * ⚠ **이 거래는 무역통계에 잡히지 않는다.** 원어가 선상·환적항에서 인도되기 때문에
 *   매수인의 국적과 화물의 목적지가 분리된다 — 한국→대만 참치 수출은 사실상 0으로 찍힌다.
 */

export type ProfileRow = [string, string];
export type CompareRow = {
  항목: string; frinsa: string; albacora: string; fcf: string;
};
export type SillaDepRow = { 연도: string; 비중: number };
export type SpeciesRow = { 어종: string; 비중: number; 비고: string };
export type GearRow = { 어법: string; 비중: number; 용도: string };
export type OwnershipRow = { 법인: string; 지분: number; 대표: string };
export type GroupRow = { 국가: string; 법인: string; 분류: string; 비고: string };

const data = raw as unknown as {
  _meta: {
    회사: string; 국가: string; 업종: string; 출처: string;
    출처한계: string; 측정경계: string; 갱신방법: string;
  };
  profile: ProfileRow[];
  compare: CompareRow[];
  sillaDependency: SillaDepRow[];
  species: SpeciesRow[];
  gear: GearRow[];
  ownership: OwnershipRow[];
  group: GroupRow[];
  stats: Record<string, number>;
};

export const fcfMeta = data._meta;
export const fcfProfile = data.profile;
export const fcfCompare = data.compare;
export const fcfSillaDependency = data.sillaDependency;
export const fcfSpecies = data.species;
export const fcfGear = data.gear;
export const fcfOwnership = data.ownership;
export const fcfGroup = data.group;
export const fcfStats = data.stats;

/** 신라교역 의존도 최신값 — 카드와 KPI가 함께 쓴다. */
export function sillaLatest(): SillaDepRow {
  return data.sillaDependency[data.sillaDependency.length - 1];
}

/** 신라교역 의존도가 가장 높았던 해. 「최대 고객」의 무게를 재는 값이다. */
export function sillaPeak(): SillaDepRow {
  return data.sillaDependency.reduce((a, b) => (b.비중 > a.비중 ? b : a));
}

/** 光陽(柯씨) 계열 4개 법인 지분 합계 — 상호와 실권이 갈리는 지점. */
export function kwangyangShare(): number {
  const names = ['信勝投資', '光洲投資', '弘光投資', '昭冠投資'];
  const sum = data.ownership
    .filter((r) => names.includes(r.법인))
    .reduce((acc, r) => acc + r.지분, 0);
  return Math.round(sum * 100) / 100;
}
