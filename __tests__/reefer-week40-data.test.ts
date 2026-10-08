import { describe, expect, it } from 'vitest';

import reeferWeek39 from '@/data/reefer_week39.json';
import { reeferWeeklyReport } from '@/lib/data/reefer-weekly';

const parseMt = (value: string) => Number.parseFloat(value.replaceAll(',', ''));

/* deliveries.OTHER 는 하역처가 아니라 원문 REMARK(부두)다 — 「41/ASIMAR」·「11B」처럼
 * 숫자가 아닌 값이 들어온다. 화면도 이 칸을 「부두」로 렌더하고 합계에서 뺀다. */
const sumDeliveries = (row: (typeof reeferWeeklyReport.rows)[number]) =>
  Object.entries(row.deliveries).reduce((sum, [key, value]) => {
    if (key === 'OTHER' || key === 'SHIP' || value === '') return sum;
    return sum + parseMt(value);
  }, 0);

describe('TTA 2026년 40주차 운반선 이동표', () => {
  it('40주차 원본과 보고기간을 최신 계약으로 고정한다', () => {
    expect(reeferWeeklyReport.source).toEqual({
      file: 'Reefer ship movement for week 40th.xlsx',
      sha256: '75e8882958d585c33e75b4fcf8752a65de45b1683550a525773db222b5e15087',
      week: 40,
      startDate: '2026-10-02',
      endDate: '2026-10-08',
    });
  });

  it('39주차 2척에서 RYOMA 가 빠지고 HUA FU 107 이 붙은 2척이다', () => {
    expect(reeferWeeklyReport.rows.map((row) => row.carrier)).toEqual(['CHERRY STAR', 'HUA FU 107']);
    expect(reeferWeeklyReport.rows.map((row) => row.date)).toEqual(['28.09.26', '04.10.26']);
    /* 표는 접안 중인 배만 남긴다 - 하역을 마친 배는 다음 주 표에서 빠진다. */
    const previous = new Set(reeferWeek39.map((row) => row.carrier));
    const current = new Set(reeferWeeklyReport.rows.map((row) => row.carrier));
    expect([...previous].filter((name) => !current.has(name))).toEqual(['RYOMA']);
    expect([...current].filter((name) => !previous.has(name))).toEqual(['HUA FU 107']);
    // CHERRY STAR 는 39주차와 배분이 같다 - 월별 집계에서 한 번만 센다
    expect(reeferWeeklyReport.rows[0].deliveries).toEqual(reeferWeek39.find((row) => row.carrier === 'CHERRY STAR')!.deliveries);
  });

  it('신규 HUA FU 107 의 배분과 원문 기재를 그대로 보존한다', () => {
    /* 10/4 접안분이다 — 방콕 주간보고(10/7 정정본) 하역 표의 HUA FU 107(FCF) 4,840 MT 와 같다. */
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

  it('선박별 배분과 8,255MT 전체 합계를 독립 검산한다', () => {
    // 원문 TOTAL 열(AI)과 행 합산이 2척 모두 일치한다
    expect(reeferWeeklyReport.rows.map((row) => sumDeliveries(row))).toEqual([3_415, 4_840]);
    expect(reeferWeeklyReport.rows.reduce((sum, row) => sum + sumDeliveries(row), 0)).toBeCloseTo(8_255, 3);
  });

  it('39주차 이력을 보존하고 최신 행은 보고 시점 자료로 표기한다', () => {
    expect(reeferWeek39).toHaveLength(2);
    expect(reeferWeeklyReport.rows.every((row) => row.status === '주간 보고 기록')).toBe(true);
    expect(reeferWeeklyReport.rows.every((row) => row.daysRemaining === null)).toBe(true);
    expect(reeferWeeklyReport.rows.every((row) => row.priority === '이력')).toBe(true);
  });
});
