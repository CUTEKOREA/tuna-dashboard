import raw from '@/public/data/bangkok/vn_surimi_suppliers.json';

/**
 * 베트남 연육·오징어 공급사 인테이크.
 *
 * 원자료는 사내 보고서 「베트남 현지법인과의 협업의 건」(2026-09-12) 별첨 A와
 * 「대왕오징어 조달 보고서」(2026-09-12)에서 나온 식약처 수입신고 원장 집계다.
 * 동남아 가공사 조사 화면이 이 JSON 을 보는 유일한 통로다 — 위젯이 원본 JSON 을
 * 직접 import 하지 않는다.
 *
 * 셀 구조는 `seasia-processors` 와 같은 `{ v, tags? }` 를 쓴다. 같은 화면에 나란히
 * 놓이는 표라 구조를 갈라놓으면 렌더러를 두 벌 유지해야 한다.
 */
export type SupplierCell = { v: string; tags?: string[] };
export type SupplierRow = Record<string, SupplierCell>;

export const vnSuppliers = raw as unknown as {
  meta: {
    source: string;
    ledger: string;
    surimiPeriod: string;
    squidPeriod: string;
    note: string;
    overlap: string;
    squidFacilities: number;
    squidDeclarations: number;
    surimiFirms: number;
  };
  surimi: SupplierRow[];
  squidTop: SupplierRow[];
};

export const vnSurimiRows = vnSuppliers.surimi;
export const vnSquidTopRows = vnSuppliers.squidTop;
export const vnSupplierMeta = vnSuppliers.meta;

/** 연육 신고 건수 합계 — 화면 상단 숫자와 캡션이 같은 값을 쓰게 한다. */
export function vnSurimiDeclarations(): number {
  return vnSurimiRows.reduce((sum, r) => {
    const m = (r['한국향 연육 신고']?.v ?? '').replace(/,/g, '').match(/\d+/);
    return sum + (m ? Number(m[0]) : 0);
  }, 0);
}

/** 식약처 등록이 만료·갱신필요로 표시된 공급사. 선적이 멈추는 자리라 따로 센다. */
export function vnRegistrationRisk(): SupplierRow[] {
  return vnSurimiRows.filter((r) => (r['식약처 등록']?.tags ?? []).some((t) => t !== '유효'));
}
