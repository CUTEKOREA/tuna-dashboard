import { fleetDailyPublicSeries } from '@/lib/data/fleet-daily-public';

/** 이 일수 이상 어획이 끊기면 가동 중단으로 본다. 조업 공백과 정박·수리를 가르는 선. */
export const FLEET_IDLE_THRESHOLD_DAYS = 7;

export interface FleetIdleVessel {
  vessel: string;
  region: '태평양' | '대서양';
  /** 마지막으로 어획이 잡힌 보고일 */
  lastCatchDate: string;
  /** 선적량이 마지막으로 늘어난 보고일. 보고 없는 날 잡은 어획은 여기로만 드러난다. */
  lastLoadIncreaseDate: string | null;
  /** 마지막 어획·적재 증가 중 늦은 쪽 이후의 보고일 수 */
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
    asOf: '2026-10-06',
    headline: '프로펠러 볼트 3개 파손(선장 보고서 8/18 확정) 수리차 예인 · 10/2 08:30 젠산 입항 완료(8/31 출발, 항해 32일 확정) · 계약 항해 24~26일보다 6~8일 길었다 · 예인료 일 $41,000 × 32일 = 약 131만불(1,390원/$ 환산 18.2억원, 정산 전 계산값), 계약 대비 $24.6만~32.8만 초과 · 상가수리 10/4~10/10 후 10/11 출항 예정(10/6 보고) · 복귀 10/18 전후 예상 · 조업손실 약 840~1,080 MT 예상',
    lines: [
      { label: '사고 경위 (선장 보고서 8/18)', text: '8/17 LMT 17:30경 키리바시 크리스마스 입항 후 운반선 SEIN KASAMA와 접안 작업 중, 기상이 나빠 운반선 선수 로프가 크게 흔들리다 본선 선미 프로펠러 쪽으로 유입됐다. 당시 본선이 ASTERN으로 엔진을 쓰고 있어 로프가 프로펠러에 감겼고, 추가 손상을 막기 위해 운반선 선수 로프를 즉시 절단했다.' },
      { label: '손상 (확정 / 미확인)', text: '8/18 본선 갑판장이 잠수 장비로 감긴 로프를 제거하는 과정에서 프로펠러 볼트 3개 파손을 확인했다 — 여기까지가 확정이다. 프로펠러·관련 장비의 추가 손상 여부는 잠수부 점검이 필요하다고 보고돼 아직 미확인이다.' },
      { label: '체류·출발', text: '8/17 입항 후 SEIN KASAMA편으로 약 760톤을 전재했고, 이 전재 작업이 체류 14일의 대부분을 차지했다. 8/31 SEIN SAPPHIRE 예인으로 젠산 출발.' },
      { label: '예인 계약', text: '크리스마스섬 출발 → 제너럴 산토스 도착, 예인료 일 $41,000, 계약 항해일수 24~26일. 4,644해리를 24~26일에 끌려면 평균 7.4~8.1노트가 필요하다.' },
      { label: '예인 결과 (확정)', text: '8/31 크리스마스섬 출발, 10/2 08:30 제너럴 산토스 입항 — 항해 32일, 평균 약 6.0노트다. 계약 상한(26일)보다 6일·하한(24일)보다 8일 길었다. 도착 예정은 보고마다 바뀌었다(9/11 10/20 → 9/14 10/11 → 9/15 10/4 → 9/16 10/1 → 9/17 9/30 → 9/18 10/1 → 9/21 10/2 → 9/23 10/1 → 9/30 10/2). 9/30~10/1 하루는 약 4.7노트(약 114해리)로 느려져 그 속도면 10/3 도착이라는 계산이 나왔지만, 남은 약 240해리를 하루 안에 끌어 보고 일정대로 10/2 아침에 닿았다.' },
      { label: '예인료 (계약 확정 / 총액 계산값)', text: '일 $41,000은 계약 확정, 항해 32일도 확정이다. 총액 약 $131만(1,390원/$ 환산 18.2억원)은 그 둘을 곱한 계산값이고 정산서는 아직 없다. 계약 24~26일이면 $98.4만~106.6만이었으니 초과 6~8일분 $24.6만~32.8만(약 3.4~4.6억원)이다. 9/14 보고의 10/11 도착 가정(41일·약 $168만)보다 $36.9만 적고, 자금팀 추산 「약 123만불(일 5,700만원·30일 약 17억원)」보다 이틀치 $8.2만 많다. 초과분의 부담 주체가 용선 계약서상 누구인지 확인이 먼저다.' },
      { label: '수리 (짧은 쪽, 예상)', text: '볼트 3개 교체로 끝나면 3~7일. 다만 크리스마스섬은 항만 없는 개방 정박지라 너울에 노출돼 현장 잠수 점검·수리가 어려웠고, 그래서 손상 범위를 확정하지 못한 채 젠산까지 끌고 가는 판단이 나왔다.' },
      { label: '수리 (긴 쪽, 예상)', text: '9/28 보고에 상가수리 일정이 10/2~10/8(7일)로 처음 명시됐다 — 입거 2~4주가 아니라 일주일이다. 10/6 보고는 이를 10/4~10/10 으로 이틀 늦추고 출항을 10/10 → 10/11 로 바꿨다 — 기간은 7일 그대로이고 시작이 밀렸다. 잠수부 점검에서 프로펠러 날개·축계까지 번진 것으로 나오면 그보다 길어질 수 있다. 볼트 3개가 파손될 만큼의 하중이 걸렸다는 점이 이 쪽 가능성을 남긴다. 젠산 도착 후 점검 결과가 첫 판단 근거가 된다.' },
      { label: '복귀', text: '어장까지 1,945해리, 11노트 기준 7일. 10/6 보고 기준 10/11 출항 예정이고 어장까지 7일이면 어장 복귀는 10/18 전후다(10/2 보고 기준 10/17 에서 하루 밀림). 수리가 길어지면 그만큼 밀린다.' },
      { label: '조업손실', text: '마지막 어획 8/13부터 어장 복귀까지 66~85일이다(짧은 쪽 = 10/18 복귀, 긴 쪽 = 수리가 늘어지는 경우). 보고 주기(168보고일 / 263달력일)로 환산하면 42~54보고일이고, 일평균 20.03 MT(연간 실적 3,365 MT ÷ 168보고일)를 곱해 약 840~1,080 MT다. 8/14 이후 이미 발생한 분을 포함한 값이며 MOAMARI 연간 실적 3,365 MT의 25~32%에 해당한다.' },
      { label: '확정 / 예상 구분', text: '확정은 사고 경위(8/17 접안 중 로프 감김)·프로펠러 볼트 3개 파손·일 $41,000·계약 항해 24~26일·8/31 출발·10/2 08:30 젠산 입항(항해 32일)이다. 총 예인료 약 131만불은 정산 전 계산값이고, 프로펠러 추가 손상 여부, 상가수리 10/4~10/10·10/11 출항(10/6 보고 예정), 복귀 10/18 전후, 조업손실 840~1,080 MT은 예상치 또는 미확인이다. 잠수부 점검 결과·젠산 조선소 견적·실제 출항일이 나오면 갱신한다.' },
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

      // 보고 없는 주말의 어획은 보고일 어획에 안 잡히고 선적량 증가로만 드러난다.
      // 둘 중 늦은 쪽을 마지막 가동으로 본다(S/JUP: 보고일 어획 8/12, 선적량 증가 9/14).
      const lastLoadIncreaseDate = series[key].lastLoadIncreaseDates[vessel] ?? null;
      const lastActivityIndex = Math.max(
        lastCatchIndex,
        lastLoadIncreaseDate ? series.dates.indexOf(lastLoadIncreaseDate) : -1,
      );
      const idleDays = values.length - 1 - lastActivityIndex;
      if (idleDays < thresholdDays) continue;

      const dailyAverageMt = averageOf(values);
      const totalMt = values.reduce<number>((sum, value) => sum + (value ?? 0), 0);
      idle.push({
        vessel,
        region,
        lastCatchDate: series.dates[lastCatchIndex],
        lastLoadIncreaseDate,
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
