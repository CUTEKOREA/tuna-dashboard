import raw from '@/public/data/bangkok/seasia_ledger.json';

import type { Row } from './seasia-processors';

/**
 * 태국·베트남 가공 제조소의 대한 선적 실적 인테이크.
 *
 * 원자료는 아홉 어종 조달 조사(2026-07~09, 오징어·고등어·명태·명란·새우·문어낙지·골뱅이·게·대구)의
 * 식약처 수입신고 원장을 **가공·선적국**으로 다시 묶은 것이다.
 *
 * 기존 「한국 거래처 전수표」(사내 조사보고서)와 건수가 다르다 — 그 표는 품목군을 여섯 칸으로만
 * 가르고 해파리까지 담고, 이 표는 아홉 어종만 담는 대신 **어종군 아홉 칸**과 **원료 원산지**를 적는다.
 * 두 표를 더하거나 덮지 않는다. 화면에서도 별도 절로 붙는다.
 *
 * 위젯은 이 모듈만 본다 — 원본 JSON 을 직접 import 하지 않는다(아키텍처 가드).
 */

type LedgerRow = Record<string, string | number>;

type LedgerCountry = {
  n: number;
  facilities: number;
  inRegistry: number;
  onlyLedger: number;
  registryCount: number;
  species: [string, number][];
  origins: [string, number][];
  thirdCountry: number;
  thirdFacilities: number;
  period: [string, string];
  top: LedgerRow[];
  third: LedgerRow[];
};

export const seasiaLedger = raw as unknown as {
  meta: {
    source: string;
    ledger: string;
    species: string;
    basis: string;
    diff: string;
    merge: string;
  };
  countries: Record<string, LedgerCountry>;
};

export const seasiaLedgerMeta = seasiaLedger.meta;

/** 원장 자료가 있는 나라. 없는 나라를 고르면 화면이 이 절을 아예 그리지 않는다. */
export function hasLedger(country: string): boolean {
  return Boolean(seasiaLedger.countries[country]);
}

export function ledgerFor(country: string): LedgerCountry | undefined {
  return seasiaLedger.countries[country];
}

/**
 * 표 셀 구조를 `seasia-processors` 의 `{ v, tags? }` 로 맞춘다. 같은 화면에 나란히 놓이는
 * 표라 렌더러를 두 벌 유지하지 않는다. 「조사보고서 대조」 칸만 태그로 올려 눈에 걸리게 한다.
 */
function toRows(src: LedgerRow[]): Row[] {
  return src.map((r) => {
    const out: Row = {};
    for (const [k, v] of Object.entries(r)) {
      const s = typeof v === 'number' ? v.toLocaleString('ko-KR') : String(v);
      out[k] = k === '조사보고서 대조' && s !== '전수표 수록'
        ? { v: '', tags: s.split(' · ') }
        : { v: s };
    }
    return out;
  });
}

/** 원장 신고가 많은 제조소 상위 20곳. */
export function ledgerTopRows(country: string): Row[] {
  return toRows(ledgerFor(country)?.top ?? []);
}

/** 원료 원산지가 가공국과 다른 건이 있는 제조소. 제3국 임가공을 하는 곳이다. */
export function ledgerThirdRows(country: string): Row[] {
  return toRows(ledgerFor(country)?.third ?? []);
}

/** 어종군 구성을 「문어·낙지 1,252 · 새우 655」 꼴 한 줄로. 캡션과 표가 같은 값을 쓰게 한다. */
export function speciesLine(country: string, n = 4): string {
  const c = ledgerFor(country);
  if (!c) return '';
  return c.species.slice(0, n).map(([k, v]) => `${k} ${v.toLocaleString('ko-KR')}`).join(' · ');
}

/** 원료 원산지 구성 한 줄. 가공국 자체가 1위인 것이 정상이고, 그 다음이 임가공 원료다. */
export function originLine(country: string, n = 4): string {
  const c = ledgerFor(country);
  if (!c) return '';
  return c.origins.slice(0, n).map(([k, v]) => `${k} ${v.toLocaleString('ko-KR')}`).join(' · ');
}
