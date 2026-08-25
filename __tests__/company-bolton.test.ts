/**
 * Bolton 인테이크 회귀 검사.
 *
 * 빌드 스크립트가 원문 대조를 이미 한다. 여기서 지키는 것은 그 다음 층 —
 * **화면이 읽는 파생값이 원자료와 어긋나지 않는가**다. 특히 이 회사에서 틀리기 쉬운 것은
 * 「조달 선단 399척」과 「자사 보유 4척」을 섞는 일이다.
 */
import { describe, expect, it } from 'vitest';

import {
  activeOwnVessels,
  boltonCategories,
  boltonGear,
  boltonKorea,
  boltonMeta,
  boltonOwnFleet,
  boltonSourcing,
  boltonSpecies,
  boltonStats,
  boltonVesselList,
  fastestGrowingSpecies,
  koreaSharePeak,
  latestVesselList,
  netSales,
  nonTunaShare,
  sourcingLatest,
} from '@/lib/data/company-bolton';

describe('Bolton 매출 구성', () => {
  it('카테고리 합이 순매출과 같다', () => {
    expect(netSales()).toBe(boltonStats.매출_백만유로);
    expect(netSales()).toBe(3541);
  });

  it('참치 사이클 밖이 3분의 1이다', () => {
    expect(nonTunaShare()).toBe(32.7);
    expect(nonTunaShare() + boltonStats.food_비중).toBeCloseTo(100, 5);
  });

  it('브랜드 수 합계가 63개다', () => {
    expect(boltonCategories.reduce((a, r) => a + r.브랜드, 0)).toBe(boltonStats.브랜드수);
  });

  it('Food 가 가장 큰 카테고리다', () => {
    const top = [...boltonCategories].sort((a, b) => b.y2025 - a.y2025)[0];
    expect(top.카테고리).toBe('Food');
  });
});

describe('Bolton 조달', () => {
  it('어종 합이 조달 총량과 같다', () => {
    expect(boltonSpecies.reduce((a, r) => a + r.y2025, 0)).toBe(boltonStats.조달_톤);
  });

  it('어법 합도 조달 총량과 같다', () => {
    expect(boltonGear.reduce((a, r) => a + r.y2025, 0)).toBe(boltonStats.조달_톤);
  });

  it('시계열 마지막 값이 STATS 와 같다', () => {
    expect(sourcingLatest().톤).toBe(boltonStats.조달_톤);
    expect(sourcingLatest().연도).toBe(2025);
  });

  it('2025년에 가장 크게 는 어종은 눈다랑어다', () => {
    // 가다랑어가 79%에서 62%로 내려앉은 자리를 무엇이 채웠는지가 이 절의 요지다.
    expect(fastestGrowingSpecies().어종).toContain('Bigeye');
    expect(fastestGrowingSpecies().증감).toBe(138);
  });

  it('선망이 압도적이다', () => {
    const seine = boltonGear.find((r) => r.어법.includes('Purse Seine'));
    expect(seine?.비중).toBe(boltonStats.선망_비중);
    expect(seine!.비중).toBeGreaterThan(90);
  });
});

describe('Bolton 선단 — 조달과 보유를 섞지 않는다', () => {
  it('계열 소유 활성 선박은 WCPFC 10 + IATTC 4 = 14척이다', () => {
    expect(boltonStats.자사선_wcpfc + boltonStats.자사선_iattc).toBe(14);
    expect(activeOwnVessels()).toBe(14);
  });

  it('ICCAT 3척은 전부 비활성이라 세지 않는다', () => {
    const iccat = boltonOwnFleet.find((r) => r.등록부 === 'ICCAT');
    expect(iccat?.상태).toContain('비활성');
    expect(activeOwnVessels()).toBeLessThan(
      boltonOwnFleet.reduce((a, r) => a + r.척수, 0),
    );
  });

  it('조달 선박명단은 자사 선단과 자릿수가 다르다', () => {
    expect(latestVesselList().총척수).toBe(boltonStats.명단선박);
    expect(latestVesselList().총척수).toBeGreaterThan(activeOwnVessels() * 20);
  });
});

describe('Bolton 한국 접점', () => {
  it('최신 명단의 한국선이 14척이다', () => {
    expect(latestVesselList().한국선).toBe(boltonStats.한국선);
    expect(latestVesselList().연도).toBe(2024);
  });

  it('비중은 계산과 표기가 맞는다', () => {
    for (const r of boltonVesselList) {
      expect(Math.round((r.한국선 / r.총척수) * 1000) / 10, `${r.연도}년`).toBe(r.비중);
    }
  });

  it('총 척수는 줄었는데 한국 비중은 올라갔다', () => {
    const first = boltonVesselList[0];
    const last = latestVesselList();
    expect(last.총척수).toBeLessThan(first.총척수);
    expect(last.비중).toBeGreaterThan(first.비중);
    expect(koreaSharePeak().연도).toBe(2024);
  });

  it('한국 지표에 DART 0건이 남아 있다', () => {
    const dart = boltonKorea.find((r) => r.항목.includes('공시'));
    expect(dart?.값).toBe('0건');
  });
});

describe('Bolton 측정 경계', () => {
  it('메타가 조달량의 집계 경계를 밝힌다', () => {
    // 74만 톤을 「브랜드가 쓴 양」으로 읽으면 안 된다 — 그 경고가 화면에서 사라지면 안 된다.
    expect(boltonMeta.측정경계).toContain('Tri Marine');
    expect(boltonMeta.출처한계).toContain('비상장');
  });
});
