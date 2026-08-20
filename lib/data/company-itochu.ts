import raw from '@/public/data/companies/itochu_v1.json';

/**
 * ITOCHU Corporation(伊藤忠商事) 기업 해부 인테이크 (신라교역 사내 조사보고서, 2026-08).
 *
 * 앞의 네 회사는 참치가 본업이었다. 이 회사는 다르다 — 일본 5대 종합상사 중 순이익 1위인데
 * **참치는 8개 컴퍼니 중 하나(食料), 그 안의 3부문 중 하나(生鮮食品), 그 안의 2부 중 하나**다.
 * 그것도 단독 부가 아니라 Dole(농산)과 한 부에 묶인 「農産・水産部」다.
 *
 * 그래서 규모를 재는 방식부터 다르다. **유가증권보고서·결산단신·경영계획 어디에도
 * 수산·참치의 매출·이익·자산 수치가 없다.** 상한선은 生鮮食品 부문 순이익 166억엔뿐이고,
 * 그 안에 프리마햄·HyLife(축산)와 Dole(농산)이 전부 들어 있다.
 *
 * 한국 관점의 무게는 재무가 아니라 **선박 명단**에 있다. MSC 인증 선단 25척 가운데
 * **11척이 사조그룹**이다 — ITOCHU가 인증 보유자로서 신청·유지 비용을 지는 구조적 조달관계다.
 *
 * ⚠ **선단 25척은 2022~2023년 인증 문서 기준**이다. ESG레포트의 「26척 체제」와 정합하며,
 *   2025-02 추가된 1척은 이 명단에 아직 없다.
 * ⚠ **食料 부문 합(920)과 세그먼트 합계(921)가 1억엔 어긋난다** — 회사 공시 자체의 반올림이다.
 */

export type ProfileRow = [string, string];
export type CompareRow = {
  항목: string; frinsa: string; albacora: string; fcf: string; itochu: string;
};
export type FleetRow = { 기국: string; 척수: number; 비중: number; 선주: string };
export type SiVesselRow = { 선명: string; 선사: string; imo: string; gt: number };
export type SegmentRow = { 세그먼트: string; fy2024: number; fy2025: number };
export type FoodDivRow = { 부문: string; fy2024: number; fy2025: number };
export type AtiRow = { 항목: string; 값: string };
export type KoreaRow = { 항목: string; 값: string; 기준: string };

const data = raw as unknown as {
  _meta: {
    회사: string; 국가: string; 업종: string; 출처: string;
    출처한계: string; 측정경계: string; 갱신방법: string;
  };
  profile: ProfileRow[];
  compare: CompareRow[];
  fleet: FleetRow[];
  siVessels: SiVesselRow[];
  segments: SegmentRow[];
  foodDivisions: FoodDivRow[];
  ati: AtiRow[];
  korea: KoreaRow[];
  stats: Record<string, number>;
};

export const itochuMeta = data._meta;
export const itochuProfile = data.profile;
export const itochuCompare = data.compare;
export const itochuFleet = data.fleet;
export const itochuSiVessels = data.siVessels;
export const itochuSegments = data.segments;
export const itochuFoodDivisions = data.foodDivisions;
export const itochuAti = data.ati;
export const itochuKorea = data.korea;
export const itochuStats = data.stats;

/** 인증 선단 총 척수. */
export function fleetTotal(): number {
  return data.fleet.reduce((a, r) => a + r.척수, 0);
}

/** 사조그룹 계열 척수 — 이 화면에서 가장 중요한 값이다. */
export function sajoVessels(): number {
  return data.fleet
    .filter((r) => r.선주.includes('SAJO'))
    .reduce((a, r) => a + r.척수, 0);
}

/** 사조 비중(%) — 소수 첫째 자리. */
export function sajoShare(): number {
  return Math.round((sajoVessels() / fleetTotal()) * 1000) / 10;
}

/** SI 어업 6척의 합계 GT. 한국 선적분의 규모다. */
export function siGtTotal(): number {
  return data.siVessels.reduce((a, r) => a + r.gt, 0);
}

/** 食料 세그먼트가 8개 세그먼트 가운데 몇 위인지. */
export function foodRank(): number {
  const sorted = [...data.segments].sort((a, b) => b.fy2025 - a.fy2025);
  return sorted.findIndex((r) => r.세그먼트 === '食料') + 1;
}
