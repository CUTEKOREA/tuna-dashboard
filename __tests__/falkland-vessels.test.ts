/**
 * 포클랜드 선박별 실적 인테이크의 가드.
 *
 * 이 자료는 **공개 통계가 닿지 못하는 층위**(선박·회사)라서, 틀려도 밖에서 검증해 줄
 * 것이 없다. 그래서 내부 정합성을 여기서 붙든다.
 *
 * 옮기는 과정에서 실제로 두 가지가 드러났다.
 *   1. 중량이 두 가지다 — 판×20(명목)과 실측 kg 가 30척 중 17척에서 어긋난다.
 *   2. 원본 회사 집계에 현원수산이 빠져 있었다.
 * 둘 다 섞어 쓰면 합계가 맞지 않으므로 테스트로 못 박는다.
 */
import { describe, expect, it } from 'vitest';

import {
  companiesFromVessels,
  idleVessels,
  falklandMeta,
  falklandVessels,
  fleetTotals,
  SEASON_MONTHS,
  seasonTotals,
  vesselsByPan,
} from '@/lib/data/falkland-squid-vessels';

describe('포클랜드 선박별 실적', () => {
  it('선박과 회사 수가 메타와 맞는다', () => {
    expect(falklandVessels).toHaveLength(falklandMeta.척수);
    expect(companiesFromVessels().length).toBeGreaterThanOrEqual(falklandMeta.회사수);
  });

  /** 월별 합이 누계와 어긋나면 표에서 옮길 때 한 칸 밀린 것이다. */
  it('배마다 월별 합이 누계와 같다', () => {
    for (const v of falklandVessels) {
      const sum = SEASON_MONTHS.reduce((n, m) => n + v[m], 0);
      expect(sum, `${v.name}: 월별 합 ${sum} ≠ 누계 ${v.totalPan}`).toBe(v.totalPan);
    }
  });

  it('선단 월별 합계가 선박 누계 총합과 같다', () => {
    const season = seasonTotals().reduce((n, m) => n + m.물량, 0);
    expect(season).toBe(fleetTotals().판);
  });

  /**
   * 명목 환산과 실측이 다르다는 것 자체가 이 자료의 성질이다. 같아지면 누군가
   * 한쪽으로 덮어쓴 것이므로 그때 다시 봐야 한다.
   */
  it('명목 환산중량과 실측중량이 서로 다르다', () => {
    const off = falklandVessels.filter((v) => v.totalKg !== v.totalPan * 20);
    expect(off.length, '환산과 실측이 전부 같아졌다 — 한쪽으로 덮어썼는지 확인하라').toBeGreaterThan(0);
    const t = fleetTotals();
    expect(t.환산톤).not.toBe(t.실측톤);
  });

  /** 회사 집계는 선박에서 다시 센다. 원본 집계에 빠진 회사가 있었다. */
  it('회사 집계가 선박 전량을 담는다', () => {
    const fromVessels = companiesFromVessels();
    expect(fromVessels.reduce((n, c) => n + c.vessels, 0)).toBe(falklandVessels.length);
    expect(fromVessels.reduce((n, c) => n + c.totalPan, 0)).toBe(fleetTotals().판);
    // 원본 집계에 없던 회사다. 누락이 아니라 실적 0이라 빠진 것인데, 선단에 있는 배는
    // 세어야 한다 — 조업하지 않은 것과 존재하지 않는 것은 다르다.
    expect(fromVessels.some((c) => c.name === '현원수산')).toBe(true);
  });

  /**
   * 실적 0인 배를 「없는 배」로 처리하면 선단 규모가 줄어 보인다. 108은해는 선령 39년에
   * 「교체시급」이고 한 어기를 통째로 쉬었다 — 그 사실 자체가 선단의 상태다.
   */
  it('한 어기를 쉰 배가 선단에 남아 있다', () => {
    const idle = idleVessels();
    expect(idle.length).toBeGreaterThan(0);
    expect(idle.every((v) => v.totalPan === 0)).toBe(true);
    expect(falklandVessels.length).toBe(companiesFromVessels().reduce((n, c) => n + c.vessels, 0));
  });

  it('선박 정렬이 누계 내림차순이다', () => {
    const pans = vesselsByPan().map((v) => v.totalPan);
    expect([...pans].sort((a, b) => b - a)).toEqual(pans);
  });

  /** 어기는 12월에 시작한다. 달력 순으로 정렬하면 그래프가 뜻을 잃는다. */
  it('어기 월 순서가 12월에서 시작한다', () => {
    expect(seasonTotals().map((m) => m.월)[0]).toBe('12월');
    expect(SEASON_MONTHS[0]).toBe('m12');
  });

  it('측정 경계를 데이터가 들고 있다', () => {
    expect(falklandMeta.측정경계).toMatch(/직접 견줄 수 없다/);
    expect(falklandMeta.단위).toMatch(/실중량/);
  });
});
