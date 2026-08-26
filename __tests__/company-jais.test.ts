/**
 * JAIS 인테이크 회귀 검사.
 *
 * 이 회사는 소유한 것이 없어서 재무제표보다 **명부의 판별 시계열**이 실체를 말한다.
 * 그래서 여기서 지키는 것도 둘이다 — 7개년 재무의 산술 정합, 그리고
 * **「등재행 0」이 「거래 0」으로 미끄러지지 않도록 하는 문구**다.
 */
import { describe, expect, it } from 'vitest';

import {
  foundingGap,
  fosVanished,
  jaisFinancials,
  jaisFos,
  jaisKorea,
  jaisMeta,
  jaisPanofi,
  jaisRegistries,
  jaisStats,
  lossStreak,
  marginBand,
  ownedAssets,
  revenuePeak,
} from '@/lib/data/company-jais';

describe('JAIS 규모 - 아무것도 소유하지 않는다', () => {
  it('공장·선박·자회사가 전부 0이다', () => {
    expect(ownedAssets()).toBe(0);
    expect(jaisStats.공장).toBe(0);
    expect(jaisStats.자사선).toBe(0);
    expect(jaisStats.자회사).toBe(0);
  });

  it('종업원이 여덟 명이다', () => {
    expect(jaisStats.종업원).toBe(8);
    const y2024 = jaisFinancials.find((r) => r.연도 === 2024);
    expect(y2024?.종업원).toBe(jaisStats.종업원);
  });
});

describe('JAIS 재무 - 매출은 튀는데 마진은 안 움직인다', () => {
  it('순마진이 손익/매출과 맞는다', () => {
    for (const r of jaisFinancials) {
      const calc = Math.round((r.순손익 / r.매출) * 10000) / 100;
      expect(Math.abs(calc - r.순마진), `${r.연도}년`).toBeLessThanOrEqual(0.01);
    }
  });

  it('7개년 내내 순마진 절대값이 1%를 넘지 않는다', () => {
    expect(marginBand()).toBeLessThan(1);
    expect(marginBand()).toBe(0.6);
  });

  it('매출 정점은 2022년이다', () => {
    expect(revenuePeak().연도).toBe(2022);
    expect(Math.round(revenuePeak().매출 / 10000)).toBe(jaisStats.정점_만유로);
  });

  it('매출 진폭이 마진 진폭보다 훨씬 크다', () => {
    // 취급액이지 부가가치가 아니라는 것이 이 표의 요지다.
    const 매출들 = jaisFinancials.map((r) => r.매출);
    const 매출배수 = Math.max(...매출들) / Math.min(...매출들);
    expect(매출배수).toBeGreaterThan(1.8);
    expect(marginBand()).toBeLessThan(1);
  });

  it('2023년부터 3년 연속 적자다', () => {
    expect(lossStreak()).toBe(jaisStats.적자연속);
    expect(lossStreak()).toBe(3);
    for (const y of [2023, 2024, 2025]) {
      expect(jaisFinancials.find((r) => r.연도 === y)!.순손익, `${y}년`).toBeLessThan(0);
    }
  });
});

describe('JAIS 명부 - 이 조사의 핵심 산출물', () => {
  it('등재행이 43에서 0으로 갔다', () => {
    expect(jaisFos[0].등재행).toBe(jaisStats.fos_최대);
    expect(jaisFos[jaisFos.length - 1].등재행).toBe(jaisStats.fos_현재);
  });

  it('시계열이 단조 감소한다', () => {
    for (let i = 1; i < jaisFos.length; i += 1) {
      expect(jaisFos[i].등재행, jaisFos[i].판).toBeLessThanOrEqual(jaisFos[i - 1].등재행);
    }
  });

  it('0행이 된 판이 있고, 그 판에서도 FCF 는 유효하다', () => {
    const v = fosVanished();
    expect(v).toBeDefined();
    // 명부 자체가 축소된 것이 아니라 이 회사만 빠졌다는 대조가 사라지면 안 된다.
    expect(v!.내역).toContain('FCF');
  });

  it('네 명부가 따로 「가공 없음」을 확인한다', () => {
    expect(jaisRegistries).toHaveLength(4);
    expect(jaisRegistries.some((r) => r.표기.includes('0건'))).toBe(true);
    expect(jaisRegistries.some((r) => r.표기.includes('Broker/Trader'))).toBe(true);
  });
});

describe('JAIS 정직성 문구 - 미끄러지면 안 되는 자리', () => {
  it('등재행을 거래 실적으로 읽지 말라는 경고가 남아 있다', () => {
    expect(jaisMeta.측정경계).toContain('거래 실적이 아니다');
  });

  it('2025년이 추정치라는 표시가 남아 있다', () => {
    expect(jaisMeta.측정경계).toContain('추정치');
  });

  it('지배구조가 확인되지 않는다는 한계가 남아 있다', () => {
    expect(jaisMeta.출처한계).toContain('주주');
  });
});

describe('JAIS 한국 접점', () => {
  it('DART 공시는 0건이다', () => {
    const dart = jaisKorea.find((r) => r.항목.includes('DART'));
    expect(dart?.값).toBe('0건');
  });

  it('Panofi 는 지분보다 채권이 크다', () => {
    expect(jaisStats.panofi_지분).toBe(45);
    const 지분 = jaisPanofi.find((r) => r.항목.includes('지분'));
    expect(지분?.기준).toContain('장부가액 0');
    expect(jaisPanofi.some((r) => r.항목.includes('수취채권'))).toBe(true);
    // 담보 사실은 어느 칸에 적히든 사라지면 안 된다 — 실질 지배의 근거가 그것이다.
    const 담보 = jaisPanofi.some((r) => `${r.항목} ${r.값} ${r.기준}`.includes('담보권'));
    expect(담보).toBe(true);
  });

  it('창업 서사와 등기가 3년 어긋난다', () => {
    expect(foundingGap()).toBe(3);
    expect(jaisStats.등기년).toBe(1966);
    expect(jaisStats.창업서사년).toBe(1963);
  });
});
