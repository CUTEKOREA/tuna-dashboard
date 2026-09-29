/**
 * 키리코레 VDS 소진현황(2026-09-27) 가드.
 *
 * 원문 PDF 의 수역별 소계·총계와 대조한다. 조업일은 **수역 간 이전되지 않으므로**
 * 총 잔여일수만 보면 여유가 있어 보이지만 실제 잔량은 수역마다 따로다.
 */
import { describe, expect, it } from 'vitest';

import { kiribatiVds } from '@/lib/fleet-operations-2026-08-23';

const round = (n: number) => Math.round(n * 100) / 100;

describe('키리코레 VDS 2026-09-27', () => {
  it('기준일과 출처가 09-27 판이다', () => {
    expect(kiribatiVds.asOf).toBe('2026-09-27');
    expect(kiribatiVds.source).toContain('2026.09.27');
  });

  it('09-27 판은 원문 소계와 선박 행 합이 전부 맞아떨어진다', () => {
    /* 08-23 판에 있던 키리바시 소진 0.1일 차이가 09-27 판에 다시 나타났다
     * (행 합 408.4 대 인쇄 소계 408.3). 원문 반올림이므로 맞추지 말고 여기 적어 드러낸다. */
    const mismatches: string[] = [];
    for (const a of kiribatiVds.areas) {
      for (const k of ['allocated', 'consumed', 'remaining', 'weekly'] as const) {
        const sum = round(a.rows.reduce((acc, r) => acc + r[k], 0));
        const printed = round(a.totals[k]);
        if (printed !== sum) mismatches.push(`${a.area}/${k}:${sum}/${printed}`);
      }
    }
    expect(mismatches).toEqual(['키리바시/consumed:408.4/408.3']);
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
    // 소계 합 607.4 는 인쇄 총계 607.5 와 0.1 다르다 - 위 반올림이 총계까지 따라온다
    expect(round(counted.reduce((s, a) => s + a.totals.consumed, 0))).toBe(607.4);
    expect(kiribatiVds.totals).toEqual({ allocated: 770, consumed: 607.5, remaining: 162.5, weekly: 16.6 });
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

  it('예인 중인 MOAMARI 의 통과 소진이 한 수역에서 되돌려지고 다른 수역에서 더 붙었다', () => {
    /* 원문 각주: VMS 항적상 해당 수역에 있으면 1일 소진으로 «추정» 한다. MOAMARI 는 8/31 부터
     * 젠산으로 예인 중이라 조업을 하지 않는다. 09-20 판의 7.0일(협정 1.5 + 키리바시 1.7 + 양자 3.8)이
     * 이번 판에서 협정 -1.5 로 되돌려졌지만 양자에는 +8.9 가 새로 붙었다 - 한 방향이 아니다.
     * 추정치이므로 맞추지 않고 그대로 싣고, 비조업 통과 신고 가능 여부를 확인 대상으로 남긴다. */
    const moamari = kiribatiVds.areas
      .filter((a) => a.includedInGrandTotal)
      .flatMap((a) => a.rows.filter((r) => r.vessel === 'MOAMARI' && r.weekly !== 0).map((r) => [a.area, r.weekly]));
    expect(moamari).toEqual([['미크로네시아 협정', -1.5], ['미크로네시아 양자', 8.9]]);
    expect(round(moamari.reduce((s, [, w]) => s + (w as number), 0))).toBe(7.4);
  });

  it('초과 소진 칸을 원문 그대로 음수로 둔다', () => {
    // 0 으로 깎으면 초과가 사라진다. 원문이 음수로 적었다.
    // 09-20 판: 솔로몬/MOAMARI 는 재배분으로 빠졌고, 키리바시에서 MOAMARI(-1.55)·NAOERO STAR(-3.45)가 새로 초과,
    // PNG 양자/MOAKONA 는 배정이 27 → 22일로 줄어 -1.70 이 됐다.
    const over = kiribatiVds.areas.flatMap((a) => a.rows.filter((r) => r.remaining < 0).map((r) => `${a.area}/${r.vessel}`));
    // 09-27 판: 미크로네시아 양자에 MOAMARI 가 새로 초과로 들어왔다(주간 +8.9)
    expect(over.sort()).toEqual([
      '미크로네시아 양자/MOAMARI',
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
    // 09-27 판 주간 소모 16.6일 중 9.2일이 키리바시에서 난다(나머지는 MOAMARI 양자 8.9 - 협정 -1.5).
    expect(kiribati.totals.weekly).toBe(9.2);
    expect(kiribati.totals.weekly / kiribatiVds.totals.weekly).toBeGreaterThan(0.5);
    /* 총 잔여는 9.8주치처럼 보이지만 소모가 나는 키리바시 잔여는 0.3주치뿐이다
     * (09-13 1.54주 → 09-20 0.87주 → 09-27 0.28주). 남은 여유가 빠르게 준다. */
    const kiribatiWeeks = kiribati.totals.remaining / kiribati.totals.weekly;
    const totalWeeks = kiribatiVds.totals.remaining / kiribatiVds.totals.weekly;
    expect(kiribati.totals.remaining).toBe(2.6);
    expect(kiribatiWeeks).toBeLessThan(0.4);
    expect(totalWeeks / kiribatiWeeks).toBeGreaterThan(5);
  });

  it('공해는 전량 소진되어 잔여가 없다', () => {
    const hs = kiribatiVds.areas.find((a) => a.area === '공해')!;
    expect(hs.totals.remaining).toBe(0);
    // 09-20 판 260 → 09-27 판 271. 공해 조업이 이어진 만큼 배정도 따라 올라간다
    expect(hs.totals.allocated).toBe(271);
    for (const r of hs.rows) expect(r.remaining).toBe(0);
  });
});
