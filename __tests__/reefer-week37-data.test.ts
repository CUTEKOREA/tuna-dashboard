import { describe, expect, it } from 'vitest';

import reeferWeek36 from '@/data/reefer_week36.json';
import { reeferWeeklyReport } from '@/lib/data/reefer-weekly';

const parseMt = (value: string) => Number.parseFloat(value.replaceAll(',', ''));

/* deliveries.OTHER 는 하역처가 아니라 원문 REMARK(부두)다 — 「41/ASIMAR」·「11B」처럼
 * 숫자가 아닌 값이 들어온다. 화면도 이 칸을 「부두」로 렌더하고 합계에서 뺀다.
 * 합산할 때 빼지 않으면 숫자 아닌 값에서 NaN 이 나거나(2026-09-10 실측)
 * 「23」 같은 선석 번호가 하역량으로 더해진다. */
const sumDeliveries = (row: (typeof reeferWeeklyReport.rows)[number]) =>
  Object.entries(row.deliveries).reduce((sum, [key, value]) => {
    if (key === 'OTHER' || key === 'SHIP' || value === '') return sum;
    return sum + parseMt(value);
  }, 0);

describe('TTA 2026년 37주차 운반선 이동표', () => {
  it('37주차 원본과 보고기간을 최신 계약으로 고정한다', () => {
    expect(reeferWeeklyReport.source).toEqual({
      file: 'Reefer ship movement for week 37th.xlsx',
      sha256: '171caae22ca11f57718b34e62f4abdf497feaedfb5f3fc1a8f63fd84b012df2f',
      week: 37,
      startDate: '2026-09-11',
      endDate: '2026-09-17',
    });
  });

  it('36주차 5척에 2척이 더 붙은 7척 접안 기록을 보존한다', () => {
    expect(reeferWeeklyReport.rows.map((row) => row.carrier)).toEqual([
      'SEIN VENUS',
      'SEITA MARU',
      'FONG KUO NO.818',
      'ZHONG YU MARINE',
      'SEIN QUEEN',
      'FONG KUO NO.819',
      'SEIN GALAXY',
    ]);
    expect(reeferWeeklyReport.rows.map((row) => row.date)).toEqual([
      '06.08.26',
      '29.08.26',
      '01.09.26',
      '02.09.26',
      '04.09.26',
      '14.09.26',
      '17.09.26',
    ]);
    // 36주차에서 빠진 배는 없고 두 척이 더 붙었다
    const previous = new Set(reeferWeek36.map((row) => row.carrier));
    const current = new Set(reeferWeeklyReport.rows.map((row) => row.carrier));
    expect([...previous].filter((name) => !current.has(name))).toEqual([]);
    expect([...current].filter((name) => !previous.has(name)))
      .toEqual(['FONG KUO NO.819', 'SEIN GALAXY']);
  });

  it('신규 SEIN GALAXY의 배분과 원문 기재를 그대로 보존한다', () => {
    /* 9/17 접안분이다 — 일일업무보고(260917)의 「9/16 BKK 도착, 9/17 부두 접안 예정」과
     * /unloading 에 등재한 방콕 항차(1,846 MT)와 같은 배·같은 물량이다. */
    expect(reeferWeeklyReport.rows.at(-1)).toMatchObject({
      carrier: 'SEIN GALAXY',
      date: '17.09.26',
      deliveries: {
        CMC: '340',
        GB: '155',
        ISA: '24',
        RMK: '150',
        UC: '1,177',
        OTHER: '41',   // 부두 - 하역량이 아니다
      },
    });
  });

  it('선박별 배분과 26,271MT 전체 합계를 독립 검산한다', () => {
    // 원문 TOTAL 열(AI)과 행 합산이 7척 전부 일치한다
    expect(reeferWeeklyReport.rows.map((row) => sumDeliveries(row))).toEqual([
      3_275,
      3_432,
      4_880,
      5_025,
      2_902,
      4_911,
      1_846,
    ]);
    expect(reeferWeeklyReport.rows.reduce((sum, row) => sum + sumDeliveries(row), 0))
      .toBeCloseTo(26_271, 3);
  });

  it('36주차 이력을 보존하고 최신 행은 보고 시점 자료로 표기한다', () => {
    expect(reeferWeek36).toHaveLength(5);
    expect(reeferWeeklyReport.rows.every((row) => row.status === '주간 보고 기록')).toBe(true);
    expect(reeferWeeklyReport.rows.every((row) => row.daysRemaining === null)).toBe(true);
    expect(reeferWeeklyReport.rows.every((row) => row.priority === '이력')).toBe(true);
  });
});
