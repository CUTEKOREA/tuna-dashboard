/**
 * 위젯 기준일(`telemetry.syncDate`)의 «나이»를 읽는다.
 *
 * 왜 필요한가 — 카드 549장이 전부 같은 무게로 보인다. 어제 받은 숫자와
 * 2018-01-30 자료가 같은 회색 배지를 달고 나란히 앉아 있다. 실측하니
 * 다섯 중 하나(97~129장)가 18개월 넘은 값이었다.
 *
 * 값의 형식이 통일돼 있지 않다 — 581개를 세어 보니 `YYYY-MM-DD` 240,
 * `YYYY-MM` 76, 연도만 166, 어기 표기(`2025-26`) 41, 그리고 아예 날짜가
 * 아닌 것 58(`참고용 (Reference Only)`, `내부 원가 모델` …)이다.
 * 접미사가 붙은 것(`2026-08-17 조사`, `2024년 기준`, `연보 2024`)도 흔하다.
 * 그래서 문자열을 «고치지 않고» 읽기만 한다. 데이터 549곳을 손대는 것은
 * 다른 일이고, 못 읽는 값은 숨기지 말고 「기준일 미상」으로 드러낸다.
 *
 * ⚠ 파싱은 «보수적»이다 — 연도만 있으면 그 해 1월 1일, 달만 있으면 그 달
 * 1일로 본다. 자료가 실제보다 새것으로 보이는 쪽이 위험하기 때문이다.
 */

export type FreshnessTier =
  | 'live'      // status LIVE — 기준일 개념이 없다
  | 'fresh'     // 90일 이내
  | 'ok'        // 18개월 이내
  | 'stale'     // 18개월 초과
  | 'unknown';  // 날짜로 못 읽는 값

/** 어느 정밀도로 읽었나. 「2024」를 하루처럼 말하지 않기 위해 남긴다. */
export type SyncPrecision = 'day' | 'month' | 'season' | 'year';

export interface ParsedSyncDate {
  at: Date;
  precision: SyncPrecision;
}

const DAY = 86_400_000;
/** 「오래됨」 경계. 연간 통계(FAOSTAT·KREI 연보)가 1년을 넘는 것은 정상이라 18개월로 둔다. */
export const STALE_DAYS = 548;
export const FRESH_DAYS = 90;

/**
 * 기준일 문자열에서 날짜를 읽는다. 못 읽으면 null.
 * 접미사·출처명이 붙어 있어도 «맨 앞의 날짜»를 집는다.
 */
export function parseSyncDate(raw: string | undefined | null): ParsedSyncDate | null {
  if (!raw) return null;
  const s = String(raw).trim();
  if (!s) return null;

  const ymd = s.match(/(\d{4})[-./](\d{1,2})[-./](\d{1,2})/);
  if (ymd) {
    const [, y, m, d] = ymd;
    const at = makeDate(+y, +m, +d);
    if (at) return { at, precision: 'day' };
  }

  // 달까지. 뒤에 숫자가 이어지면(`2025-26` 어기) 여기서 잡지 않는다.
  const ym = s.match(/(\d{4})[-./](\d{1,2})(?![\d-])/);
  if (ym) {
    const at = makeDate(+ym[1], +ym[2], 1);
    if (at) return { at, precision: 'month' };
  }

  /* 어기·회계연도 `2025-26` — 끝 연도의 시작으로 본다(보수적).
     ⚠ 뒤 두 자리가 «다음 해»일 때만 어기로 읽는다. 안 그러면 달이 깨진 값
     (`2026-13-01`)을 2013년으로 읽는다 — 8년 묵은 자료로 둔갑한다. */
  const season = s.match(/(\d{4})\s*[-/]\s*(\d{2})(?!\d)/);
  if (season && (+season[1] + 1) % 100 === +season[2]) {
    const at = makeDate(2000 + +season[2], 1, 1);
    if (at) return { at, precision: 'season' };
  }

  const year = s.match(/(?:19|20)\d{2}/);
  if (year) {
    const at = makeDate(+year[0], 1, 1);
    if (at) return { at, precision: 'year' };
  }

  return null;
}

function makeDate(y: number, m: number, d: number): Date | null {
  if (y < 1900 || y > 2999) return null;
  if (m < 1 || m > 12) return null;
  if (d < 1 || d > 31) return null;
  const at = new Date(Date.UTC(y, m - 1, d));
  // 2월 31일 같은 값은 달이 넘어간다 — 그런 입력은 안 읽은 것으로 본다.
  return at.getUTCMonth() === m - 1 ? at : null;
}

/** 지난 시간을 사람 말로. 하루 단위까지 내려가지 않는다 — 기준일 정밀도가 그만큼 없다. */
export function ageLabel(days: number): string {
  if (days < 0) return '기준일이 미래다';
  if (days < 45) return `${days}일 전`;
  /* ⚠ 달을 먼저 세어 12로 나누면 365일이 «11개월»로 나온다(365/30.44 = 11.99).
     해를 먼저 가른다 — 한 해를 넘긴 자료가 「11개월」로 읽히면 안 된다. */
  if (days < 365) return `${Math.floor(days / 30.44)}개월 전`;
  const years = Math.floor(days / 365);
  const rest = Math.floor((days - years * 365) / 30.44);
  return rest ? `${years}년 ${rest}개월 전` : `${years}년 전`;
}

export interface Freshness {
  tier: FreshnessTier;
  /** 기준일에서 오늘까지 며칠. 못 읽었으면 null */
  ageDays: number | null;
  /** 배지에 덧붙일 말. tier 가 live·unknown 이면 null */
  ageText: string | null;
  precision: SyncPrecision | null;
}

/**
 * 상태와 기준일로 신선도를 낸다.
 * `now` 는 시험을 위해 받는다 — 화면에서는 넘기지 않는다.
 */
export function freshnessOf(
  status: string | undefined,
  syncDate: string | undefined,
  now: Date = new Date(),
): Freshness {
  if (String(status ?? '').toUpperCase() === 'LIVE') {
    return { tier: 'live', ageDays: null, ageText: null, precision: null };
  }
  const parsed = parseSyncDate(syncDate);
  if (!parsed) {
    return { tier: 'unknown', ageDays: null, ageText: null, precision: null };
  }
  const ageDays = Math.floor((now.getTime() - parsed.at.getTime()) / DAY);
  const tier: FreshnessTier =
    ageDays <= FRESH_DAYS ? 'fresh' : ageDays <= STALE_DAYS ? 'ok' : 'stale';
  return { tier, ageDays, ageText: ageLabel(ageDays), precision: parsed.precision };
}

/** 배지가 쓸 tone. 색을 받는 것은 둘뿐이다 — 549장이 다 색을 달면 신호가 아니라 배경이다. */
export function toneOf(tier: FreshnessTier): 'accent' | 'stale' | 'unknown' | 'neutral' {
  if (tier === 'live') return 'accent';
  if (tier === 'stale') return 'stale';
  if (tier === 'unknown') return 'unknown';
  return 'neutral';
}
