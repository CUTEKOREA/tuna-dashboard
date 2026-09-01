import { fleetDailyPublicSeries } from '@/lib/data/fleet-daily-public';

/** 이 일수 이상 어획이 끊기면 가동 중단으로 본다. 조업 공백과 정박·수리를 가르는 선. */
export const FLEET_IDLE_THRESHOLD_DAYS = 7;

export interface FleetIdleVessel {
  vessel: string;
  region: '태평양' | '대서양';
  /** 마지막으로 어획이 잡힌 보고일 */
  lastCatchDate: string;
  /** 그 이후 어획이 없는 보고일 수 */
  idleDays: number;
  /** 보고 전 기간 일평균 어획량 (MT) */
  dailyAverageMt: number;
  /** 일평균 x 무실적 일수 (MT) */
  forgoneMt: number;
  /** 전 기간 누계 어획량 (MT) */
  totalMt: number;
  /** 같은 해역 누계에서 차지하는 비중 (%) */
  regionSharePct: number;
}

export interface FleetIdleNote {
  asOf: string;
  /** 한 줄 요약. 카드에서 가장 먼저 읽힌다. */
  headline: string;
  /** 라벨 + 설명 한 줄씩. 긴 문단 대신 항목으로 끊어 읽게 한다. */
  lines: { label: string; text: string }[];
}

/**
 * 사고·수리처럼 원문 비고에서만 읽히는 사정은 선박별로 여기에 둔다.
 * 해당 선박이 조업을 재개하면 가동 중단 목록에서 빠지면서 이 주석도 함께 사라진다.
 */
export const FLEET_IDLE_NOTES: Record<string, FleetIdleNote> = {
  MOAMARI: {
    asOf: '2026-09-01',
    headline: '프로펠러 로프가드 수리차 젠산 예인 중 · 복귀 10월 말~11월 중순 · 총 이탈 61~93일 · 조업손실 약 900~1,370 MT',
    lines: [
      { label: '경위', text: '8/17 크리스마스섬 입항 후 SEIN KASAMA편으로 약 760톤을 전재했고, 이 전재 작업이 체류 14일의 대부분을 차지했다. 8/31 SEIN SAPPHIRE 예인으로 젠산 출발.' },
      { label: '예인', text: '크리스마스섬~젠산 4,644해리. 원양 예인 5~6노트 기준 32~39일 걸려 10월 초·중순 도착 예상.' },
      { label: '수리 (짧은 쪽)', text: '로프가드만 손상이면 3~7일. 크리스마스섬은 항만 없는 개방 정박지라 너울에 노출돼 현장 잠수 작업이 어렵고, 그래서 손상이 가벼워도 젠산까지 끌고 갈 수 있다.' },
      { label: '수리 (긴 쪽)', text: '추진계까지 번졌다면 젠산 입거 2~4주.' },
      { label: '복귀', text: '어장까지 1,945해리, 11노트 기준 7일.' },
      { label: '조업손실', text: '이탈 61~93일을 보고 주기(146보고일 / 229달력일)로 환산하면 39~59보고일이고, 일평균 23.05 MT를 곱해 약 900~1,370 MT다. 8/14 이후 이미 발생한 277 MT를 포함한 값이며 MOAMARI 연간 실적 3,365 MT의 27~41%에 해당한다.' },
      { label: '가정', text: '예인 속도와 수리 기간은 공개 자료 기반 추정이다. 젠산 조선소 견적이 나오면 구간이 좁혀진다.' },
    ],
  },
};

function averageOf(values: (number | null)[]) {
  const reported = values.filter((value): value is number => value !== null);
  if (reported.length === 0) return 0;
  return reported.reduce((sum, value) => sum + value, 0) / reported.length;
}

/** 마지막 어획일 이후 보고일 수가 임계치를 넘은 선박만, 공백이 긴 순으로 돌려준다. */
export function resolveFleetIdleVessels(
  thresholdDays: number = FLEET_IDLE_THRESHOLD_DAYS,
): FleetIdleVessel[] {
  const series = fleetDailyPublicSeries;
  const idle: FleetIdleVessel[] = [];

  for (const [key, region] of [['pacific', '태평양'], ['atlantic', '대서양']] as const) {
    const vessels = series[key].vessels;
    const regionTotal = Object.values(vessels)
      .reduce((sum, values) => sum + values.reduce<number>((inner, value) => inner + (value ?? 0), 0), 0);

    for (const [vessel, values] of Object.entries(vessels)) {
      let lastCatchIndex = -1;
      for (let index = values.length - 1; index >= 0; index -= 1) {
        if ((values[index] ?? 0) > 0) { lastCatchIndex = index; break; }
      }
      if (lastCatchIndex < 0) continue;

      const idleDays = values.length - 1 - lastCatchIndex;
      if (idleDays < thresholdDays) continue;

      const dailyAverageMt = averageOf(values);
      const totalMt = values.reduce<number>((sum, value) => sum + (value ?? 0), 0);
      idle.push({
        vessel,
        region,
        lastCatchDate: series.dates[lastCatchIndex],
        idleDays,
        dailyAverageMt: Number(dailyAverageMt.toFixed(2)),
        forgoneMt: Math.round(dailyAverageMt * idleDays),
        totalMt,
        regionSharePct: regionTotal > 0 ? Number((totalMt / regionTotal * 100).toFixed(1)) : 0,
      });
    }
  }

  return idle.sort((left, right) => right.idleDays - left.idleDays);
}
