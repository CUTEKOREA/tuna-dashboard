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
    asOf: '2026-09-03',
    headline: '프로펠러 볼트 3개 파손(선장 보고서 8/18 확정) 수리차 젠산 예인 중 · 계약 항해 24~26일 · 9/3 보고에서 도착이 9/28로 하루 당겨져 29일 예상 · 예인료 계약 일 $41,000, 29일 가정 시 약 119만불(16.5억원)으로 계약 대비 3~5일·$12.3~20.5만 초과 예상 · 복귀 10월 중순~11월 초 예상 · 조업손실 약 820~1,190 MT 예상',
    lines: [
      { label: '사고 경위 (선장 보고서 8/18)', text: '8/17 LMT 17:30경 키리바시 크리스마스 입항 후 운반선 SEIN KASAMA와 접안 작업 중, 기상이 나빠 운반선 선수 로프가 크게 흔들리다 본선 선미 프로펠러 쪽으로 유입됐다. 당시 본선이 ASTERN으로 엔진을 쓰고 있어 로프가 프로펠러에 감겼고, 추가 손상을 막기 위해 운반선 선수 로프를 즉시 절단했다.' },
      { label: '손상 (확정 / 미확인)', text: '8/18 본선 갑판장이 잠수 장비로 감긴 로프를 제거하는 과정에서 프로펠러 볼트 3개 파손을 확인했다 — 여기까지가 확정이다. 프로펠러·관련 장비의 추가 손상 여부는 잠수부 점검이 필요하다고 보고돼 아직 미확인이다.' },
      { label: '체류·출발', text: '8/17 입항 후 SEIN KASAMA편으로 약 760톤을 전재했고, 이 전재 작업이 체류 14일의 대부분을 차지했다. 8/31 SEIN SAPPHIRE 예인으로 젠산 출발.' },
      { label: '예인 계약', text: '크리스마스섬 출발 → 제너럴 산토스 도착, 예인료 일 $41,000, 계약 항해일수 24~26일. 4,644해리를 24~26일에 끌려면 평균 7.4~8.1노트가 필요하다.' },
      { label: '예인 진행 (예상)', text: '8/31 출발은 확정. 도착 예정은 9/2 보고의 9/29에서 9/3 보고에서 9/28로 하루 당겨졌다 — 항해 29일, 평균 6.7노트 환산이다. 여전히 예상치이며 계약 상한(26일)보다 3일·하한(24일)보다 5일 늦다. 속도가 더 붙으면 계속 좁혀진다.' },
      { label: '예인료 (계약 확정 / 총액 예상)', text: '일 $41,000은 계약 확정. 총액은 항해일수에 달려 있어 예상치다 — 계약 24~26일이면 $98.4만~106.6만, 9/28 도착 기준 29일이면 약 $119만이다. 자금팀 추산 「약 123만불(일 5,700만원·30일 약 17억원)」은 9/29 도착 기준이라, 하루 당겨진 만큼 약 $4.1만(0.6억원) 낮아진다(내포 환율 1,390원/$, 당시 시장 1,363원/$). 계약 초과 3~5일분 $12.3만~20.5만(약 1.7~2.9억원)의 부담 주체가 용선 계약서상 누구인지 확인이 먼저다.' },
      { label: '수리 (짧은 쪽, 예상)', text: '볼트 3개 교체로 끝나면 3~7일. 다만 크리스마스섬은 항만 없는 개방 정박지라 너울에 노출돼 현장 잠수 점검·수리가 어려웠고, 그래서 손상 범위를 확정하지 못한 채 젠산까지 끌고 가는 판단이 나왔다.' },
      { label: '수리 (긴 쪽, 예상)', text: '잠수부 점검에서 프로펠러 날개·축계까지 번진 것으로 나오면 젠산 입거 2~4주. 볼트 3개가 파손될 만큼의 하중이 걸렸다는 점이 이 쪽 가능성을 남긴다.' },
      { label: '복귀', text: '어장까지 1,945해리, 11노트 기준 7일. 9/28 도착 + 수리 3~28일 + 복귀 7일이면 어장 복귀는 10/8~11/2이다.' },
      { label: '조업손실', text: '마지막 어획 8/13부터 어장 복귀까지 56~81일이다. 보고 주기(146보고일 / 229달력일)로 환산하면 36~52보고일이고, 일평균 22.74 MT를 곱해 약 820~1,190 MT다. 8/14 이후 이미 발생한 분을 포함한 값이며 MOAMARI 연간 실적 3,365 MT의 24~35%에 해당한다.' },
      { label: '확정 / 예상 구분', text: '확정은 사고 경위(8/17 접안 중 로프 감김)·프로펠러 볼트 3개 파손·출발지·도착지·일 $41,000·계약 항해 24~26일·8/31 출발이다. 프로펠러 추가 손상 여부, 도착 9/28, 항해 29일, 총 예인료 약 119만불, 수리 3~28일, 복귀 10/8~11/2, 조업손실 820~1,190 MT은 전부 예상치 또는 미확인이다. 도착 예정일은 일일보고에서 매일 바뀐다 — 9/2 보고 9/29 → 9/3 보고 9/28. 잠수부 점검 결과·젠산 조선소 견적·실제 도착일이 나오면 갱신한다.' },
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
