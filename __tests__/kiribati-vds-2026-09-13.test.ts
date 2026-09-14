/**
 * 키리코레 VDS 소진현황(2026-09-13) 가드.
 *
 * 원문 PDF 의 수역별 소계·총계와 대조한다. 조업일은 **수역 간 이전되지 않으므로**
 * 총 잔여일수만 보면 여유가 있어 보이지만 실제 잔량은 수역마다 따로다.
 */
import { describe, expect, it } from 'vitest';

import { kiribatiVds } from '@/lib/fleet-operations-2026-08-23';

const round = (n: number) => Math.round(n * 100) / 100;

describe('키리코레 VDS 2026-09-13', () => {
  it('기준일과 출처가 09-13 판이다', () => {
    expect(kiribatiVds.asOf).toBe('2026-09-13');
    expect(kiribatiVds.source).toContain('2026.09.13');
  });

  it('09-13 판은 원문 소계와 선박 행 합이 전부 맞아떨어진다', () => {
    // 08-23 판에는 키리바시 소진에서 0.1일 차이가 있었다. 09-06·09-13 판은 없다 —
    // 생기면 원문이 반올림한 것이므로 맞추지 말고 여기 목록에 적어 드러낸다.
    const mismatches: string[] = [];
    for (const a of kiribatiVds.areas) {
      for (const k of ['allocated', 'consumed', 'remaining', 'weekly'] as const) {
        const sum = round(a.rows.reduce((acc, r) => acc + r[k], 0));
        const printed = round(a.totals[k]);
        if (printed !== sum) mismatches.push(`${a.area}/${k}:${sum}/${printed}`);
      }
    }
    expect(mismatches).toEqual([]);
  });

  it('잔여일 = 배정일 − 소진일', () => {
    for (const a of kiribatiVds.areas) {
      for (const r of a.rows) {
        expect(round(r.remaining), `${a.area}/${r.vessel}`).toBe(round(r.allocated - r.consumed));
      }
    }
  });

  it('키리바시 배정이 척당 95.25 → 102.75일로 늘어 총계가 770일이 됐다', () => {
    // 09-06 판 381일(4척 × 95.25) → 09-13 판 411일(4척 × 102.75). 원문 배정일 자체가 늘었다.
    const kiribati = kiribatiVds.areas.find((a) => a.area === '키리바시')!;
    expect(kiribati.rows.map((r) => r.allocated)).toEqual([102.75, 102.75, 102.75, 102.75]);
    expect(kiribati.totals.allocated).toBe(411);

    // 원문이 「소진일수에서 제외」라 적은 공해는 총계에 안 들어간다. 더하면 1,021 로 불어난다.
    const counted = kiribatiVds.areas.filter((a) => a.area !== '공해');
    expect(round(counted.reduce((s, a) => s + a.totals.allocated, 0))).toBe(770);
    expect(round(counted.reduce((s, a) => s + a.totals.consumed, 0))).toBe(575.8);
    expect(kiribatiVds.totals).toEqual({ allocated: 770, consumed: 575.8, remaining: 194.2, weekly: 16.5 });
  });

  it('초과 소진 4칸을 원문 그대로 음수로 둔다', () => {
    // 0 으로 깎으면 초과가 사라진다. 원문이 음수로 적었다.
    // 09-06 판의 키리바시/MOAMARI(-6.65)는 배정이 늘면서 +0.15 로 돌아섰다.
    const over = kiribatiVds.areas.flatMap((a) => a.rows.filter((r) => r.remaining < 0).map((r) => `${a.area}/${r.vessel}`));
    expect(over.sort()).toEqual([
      '미크로네시아 양자/NAOERO SUN',
      '솔로몬제도 양자/MOAMARI',
      '키리바시/MOAKONA',
      '투발루 양자/NAOERO STAR',
    ]);
  });

  it('소모는 키리바시에 몰려 있다 - 총 잔여로 읽으면 안 된다', () => {
    const kiribati = kiribatiVds.areas.find((a) => a.area === '키리바시')!;
    // 총계에 드는 주간 소모 전량이 키리바시에서 난다.
    expect(kiribati.totals.weekly).toBe(kiribatiVds.totals.weekly);
    // 총 잔여는 11.8주치처럼 보이지만 소모가 나는 수역의 잔여는 1.5주치뿐이다
    // (09-06 판 1.2주 대 18.1주 → 배정 증가로 09-13 판 1.54주 대 11.77주).
    const kiribatiWeeks = kiribati.totals.remaining / kiribati.totals.weekly;
    const totalWeeks = kiribatiVds.totals.remaining / kiribatiVds.totals.weekly;
    expect(kiribati.totals.remaining).toBe(25.4);
    expect(kiribatiWeeks).toBeLessThan(2);
    expect(totalWeeks / kiribatiWeeks).toBeGreaterThan(5);
  });

  it('공해는 전량 소진되어 잔여가 없다', () => {
    const hs = kiribatiVds.areas.find((a) => a.area === '공해')!;
    expect(hs.totals.remaining).toBe(0);
    expect(hs.totals.allocated).toBe(251);
    for (const r of hs.rows) expect(r.remaining).toBe(0);
  });
});
