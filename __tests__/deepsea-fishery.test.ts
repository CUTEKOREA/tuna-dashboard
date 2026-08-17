/**
 * 원양어업통계조사(승인 제114048호) 인테이크의 가드.
 *
 * 이 자료에는 조용히 틀리기 쉬운 구석이 셋 있다.
 *   1. **원양만 담는다.** 오징어 페이지의 다른 단계는 FAO 생산 통계라 더할 수 없다.
 *   2. **해역이 계층이다.** 「대서양」 안에 「서남부」가 들어 있어 막대를 더하면 이중계상이다.
 *   3. **생산금액이 독립 측정이 아니다.** 2021~2024년이 톤당 6,667천원으로 고정돼 있어
 *      단가 차트를 만들면 뜻 없는 평선이 나온다 — 그래서 만들지 않았고, 그 사실을 여기 박는다.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  deepseaMeta,
  latestYear,
  southeastPacific,
  SPRFMO_2024,
  squidAllGearTotal,
  squidByArea,
  squidBySizeBand,
  squidGearSeries,
  SQUID_GEAR,
  table,
  years,
} from '@/lib/data/deepsea-fishery';

const ROOT = join(__dirname, '..');

describe('원양어업통계조사 인테이크', () => {
  it('18개 표가 모두 실려 있다', () => {
    const raw = JSON.parse(
      readFileSync(join(ROOT, 'public/data/deepsea_fishery_v1.json'), 'utf8'),
    ) as { tables: Record<string, unknown[]> };
    expect(Object.keys(raw.tables)).toHaveLength(18);
    for (const [name, rows] of Object.entries(raw.tables)) {
      expect(rows.length, `${name} 표가 비었다`).toBeGreaterThan(0);
    }
  });

  it('오징어채낚기 업종 시계열이 연도순으로 나온다', () => {
    const s = squidGearSeries();
    expect(s.length).toBeGreaterThanOrEqual(5);
    expect(s.map((p) => p.연도)).toEqual([...s.map((p) => p.연도)].sort());
    for (const p of s) expect(p.생산량, `${p.연도} 생산량 없음`).toBeGreaterThan(0);
  });

  /**
   * 이 일치가 이 자료를 믿는 근거다. KOSIS(해수부 전수조사)의 태평양 동남부 오징어류와
   * SPRFMO 과학위원회에 제출된 채낚기 어획량이 서로 다른 경로로 집계되는데 값이 같다.
   * 어느 쪽이든 갱신되며 어긋나면 그때 다시 봐야 한다 — 그래서 테스트로 붙든다.
   */
  it('KOSIS 동남부와 SPRFMO 2024 어획량이 일치한다', () => {
    expect(southeastPacific('2024')).toBe(SPRFMO_2024.어획량);
  });

  /** 해역은 계층이라 합이 전체를 넘는다. 더하면 안 된다는 것을 숫자로 붙든다. */
  it('해역 막대를 더하면 전체를 넘는다 — 계층이라 합산 금지', () => {
    const y = latestYear();
    const sum = squidByArea(y).reduce((n, a) => n + a.생산량, 0);
    const total = squidAllGearTotal(y);
    expect(total).not.toBeNull();
    expect(sum, '해역 합이 전체보다 작다면 계층 가정이 깨진 것이다').toBeGreaterThan(total!);
  });

  /** 규모 구간은 서로 겹치지 않아 합이 전체와 맞아야 한다. */
  it('보유 척수 구간 합이 전 업종 합계와 맞는다', () => {
    const y = latestYear();
    const sum = squidBySizeBand(y).reduce((n, b) => n + b.생산량, 0);
    expect(sum).toBe(squidAllGearTotal(y));
  });

  /**
   * 생산금액은 단가 정보를 담고 있지 않다. 이 검사가 실패하면 KOSIS 가 산출 방식을
   * 바꿨다는 뜻이고, 그때는 단가 차트를 만들 수 있는지 다시 판단해야 한다.
   */
  it('생산금액이 고정 환산단가로 산출돼 있다 — 단가 차트를 만들면 안 된다', () => {
    const unit = squidGearSeries()
      .filter((p) => p.연도 >= '2021' && p.생산량 > 0)
      .map((p) => (p.생산금액 * 1000) / p.생산량);
    expect(unit.length).toBeGreaterThanOrEqual(3);
    const spread = Math.max(...unit) - Math.min(...unit);
    expect(spread, `단가 편차 ${spread.toFixed(1)}천원/톤 — 독립 측정으로 바뀌었을 수 있다`).toBeLessThan(5);
  });

  it('측정 경계와 단위 한계를 데이터가 들고 있다', () => {
    expect(deepseaMeta.측정경계).toMatch(/원양어업만/);
    expect(deepseaMeta.단위한계).toMatch(/회사명·선박명은 공표되지 않는다/);
    expect(deepseaMeta.출처).toMatch(/제114048호/);
  });

  it('업종 이름이 KOSIS 원표기와 같다', () => {
    const gears = new Set(table('업종별생산').map((r) => r.분류2));
    expect(gears.has(SQUID_GEAR), `업종 이름이 바뀌면 화면이 조용히 빈다`).toBe(true);
  });

  it('연도가 5개 이상 있고 최신이 마지막이다', () => {
    const y = years();
    expect(y.length).toBeGreaterThanOrEqual(5);
    expect(latestYear()).toBe(y[y.length - 1]);
  });
});
