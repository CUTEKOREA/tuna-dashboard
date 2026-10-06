/**
 * 키리코레 VDS 소진현황(2026-10-05) 가드.
 *
 * 원문 PDF 의 수역별 소계·총계와 대조한다. 조업일은 **수역 간 이전되지 않으므로**
 * 총 잔여일수만 보면 여유가 있어 보이지만 실제 잔량은 수역마다 따로다.
 */
import { describe, expect, it } from 'vitest';

import { kiribatiVds, nationalVds } from '@/lib/fleet-operations-2026-08-23';

const round = (n: number) => Math.round(n * 100) / 100;
const areaOf = (name: string) => kiribatiVds.areas.find((a) => a.area === name)!;

describe('키리코레 VDS 2026-10-05', () => {
  it('기준일과 출처가 10-05 판이다', () => {
    expect(kiribatiVds.asOf).toBe('2026-10-05');
    expect(kiribatiVds.source).toContain('2026.10.05');
  });

  it('원문 소계와 선박 행 합의 차이를 드러낸다', () => {
    /* 10-05 판은 키리바시 소진 0.1일 차이(09-27 판 408.4 대 408.3)가 사라졌다.
     * 대신 솔로몬 양자 배정이 척당 2.875일인데 2.88 로 인쇄돼 행 합 11.52 대 소계 11.50 이다. 맞추지 않는다. */
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

  it('솔로몬 22.5일이 키리코레 양자에서 국적선으로 옮겨 갔다', () => {
    // 키리코레 솔로몬 양자 34 → 11.5일(척당 8.5 → 2.88), 같은 판 국적선 솔로몬 44 → 66.5일(척당 7.33 → 11.08).
    const kfc = areaOf('솔로몬제도 양자');
    const nat = nationalVds.areas.find((a) => a.area === '솔로몬제도')!;
    expect(kfc.totals.allocated).toBe(11.5);
    expect(nat.totals.allocated).toBe(66.5);
    expect(round((34 - kfc.totals.allocated) - (nat.totals.allocated - 44))).toBe(0);
  });

  it('키리바시 배정이 척당 102.75 → 107.75일로 늘었다 - 총계는 770 → 767.5일', () => {
    const kiribati = areaOf('키리바시');
    expect(kiribati.rows.map((r) => r.allocated)).toEqual([107.75, 107.75, 107.75, 107.75]);
    expect(kiribati.totals.allocated).toBe(431);
    // 키리바시 +20, 솔로몬 양자 −22.5 → 총 −2.5. 공해(「소진일수에서 제외」)는 더하지 않는다.
    const counted = kiribatiVds.areas.filter((a) => a.includedInGrandTotal);
    expect(round(counted.reduce((s, a) => s + a.totals.allocated, 0))).toBe(767.5);
    expect(round(counted.reduce((s, a) => s + a.totals.consumed, 0))).toBe(607.8);
    expect(kiribatiVds.totals).toEqual({ allocated: 767.5, consumed: 607.8, remaining: 159.7, weekly: 9.3 });
  });

  it('예인 중이던 MOAMARI 의 키리바시 통과 소진 4.4일이 되돌려졌다', () => {
    /* 원문 각주: VMS 항적상 해당 수역에 있으면 1일 소진으로 «추정» 한다. 09-27 판 104.3일이 99.9일로
     * 줄어 키리바시 초과(-1.55)가 7.85일 여유로 바뀌었다. 미크로네시아 협정은 +2.3 이 새로 붙었다. */
    const moamari = areaOf('키리바시').rows.find((r) => r.vessel === 'MOAMARI')!;
    expect(moamari).toEqual({ vessel: 'MOAMARI', allocated: 107.75, consumed: 99.9, remaining: 7.85, weekly: -4.4 });
    expect(areaOf('미크로네시아 협정').rows.find((r) => r.vessel === 'MOAMARI')!.weekly).toBe(2.3);
  });

  it('초과 소진 칸을 원문 그대로 음수로 둔다', () => {
    const over = kiribatiVds.areas.flatMap((a) => a.rows.filter((r) => r.remaining < 0).map((r) => `${a.area}/${r.vessel}`));
    // 10-05 판: 키리바시/MOAMARI 가 빠지고, 배정이 줄어든 솔로몬 양자에서 MOAMARI·NAOERO SUN 이 새로 초과
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

  it('이번 주 키리바시 소모는 음수(되돌림)라 잔여 주수로 읽지 않는다', () => {
    // 주간 9.3일은 협정 2.3 + 미크로네시아 양자 8.9(09-27 판과 같은 값) + 키리바시 −1.9 이다.
    const kiribati = areaOf('키리바시');
    expect(kiribati.totals.weekly).toBe(-1.9);
    expect(kiribati.totals.remaining).toBe(24.5);
    expect(areaOf('미크로네시아 양자').totals.weekly).toBe(8.9);
  });

  it('공해는 전량 소진되어 잔여가 없다', () => {
    const hs = areaOf('공해');
    expect(hs.totals.remaining).toBe(0);
    // 09-27 판 271 → 10-05 판 284. 공해 조업이 이어진 만큼 배정도 따라 올라간다
    expect(hs.totals.allocated).toBe(284);
    for (const r of hs.rows) expect(r.remaining).toBe(0);
  });
});
