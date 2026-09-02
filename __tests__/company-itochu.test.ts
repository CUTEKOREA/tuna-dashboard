/**
 * ITOCHU 인테이크 회귀 테스트.
 *
 * 지키는 것은 셋이다.
 *  ① **부재를 부재로 유지한다** — 수산 실적 공시는 0건이다. 누군가 「食料 중 수산 X%」를
 *    만들어 넣으면 여기서 깨진다.
 *  ② **선단 명단이 온전하다** — 사조 11척은 이 화면에서 가장 무거운 사실이다.
 *  ③ **파생 함수가 표와 어긋나지 않는다** — 사조 비중·GT 합계는 계산값이다.
 */
import { describe, expect, it } from 'vitest';

import {
  ITOCHU_SOURCE_NOTES,
} from '@/lib/company-itochu-content';
import {
  fleetTotal,
  foodRank,
  itochuFleet,
  itochuFoodDivisions,
  itochuKorea,
  itochuMeta,
  itochuSegments,
  itochuSiVessels,
  itochuStats,
  sajoShare,
  sajoVessels,
  siGtTotal,
} from '@/lib/data/company-itochu';
import { proseBriefing, proseStages } from '@/lib/company-prose-stages';

// 서술은 조사보고서에서 그대로 읽어 온다. 손으로 쓴 상수는 더 없다.
const ITOCHU_NARRATIVES = proseStages('itochu');
const ITOCHU_BRIEFING = proseBriefing('itochu');

describe('ITOCHU 인테이크', () => {
  it('인증 선단은 25척이다', () => {
    expect(fleetTotal()).toBe(25);
    expect(fleetTotal()).toBe(itochuStats.인증선단);
  });

  it('사조그룹이 11척으로 44%다 - 이 화면의 핵심', () => {
    expect(sajoVessels()).toBe(11);
    expect(sajoVessels()).toBe(itochuStats.사조선단);
    expect(sajoShare()).toBe(44);
  });

  it('대만이 최다 기국이다', () => {
    const top = [...itochuFleet].sort((a, b) => b.척수 - a.척수)[0];
    expect(top.기국).toBe('Chinese Taipei');
    expect(top.척수).toBe(12);
  });

  it('SI 어업 6척은 전부 사조 계열이다', () => {
    expect(itochuSiVessels).toHaveLength(6);
    const owners = new Set(itochuSiVessels.map((v) => v.선사));
    expect(owners).toEqual(new Set(['SAJO INDUSTRIES', 'OYANG CORPORATION', 'SAJO SEAFOOD']));
    expect(siGtTotal()).toBe(6226);
  });

  it('IMO 번호가 7자리로 온전하다', () => {
    for (const v of itochuSiVessels) expect(v.imo).toMatch(/^\d{7}$/);
  });

  it('食料는 8개 세그먼트 중 4위다', () => {
    expect(itochuSegments).toHaveLength(8);
    expect(foodRank()).toBe(4);
  });

  it('生鮮食品 부문만 역성장했다 - 참치가 속한 부문', () => {
    const fresh = itochuFoodDivisions.find((r) => r.부문 === '生鮮食品');
    expect(fresh?.fy2025).toBe(166);
    expect(fresh!.fy2025).toBeLessThan(fresh!.fy2024);
    const others = itochuFoodDivisions.filter((r) => r.부문 !== '生鮮食品');
    for (const r of others) expect(r.fy2025).toBeGreaterThanOrEqual(r.fy2024 - 2);
  });

  it('부문 합과 세그먼트 값의 차이는 1억엔 이내다 - 회사 공시의 반올림', () => {
    const sum = itochuFoodDivisions.reduce((a, r) => a + r.fy2025, 0);
    expect(Math.abs(sum - itochuStats.식료_억엔)).toBeLessThanOrEqual(1);
  });

  it('수산 실적 공시는 0건으로 남는다', () => {
    expect(itochuStats.수산공시건수).toBe(0);
    expect(itochuMeta.출처한계).toContain('공시하지 않는다');
    expect(ITOCHU_SOURCE_NOTES.join(' ')).toContain('166억엔');
  });

  it('한국 지표에 사조 선단과 관세가 함께 있다', () => {
    const joined = itochuKorea.map((r) => `${r.항목} ${r.값}`).join(' ');
    expect(joined).toContain('11척');
    expect(joined).toContain('3.5%');
  });

  it('서술은 6단계이고 브리핑이 실재 단계를 가리킨다', () => {
    expect(ITOCHU_NARRATIVES).toHaveLength(6);
    const keys = new Set(ITOCHU_NARRATIVES.map((s) => s.key));
    for (const b of ITOCHU_BRIEFING) expect(keys.has(b.stage)).toBe(true);
  });
});
