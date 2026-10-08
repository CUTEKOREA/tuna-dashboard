/**
 * Jealsa 인테이크 회귀 검사.
 *
 * 이 회사에서 미끄러지기 쉬운 자리는 넷이고, 여기서 지키는 것도 그 넷이다.
 *   ① 개별법인 합산을 그룹 연결과 나란히 놓는 것
 *   ② 「사상 최대 매출」을 우상향으로 읽는 것 (정점은 2022년이었다)
 *   ③ 자사 MSC 어장 인증이 지금도 있는 것처럼 쓰는 것 (2022-11-22 철회)
 *   ④ 이사회 자리를 지분으로 읽는 것
 */
import { describe, expect, it } from 'vitest';

import {
  entitySumPreElimination,
  headcountChangeFromPeak,
  jealsaAlbacora,
  jealsaEntities,
  jealsaFinancials,
  jealsaFleet,
  jealsaGalicia,
  jealsaHeadcount,
  jealsaMeta,
  jealsaSourcing,
  jealsaStats,
  mercadonaShare,
} from '@/lib/data/company-jealsa';

describe('연결 시계열 - 정점은 2022년이다', () => {
  it('2025년이 사상 최대이되 2022년을 되찾은 것이다', () => {
    const y2025 = jealsaFinancials.find((r) => r.연도 === 2025);
    const y2022 = jealsaFinancials.find((r) => r.연도 === 2022);
    expect(y2025?.매출).toBe(jealsaStats.연결매출_2025);
    expect(y2022?.매출).toBe(jealsaStats.연결매출_정점);
    expect(y2025!.매출).toBeGreaterThan(y2022!.매출);
    // 2023년 하락이 실재한다. 이것을 지우면 우상향 서사가 된다.
    const y2023 = jealsaFinancials.find((r) => r.연도 === 2023);
    expect(y2023!.매출).toBeLessThan(y2022!.매출);
  });

  it('2021년이 결측이 아니다', () => {
    const y2021 = jealsaFinancials.find((r) => r.연도 === 2021);
    expect(y2021?.매출).toBe(704);
    // 화재의 해다. 매출은 1.2% 빠졌는데 순이익이 65% 날아갔다.
    expect(y2021!.순이익).toBeLessThan(jealsaFinancials.find((r) => r.연도 === 2020)!.순이익!);
  });

  it('매출이 순이익보다 훨씬 완만하게 움직인다', () => {
    // 이익을 통조림 업황으로 읽으면 틀린다는 것이 이 회사의 요지다.
    const y2023 = jealsaFinancials.find((r) => r.연도 === 2023)!;
    const y2025 = jealsaFinancials.find((r) => r.연도 === 2025)!;
    const rev = (y2025.매출 - y2023.매출) / y2023.매출;
    const net = (y2025.순이익! - y2023.순이익!) / y2023.순이익!;
    expect(net).toBeGreaterThan(rev * 10);
  });
});

describe('개별법인 - 연결과 접합하면 안 된다', () => {
  it('두 법인 합산이 그룹 연결을 넘는다', () => {
    const y2024 = jealsaFinancials.find((r) => r.연도 === 2024)!;
    expect(entitySumPreElimination()).toBe(1080.3);
    expect(entitySumPreElimination()).toBeGreaterThan(y2024.매출);
  });

  it('개별 랭킹 1위는 Jealsa가 아니다', () => {
    const top = jealsaEntities.find((e) => e.순위 === 1)!;
    expect(top.그룹).toBe('Frinsa');
    expect(top.매출).toBeGreaterThan(
      jealsaEntities.filter((e) => e.그룹 === 'Jealsa')[0].매출,
    );
  });
});

describe('Mercadona - 단일 고객 의존', () => {
  it('비중이 계산으로 맞는다', () => {
    expect(mercadonaShare()).toBe(jealsaStats.mercadona_비중);
    expect(mercadonaShare()).toBeGreaterThan(50);
  });
});

