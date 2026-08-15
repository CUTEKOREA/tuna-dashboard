import rawBangkokWeeklyKpi from '../../public/data/bangkok_weekly_kpi.json';

export type BangkokWeeklyKpi = {
  readonly period: string;
  readonly weeks: number;
  readonly latestPrice: number;
  readonly stockMt: number;
  readonly processDays: number;
  readonly cumUnloadMt: number;
  readonly highSaltUsd: number;
};

const PERIOD_PATTERN = /^\d{4}\.\d{2}~\d{4}\.\d{2}$/;

function recordAt(value: unknown): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error('방콕 주간보고 KPI는 객체여야 합니다.');
  }
  return value as Record<string, unknown>;
}

function positiveIntegerAt(value: unknown, field: string): number {
  if (!Number.isSafeInteger(value) || (value as number) <= 0) {
    throw new Error(`${field}는 0보다 큰 정수여야 합니다.`);
  }
  return value as number;
}

export function parseBangkokWeeklyKpi(value: unknown): BangkokWeeklyKpi {
  const record = recordAt(value);
  if (typeof record.period !== 'string' || !PERIOD_PATTERN.test(record.period)) {
    throw new Error('period는 YYYY.MM~YYYY.MM 형식이어야 합니다.');
  }

  return {
    period: record.period,
    weeks: positiveIntegerAt(record.weeks, 'weeks'),
    latestPrice: positiveIntegerAt(record.latestPrice, 'latestPrice'),
    stockMt: positiveIntegerAt(record.stockMt, 'stockMt'),
    processDays: positiveIntegerAt(record.processDays, 'processDays'),
    cumUnloadMt: positiveIntegerAt(record.cumUnloadMt, 'cumUnloadMt'),
    highSaltUsd: positiveIntegerAt(record.highSaltUsd, 'highSaltUsd'),
  };
}

export const bangkokWeeklyKpi = parseBangkokWeeklyKpi(rawBangkokWeeklyKpi);
