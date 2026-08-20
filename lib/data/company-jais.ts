import raw from '@/public/data/companies/jais_v1.json';

/**
 * JAIS S.R.L. 기업 해부 인테이크 (신라교역 사내 조사보고서, 2026-08).
 *
 * 앞의 여섯 회사는 「무엇을 지배하는가」로 설명됐다. 이 회사는 반대편에 선다 —
 * **공장 0 · 선박 0 · 승인시설 0 · 자회사 0**. 밀라노의 방 몇 개에서 여덟 명이
 * 연 €3,400만~€5,200만어치 참치를 넘기며 ±0.3%를 남겨 온 60년 된 가족형 중개상이다.
 *
 * 그래서 재는 방식이 다르다. 재무제표보다 **명부의 판별 시계열**이 더 많은 것을 말한다.
 * Friend of the Sea 승인선박 명부에서 이 회사의 등재행이 43(2018) → 12(2023-04) →
 * **0(2023-11 이후 네 판 연속)** 으로 갔다. 같은 판에서 FCF는 34행 전부 유효다.
 *
 * 조사의 부산물이 하나 더 있다. FCF 조사와 신라교역 조사에서 각각 따로 보였던
 * **대만 태평양 선단과 가나 대서양 선단이 2018~2020년 한 회사의 판매권 아래 동시에**
 * 있었다. 두 축이 유럽 판매단에서 만나던 지점이고, 그 지점은 지금 비어 있다.
 *
 * ⚠ **2025년 매출·손익은 「약」으로 표기된 추정치**다. 확정 기탁분이 아니다.
 * ⚠ **FoS 등재행은 명부 판별 기준이지 거래 실적이 아니다.** 등재가 사라진 것이
 *   거래가 사라진 것과 같다고 읽으면 안 된다.
 * ⚠ 대표자·이사회·주주 명단이 무료 경로에 없다. 주주 목록 세 행은 전부 가려져 있다.
 */

export type ProfileRow = [string, string];
export type CompareRow = { 항목: string; others: string; jais: string };
export type FinancialRow = {
  연도: number; 매출: number; 전년비: number | null;
  순손익: number; 순마진: number; 종업원: number | null;
};
export type FosRow = { 판: string; 등재행: number; 총행수: number | null; 내역: string };
export type RegistryRow = { 근거: string; 표기: string; 뜻: string; 기준: string };
export type AxisRow = { 축: string; 기간: string; 규모: string; 현재: string; 근거: string };
export type PanofiRow = { 항목: string; 값: string; 기준: string };
export type KoreaRow = { 항목: string; 값: string; 기준: string };

const data = raw as unknown as {
  _meta: {
    회사: string; 국가: string; 업종: string; 출처: string;
    출처한계: string; 측정경계: string; 갱신방법: string;
  };
  profile: ProfileRow[];
  compare: CompareRow[];
  financials: FinancialRow[];
  fos: FosRow[];
  registries: RegistryRow[];
  axes: AxisRow[];
  panofi: PanofiRow[];
  korea: KoreaRow[];
  stats: {
    매출_유로: number; 매출_만유로: number; 정점_만유로: number; 총자산_만유로: number;
    종업원: number; 자사선: number; 공장: number; 자회사: number; 적자연속: number;
    fos_최대: number; fos_현재: number; 등기년: number; 창업서사년: number;
    이탈리아수입_한국비중: number; panofi_지분: number;
  };
};

export const jaisMeta = data._meta;
export const jaisProfile = data.profile;
export const jaisCompare = data.compare;
export const jaisFinancials = data.financials;
export const jaisFos = data.fos;
export const jaisRegistries = data.registries;
export const jaisAxes = data.axes;
export const jaisPanofi = data.panofi;
export const jaisKorea = data.korea;
export const jaisStats = data.stats;

/** 매출이 가장 컸던 해. 2022년 €5,193만이 정점이고 그 뒤로 내려왔다. */
export function revenuePeak(): FinancialRow {
  return data.financials.reduce((a, r) => (r.매출 > a.매출 ? r : a));
}

/** 순마진 절대값의 최댓값(%). 7개년 내내 1%를 넘지 않는다. */
export function marginBand(): number {
  return Math.max(...data.financials.map((r) => Math.abs(r.순마진)));
}

/** 연속 적자 연수 — 2023년부터 이어진다. */
export function lossStreak(): number {
  let n = 0;
  for (let i = data.financials.length - 1; i >= 0; i -= 1) {
    if (data.financials[i].순손익 >= 0) break;
    n += 1;
  }
  return n;
}

/** FoS 명부에서 등재행이 0이 된 첫 판. 이 회사가 지워진 시점이다. */
export function fosVanished(): FosRow | undefined {
  return data.fos.find((r) => r.등재행 === 0);
}

/** 창업 서사와 등기 사실의 간극(년). 회사는 1963년, 등기는 1966년이다. */
export function foundingGap(): number {
  return data.stats.등기년 - data.stats.창업서사년;
}

/** 소유 자산 합계. 전부 0이라는 것이 이 회사의 정의다. */
export function ownedAssets(): number {
  return data.stats.자사선 + data.stats.공장 + data.stats.자회사;
}
