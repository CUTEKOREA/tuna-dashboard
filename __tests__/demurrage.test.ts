import { describe, expect, it } from 'vitest';

import {
  DEMURRAGE_DAILY_BASIS_MT,
  DEMURRAGE_RATE_USD_PER_DAY,
  calcDemurrage,
  countLaytimeDays,
  demurrageRisk,
} from '@/lib/demurrage';

describe('체선료 산식 (전체물량/220 - 사용일수, 일요일·공휴일 제외)', () => {
  it('기준 상수는 소유자 산식과 일치한다 (220 MT/일, $10,000/일)', () => {
    expect(DEMURRAGE_DAILY_BASIS_MT).toBe(220);
    expect(DEMURRAGE_RATE_USD_PER_DAY).toBe(10_000);
  });

  it('일요일을 사용 일수에서 제외한다', () => {
    // 2026-08-20(목) ~ 2026-08-25(화): 6일 중 일요일 8/23 제외 = 5일
    const { used, sundays, holidays } = countLaytimeDays('2026-08-20', '2026-08-25');
    expect(used).toBe(5);
    expect(sundays).toBe(1);
    expect(holidays).toBe(0);
  });

  it('태국 공휴일을 제외한다 (어머니날 8/12)', () => {
    // 2026-08-10(월) ~ 2026-08-14(금): 5일 중 8/12 공휴일 제외 = 4일
    const { used, holidays } = countLaytimeDays('2026-08-10', '2026-08-14');
    expect(used).toBe(4);
    expect(holidays).toBe(1);
  });

  it('송크란 연휴 + 일요일이 함께 빠진다', () => {
    // 2026-04-11(토) ~ 2026-04-16(목): 6일 중 일 4/12 + 공휴일 4/13~15 제외 = 2일
    const { used, sundays, holidays } = countLaytimeDays('2026-04-11', '2026-04-16');
    expect(used).toBe(2);
    expect(sundays).toBe(1);
    expect(holidays).toBe(3);
  });

  it('HIKARI 1 실측: 2,929 MT, 8/20~8/25 진행 중이면 여유 구간이다', () => {
    const r = calcDemurrage({ cargoMt: 2929, startDate: '2026-08-20', baseDate: '2026-08-25' });
    expect(r.allowedDays).toBe(13.3); // 2929 / 220
    expect(r.usedDays).toBe(5);
    expect(r.balanceDays).toBe(8.3);
    expect(r.estimateUsd).toBeNull();
    expect(demurrageRisk(r.balanceDays)).toBe('Low');
  });

  it('허용 초과 시 초과일수 x $10,000 로 추정한다', () => {
    // 550 MT -> 허용 2.5일. 6/2(화)~6/8(월): 7일 중 일 6/7 + 공휴일 6/3(왕비 탄신) 제외 = 5일 사용 -> 초과 2.5일
    const r = calcDemurrage({ cargoMt: 550, startDate: '2026-06-02', baseDate: '2026-06-08' });
    expect(r.allowedDays).toBe(2.5);
    expect(r.usedDays).toBe(5);
    expect(r.excludedHolidays).toBe(1);
    expect(r.balanceDays).toBe(-2.5);
    expect(r.estimateUsd).toBe(25_000);
    expect(demurrageRisk(r.balanceDays)).toBe('High');
  });

  it('잔여 2일 이내는 Medium 이다', () => {
    expect(demurrageRisk(1.5)).toBe('Medium');
    expect(demurrageRisk(0)).toBe('Medium');
    expect(demurrageRisk(2.1)).toBe('Low');
  });
});
