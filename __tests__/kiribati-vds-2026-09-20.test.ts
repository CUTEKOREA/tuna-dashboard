/**
 * 키리코레 VDS 소진현황(2026-09-20) 가드.
 *
 * 원문 PDF 의 수역별 소계·총계와 대조한다. 조업일은 **수역 간 이전되지 않으므로**
 * 총 잔여일수만 보면 여유가 있어 보이지만 실제 잔량은 수역마다 따로다.
 */
import { describe, expect, it } from 'vitest';

import { kiribatiVds } from '@/lib/fleet-operations-2026-08-23';

const round = (n: number) => Math.round(n * 100) / 100;

describe('키리코레 VDS 2026-09-20', () => {
  it('기준일과 출처가 09-20 판이다', () => {
    expect(kiribatiVds.asOf).toBe('2026-09-20');
    expect(kiribatiVds.source).toContain('2026.09.20');
  });

  it('09-20 판은 원문 소계와 선박 행 합이 전부 맞아떨어진다', () => {
    // 08-23 판에는 키리바시 소진에서 0.1일 차이가 있었다. 09-06·09-13·09-20 판은 없다 —
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
    expect(round(counted.reduce((s, a) => s + a.totals.consumed, 0))).toBe(594.7);
    expect(kiribatiVds.totals).toEqual({ allocated: 770, consumed: 594.7, remaining: 175.3, weekly: 18.9 });
  });

  it('09-20 판에서 PNG 양자 20일이 솔로몬 양자로 옮겨졌다 - 총 배정 770일은 그대로', () => {
    // 척당 PNG 27 → 22일(108 → 88), 솔로몬 3.5 → 8.5일(14 → 34). 새로 받은 일수가 아니라 수역 간 재배분이다.
    const png = kiribatiVds.areas.find((a) => a.area === '파푸아뉴기니 양자')!;
    const solomon = kiribatiVds.areas.find((a) => a.area === '솔로몬제도 양자')!;
    expect(png.rows.map((r) => r.allocated)).toEqual([22, 22, 22, 22]);
    expect(solomon.rows.map((r) => r.allocated)).toEqual([8.5, 8.5, 8.5, 8.5]);
    expect(png.totals.allocated + solomon.totals.allocated).toBe(108 + 14);
    // 솔로몬에서 초과였던 MOAMARI(-0.1)가 재배분으로 4.9일 여유가 됐다
    expect(solomon.rows.find((r) => r.vessel === 'MOAMARI')!.remaining).toBe(4.9);
  });

  it('예인 중인 MOAMARI 가 이번 주에도 VDS 를 7일 소진했다', () => {
    /* 원문 각주: VMS 항적상 해당 수역에 있으면 1일 소진으로 «추정» 한다. MOAMARI 는 8/31 부터
     * 젠산으로 예인 중이라 조업을 하지 않는데, 통과 수역(미크로네시아 협정·키리바시·미크로네시아 양자)에서
     * 주간 소모가 1.5 + 1.7 + 3.8 = 7.0일 잡혔다. 비조업 통과로 신고해 뺄 수 있는지가 확인 대상이다. */
    const moamariWeekly = kiribatiVds.areas
      .filter((a) => a.includedInGrandTotal)
      .flatMap((a) => a.rows.filter((r) => r.vessel === 'MOAMARI' && r.weekly > 0).map((r) => [a.area, r.weekly]));
    expect(moamariWeekly).toEqual([['미크로네시아 협정', 1.5], ['키리바시', 1.7], ['미크로네시아 양자', 3.8]]);
    expect(round(moamariWeekly.reduce((s, [, w]) => s + (w as number), 0))).toBe(7);
  });

  it('초과 소진 칸을 원문 그대로 음수로 둔다', () => {
    // 0 으로 깎으면 초과가 사라진다. 원문이 음수로 적었다.
    // 09-20 판: 솔로몬/MOAMARI 는 재배분으로 빠졌고, 키리바시에서 MOAMARI(-1.55)·NAOERO STAR(-3.45)가 새로 초과,
    // PNG 양자/MOAKONA 는 배정이 27 → 22일로 줄어 -1.70 이 됐다.
    const over = kiribatiVds.areas.flatMap((a) => a.rows.filter((r) => r.remaining < 0).map((r) => `${a.area}/${r.vessel}`));
    expect(over.sort()).toEqual([
      '미크로네시아 양자/NAOERO SUN',
      '키리바시/MOAKONA',
      '키리바시/MOAMARI',
      '키리바시/NAOERO STAR',
      '투발루 양자/NAOERO STAR',
      '파푸아뉴기니 양자/MOAKONA',
    ]);
  });

  it('소모는 키리바시에 몰려 있다 - 총 잔여로 읽으면 안 된다', () => {
    const kiribati = kiribatiVds.areas.find((a) => a.area === '키리바시')!;
    // 09-20 판 주간 소모 18.9일 중 13.6일이 키리바시에서 난다(나머지는 MOAMARI 예인 통과분).
    expect(kiribati.totals.weekly).toBe(13.6);
    expect(kiribati.totals.weekly / kiribatiVds.totals.weekly).toBeGreaterThan(0.7);
    // 총 잔여는 9.3주치처럼 보이지만 소모가 나는 수역의 잔여는 0.9주치뿐이다
    // (09-13 판 1.54주 대 11.77주 → 09-20 판 0.87주 대 9.28주).
    const kiribatiWeeks = kiribati.totals.remaining / kiribati.totals.weekly;
    const totalWeeks = kiribatiVds.totals.remaining / kiribatiVds.totals.weekly;
    expect(kiribati.totals.remaining).toBe(11.8);
    expect(kiribatiWeeks).toBeLessThan(1);
    expect(totalWeeks / kiribatiWeeks).toBeGreaterThan(5);
  });

  it('공해는 전량 소진되어 잔여가 없다', () => {
    const hs = kiribatiVds.areas.find((a) => a.area === '공해')!;
    expect(hs.totals.remaining).toBe(0);
    expect(hs.totals.allocated).toBe(260);
    for (const r of hs.rows) expect(r.remaining).toBe(0);
  });
});
