import { describe, expect, it } from 'vitest';

import reeferWeek40 from '@/data/reefer_week40.json';
import { reeferWeeklyReport } from '@/lib/data/reefer-weekly';

const parseMt = (value: string) => Number.parseFloat(value.replaceAll(',', ''));

/* deliveries.OTHER 는 하역처가 아니라 원문 REMARK(부두)다 — 「41/ASIMAR」·「11B」처럼
 * 숫자가 아닌 값이 들어온다. 화면도 이 칸을 「부두」로 렌더하고 합계에서 뺀다. */
const sumDeliveries = (row: (typeof reeferWeeklyReport.rows)[number]) =>
  Object.entries(row.deliveries).reduce((sum, [key, value]) => {
    if (key === 'OTHER' || key === 'SHIP' || value === '') return sum;
    return sum + parseMt(value);
  }, 0);

describe('TTA 2026년 41주차 운반선 이동표', () => {
  it('41주차 원본과 보고기간을 최신 계약으로 고정한다', () => {
    /* A1 이 「9/10/26 - 15/10/26」로 일(日)을 한 자리로 적어 왔다 - 파서가 1~2자리를 받는다 */
    expect(reeferWeeklyReport.source).toEqual({
      file: 'Reefer ship movement for week 41th.xlsx',
      sha256: 'd310034c22a514ba64cb369ebc7c058ef6c4f9df1985b7c3e2a41b9ff4c4d60a',
      week: 41,
      startDate: '2026-10-09',
      endDate: '2026-10-15',
    });
  });

  it('40주차 2척에서 CHERRY STAR 가 빠지고 HUA FU 107 한 척만 남는다', () => {
    expect(reeferWeeklyReport.rows.map((row) => row.carrier)).toEqual(['HUA FU 107']);
    expect(reeferWeeklyReport.rows.map((row) => row.date)).toEqual(['04.10.26']);
    /* 표는 접안 중인 배만 남긴다 - 하역을 마친 배는 다음 주 표에서 빠진다. 이번 주 새 배는 없다. */
    const previous = new Set(reeferWeek40.map((row) => row.carrier));
    const current = new Set(reeferWeeklyReport.rows.map((row) => row.carrier));
    expect([...previous].filter((name) => !current.has(name))).toEqual(['CHERRY STAR']);
    expect([...current].filter((name) => !previous.has(name))).toEqual([]);
    // HUA FU 107 은 40주차와 배분이 같다 - 월별 집계에서 한 번만 센다
    expect(reeferWeeklyReport.rows[0].deliveries).toEqual(reeferWeek40.find((row) => row.carrier === 'HUA FU 107')!.deliveries);
  });

  it('HUA FU 107 의 배분과 원문 기재를 그대로 보존한다', () => {
    /* 10/4 접안분이다 — 방콕 주간보고(10/14 정정본) 하역 표의 HUA FU 107(FCF) 4,840 MT 와 같다. */
    expect(reeferWeeklyReport.rows.at(-1)).toMatchObject({
      carrier: 'HUA FU 107',
      date: '04.10.26',
      deliveries: {
        ASIAN: '176',
        CMC: '732',
        GB: '1,251',
        PTY: '943',
        RMK: '300',
        TUG: '350',
        TUM: '300',
        UC: '788',
        OTHER: '11B',   // 부두 - 하역량이 아니다
      },
    });
  });

  it('선박별 배분과 4,840MT 전체 합계를 독립 검산한다', () => {
    // 원문 TOTAL 열(AI7 4,840)과 행 합산이 일치한다
    expect(reeferWeeklyReport.rows.map((row) => sumDeliveries(row))).toEqual([4_840]);
    expect(reeferWeeklyReport.rows.reduce((sum, row) => sum + sumDeliveries(row), 0)).toBeCloseTo(4_840, 3);
  });

  it('40주차 이력을 보존하고 최신 행은 보고 시점 자료로 표기한다', () => {
    expect(reeferWeek40).toHaveLength(2);
    expect(reeferWeeklyReport.rows.every((row) => row.status === '주간 보고 기록')).toBe(true);
    expect(reeferWeeklyReport.rows.every((row) => row.daysRemaining === null)).toBe(true);
    expect(reeferWeeklyReport.rows.every((row) => row.priority === '이력')).toBe(true);
  });
});
