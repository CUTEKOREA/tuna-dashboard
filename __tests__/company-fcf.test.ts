/**
 * FCF 인테이크 회귀 테스트.
 *
 * 지키는 것은 셋이다.
 *  ① **검증 불가를 검증 불가로 유지한다** — 2002년 발행정지사라 감사 재무제표가 없다.
 *    매출·물량을 A등급으로 올리면 여기서 깨진다.
 *  ② **신라교역 의존도 시계열이 온전하다** — 이 화면에서 가장 무거운 표다.
 *    한 해가 빠지거나 최대값이 바뀌면 카드 KPI가 조용히 틀어진다.
 *  ③ **파생 함수가 표와 어긋나지 않는다** — 光陽 계열 합계는 계산값이다.
 */
import { describe, expect, it } from 'vitest';

import {
  FCF_BRIEFING,
  FCF_NARRATIVES,
  FCF_SOURCE_NOTES,
} from '@/lib/company-fcf-content';
import {
  fcfGear,
  fcfMeta,
  fcfOwnership,
  fcfProfile,
  fcfSillaDependency,
  fcfSpecies,
  fcfStats,
  kwangyangShare,
  sillaLatest,
  sillaPeak,
} from '@/lib/data/company-fcf';

describe('FCF 인테이크', () => {
  it('자사 어선은 0척이다 — 이 회사 성격의 출발점', () => {
    expect(fcfStats.자사선).toBe(0);
    expect(fcfStats.협력선).toBe(600);
  });

  it('신라교역 의존도가 7개 연도 온전히 있다', () => {
    expect(fcfSillaDependency).toHaveLength(7);
    expect(fcfSillaDependency[0].연도).toBe('FY2019');
    expect(sillaLatest().연도).toBe('FY2025');
  });

  it('최대 의존도는 FY2024 46.3%다', () => {
    const peak = sillaPeak();
    expect(peak.연도).toBe('FY2024');
    expect(peak.비중).toBe(46.3);
    expect(peak.비중).toBe(fcfStats.silla_max);
  });

  it('의존도는 6년 내내 30%를 넘는다 — 한 거래처 편중이 상시적이다', () => {
    for (const r of fcfSillaDependency) expect(r.비중).toBeGreaterThan(30);
  });

  it('어종 구성 합이 100이다', () => {
    const sum = fcfSpecies.reduce((a, r) => a + r.비중, 0);
    expect(Math.abs(sum - 100)).toBeLessThan(0.1);
  });

  it('선망이 90%다 — 통조림용이 본체', () => {
    const seine = fcfGear.find((r) => r.어법 === '선망');
    expect(seine?.비중).toBe(90);
    expect(fcfGear.reduce((a, r) => a + r.비중, 0)).toBe(100);
  });

  it('光陽 계열 4개 법인 합계가 창업 가문 계열을 넘는다', () => {
    expect(kwangyangShare()).toBeCloseTo(28.07, 2);
    const founder = fcfOwnership
      .filter((r) => ['豐群投資控股', '豐達產業'].includes(r.법인))
      .reduce((a, r) => a + r.지분, 0);
    expect(kwangyangShare()).toBeGreaterThan(founder);
  });

  it('감사 재무제표가 없다는 한계를 명시한다', () => {
    expect(fcfMeta.출처한계).toContain('감사');
    expect(FCF_SOURCE_NOTES.join(' ')).toContain('발행정지');
  });

  it('발행정지 사실이 프로필에 남아 있다', () => {
    expect(fcfProfile.some(([, v]) => v.includes('발행정지'))).toBe(true);
  });

  it('서술은 6단계이고 브리핑이 실재 단계를 가리킨다', () => {
    expect(FCF_NARRATIVES).toHaveLength(6);
    const keys = new Set(FCF_NARRATIVES.map((s) => s.key));
    for (const b of FCF_BRIEFING) expect(keys.has(b.stage)).toBe(true);
  });

  it('한국 관점 단계가 마지막이다', () => {
    const last = FCF_NARRATIVES[FCF_NARRATIVES.length - 1];
    expect(last.title).toContain('한국');
  });
});
