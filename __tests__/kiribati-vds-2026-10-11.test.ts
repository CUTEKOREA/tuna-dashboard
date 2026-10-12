/**
 * 키리코레·국적선 VDS 소진현황(2026-10-11) 가드.
 *
 * 원문 PDF 의 수역별 소계·총계와 대조한다. 조업일은 **수역 간 이전되지 않으므로**
 * 총 잔여일수만 보면 여유가 있어 보이지만 실제 잔량은 수역마다 따로다.
 */
import { describe, expect, it } from 'vitest';

import { kiribatiVds, nationalVds } from '@/lib/fleet-operations-2026-08-23';

const round = (n: number) => Math.round(n * 100) / 100;
const areaOf = (name: string) => kiribatiVds.areas.find((a) => a.area === name)!;
const natArea = (name: string) => nationalVds.areas.find((a) => a.area === name)!;

describe('키리코레 VDS 2026-10-11', () => {
  it('기준일과 출처가 10-11 판이다', () => {
    expect(kiribatiVds.asOf).toBe('2026-10-11');
    expect(kiribatiVds.source).toContain('2026.10.11');
    expect(nationalVds.asOf).toBe('2026-10-11');
    expect(nationalVds.source).toContain('2026.10.11');
  });

  it('원문 소계와 선박 행 합의 차이를 드러낸다', () => {
    // 솔로몬 양자 배정이 척당 2.875일인데 2.88 로 인쇄돼 행 합 11.52 대 소계 11.50 이다. 맞추지 않는다.
    const mismatches: string[] = [];
    for (const a of kiribatiVds.areas) {
      for (const k of ['allocated', 'consumed', 'remaining', 'weekly'] as const) {
        const sum = round(a.rows.reduce((acc, r) => acc + r[k], 0));
        const printed = round(a.totals[k]);
        if (printed !== sum) mismatches.push(`${a.area}/${k}:${sum}/${printed}`);
      }
    }
    expect(mismatches).toEqual(['솔로몬제도 양자/allocated:11.52/11.5']);
  });

  it('잔여일 = 배정일 − 소진일 (인쇄 자릿수 0.01 안에서)', () => {
    // 솔로몬 양자는 실제 배정 2.875 기준으로 잔여를 찍어 2.88 − 3.5 = −0.62 가 −0.63 으로 나온다.
    for (const a of kiribatiVds.areas) {
      for (const r of a.rows) {
        expect(Math.abs(round(r.remaining) - round(r.allocated - r.consumed)), `${a.area}/${r.vessel}`).toBeLessThanOrEqual(0.0101);
      }
    }
  });

  it('공해 밖 배정은 10-05 판 그대로다 - 총계 767.5일', () => {
    // 10-05 판의 키리바시 +20 · 솔로몬 양자 −22.5 재배분 뒤로 이번 판은 배정을 옮기지 않았다.
    expect(areaOf('키리바시').rows.map((r) => r.allocated)).toEqual([107.75, 107.75, 107.75, 107.75]);
    expect(areaOf('솔로몬제도 양자').totals.allocated).toBe(11.5);
    expect(natArea('솔로몬제도').totals.allocated).toBe(66.5);
    const counted = kiribatiVds.areas.filter((a) => a.includedInGrandTotal);
    expect(round(counted.reduce((s, a) => s + a.totals.allocated, 0))).toBe(767.5);
    expect(round(counted.reduce((s, a) => s + a.totals.consumed, 0))).toBe(614.2);
    expect(kiribatiVds.totals).toEqual({ allocated: 767.5, consumed: 614.2, remaining: 153.3, weekly: 6.4 });
  });

  it('상가수리 중인 MOAMARI 는 전 수역 주간 소모가 0 이다', () => {
    // 10-05 판의 미크로네시아 양자 8.9(09-27 판 값을 이어 적은 것)도 0 으로 돌아왔다.
    const moamari = kiribatiVds.areas.flatMap((a) => a.rows.filter((r) => r.vessel === 'MOAMARI'));
    expect(moamari.map((r) => r.weekly)).toEqual(moamari.map(() => 0));
    expect(areaOf('키리바시').rows.find((r) => r.vessel === 'MOAMARI')!.consumed).toBe(99.9);
    expect(areaOf('미크로네시아 양자').totals.weekly).toBe(0);
  });

  it('이번 주 소모는 키리바시 6.4일뿐이다', () => {
    const kiribati = areaOf('키리바시');
    expect(kiribati.totals).toEqual({ allocated: 431, consumed: 412.9, remaining: 18.1, weekly: 6.4 });
    expect(kiribati.rows.find((r) => r.vessel === 'MOAKONA')).toEqual({ vessel: 'MOAKONA', allocated: 107.75, consumed: 125.7, remaining: -17.95, weekly: 4.9 });
  });

  it('초과 소진 칸을 원문 그대로 음수로 둔다', () => {
    const over = kiribatiVds.areas.flatMap((a) => a.rows.filter((r) => r.remaining < 0).map((r) => `${a.area}/${r.vessel}`));
    expect(over.sort()).toEqual([
      '미크로네시아 양자/MOAMARI',
      '미크로네시아 양자/NAOERO SUN',
      '솔로몬제도 양자/MOAMARI',
      '솔로몬제도 양자/NAOERO SUN',
      '키리바시/MOAKONA',
      '키리바시/NAOERO STAR',
      '투발루 양자/NAOERO STAR',
      '파푸아뉴기니 양자/MOAKONA',
    ]);
  });

  it('공해는 전량 소진되어 잔여가 없고, 소진 증가가 주간 소모보다 2일 적다', () => {
    const hs = areaOf('공해');
    expect(hs.totals).toEqual({ allocated: 294, consumed: 294, remaining: 0, weekly: 12 });
    for (const r of hs.rows) expect(r.remaining).toBe(0);
    // 10-05 판 284 → 294(+10) 인데 주간 소모 12 - MOAKONA 58 → 59(주간 2) · NAOERO STAR 72 → 78(주간 7)
    expect(round(hs.totals.consumed - 284)).toBe(10);
  });
});

describe('국적선 VDS 2026-10-11', () => {
  it('소진 증가와 주간 소모가 1.0일씩 어긋나는 칸 2개를 원문 그대로 둔다', () => {
    // 10-05 판 대비: PNG S/CHA 37.4 → 39.5(+2.1) 대 주간 3.1, 솔로몬 S/HAR 12.8 → 14.6(+1.8) 대 주간 2.8
    expect(natArea('파푸아뉴기니').rows.find((r) => r.vessel === 'S/CHA')).toMatchObject({ consumed: 39.5, weekly: 3.1 });
    expect(natArea('솔로몬제도').rows.find((r) => r.vessel === 'S/HAR')).toMatchObject({ consumed: 14.6, weekly: 2.8 });
    expect(round(nationalVds.totals.consumed - 1_239.1)).toBe(18.3);
    expect(nationalVds.totals.weekly).toBe(20.3);
  });
});
