import raw from '@/public/data/falkland_squid_vessels_v1.json';

/**
 * 포클랜드 수역 오징어 조업선 실적 인테이크 (신라교역 사내 자료).
 *
 * **공개 통계로는 이 층위가 나오지 않는다.** 해양수산부 원양어업통계조사는 업종·어종·
 * 보유 척수 구간까지만 공표하고, 어선별 생산실적은 승인 계정 뒤에 있다. 그래서 이
 * 자료가 선박·회사 단위를 볼 수 있는 유일한 통로다.
 *
 * ⚠ **중량이 두 가지다.**
 *   · `totalPan × 20` — 명목 환산중량. 회사 집계가 이 방식으로 계산돼 있다.
 *   · `totalKg`       — 실중량. 30척 중 17척이 환산값과 다르고 최대 -1.7% 벌어진다.
 *   섞으면 회사 합과 선박 합이 어긋난다. 화면에서도 어느 쪽인지 밝힌다.
 *
 * ⚠ **측정 경계.** 포클랜드 수역 한 어기(12~5월)의 실적이다. 원양어업통계조사의
 *   오징어채낚기 연간 생산량(전 해역)과 범위가 달라 직접 견줄 수 없다.
 */

export type Vessel = {
  rank: number;
  name: string;
  company: string;
  totalKg: number;
  totalPan: number;
  m12: number;
  m1: number;
  m2: number;
  m3: number;
  m4: number;
  m5: number;
  tonnage: string;
  launch: string;
  age: string;
  status: string;
};

export type Company = { name: string; totalKg: number; vessels: number };

const data = raw as unknown as {
  _meta: {
    출처: string;
    성격: string;
    단위: string;
    기간: string;
    척수: number;
    회사수: number;
    측정경계: string;
    실중량과환산차: number;
    갱신방법: string;
  };
  vessels: Vessel[];
  companies: Company[];
};

export const falklandMeta = data._meta;
export const falklandVessels = data.vessels;

/** 월 순서. 어기가 12월에 시작해 이듬해 5월에 끝나므로 달력 순이 아니다. */
export const SEASON_MONTHS = ['m12', 'm1', 'm2', 'm3', 'm4', 'm5'] as const;
export const SEASON_LABELS = ['12월', '1월', '2월', '3월', '4월', '5월'] as const;
export type SeasonMonth = (typeof SEASON_MONTHS)[number];
export type FalklandMonth = 'all' | SeasonMonth;

export function labelForMonth(month: FalklandMonth): string {
  if (month === 'all') return '어기 전체';
  const index = SEASON_MONTHS.indexOf(month);
  return SEASON_LABELS[index] ?? month;
}

export function monthFromLabel(label: string): FalklandMonth | undefined {
  if (label === '어기 전체') return 'all';
  const index = SEASON_LABELS.indexOf(label as (typeof SEASON_LABELS)[number]);
  return index >= 0 ? SEASON_MONTHS[index] : undefined;
}

/** 그 달(또는 어기 전체) 판수. 월별 kg 는 원본에 없다. */
export function panFor(vessel: Vessel, month: FalklandMonth): number {
  return month === 'all' ? vessel.totalPan : vessel[month];
}

/** 선박별 누계(판) 내림차순. 원본 rank 를 믿지 않고 값으로 다시 세운다. */
export function vesselsByPan(): Vessel[] {
  return vesselsByMonth('all');
}

/** 고른 달의 판수 내림차순. 어기 전체면 누계와 같다. */
export function vesselsByMonth(month: FalklandMonth): Vessel[] {
  return [...data.vessels].sort((a, b) => {
    const delta = panFor(b, month) - panFor(a, month);
    return delta !== 0 ? delta : a.name.localeCompare(b.name, 'ko');
  });
}

/**
 * 회사별 집계를 선박에서 다시 계산한다.
 *
 * 원본 `companies` 에는 현원수산이 없다. 처음엔 누락으로 봤는데 아니었다 — 이 회사의
 * 유일한 배(108은해)가 **한 어기 동안 0판**이라 집계에서 빠진 것이다.
 *
 * 그래도 선박에서 다시 센다. 선령 39년에 「교체시급」인 배가 한 어기를 통째로 쉬었다는
 * 것은 그 자체로 선단의 상태를 말한다. 회사 수를 셀 때 조용히 사라지면 안 된다.
 */
export function companiesFromVessels(): (Company & { totalPan: number })[] {
  return companiesByMonth('all');
}

/**
 * 회사별 그 달 판수. 척수는 어기 선단(그 달에 0판이어도 배는 있다).
 * 월별 kg 는 원본에 없으므로 달을 고르면 totalKg 는 0이다 — 환산하지 않는다.
 */
export function companiesByMonth(month: FalklandMonth): (Company & { totalPan: number })[] {
  const acc = new Map<string, { totalKg: number; totalPan: number; vessels: number }>();
  for (const v of data.vessels) {
    const c = acc.get(v.company) ?? { totalKg: 0, totalPan: 0, vessels: 0 };
    if (month === 'all') c.totalKg += v.totalKg;
    c.totalPan += panFor(v, month);
    c.vessels += 1;
    acc.set(v.company, c);
  }
  return [...acc.entries()]
    .map(([name, c]) => ({ name, ...c }))
    .sort((a, b) => b.totalPan - a.totalPan || a.name.localeCompare(b.name, 'ko'));
}

/** 어기 월별 선단 합계(판). 12월에서 시작한다. */
export function seasonTotals(): { 월: string; 물량: number }[] {
  return SEASON_MONTHS.map((m, i) => ({
    월: SEASON_LABELS[i],
    물량: data.vessels.reduce((n, v) => n + v[m], 0),
  }));
}

/** 한 어기 동안 실적이 없던 배. 선단에 있으나 조업하지 않은 것과 없는 것은 다르다. */
export function idleVessels(): Vessel[] {
  return data.vessels.filter((v) => v.totalPan === 0);
}

/** 선단 합계. 두 중량을 함께 낸다 — 어느 쪽인지 밝히지 않으면 숫자가 안 맞는다. */
export function fleetTotals() {
  const pan = data.vessels.reduce((n, v) => n + v.totalPan, 0);
  const kg = data.vessels.reduce((n, v) => n + v.totalKg, 0);
  return { 척수: data.vessels.length, 판: pan, 환산톤: (pan * 20) / 1000, 실측톤: kg / 1000 };
}
