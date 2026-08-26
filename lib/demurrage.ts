/**
 * 체선료(Demurrage) 추정 계산 - 2026-08-27 소유자 산식.
 *
 * 허용 정박일수 = 전체물량 / 220 (최소 일일 하역량 220 MT 기준)
 * 사용 일수     = 시작일 ~ 기준일 (양끝 포함), 일요일·공휴일 제외, 입항 대기 포함
 * 잔여(balance) = 허용 - 사용. 음수면 초과일수 x $10,000/일 로 1차 책정 후
 *                 운반선사와 최종 금액을 조율한다 (여기 값은 조율 전 추정치).
 *
 * 시작일은 입항일(입항 대기 포함)이 정본이나, 현재 하역 DB에 입항일 필드가 없어
 * 하역 개시일로 계산하는 항차는 결과에 waitingIncluded=false 로 표기한다.
 */

export const DEMURRAGE_DAILY_BASIS_MT = 220;
export const DEMURRAGE_RATE_USD_PER_DAY = 10_000;

/**
 * 태국(방콕 하역항) 공휴일 - 관공서 휴무 기준, 대체휴일 포함.
 * 출처: 태국 2026 공휴일 공표 목록 (humanresourcesonline.net 2026 리스트 대조, 2026-08-27 확인).
 * 5/31·12/5 본일은 주말이라 대체일(6/1·12/7)만 수록. 연도 추가 시 아래에 이어 붙인다.
 */
export const THAI_PUBLIC_HOLIDAYS: readonly string[] = [
  // 2026
  '2026-01-01', // 신정
  '2026-01-02', // 특별 공휴일 (내각 지정)
  '2026-03-03', // 마카부차
  '2026-04-06', // 차크리 기념일
  '2026-04-13', // 송크란
  '2026-04-14', // 송크란
  '2026-04-15', // 송크란
  '2026-05-01', // 노동절
  '2026-05-04', // 국왕 대관기념일
  '2026-06-01', // 위사카부차 대체휴일 (5/31 일요일)
  '2026-06-03', // 왕비 탄신일
  '2026-07-28', // 국왕 탄신일
  '2026-07-29', // 아싼하부차
  '2026-08-12', // 왕태후 탄신일·어머니날
  '2026-10-13', // 라마 9세 기일
  '2026-10-23', // 쭐라롱껀 대왕 기념일
  '2026-12-07', // 라마 9세 탄신·국경일 대체휴일 (12/5 토요일)
  '2026-12-10', // 제헌절
  '2026-12-31', // 연말
];

const HOLIDAY_SET = new Set(THAI_PUBLIC_HOLIDAYS);
const DAY_MS = 86_400_000;

export interface DemurrageInput {
  /** 하역 대상 전체물량 (MT) */
  cargoMt: number;
  /** 계산 시작일 (ISO). 입항일이 있으면 입항일, 없으면 하역 개시일 */
  startDate: string;
  /** 기준일 (ISO) - 진행 중이면 최신 보고일, 완료면 하역 완료일 */
  baseDate: string;
  /** 시작일이 입항일인지 (입항 대기 포함 여부 표기용) */
  waitingIncluded?: boolean;
}

export interface DemurrageResult {
  /** 허용 정박일수 = cargoMt / 220 (소수 1자리) */
  allowedDays: number;
  /** 사용 일수 (일요일·공휴일 제외, 양끝 포함) */
  usedDays: number;
  /** 제외된 일요일 수 */
  excludedSundays: number;
  /** 제외된 공휴일 수 (일요일과 겹치면 일요일로만 집계) */
  excludedHolidays: number;
  /** 잔여 일수 = allowed - used. 음수 = 초과 */
  balanceDays: number;
  /** 초과 시 추정 체선료 (USD, 초과일수 x $10,000, 조율 전). 여유면 null */
  estimateUsd: number | null;
  waitingIncluded: boolean;
}

function toUtc(iso: string): number {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

function isoOf(utc: number): string {
  return new Date(utc).toISOString().slice(0, 10);
}

/** 시작~기준일(양끝 포함)에서 일요일·공휴일을 제외한 일수 */
export function countLaytimeDays(startDate: string, baseDate: string): {
  used: number; sundays: number; holidays: number;
} {
  const start = toUtc(startDate);
  const end = toUtc(baseDate);
  let used = 0;
  let sundays = 0;
  let holidays = 0;
  if (end < start) return { used, sundays, holidays };
  for (let t = start; t <= end; t += DAY_MS) {
    if (new Date(t).getUTCDay() === 0) {
      sundays += 1;
      continue;
    }
    if (HOLIDAY_SET.has(isoOf(t))) {
      holidays += 1;
      continue;
    }
    used += 1;
  }
  return { used, sundays, holidays };
}

export function calcDemurrage(input: DemurrageInput): DemurrageResult {
  const allowedDays = Math.round((input.cargoMt / DEMURRAGE_DAILY_BASIS_MT) * 10) / 10;
  const { used, sundays, holidays } = countLaytimeDays(input.startDate, input.baseDate);
  const balanceDays = Math.round((allowedDays - used) * 10) / 10;
  const estimateUsd = balanceDays < 0
    ? Math.round(Math.abs(balanceDays) * DEMURRAGE_RATE_USD_PER_DAY)
    : null;
  return {
    allowedDays,
    usedDays: used,
    excludedSundays: sundays,
    excludedHolidays: holidays,
    balanceDays,
    estimateUsd,
    waitingIncluded: Boolean(input.waitingIncluded),
  };
}

/** 위험 등급 - 잔여 일수 기준 (양수 넉넉=Low, 2일 이내=Medium, 초과=High) */
export function demurrageRisk(balanceDays: number): 'Low' | 'Medium' | 'High' {
  if (balanceDays < 0) return 'High';
  if (balanceDays <= 2) return 'Medium';
  return 'Low';
}
