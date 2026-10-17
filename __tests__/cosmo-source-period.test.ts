import { describe, expect, it } from 'vitest';
import { latest } from '../lib/data/cosmo';
import { cosmoWeeklyReport as report } from '../lib/data/cosmo-weekly-report';

/* 2026-10-15: 경영요약 헤딩 「N주차 업무 브리핑 (기간)」은 N을 xlsx(cosmo_2026.json)에서,
 * 기간·서술을 docx(cosmo-weekly-report.ts)에서 가져온다. 한쪽만 갱신하면 숫자는 새 주,
 * 문장은 지난주가 된다(2026-09-10 36주차 실측). 다른 테스트는 주차를 상수로 박아 두 원자료가
 * 서로 같은 주인지는 보지 않는다 - 여기서는 상수 없이 두 원자료끼리 대조한다.
 * 34~41주차 이력 8건 모두 기간이 ISO 주차의 월~일과 일치했다. */
const isoWeek = (ymd: string) => {
  const d = new Date(`${ymd}T00:00:00Z`);
  const thursday = new Date(d);
  thursday.setUTCDate(d.getUTCDate() + 3 - ((d.getUTCDay() + 6) % 7));
  const jan4 = new Date(Date.UTC(thursday.getUTCFullYear(), 0, 4));
  return 1 + Math.round(((thursday.getTime() - jan4.getTime()) / 86_400_000 - 3 + ((jan4.getUTCDay() + 6) % 7)) / 7);
};
const fileWeek = (name: string) => Number(/\((\d+)주차\)/.exec(name)?.[1]);

describe('코스모 주간 원자료 두 갈래의 주차 정합', () => {
  it('ISO 주차 계산 자체검사', () => {
    expect(isoWeek('2026-10-05')).toBe(41);
    expect(isoWeek('2026-01-01')).toBe(1);
    expect(isoWeek('2025-12-29')).toBe(1);
  });

  it('docx 서술 계약의 주차가 xlsx 최신 주차와 같다', () => {
    expect(fileWeek(report.source.file)).toBe(latest.week);
  });

  it('docx 기간이 그 주차의 월요일~일요일이다', () => {
    const [start, end] = report.source.period.split('~');
    expect(isoWeek(start)).toBe(latest.week);
    expect(isoWeek(end)).toBe(latest.week);
    expect(new Date(`${start}T00:00:00Z`).getUTCDay()).toBe(1);
    expect(new Date(`${end}T00:00:00Z`).getUTCDay()).toBe(0);
  });

  it('xlsx 최신 행의 원본 파일명도 같은 주차다', () => {
    expect(fileWeek(String((latest as { source?: string }).source ?? ''))).toBe(latest.week);
  });
});
