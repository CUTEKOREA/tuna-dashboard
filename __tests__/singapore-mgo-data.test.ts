import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

type Payload = {
  meta: { grade: string; unit: string; first: string; last: string; dailyRows: number; weeklyRows: number; dailySha256: string };
  daily: [string, number][];
  weekly: [string, number, string][];
};

const payload = JSON.parse(readFileSync(join(process.cwd(), 'public/data/singapore_mgo.json'), 'utf8')) as Payload;

describe('싱가포르 MGO 시세 인테이크', () => {
  it('일별 종가가 오름차순이고 결측을 0으로 채우지 않는다', () => {
    const dates = payload.daily.map(([d]) => d);
    expect([...dates].sort()).toEqual(dates);
    expect(new Set(dates).size).toBe(dates.length);
    expect(payload.daily.every(([, v]) => Number.isFinite(v) && v > 0)).toBe(true);
    expect(payload.meta.dailyRows).toBe(payload.daily.length);
    expect(payload.meta.unit).toBe('USD/MT');
  });

  // 2026-09-02 동기화 최신행 고정 — 회귀 시 여기서 잡는다.
  it('2026-09-01까지 3년치가 있고 최신 종가는 $1,222.5/t다', () => {
    expect(payload.meta.first).toBe('2023-09-01');
    expect(payload.meta.last).toBe('2026-09-01');
    expect(payload.daily.at(-1)).toEqual(['2026-09-01', 1222.5]);
    expect(payload.daily.find(([d]) => d === '2026-04-06')?.[1]).toBe(2064);
    expect(payload.daily.find(([d]) => d === '2026-01-08')?.[1]).toBe(593.5);
  });

  it('주간 행은 전부 화요일이고 사용한 영업일은 4일 이내다', () => {
    for (const [tue, , used] of payload.weekly) {
      expect(new Date(`${tue}T00:00:00Z`).getUTCDay()).toBe(2);
      const gap = (Date.parse(`${tue}T00:00:00Z`) - Date.parse(`${used}T00:00:00Z`)) / 86_400_000;
      expect(gap).toBeGreaterThanOrEqual(0);
      expect(gap).toBeLessThanOrEqual(4);
    }
    expect(payload.weekly.at(-1)).toEqual(['2026-09-01', 1222.5, '2026-09-01']);
  });
});
