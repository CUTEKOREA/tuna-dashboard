/**
 * 키리코레 VDS 소진현황(2026-08-23) 가드.
 *
 * 원문 PDF 의 수역별 소계·총계와 대조한다. 조업일은 **수역 간 이전되지 않으므로**
 * 총 잔여일수만 보면 여유가 있어 보이지만 실제 잔량은 수역마다 따로다.
 */
import { describe, expect, it } from 'vitest';

import { kiribatiVds } from '@/lib/fleet-operations-2026-08-16';

const round = (n: number) => Math.round(n * 100) / 100;

describe('키리코레 VDS 2026-08-23', () => {
  it('기준일과 출처가 08-23 판이다', () => {
    expect(kiribatiVds.asOf).toBe('2026-08-23');
    expect(kiribatiVds.source).toContain('2026.08.23');
  });

  it('원문 소계와 선박 행 합의 0.1일 차이를 숨기지 않는다', () => {
    const mismatches: string[] = [];
    for (const a of kiribatiVds.areas) {
      for (const k of ['allocated', 'consumed', 'remaining', 'weekly'] as const) {
        const sum = round(a.rows.reduce((acc, r) => acc + r[k], 0));
        const printed = round(a.totals[k]);
        if (printed !== sum) mismatches.push(`${a.area}/${k}:${sum}/${printed}`);
      }
    }
    expect(mismatches).toEqual(['키리바시/consumed:352.8/352.7']);
  });

  it('잔여일 = 배정일 − 소진일', () => {
    for (const a of kiribatiVds.areas) {
      for (const r of a.rows) {
        expect(round(r.remaining), `${a.area}/${r.vessel}`).toBe(round(r.allocated - r.consumed));
      }
    }
  });

  it('총계 750일에 공해는 들어가지 않는다', () => {
    // 원문이 「소진일수에서 제외」라 적었다. 더하면 배정일이 972 로 불어난다.
    const counted = kiribatiVds.areas.filter((a) => a.area !== '공해');
    expect(round(counted.reduce((s, a) => s + a.totals.allocated, 0))).toBe(750);
    // 인쇄 수역 소계는 542.9일이지만 원문 총계는 543.0일이다. 둘 다 원문대로 둔다.
    expect(round(counted.reduce((s, a) => s + a.totals.consumed, 0))).toBe(542.9);
    expect(kiribatiVds.totals).toEqual({ allocated: 750, consumed: 543, remaining: 207, weekly: 6.5 });
  });

  it('초과 소진 4칸을 원문 그대로 음수로 둔다', () => {
    // 0 으로 깎으면 초과가 사라진다. 원문이 음수로 적었다.
    const over = kiribatiVds.areas.flatMap((a) => a.rows.filter((r) => r.remaining < 0).map((r) => `${a.area}/${r.vessel}`));
    expect(over.sort()).toEqual([
      '미크로네시아 양자/NAOERO SUN',
      '솔로몬제도 양자/MOAMARI',
      '키리바시/MOAMARI',
      '투발루 양자/NAOERO STAR',
    ]);
  });

  it('소모는 키리바시에 몰려 있다 — 총 잔여로 읽으면 안 된다', () => {
    const kiribati = kiribatiVds.areas.find((a) => a.area === '키리바시')!;
    // 주간 소모 전량이 키리바시에서 난다.
    expect(kiribati.totals.weekly).toBe(kiribatiVds.totals.weekly);
    // 총 잔여는 31.8주치처럼 보이지만, 소모가 나는 수역의 잔여는 4.3주치뿐이다.
    expect(kiribati.totals.remaining).toBe(28.2);
    expect(kiribati.totals.remaining / kiribati.totals.weekly).toBeLessThan(5);
    expect(kiribatiVds.totals.remaining / kiribatiVds.totals.weekly).toBeGreaterThan(30);
  });

  it('공해는 전량 소진되어 잔여가 없다', () => {
    const hs = kiribatiVds.areas.find((a) => a.area === '공해')!;
    expect(hs.totals.remaining).toBe(0);
    expect(hs.totals.allocated).toBe(222);
    for (const r of hs.rows) expect(r.remaining).toBe(0);
  });
});
