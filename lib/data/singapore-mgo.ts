import rawSingaporeMgo from '../../public/data/singapore_mgo.json';

/**
 * 싱가포르 MGO 벙커 시세 인테이크 — `scripts/sync_singapore_mgo.py` 산출물(Ship & Bunker 공개 API).
 * 위젯이 이 JSON 을 보는 유일한 통로다 (ADR 0005). 주간 값은 화요일 종가라 방콕 주간보고(수요일)와
 * 하루 어긋난다 — `singaporeMgoAt` 이 보고일 기준 직전 값을 찾는다. 보간하지 않는다.
 */
export type SingaporeMgoMeta = {
  readonly source: string;
  readonly grade: string;
  readonly unit: string;
  readonly first: string;
  readonly last: string;
  readonly dailyRows: number;
  readonly weeklyRows: number;
};

type Raw = { meta: SingaporeMgoMeta; daily: [string, number][]; weekly: [string, number, string][] };
const raw = rawSingaporeMgo as unknown as Raw;

export const singaporeMgoMeta: SingaporeMgoMeta = raw.meta;
/** 일별 종가 (USD/MT), 오름차순. */
export const singaporeMgoDaily: readonly (readonly [string, number])[] = raw.daily;

const dailyMap = new Map<string, number>(raw.daily);
const MS_DAY = 86_400_000;

/** `date` 또는 그 이전 `maxBackDays` 안의 마지막 영업일 종가. 없으면 null (결측 유지). */
export function singaporeMgoAt(date: string, maxBackDays = 6): number | null {
  const t = Date.parse(`${date}T00:00:00Z`);
  if (Number.isNaN(t)) return null;
  for (let back = 0; back <= maxBackDays; back += 1) {
    const key = new Date(t - back * MS_DAY).toISOString().slice(0, 10);
    const v = dailyMap.get(key);
    if (v !== undefined) return v;
  }
  return null;
}
