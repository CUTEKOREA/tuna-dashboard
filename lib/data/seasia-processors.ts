import raw from '@/public/data/bangkok/seasia_processors.json';

/**
 * 동남아 수산물 가공사 조사 인테이크.
 *
 * 원자료는 사내 조사보고서 HTML 2종(태국·베트남)을 기계 추출한 것이다
 * (`scripts/extract_seasia_processors.py`). 위젯이 JSON 을 보는 유일한 통로다.
 *
 * 셀은 `{ v, tags?, grade?, sub? }` 구조다 — 원본 보고서가 칸마다 붙인 신뢰도
 * 태그(확인·추정·불가)와 등급 배지를 값과 분리해 실었다. 재발명하지 않고 그대로 쓴다.
 */

export type Cell = {
  v: string;
  tags?: string[];
  grade?: string | string[];
  sub?: string[];
};

export type Row = Record<string, Cell>;

export type CountryReport = {
  title: string;
  sourceFile: string;
  sha256: string;
  topPicks: Row[];
  profiles: Row[];
  shortlist: Row[];
  registry: Row[];
};

export const seasia = raw as unknown as {
  meta: {
    source: string;
    note: string;
    countries: string[];
    registryTotal: number;
    taggedCells: number;
  };
  countries: Record<string, CountryReport>;
};

export const seasiaCountries = seasia.meta.countries;

export function reportFor(country: string): CountryReport | undefined {
  return seasia.countries[country];
}

/** 표의 열 이름은 나라마다 조금씩 다르다(회사/등기 vs 회사/세번·DL). 첫 행에서 뽑는다. */
export function headsOf(rows: Row[]): string[] {
  const first = rows[0];
  return first ? Object.keys(first).filter((k) => !k.startsWith('_extra')) : [];
}

/** 셀 텍스트만. 값이 비면 '자료 없음'이 아니라 대시로 둔다 — 표에서 빈칸은 읽히지 않는다. */
export function text(c: Cell | undefined): string {
  const v = c?.v?.trim();
  return v ? v : '–';
}

/**
 * 전수표에서 선적 건수를 숫자로 뽑는다. 이 값이 이 화면에서 유일한 실측 물량 신호다
 * — 나머지 칸은 조사자가 정리한 서술이다.
 */
export function shipments(r: Row): number | null {
  const raw = r['선적']?.v ?? '';
  const m = raw.replace(/,/g, '').match(/\d+/);
  return m ? Number(m[0]) : null;
}

export function companyName(r: Row): string {
  return text(r['제조업소(통관표기)'] ?? r['회사'] ?? r['회사/등기'] ?? r['회사/세번·DL']);
}

/** 국가별 전수표를 선적 건수 내림차순으로. 건수가 없는 행은 뒤로 민다. */
export function registrySorted(country: string): Row[] {
  const rows = reportFor(country)?.registry ?? [];
  return [...rows].sort((a, b) => (shipments(b) ?? -1) - (shipments(a) ?? -1));
}

/** 국가 요약 — 화면 상단 stat strip 용. */
export function summaryFor(country: string) {
  const rep = reportFor(country);
  if (!rep) return null;
  const ship = rep.registry.map(shipments).filter((n): n is number => n !== null);
  return {
    country,
    profiles: rep.profiles.length,
    shortlist: rep.shortlist.length,
    registry: rep.registry.length,
    totalShipments: ship.reduce((s, n) => s + n, 0),
    topShipments: ship.length ? Math.max(...ship) : null,
    sourceFile: rep.sourceFile,
    sha256: rep.sha256,
  };
}

/** 신뢰도 태그 분포. 어느 칸이 확인이고 어느 칸이 추정인지 화면에 밝히기 위한 집계. */
export function tagCounts(country: string): Record<string, number> {
  const rep = reportFor(country);
  const out: Record<string, number> = {};
  if (!rep) return out;
  for (const group of [rep.profiles, rep.topPicks, rep.shortlist, rep.registry]) {
    for (const row of group) {
      for (const c of Object.values(row)) {
        for (const t of c.tags ?? []) out[t] = (out[t] ?? 0) + 1;
      }
    }
  }
  return out;
}
