import { describe, expect, it } from 'vitest';
import { atunaAt, buildOverviewRows } from '@/lib/bangkok-price-overview';
import { singaporeMgoAt, singaporeMgoMeta } from '@/lib/data/singapore-mgo';
import { bangkokWeeks } from '@/lib/data/bangkok-weekly';

describe('방콕 개관 시세 겹쳐보기 행 구성', () => {
  it('싱가포르 MGO는 보고일(수) 직전 영업일 값을 쓰고 6일 넘게 비면 null이다', () => {
    expect(singaporeMgoMeta.unit).toBe('USD/MT');
    expect(singaporeMgoAt('2026-09-02')).toBe(1222.5); // 9/1(화) 종가
    expect(singaporeMgoAt('2023-08-30')).toBeNull(); // 시리즈 시작(2023-09-01) 이전
  });

  it('어튜나 관측은 보고일 이전 13일 안의 마지막 값만 붙인다', () => {
    const hist = [
      { date: '2026-08-14', skj_bkk: 1900 },
      { date: '2026-08-20', skj_bkk: 2000 },
      { date: '2026-08-11', skj_bkk: null },
    ];
    expect(atunaAt(hist, '2026-08-26')).toBe(2000);
    expect(atunaAt(hist, '2026-08-19')).toBe(1900);
    expect(atunaAt(hist, '2026-09-09')).toBeNull(); // 8/20 이후 20일 — 끊는다
  });

  it('행은 방콕 주차와 1:1이고 재고·가동률·MGO를 같은 x축에 싣는다', () => {
    const rows = buildOverviewRows(bangkokWeeks, singaporeMgoAt, []);
    expect(rows).toHaveLength(bangkokWeeks.length);
    const last = rows.at(-1)!;
    expect(last).toMatchObject({ date: '2026-09-02', 방콕사무소: 2030, 재고: 100500, 가동률: 51, MGO: 1222.5, 어튜나: null });
    expect(rows.find((r) => r.date === '2020-05-27')?.MGO).toBeNull();
  });
});

import { appendSeasonalOutlook } from '@/lib/bangkok-price-overview';
import { skjSeasonalOutlook } from '@/lib/data/skj-seasonal-outlook';

describe('계절 패턴 참고선 (예측 아님)', () => {
  it('산출물이 감쇠 계절 기준선이고 밴드가 값을 감싼다', () => {
    expect(skjSeasonalOutlook.kind).toBe('seasonal-baseline');
    expect(skjSeasonalOutlook.label).toContain('과거 같은 달 평균 변화');
    expect(skjSeasonalOutlook.label).not.toContain('예측');
    expect(skjSeasonalOutlook.band80[0]).toBeLessThan(skjSeasonalOutlook.value);
    expect(skjSeasonalOutlook.value).toBeLessThan(skjSeasonalOutlook.band80[1]);
    expect(skjSeasonalOutlook.recent10y.years).toBe(10);
  });

  it('기준점과 목표월 두 점에만 값을 두고 중간 주는 비운다', () => {
    const base = buildOverviewRows(bangkokWeeks, singaporeMgoAt, []);
    const rows = appendSeasonalOutlook(base, skjSeasonalOutlook);
    const withValue = rows.filter((r) => r.계절패턴 != null);
    expect(withValue).toHaveLength(2);
    expect(withValue[0].date.slice(0, 7)).toBe(skjSeasonalOutlook.asOf);
    expect(withValue[0].계절패턴).toBe(skjSeasonalOutlook.anchorPrice);
    expect(rows.at(-1)!.date.slice(0, 7)).toBe(skjSeasonalOutlook.targetMonth);
    expect(rows.at(-1)!.계절패턴).toBe(skjSeasonalOutlook.value);
    expect(rows.at(-1)!.계절밴드).toEqual([skjSeasonalOutlook.band80[0], skjSeasonalOutlook.band80[1]]);
    expect(rows.length).toBeGreaterThan(base.length);
    // 미래 행은 실측 계열이 전부 null
    expect(rows.slice(base.length).every((r) => r.방콕사무소 === null && r.재고 === null)).toBe(true);
  });
});
