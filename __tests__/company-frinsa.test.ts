/**
 * 「시장 이해 > 기업 해부」 Frinsa 가드.
 *
 * 이 파일이 지키는 것은 세 가지다.
 *   ① 서술이 「」로 지목한 차트가 그 단계에 실제로 있는가
 *   ② 인용된 수치가 인테이크 값과 어긋나지 않는가
 *   ③ 원본에 없는 값을 추정으로 채우지 않았는가 (2025년 미공표)
 */
import { describe, expect, it } from 'vitest';

import {
  FRINSA_BRIEFING,
  FRINSA_NARRATIVES,
  FRINSA_SOURCE_NOTES,
} from '@/lib/company-frinsa-content';
import {
  frinsaBai2024,
  frinsaBai2024Total,
  frinsaCerts,
  frinsaFinancials,
  frinsaGalicia,
  frinsaKoreaExport,
  frinsaPriceLadder,
  frinsaRegional2024,
  frinsaTariff,
  latestFinancial,
  marginSeries,
  sustainabilityBy,
  tunaPurchasedMt,
} from '@/lib/data/company-frinsa';

/** 대시보드 파일에 실린 슬롯 제목. 컴포넌트를 import 하면 recharts 가 딸려와 느려진다. */
const SLOT_TITLES: Record<string, string[]> = {
  c01: ['회사 개요'],
  c02: ['FY2024 국가별 세전이익 (M€)'],
  c03: ['가격 사다리 (€/kg)', '브랜드 포트폴리오'],
  c04: ['열병합 발전량 (MWh)'],
  c05: ['참치 원어 구매량 (톤)', '2025년 참치 구매 출처 (%)', '2025년 공급사 참여 (%)', '인증 현황'],
  c06: ['매출과 순이익률 (M€·%)', 'FY2024 지역별 매출 (M€)'],
  c07: ['갈리시아 3강 매출 (M€)'],
  c08: ['한국 → 스페인 냉동참치 수출 (톤·백만$)', 'EU 수입관세 (%)'],
};

describe('Frinsa 서술과 차트의 연결', () => {
  it('본문의 「」는 그 단계에 실린 차트만 가리킨다', () => {
    for (const n of FRINSA_NARRATIVES) {
      const titles = SLOT_TITLES[n.key] ?? [];
      const cited = [n.lede, ...n.paragraphs]
        .flatMap((p) => [...p.matchAll(/「([^」]+)」/g)].map((m) => m[1]));
      for (const c of cited) {
        expect(titles, `${n.key} 단계가 「${c}」를 지목했다`).toContain(c);
      }
    }
  });

  it('모든 단계에 차트가 하나 이상 있다', () => {
    for (const n of FRINSA_NARRATIVES) {
      expect(SLOT_TITLES[n.key]?.length ?? 0, `${n.key}`).toBeGreaterThan(0);
    }
  });

  it('브리핑은 실재하는 단계를 가리킨다', () => {
    const keys = new Set(FRINSA_NARRATIVES.map((n) => n.key));
    for (const b of FRINSA_BRIEFING) expect(keys).toContain(b.stage);
  });

  it('인용은 큰따옴표를 쓴다 — 낫표는 차트 제목 전용이다', () => {
    const prose = FRINSA_NARRATIVES.flatMap((n) => [n.lede, ...n.paragraphs]).join('\n');
    // 차트 제목을 다 지운 뒤에도 낫표가 남으면 인용에 쓴 것이다.
    const stripped = Object.values(SLOT_TITLES)
      .flat()
      .reduce((acc, t) => acc.split(`「${t}」`).join(''), prose);
    expect(stripped).not.toMatch(/「/);
  });
});

