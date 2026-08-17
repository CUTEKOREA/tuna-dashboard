import raw from '@/public/data/deepsea_fishery_v1.json';

/**
 * 원양어업통계조사 인테이크 (해양수산부, 통계법 승인 제114048호).
 *
 * 원양어업 허가를 받은 **모든 어선과 보유 업체를 전수조사**하는 법정 통계다.
 * `scripts/fetch_deepsea_fishery_kosis.py` 가 KOSIS 18개 표를 받아 오징어 슬라이스와
 * 합계만 남긴다. 위젯이 이 JSON 을 보는 유일한 통로다.
 *
 * ⚠ **측정 경계.** 원양어업만 담는다 — 연근해와 더할 수 없고 FAO 생산 통계와도 집계
 *   기준이 다르다. 오징어 페이지의 다른 단계는 FAO 기준이므로 나란히 놓되 더하지 않는다.
 *
 * ⚠ **단위 한계.** KOSIS 공표분은 업종·어종·규모 구간까지다. **회사명·선박명은 없다.**
 *   OFIS 조사개요는 「(어선별) 생산실적」도 공표범위라 밝히지만 승인 계정이 필요하고
 *   공개 링크는 404 였다(2026-08-17 실측). 없는 것이 아니라 닫혀 있는 것이다.
 */

export type Row = {
  연도: string;
  분류1: string | null;
  분류2: string | null;
  항목: string;
  값: number;
  단위: string | null;
};

const data = raw as unknown as {
  _meta: {
    출처: string;
    표: string;
    기간: string;
    조사방식: string;
    공표주기: string;
    측정경계: string;
    단위한계: string;
    갱신방법: string;
  };
  tables: Record<string, Row[]>;
};

export const deepseaMeta = data._meta;

/** 업종 이름은 KOSIS 원표기 그대로다. 바꾸면 슬라이스가 조용히 빈다. */
export const SQUID_GEAR = '오징어채낚기';

export function table(name: string): Row[] {
  return data.tables[name] ?? [];
}

export type YearPoint = { 연도: string; 생산량: number; 생산금액: number };

/**
 * 오징어채낚기 업종의 연도별 생산. 「합계」 행만 쓴다 — 어종별 행을 더하면
 * 합계와 어긋난다(미분류가 있다).
 */
export function squidGearSeries(): YearPoint[] {
  const rows = table('업종별생산').filter(
    (r) => r.분류2 === SQUID_GEAR && r.분류1 === '합계',
  );
  const byYear = new Map<string, YearPoint>();
  for (const r of rows) {
    const p = byYear.get(r.연도) ?? { 연도: r.연도, 생산량: 0, 생산금액: 0 };
    if (r.항목 === '생산량') p.생산량 = r.값;
    if (r.항목 === '생산금액') p.생산금액 = r.값;
    byYear.set(r.연도, p);
  }
  return [...byYear.values()].sort((a, b) => a.연도.localeCompare(b.연도));
}

/** 톤당 단가(천원/톤). 생산금액은 백만원, 생산량은 톤이라 1,000 을 곱한다. */
export function squidUnitPrice(): { 연도: string; 단가: number }[] {
  return squidGearSeries()
    .filter((p) => p.생산량 > 0)
    .map((p) => ({ 연도: p.연도, 단가: (p.생산금액 * 1000) / p.생산량 }));
}

export type AreaPoint = { 해역: string; 생산량: number };

/** 오징어류 해역별 생산량. 「전체」는 빼고 실제 해역만 남긴다. */
export function squidByArea(year: string): AreaPoint[] {
  return table('해역별생산')
    .filter(
      (r) =>
        r.분류1 === '오징어류' &&
        r.항목 === '생산량' &&
        r.연도 === year &&
        r.분류2 !== null &&
        r.분류2 !== '전체' &&
        r.값 > 0,
    )
    .map((r) => ({ 해역: r.분류2 as string, 생산량: r.값 }))
    .sort((a, b) => b.생산량 - a.생산량);
}

/** 오징어류 전 업종 합계. 채낚기 업종 합계와 다르다 — 다른 업종도 오징어를 잡는다. */
export function squidAllGearTotal(year: string): number | null {
  const r = table('해역별생산').find(
    (x) => x.분류1 === '오징어류' && x.항목 === '생산량' && x.연도 === year && x.분류2 === '전체',
  );
  return r ? r.값 : null;
}

/**
 * SPRFMO 연례보고와의 교차검증.
 *
 * 두 기관이 각각 집계한 값이 맞아떨어지는지 보는 것이라 상수를 여기 둔다.
 * 출처: SPRFMO SC13-Doc24 Table 4 (국립수산과학원 → SPRFMO 과학위원회, 2025).
 */
export const SPRFMO_2024 = {
  척수: 1,
  조업일: 53,
  어획량: 128,
  출처: 'SPRFMO SC13-Doc24 Table 4 (국립수산과학원, 2025)',
} as const;

/** KOSIS 태평양 동남부(= SPRFMO 수역) 오징어류 생산량. */
export function southeastPacific(year: string): number | null {
  const r = table('해역별생산').find(
    (x) =>
      x.분류1 === '오징어류' && x.항목 === '생산량' && x.연도 === year && x.분류2 === '동남부',
  );
  return r ? r.값 : null;
}

export type SizeBand = { 구간: string; 생산량: number };

/**
 * 보유 척수 구간별 오징어류 생산.
 *
 * 회사명은 없지만 **회사를 보유 척수로 묶은** 축이라, 회사별 명부(회사당 척수)와
 * 맞대면 어느 구간에 어느 회사가 들어가는지는 안다. 구간 안에서 회사별로 쪼개지는
 * 않는다 — 그건 추정이지 실적이 아니다.
 */
export function squidBySizeBand(year: string): SizeBand[] {
  const bands = ['1척', '2~5척', '6~9척', '10척 이상'];
  return table('규모별생산')
    .filter(
      (r) =>
        r.분류1 === '오징어류' &&
        r.항목 === '생산량' &&
        r.연도 === year &&
        r.분류2 !== null &&
        bands.includes(r.분류2),
    )
    .map((r) => ({ 구간: r.분류2 as string, 생산량: r.값 }))
    .sort((a, b) => bands.indexOf(a.구간) - bands.indexOf(b.구간));
}

/** 데이터가 담고 있는 연도. 최신이 마지막이다. */
export function years(): string[] {
  return [...new Set(table('업종별생산').map((r) => r.연도))].sort();
}

export function latestYear(): string {
  const y = years();
  return y[y.length - 1] ?? '';
}
