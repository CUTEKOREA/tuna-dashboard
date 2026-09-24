import week19 from '../../data/reefer_week19.json';
import week22 from '../../data/reefer_week22.json';
import week24 from '../../data/reefer_week24.json';
import week26 from '../../data/reefer_week26.json';
import week27 from '../../data/reefer_week27.json';
import week29 from '../../data/reefer_week29.json';
import week30 from '../../data/reefer_week30.json';
import week31 from '../../data/reefer_week31.json';
import week32 from '../../data/reefer_week32.json';
import week33 from '../../data/reefer_week33.json';
import week34 from '../../data/reefer_week34.json';
import week35 from '../../data/reefer_week35.json';
import week36 from '../../data/reefer_week36.json';
import week37 from '../../data/reefer_week37.json';
import week38 from '../../data/reefer_week38.json';

/**
 * TTA 운반선 주간동향을 월별 방콕 반입량으로 접는다.
 *
 * 주간표는 그 주에 «보고된» 선박을 싣기 때문에 같은 배가 여러 주차에 반복해서 나온다.
 * 선박명+일자로 한 번만 세고, 배분처가 아닌 OTHER·SHIP 열은 빼서 캔 공장 반입만 더한다.
 *
 * **보유 주차가 연속이 아니다.** 19·22·24·26·27·29~37 주차만 갖고 있어 월 합계는
 * 실제 반입의 하한이다 - 화면이 그 사실을 같이 말하도록 `weeksHeld` 를 내보낸다.
 */
type ReeferRow = { carrier: string; date: string; deliveries: Record<string, string | undefined> };

const WEEKLY: ReadonlyArray<{ week: number; rows: ReeferRow[] }> = [
  { week: 19, rows: week19 as unknown as ReeferRow[] },
  { week: 22, rows: week22 as unknown as ReeferRow[] },
  { week: 24, rows: week24 as unknown as ReeferRow[] },
  { week: 26, rows: week26 as unknown as ReeferRow[] },
  { week: 27, rows: week27 as unknown as ReeferRow[] },
  { week: 29, rows: week29 as unknown as ReeferRow[] },
  { week: 30, rows: week30 as unknown as ReeferRow[] },
  { week: 31, rows: week31 as unknown as ReeferRow[] },
  { week: 32, rows: week32 as unknown as ReeferRow[] },
  { week: 33, rows: week33 as unknown as ReeferRow[] },
  { week: 34, rows: week34 as unknown as ReeferRow[] },
  { week: 35, rows: week35 as unknown as ReeferRow[] },
  { week: 36, rows: week36 as unknown as ReeferRow[] },
  { week: 37, rows: week37 as unknown as ReeferRow[] },
  { week: 38, rows: week38 as unknown as ReeferRow[] },
];

export interface ReeferMonthlyIntake {
  /** 'YYYY-MM' */
  month: string;
  mt: number;
  vessels: number;
}

/** 배분처 합계 (MT). OTHER 는 부두, SHIP 은 선박 간 전재라 캔 공장 반입이 아니다. */
function deliveredMt(row: ReeferRow): number {
  return Object.entries(row.deliveries).reduce((sum, [destination, amount]) => {
    if (destination === 'OTHER' || destination === 'SHIP') return sum;
    const parsed = Number.parseFloat(String(amount).replaceAll(',', ''));
    return Number.isFinite(parsed) ? sum + parsed : sum;
  }, 0);
}

/** 원문 표기는 «dd.mm.yy» 다. 그 밖의 표기는 월을 지어내지 않고 버린다. */
function monthOf(date: string): string | null {
  const match = String(date).trim().match(/^(\d{2})\.(\d{2})\.(\d{2})$/);
  return match === null ? null : `20${match[3]}-${match[2]}`;
}

function buildMonthly(): ReeferMonthlyIntake[] {
  const seen = new Map<string, { month: string; mt: number }>();
  for (const { rows } of WEEKLY) {
    for (const row of rows) {
      const month = monthOf(row.date);
      if (month === null) continue;
      // 같은 선박·같은 일자는 여러 주차에 반복 보고된다 - 한 번만 센다
      seen.set(`${row.carrier}|${row.date}`, { month, mt: deliveredMt(row) });
    }
  }
  const byMonth = new Map<string, ReeferMonthlyIntake>();
  for (const { month, mt } of seen.values()) {
    const bucket = byMonth.get(month) ?? { month, mt: 0, vessels: 0 };
    bucket.mt = Math.round((bucket.mt + mt) * 1_000) / 1_000;
    bucket.vessels += 1;
    byMonth.set(month, bucket);
  }
  return [...byMonth.values()].sort((left, right) => left.month.localeCompare(right.month));
}

export const reeferMonthlyIntake = {
  weeksHeld: WEEKLY.map(({ week }) => week),
  months: buildMonthly(),
  /**
   * 같은 기간을 보는 제3자 추정 - 2026-09-16 방콕 출장보고에 기록된 스페인 선사 자체 추산이다.
   * 우리 집계는 TTA 가 추적하는 운반선만 담고 보유 주차도 띄엄띄엄이라 낮게 나온다.
   * 값을 맞추지 말고 나란히 둔다 - 볼 것은 방향이 같은지다.
   */
  thirdPartyEstimate: {
    source: '방콕 출장보고 (종합).docx',
    sha256: '4dbb23a0798432fd9a140a09c951d22fe96d010bb98e7c02a0775a9b90c9b7e2',
    reportDate: '2026-09-16',
    note: '스페인 선사 자체 추산 (방콕 반입 전체)',
    months: [
      { month: '2026-07', mt: 15_000, qualifier: null },
      { month: '2026-08', mt: 30_000, qualifier: null },
      { month: '2026-09', mt: 20_000, qualifier: '미만' },
    ],
  },
} as const;

/** 최근 N개월만 - 다 담으면 결측 주차가 많은 초기 달이 추세처럼 보인다. */
export function recentReeferMonths(count = 6): ReeferMonthlyIntake[] {
  return reeferMonthlyIntake.months.slice(-count);
}