describe('선단 - 회사 진술과 등록부가 어긋난다', () => {
  it('회사는 두 척이라 하고 등록부에는 세 척이 있다', () => {
    expect(jealsaStats.선단_회사표기).toBe(2);
    expect(jealsaFleet).toHaveLength(3);
    expect(jealsaStats.선단_등록부).toBe(jealsaFleet.length);
  });

  it('세 척 다 과테말라 기국이고 ICCAT 활성 목록에 없다', () => {
    expect(jealsaStats.iccat_활성_과테말라).toBe(0);
    for (const v of jealsaFleet) expect(v.imo).toMatch(/^89194\d\d$/);
  });

  it('두 척이 국적을 바꿔 왔다', () => {
    const renamed = jealsaFleet.filter((v) => v.구기국 !== null);
    expect(renamed).toHaveLength(2);
    expect(renamed.map((v) => v.구기국).sort()).toEqual(['벨리즈', '일본']);
  });
});

describe('조달 - MSC 인증 어장은 58%뿐이다', () => {
  it('구성 합이 100이다', () => {
    expect(jealsaSourcing.reduce((a, s) => a + s.비중, 0)).toBe(100);
  });

  it('96%는 잔여 4%의 여집합이다', () => {
    const off = jealsaSourcing.find((s) => s.구분.startsWith('어느'))!.비중;
    expect(100 - off).toBe(96);
  });

  it('MSC 인증 어장이 절반을 조금 넘는 데 그친다', () => {
    const msc = jealsaSourcing.find((s) => s.구분 === 'MSC 인증 어장')!;
    expect(msc.비중).toBe(jealsaStats.msc_인증어장_비중);
    expect(msc.비중).toBeLessThan(60);
  });
});

describe('인력 - 줄고 있다', () => {
  it('2022년 정점 대비 상시 인력이 줄었다', () => {
    expect(headcountChangeFromPeak()).toBeLessThan(0);
    expect(jealsaStats.상시인력_2024).toBeLessThan(jealsaStats.상시인력_2022);
  });

  it('연간 총 창출 고용도 2022년이 정점이다', () => {
    const peak = jealsaHeadcount.reduce((a, b) => (b.연간총창출 > a.연간총창출 ? b : a));
    expect(peak.연도).toBe(2022);
  });
});

describe('Albacora - 이사회 자리를 지분으로 읽지 않는다', () => {
  it('자본 층위만 매체 등급이다', () => {
    const capital = jealsaAlbacora.find((r) => r.층위 === '자본')!;
    expect(capital.등급).toBe('B');
    const governance = jealsaAlbacora.find((r) => r.층위 === '지배구조')!;
    expect(governance.등급).toBe('A');
  });

  it('지분율을 수치로 들고 있지 않다', () => {
    // 여기에 숫자가 들어오면 공개되지 않은 값을 지어낸 것이다.
    const keys = Object.keys(jealsaStats);
    expect(keys.some((k) => k.includes('지분'))).toBe(false);
  });

  it('자본금이 발행주식 × 액면과 맞는다', () => {
    expect(jealsaStats.albacora_발행주식 * jealsaStats.albacora_액면).toBe(
      jealsaStats.albacora_자본금,
    );
  });
});

describe('갈리시아 3사 - 1위이되 가장 느리다', () => {
  it('전 연도에서 Jealsa가 앞선다', () => {
    for (const r of jealsaGalicia) {
      expect(r.jealsa).toBeGreaterThan(r.nauterra);
      if (r.frinsa !== null) expect(r.jealsa).toBeGreaterThan(r.frinsa);
    }
  });

  it('2020→2024 성장률이 세 회사 중 가장 낮다', () => {
    const a = jealsaGalicia.find((r) => r.연도 === 2020)!;
    const b = jealsaGalicia.find((r) => r.연도 === 2024)!;
    const g = (x: number, y: number) => (y - x) / x;
    expect(g(a.jealsa, b.jealsa)).toBeLessThan(g(a.nauterra, b.nauterra));
    expect(g(a.jealsa, b.jealsa)).toBeLessThan(g(a.frinsa!, b.frinsa!));
  });
});

describe('반증에서 기각된 주장이 되살아나지 않는다', () => {
  const banned = [
    '자기 배로 MSC 인증',
    'Albacora 지분율',
    '유럽 2위',
    'Frigoríficos Rianxo',
    '모로코 공장',
  ];

  it('메타 어디에도 기각된 문구가 없다', () => {
    const text = Object.values(jealsaMeta).join(' ');
    for (const b of banned) expect(text, b).not.toContain(b);
  });

  it('측정경계가 연결과 개별의 구분을 명시한다', () => {
    expect(jealsaMeta.측정경계).toContain('연결');
    expect(jealsaMeta.측정경계).toContain('개별');
  });
});
