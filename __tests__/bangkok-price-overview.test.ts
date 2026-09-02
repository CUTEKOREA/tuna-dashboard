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
