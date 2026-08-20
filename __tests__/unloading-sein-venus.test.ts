/**
 * SEIN VENUS 2026-08 방콕 하역 항차 가드.
 *
 * 이 항차에서 틀리기 쉬운 곳.
 *   ① **진행 중이다.** 누계를 최종 실적으로, 차이를 과부족으로 읽으면 안 된다.
 *   ② 기록 없는 날을 0 톤 하역으로 채우면 「일했는데 못 실었다」가 된다.
 *   ③ 합계는 89.9% 인데 어종 구성은 이미 어긋나 있다 — 합계만 보면 안 보인다.
 */
import { describe, expect, it } from 'vitest';

import { UNLOADING_STATIC_VESSELS, seinVenus } from '@/lib/data/unloading-static';

const V = UNLOADING_STATIC_VESSELS['sein-venus'];

describe('SEIN VENUS 항차 정합', () => {
  it('원장에 실려 있다', () => {
    expect(V).toBeDefined();
    expect(V.name).toBe('M/V SEIN VENUS');
    expect(V.location).toBe('BANGKOK, THAILAND');
  });

  it('일일 하역량을 누적하면 최종 누계가 나온다', () => {
    const sum = V.timeline.reduce((a, t) => a + t.dailyAmount, 0);
    expect(Number(sum.toFixed(2))).toBe(Number(V.actualTotal.toFixed(2)));
  });

  it('누계 열이 실제 누적과 일치한다', () => {
    let run = 0;
    for (const t of V.timeline) {
      run = Number((run + t.dailyAmount).toFixed(3));
      expect(Number(t.cumAmount.toFixed(3)), t.date).toBe(run);
    }
  });

  it('원선 4척의 보고량 합이 총 보고량과 같다', () => {
    const sum = seinVenus.원선별.reduce((a, v) => a + v.보고, 0);
    expect(sum).toBe(seinVenus.요약.본선보고총량);
    expect(sum).toBe(3275);
  });

  it('원선 누계 합이 하역 누계와 같다', () => {
    const sum = seinVenus.원선별.reduce((a, v) => a + v.누계, 0);
    expect(Number(sum.toFixed(2))).toBe(Number(seinVenus.요약.하역누계.toFixed(2)));
  });

  it('하역처 계획 합이 총 보고량과 같다', () => {
    const sum = seinVenus.하역처계획.reduce((a, p) => a + p.plannedMt, 0);
    expect(sum).toBe(3275);
  });

  it('일자별 하역처 배분 합이 그날 하역량과 같다', () => {
    for (const d of seinVenus.일자별) {
      const a = d.하역처.reduce((t, x) => t + x.amountMt, 0);
      expect(Number(a.toFixed(2)), d.label).toBe(Number(d.daily.toFixed(2)));
    }
  });
});

describe('진행 중 항차로 다룬다', () => {
  it('상태가 하역중이고 진척률이 100 % 미만이다', () => {
    expect(V.status).toContain('하역중');
    expect(seinVenus.요약.진척률).toBeLessThan(100);
    expect(seinVenus.요약.진척률).toBe(89.9);
  });

  it('과부족을 확정하지 않는다', () => {
    // 아직 안 내린 물량이 섞여 있다. 완료 항차의 surplus 와 같은 뜻이 아니다.
    expect(V.surplus).toBe(0);
    expect(V.speciesBreakdownNote).toMatch(/진행 중/);
  });

  it('잔량 = 보고 − 누계이고 전부 S/PIO 몫이다', () => {
    expect(seinVenus.요약.잔량).toBe(331.73);
    const open = seinVenus.원선별.filter((v) => !v.완료);
    expect(open.map((v) => v.원선)).toEqual(['S/PIO']);
    // 미완 원선의 잔량(375.83)이 총 잔량보다 크다 — 끝난 배들이 초과 인도했기 때문이다.
    expect(open[0].잔량).toBeGreaterThan(seinVenus.요약.잔량);
  });

  it('완료 원선 3척은 잔량이 0 이하이거나 확정됐다', () => {
    const done = seinVenus.원선별.filter((v) => v.완료);
    expect(done).toHaveLength(3);
    expect(done.map((v) => v.원선).sort()).toEqual(['N/STAR', 'N/SUN', 'S/SPR']);
  });
});

describe('어종 구성', () => {
  it('어종별 보고량 합이 총 보고량과 같다', () => {
    const sum = V.species.reduce((a, s) => a + s.reported, 0);
    expect(sum).toBe(3275);
  });

  it('어종별 누계 합이 하역 누계와 같다', () => {
    const sum = V.species.reduce((a, s) => a + s.actual, 0);
    expect(Number(sum.toFixed(2))).toBe(Number(V.actualTotal.toFixed(2)));
  });

  it('합계는 미달인데 황다랑어는 이미 초과했다', () => {
    // 합계만 보면 89.9% 진행이라 아무 문제 없어 보인다. 어종을 나눠야 보인다.
    const yf = V.species.find((s) => s.id === 'YF')!;
    const sj = V.species.find((s) => s.id === 'SJ')!;
    expect(yf.surplus).toBeGreaterThan(0);
    expect(sj.surplus).toBeLessThan(0);
    expect(yf.surplus).toBe(82.98);
    expect(sj.surplus).toBe(-414.71);
  });
});

describe('결측을 0 으로 채우지 않는다', () => {
  it('기록 없는 날은 시간축에 들어가지 않는다', () => {
    // 8/9·8/12·8/16 은 원자료에 시트가 없다. 0 톤 행을 만들면 「일했는데 못 실었다」가 된다.
    expect(seinVenus.무하역일.map((g) => g.label)).toEqual(['8/9', '8/12', '8/16']);
    const dates = new Set(V.timeline.map((t) => t.date));
    for (const g of seinVenus.무하역일) expect(dates.has(g.label), g.label).toBe(false);
    expect(V.timeline).toHaveLength(10);
  });

  it('0 톤 하역 행이 없다', () => {
    for (const t of V.timeline) expect(t.dailyAmount, t.date).toBeGreaterThan(0);
  });

  it('작업시간이 없는 날은 채우지 않고 그 사실을 적는다', () => {
    const withHours = V.timeline.filter((t) => t.time !== '-');
    expect(withHours).toHaveLength(3);
    expect(withHours.map((t) => t.date).sort()).toEqual(['8/14', '8/18', '8/19']);
    for (const t of V.timeline.filter((x) => x.time === '-')) {
      expect(t.quality, t.date).toMatch(/기록이 없습니다/);
    }
  });

  it('온도 기록이 있는 날만 관측이 붙는다', () => {
    for (const t of V.timeline) {
      if (t.time === '-') expect(t.observations, t.date).toBeUndefined();
      else expect(t.observations?.length, t.date).toBeGreaterThan(0);
    }
  });
});

describe('출처 표기', () => {
  it('하역사 수기 보고서를 수치 출처로 쓰지 않았다고 밝힌다', () => {
    expect(seinVenus._meta.주의).toMatch(/THAICEN/);
    expect(seinVenus._meta.주의).toMatch(/맞지 않/);
  });

  it('진행 중임을 메타에 남긴다', () => {
    expect(seinVenus._meta.진행상태).toMatch(/진행 중/);
  });

  it('무하역일이 0 톤이 아님을 밝힌다', () => {
    expect(seinVenus._meta.무하역일).toMatch(/기록 없음/);
  });
});