describe('Frinsa 수치', () => {
  it('2024년이 마지막 확정 회계연도다', () => {
    expect(latestFinancial().연도).toBe(2024);
    expect(latestFinancial().매출).toBe(741);
    expect(latestFinancial().순이익).toBe(39.1);
  });

  it('2025년 매출은 미공표라 값이 없다 — 0 으로 채우지 않는다', () => {
    const frinsa = frinsaGalicia.find((r) => r.기업.startsWith('Frinsa'));
    expect(frinsa?.y2025).toBeNull();
    // 경쟁 2사는 공표했다. 「전부 없음」이 아니라 Frinsa 만 없다는 것이 요지다.
    for (const other of frinsaGalicia.filter((r) => !r.기업.startsWith('Frinsa'))) {
      expect(other.y2025, other.기업).not.toBeNull();
    }
    expect(frinsaFinancials.some((r) => r.연도 === 2025)).toBe(false);
  });

  it('2024년 매출 순위는 Jealsa > Frinsa > Nauterra 다', () => {
    const y = frinsaGalicia.map((r) => ({ 기업: r.기업.split(' ')[0], v: r.y2024 }));
    const sorted = [...y].sort((a, b) => b.v - a.v).map((r) => r.기업);
    expect(sorted).toEqual(['Jealsa', 'Frinsa', 'Nauterra']);
  });

  it('그룹 참치 구매는 스페인 + 포르투갈과 맞는다', () => {
    const esp = 105559;
    const prt = 29730;
    expect(tunaPurchasedMt()).toBe(esp + prt);
  });

  it('지속가능성은 축마다 합이 100% 다', () => {
    for (const axis of ['어업 출처', '공급사 출처']) {
      const sum = sustainabilityBy(axis).reduce((a, r) => a + r.비중, 0);
      expect(Math.round(sum), axis).toBe(100);
    }
  });

  it('공급사 축의 최대 칸은 「어디에도 해당 없음」이다', () => {
    // 이 표를 요약할 때 MSC 68% 만 인용하면 그림이 뒤집힌다. 그 함정을 고정한다.
    const rows = [...sustainabilityBy('공급사 출처')].sort((a, b) => b.비중 - a.비중);
    expect(rows[0].구분).toContain('해당 없음');
    expect(rows[0].비중).toBeGreaterThan(50);
  });

  it('가격 사다리는 위층부터 내림차순이다', () => {
    // 원본 표가 5층 → 1층 순이다. 차트가 뒤집어 그리므로 순서가 바뀌면 축이 거꾸로 선다.
    for (let i = 1; i < frinsaPriceLadder.length; i += 1) {
      expect(frinsaPriceLadder[i].eurPerKg).toBeLessThan(frinsaPriceLadder[i - 1].eurPerKg);
    }
    expect(frinsaPriceLadder[0].eurPerKg / frinsaPriceLadder[frinsaPriceLadder.length - 1].eurPerKg)
      .toBeGreaterThan(11);
  });

  it('한국 → 스페인 수출은 2024년에 튀었다가 되돌아왔다', () => {
    const by = Object.fromEntries(frinsaKoreaExport.map((r) => [r.연도, r]));
    expect(by[2024].kg).toBeGreaterThan(by[2023].kg * 2);
    expect(by[2025].kg).toBeLessThan(by[2024].kg / 2);
  });

  it('캔가공용 냉동 통마리만 무관세다', () => {
    const zero = frinsaTariff.filter((r) => r.mfn.startsWith('0'));
    expect(zero).toHaveLength(1);
    expect(zero[0].코드).toContain('0303 42');
    expect(zero[0].조건).toContain('end-use');
  });

  it('싱가포르가 스페인 다음 세전이익 2위권이다 — 그리고 국가별 합이 EINF 합계와 맞는다', () => {
    const sorted = [...frinsaBai2024].sort((a, b) => b.세전이익 - a.세전이익);
    expect(sorted[0].국가).toContain('스페인');
    // 포르투갈(생산법인)과 싱가포르(구매본부)가 2·3위 — 판매법인이 아니라는 것이 요지다.
    expect(sorted.slice(1, 3).map((r) => r.국가).join(' ')).toContain('싱가포르');
    expect(frinsaBai2024.find((r) => r.국가.includes('싱가포르'))?.세전이익).toBe(5012317);
    const sum = frinsaBai2024.reduce((a, r) => a + r.세전이익, 0);
    expect(sum).toBe(frinsaBai2024Total);
  });

  it('FY2024 지역분해는 보도치 741 과 정합하고, 이베리아 밖이 절반을 넘는다', () => {
    const total = frinsaRegional2024.reduce((a, r) => a + r.매출, 0);
    expect(total).toBeCloseTo(740.4, 1);
    const nonIberia = frinsaRegional2024
      .filter((r) => !r.시장.includes('이베리아'))
      .reduce((a, r) => a + r.매출, 0);
    expect(nonIberia / total).toBeGreaterThan(0.5);
  });

  it('IFS Broker 는 현재형으로 표기하지 않는다 — 만료가 명시돼 있다', () => {
    const broker = frinsaCerts.find((r) => r.인증.includes('IFS Broker'));
    expect(broker?.상태).toContain('만료');
    expect(broker?.유효).toContain('갱신본 미확보');
  });

  it('순이익률은 매출과 순이익에서만 나온다', () => {
    for (const m of marginSeries()) {
      const src = frinsaFinancials.find((r) => r.연도 === m.연도)!;
      expect(m.순이익률).toBeCloseTo((src.순이익 / src.매출) * 100, 2);
    }
  });
});

describe('출처 표기', () => {
  it('출처 한계를 숨기지 않는다', () => {
    const notes = FRINSA_SOURCE_NOTES.join('\n');
    expect(notes).toMatch(/미확인|추정/);
    expect(notes).toMatch(/2025 회계연도/);
  });

  it('모든 근거 줄에 출처와 등급이 있다', () => {
    for (const n of FRINSA_NARRATIVES) {
      for (const f of n.facts) {
        expect(f.source, `${n.key} / ${f.label}`).toBeTruthy();
        expect(['A', 'B', 'C']).toContain(f.grade);
        expect(f.asOf, `${n.key} / ${f.label}`).toBeTruthy();
      }
    }
  });
});
