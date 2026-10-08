import raw from '../../public/data/squid_peru_supply_v1.json';

/**
 * 페루 조달 — 관세청 페루산 수입 5개년 + 식약처 수입신고 원장의 페루 제조소.
 *
 * 사내 조사보고서 「페루 조달과 탈라라」(2026-09-09)의 확정 사실만 옮긴다.
 *
 * ⚠ **신고 건수는 수량이 아니다.** 한 건이 컨테이너 한 대일 수도 샘플일 수도 있다. 물량 순위로 읽지 않는다.
 * ⚠ **한국 전체 분모는 네 HS6 합산 바스켓이다.** s10 본문의 「10자리 오징어만」 비중과 같은 줄에 놓지 않는다.
 * ⚠ **CHD 수출액은 전 어종 합계이고 매출이 아니다.**
 * ⚠ 「한국계 경영」은 등기 임원 성명으로 판단한 값이다. 개인 이름은 싣지 않는다.
 * ⚠ `예(미팅)` 은 사내 미팅(대표 면담)으로 확인한 경우다. `미팅_자칭` 값은 본인 진술이라 공개 자료 값과 섞지 않는다.
 */

export interface PeruImportRow {
  연도: string;
  냉동_톤: number;
  조제_톤: number;
  합계_톤: number;
  금액_usd: number;
  단가_usd_kg: number;
  한국수입중_금액비중_pct: number;
  한국수입중_물량비중_pct: number;
}

export interface PeruPlantRow {
  공장: string;
  RUC: string;
  항구: string;
  능력_톤일: number | null;
  직원: number;
  직원_기준월: string;
  한국계경영: string;
  신고건수: number;
  대왕오징어_pct: number;
  자숙_pct: number;
  CHD수출_2024_usd: number | null;
  SANIPES_영국승인: string | null;
  미팅_자칭?: PeruPlantMeetingClaim;
}

/** 사내 미팅에서 대표가 직접 말한 값(검증되지 않음). */
export interface PeruPlantMeetingClaim {
  기준일: string;
  출처: string;
  연안조업선_척: number;
  가공능력_톤일: number;
  월작업일: number;
  냉동창고_톤: number;
  자숙_pct_약: number;
  주요_한국파트너: string;
  신뢰: string;
}

const data = raw as unknown as {
  _meta: { 출처: string; 보고서: string; 범위_수입: string; 조회일: string };
  수입: PeruImportRow[];
  공장: PeruPlantRow[];
  원장요약: {
    전체_신고건수: number;
    상위14사_신고건수: number;
    한국계7사_신고건수: number;
    한국계7사_직원: number;
    한국계_미팅포함8사_신고건수: number;
    한국계_미팅포함8사_직원: number;
  };
};

export const peruMeta = data._meta;
export const peruImports = data.수입;
export const peruPlants = data.공장;
export const peruLedger = data.원장요약;

/** 원장 전체 신고 중 비율(%). */
export function ledgerSharePct(n: number): number {
  return Number(((n / peruLedger.전체_신고건수) * 100).toFixed(1));
}

/**
 * 식약처 해외제조업소 등록 상태 — 위 14곳에 붙인다.
 *
 * 보고서 데이터에는 신고 건수·능력·직원은 있어도 **등록이 살아 있는지**가 없었다.
 * `scripts/sync_maru_registry_status.py` 로 다시 만든다(마루 화면 조회, 로그인 불필요).
 *
 * ⚠ 「만료」는 등록 만료일이 지났다는 뜻이지 위법이라는 뜻이 아니다. 갱신이 아직 반영되지 않았을 수 있다.
 * ⚠ 보고서는 약칭을, 등록부는 정식명을 쓴다. 접두가 여러 회사에 걸리면 붙이지 않고 「모호」로 남긴다.
 */
import registry from '../../public/data/maru_registry_status_v1.json';

export type PeruRegistryStatus = {
  상태: '유효' | '만료' | '등록부에 없음' | '모호';
  /** 이미 지난 만료일 중 가장 최근. 만료된 줄이 없으면 null. */
  만료일: string | null;
  /** 앞으로 다가오는 기한 중 가장 이른 것. 기한 표기가 없으면 null. */
  유효기한?: string | null;
  등록줄: number;
  만료된줄?: number;
  등록명?: string | string[] | null;
};

export const peruRegistry = registry.공장 as Record<string, PeruRegistryStatus>;
export const peruRegistryMeta = registry._meta;
