import { describe, expect, it } from 'vitest';

import {
  BUSAN_VESSEL_TYPES,
  getBusanLatestYear,
  getBusanMonthlySeries,
  getBusanPortData,
  getBusanStayComparison,
} from '@/lib/data/busan-port';

const data = getBusanPortData();
const latest = String(getBusanLatestYear());

describe('부산 입출항선 데이터 계약 (busan_port_calls.json)', () => {
  it('기준일은 ISO 날짜, 연도는 최신순 3개다', () => {
    expect(data.asof).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(data.years.length).toBeGreaterThanOrEqual(3);
    expect([...data.years].sort((a, b) => b - a)).toEqual(data.years);
  });

  it('타임라인은 최신 연도 어기 수와 일치하고 최소 필드를 갖춘다', () => {
    expect(data.timeline.length).toBe(data.kpi.runs[latest]);
    for (const run of data.timeline) {
      expect(run.ship).toBeTruthy();
      expect(run.co).toBeTruthy();
      expect(BUSAN_VESSEL_TYPES).toContain(run.type);
    }
  });

  it('선장 실명 필드는 어디에도 없다 (개인정보 최소화 계약)', () => {
    const serialized = JSON.stringify(data);
    expect(serialized).not.toMatch(/"(prev_capt|next_capt|capt|captain)"/);
  });

  it('앰대시는 데이터에 없다 (2026-08-26 사용자 지시)', () => {
    expect(JSON.stringify(data)).not.toContain('\u2014');
  });

  it('월별 시계열은 12개월이고 전년 병기를 포함한다', () => {
    const series = getBusanMonthlySeries();
    expect(series.length).toBe(12);
    expect(series[0]).toHaveProperty('전년입항');
    for (const year of data.years) {
      expect(data.monthly[String(year)]).toHaveLength(12);
    }
  });

  it('체류 통계는 문서 규칙(90일 제외 <= 전체 포함)을 지킨다', () => {
    for (const row of getBusanStayComparison()) {
      if (row.avg != null && row.avg90 != null) {
        expect(row.avg90).toBeLessThanOrEqual(row.avg);
      }
    }
    // 문서 대조 앵커 (2026-08-21 기준 통합본): 연승 52/47일, 완료 33건
    const yeon = data.stay[latest]?.['연승'];
    expect(yeon?.avg).toBe(52);
    expect(yeon?.avg90).toBe(47);
    expect(yeon?.n).toBe(33);
  });

  it('주간 변화 창은 기준일에서 7일 창이다', () => {
    expect(data.weekly.w1).toBe(data.asof);
    const w0 = new Date(data.weekly.w0);
    const w1 = new Date(data.weekly.w1);
    expect((w1.getTime() - w0.getTime()) / 86400000).toBe(6);
  });
});
