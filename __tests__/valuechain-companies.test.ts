/**
 * 밸류체인 단계별 기업 정보가 **화면에 남아 있는지** 지키는 가드.
 *
 * 이 검사가 있는 이유가 있다. 조사는 끝나 있었고 집계 JSON 에도 들어 있었는데
 * 페이지에는 한 줄도 올라가지 않은 채 배포된 적이 있다. 자료가 있다는 것과
 * 사용자가 볼 수 있다는 것은 다른 문제다 — 후자를 검사한다.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import SquidIndustryDashboard, {
  SQUID_CHART_SLOTS,
} from '../components/market-understanding/SquidIndustryDashboard';
import TunaIndustryDashboard, {
  CATCH_CHART_SLOTS,
} from '../components/market-understanding/TunaIndustryDashboard';
import { getSquidFleetData } from '../lib/data/squid-industry';
import {
  getSquidCompanyData,
  getTunaCompanyData,
  getTunaOceanOperators,
} from '../lib/data/valuechain-companies';
import { ALL_NARRATIVES as TUNA_ALL_NARRATIVES } from '../lib/tuna-industry-content';
import { SQUID_ALL_NARRATIVES } from '../lib/squid-industry-content';

const TUNA = getTunaCompanyData();

function textOf(narratives: { key: string; lede: string; paragraphs: string[] }[], key: string) {
  const stage = narratives.find((entry) => entry.key === key);
  if (!stage) throw new Error(`${key} 단계가 없다`);
  return [stage.lede, ...stage.paragraphs].join('\n');
}

function factsOf(
  narratives: { key: string; facts: { label: string; value: string; source: string; grade: string }[] }[],
  key: string,
) {
  return narratives.find((entry) => entry.key === key)?.facts ?? [];
}

describe('밸류체인 기업 — 데이터', () => {
  it('참치 조업 선사에 한국 3사가 다 있다', () => {
    const names = TUNA.조업.rows.map((row) => row.회사);
    for (const name of ['동원산업', '사조산업', '신라교역']) {
      expect(names, `${name} 이 빠졌다`).toContain(name);
    }
  });

  it('참치 조업 행마다 출처·기준시점·등급이 붙어 있다', () => {
    // 집계 산출물이 아니라 손으로 옮긴 값이다. 출처 없는 행이 섞이면 안 된다
    for (const row of TUNA.조업.rows) {
      expect(row.출처).not.toBe('');
      expect(row.기준시점).not.toBe('');
      expect(['A', 'B', 'C']).toContain(row.등급);
    }
    for (const row of TUNA.가공.rows) {
      expect(row.출처).not.toBe('');
      expect(row.값).not.toBe('');
      expect(['A', 'B', 'C']).toContain(row.등급);
    }
  });

  it('수출실적 순위가 내림차순이고 비율 합이 100 근처다', () => {
    const rows = TUNA.수출순위.rows;
    expect(rows.length).toBeGreaterThanOrEqual(9);
    for (let i = 1; i < rows.length; i += 1) {
      expect(rows[i].수출실적).toBeLessThanOrEqual(rows[i - 1].수출실적);
    }
    const sum = rows.reduce((total, row) => total + row.비율, 0);
    expect(Math.abs(sum - 100)).toBeLessThanOrEqual(0.5);

    // 발주처가 어디 있는지가 이 표의 요지다
    const silla = rows.find((row) => row.회사 === '신라교역');
    expect(silla).toBeDefined();
    expect(silla!.순위).toBe(2);
  });

  it('오징어 선사 집계가 선박 명세와 어긋나지 않는다', () => {
    const fleet = getSquidFleetData();
    const byCompany = fleet.채낚기선박.회사별;
    expect(byCompany.length).toBeGreaterThanOrEqual(8);

    const totalFromCompanies = byCompany.reduce((sum, row) => sum + row.척수, 0);
    expect(totalFromCompanies).toBe(fleet.채낚기선박.rows.length);

    // 메모에 적힌 회사는 실제 선사 목록에 있어야 한다
    const names = new Set(byCompany.map((row) => row.회사));
    for (const note of getSquidCompanyData().선사메모) {
      expect(names, `${note.회사} 는 선사 목록에 없다`).toContain(note.회사);
    }
  });
});

describe('해역별 선사 — 데이터', () => {
  const ocean = getTunaOceanOperators();

  it('세 해역이 다 있고 기구·출처가 붙어 있다', () => {
    const areas = ocean.한국선사해역._meta.해역목록;
    // 다섯 기구 전부 — 뒤 둘(서·중부태평양·동부태평양)은 브라우저 자동화로 받았다
    expect(areas).toHaveLength(5);
    expect(areas).toContain('서·중부태평양');
    expect(areas).toContain('동부태평양');
    for (const area of areas) {
      const block = ocean.해역[area];
      expect(block, `${area} 블록이 없다`).toBeDefined();
      expect(String(block._meta.출처)).not.toBe('');
      expect(String(block._meta.등급)).toBe('A');
      expect(Number(block._meta.유효척수)).toBeGreaterThan(0);
    }
  });

  it('회사 이름 정규화가 먹었다 — 한 회사가 여러 칸으로 갈리지 않는다', () => {
    // 원본에 `Dongwon Industires`(오타)·뒤 공백 표기가 섞여 있다
    for (const area of ocean.한국선사해역._meta.해역목록) {
      const names = ocean.해역[area].한국선사.map((row) => row.선사);
      expect(new Set(names).size, `${area} 에 중복 상호가 있다`).toBe(names.length);
    }
    const matrixNames = ocean.한국선사해역.rows.map((row) => row.선사);
    expect(new Set(matrixNames).size).toBe(matrixNames.length);
  });

  it('한국 상호가 한글로 나온다 (L-01)', () => {
    for (const row of ocean.한국선사해역.rows) {
      expect(row.선사, `${row.선사} 가 한글이 아니다`).toMatch(/[가-힣]/);
    }
  });

  it('개인 소유자 실명이 산출물 어디에도 없다', () => {
    // 등록부에는 개인명이 그대로 적힌 행이 있다. 「개인 소유」 한 칸으로만 나가야 한다
    const blob = JSON.stringify(ocean);
    expect(blob).not.toMatch(/PARK, ?CHUNHWA/i);
    expect(blob).not.toMatch(/KIM JU SUK/i);
    expect(blob).not.toMatch(/LIM JUN TAEK/i);
    for (const area of ocean.한국선사해역._meta.해역목록) {
      for (const row of ocean.해역[area].한국선사) {
        if (row.선사 === '개인 소유') {
          expect(row.원표기).toBe('(개인 소유자 — 실명 미기록)');
        }
      }
    }
    expect(String(ocean._meta.개인정보)).toContain('실명을 기록하지 않는다');
  });

  it('교차표의 칸이 해역별 집계와 일치한다', () => {
    for (const area of ocean.한국선사해역._meta.해역목록) {
      const fromBlock = ocean.해역[area].한국선사.reduce((sum, row) => sum + row.척수, 0);
      const fromMatrix = ocean.한국선사해역.rows.reduce(
        (sum, row) => sum + Number(row[area] ?? 0),
        0,
      );
      expect(fromMatrix, `${area} 교차표 합이 어긋난다`).toBe(fromBlock);
    }
  });

  it('합산 금지 경고가 붙어 있다', () => {
    // 해역별 척수를 더하면 중복 인가 때문에 실제 선단보다 커진다
    expect(ocean._meta.합산금지).toContain('더하지');
    expect(ocean.한국선사해역._meta.주의).toContain('총 선단');
    // 한국 선적만 담은 두 해역이라는 사실을 숨기지 않는다
    expect(ocean._meta.수집주의).toContain('한국 선적만');
  });
});

describe('소매 단계 — 데이터', () => {
  const retail = getTunaCompanyData().소매;

  it('점유율 시계열이 4개 기간이고 범위가 온전하다', () => {
    expect(retail.rows.length).toBeGreaterThanOrEqual(4);
    for (const row of retail.rows) {
      expect(row.점유율).toBeGreaterThan(0);
      expect(row.점유율).toBeLessThanOrEqual(100);
    }
  });

  it('자사 공시라는 한계가 적혀 있다', () => {
    expect(retail._meta.주의).toContain('경쟁사');
    expect(retail._meta.조사기관).not.toBe('');
  });
});

describe('밸류체인 기업 — 화면 노출', () => {
  it('참치 차트에 선사 선단과 수출실적이 있다', () => {
    const titles = Object.values(CATCH_CHART_SLOTS)
      .flat()
      .map((slot) => slot.title);
    expect(titles).toContain('선사별 참치 선단 (척)');
    expect(titles).toContain('한국 원양업계 회사별 수출실적 (천달러)');
    expect(titles).toContain('한국 선사의 해역별 인가 선박 (척)');
    expect(titles).toContain('국내 참치캔 시장 점유율 (%)');
  });

  it('오징어 차트에 선사별 선단이 있다', () => {
    const titles = Object.values(SQUID_CHART_SLOTS)
      .flat()
      .map((slot) => slot.title);
    expect(titles).toContain('선사별 채낚기 선단 (척·톤)');
  });

  it('참치 서술이 조업 선사와 신라교역의 자리를 설명한다', () => {
    const s02 = textOf(TUNA_ALL_NARRATIVES, 's02');
    for (const name of ['동원산업', '사조산업', '신라교역']) {
      expect(s02, `s02 에 ${name} 언급이 없다`).toContain(name);
    }
    // 기준시점이 다르다는 경고가 본문에 남아 있어야 한다
    expect(s02).toContain('기준시점');

    const x03 = textOf(TUNA_ALL_NARRATIVES, 'x03');
    expect(x03).toContain('신라교역');
    expect(x03).toContain('22.73');
    expect(x03).toContain('StarKist');

    // 해역별 선사 — 태평양 두 수역에만 있다는 사실이 본문에 남아 있는지
    expect(s02).toContain('태평양 밖으로 나가지 않는다');
    expect(s02).toContain('서·중부태평양 15');
    // 합산 금지 경고가 본문에도 있어야 한다
    expect(s02).toContain('더하지 마라');
    // 개인정보 처리를 밝혔는지
    expect(s02).toContain('실명을 기록하지 않았');

    // 소매 단계
    const s07 = textOf(TUNA_ALL_NARRATIVES, 's07');
    expect(s07).toContain('동원에프앤비');
    expect(s07).toContain('79.2');
  });

  it('참치 근거표에 선사와 가공사가 올라 있다', () => {
    const s02 = factsOf(TUNA_ALL_NARRATIVES, 's02').map((f) => f.label).join(' ');
    expect(s02).toContain('신라교역');

    const x03 = factsOf(TUNA_ALL_NARRATIVES, 'x03');
    const labels = x03.map((f) => f.label).join(' ');
    expect(labels).toContain('신라교역');
    expect(labels).toContain('StarKist');
    // 확인 못 한 값은 등급으로 구분돼 있어야 한다
    expect(x03.some((f) => f.grade === 'C')).toBe(true);
  });

  it('오징어 서술이 선사 구조를 설명한다', () => {
    const s03 = textOf(SQUID_ALL_NARRATIVES, 's03');
    expect(s03).toContain('아그네스수산');
    expect(s03).toContain('열 개 회사');

    const labels = factsOf(SQUID_ALL_NARRATIVES, 's03').map((f) => f.label).join(' ');
    expect(labels).toContain('선사');
  });

  it('두 대시보드가 렌더된다', () => {
    expect(() => renderToStaticMarkup(React.createElement(TunaIndustryDashboard))).not.toThrow();
    expect(() => renderToStaticMarkup(React.createElement(SquidIndustryDashboard))).not.toThrow();
  });

  it('새 차트가 개별로 렌더된다', () => {
    const slots = [...Object.values(CATCH_CHART_SLOTS).flat(), ...Object.values(SQUID_CHART_SLOTS).flat()]
      .filter((slot) => slot.title.includes('선사') || slot.title.includes('수출실적'));
    expect(slots.length).toBeGreaterThanOrEqual(3);
    for (const slot of slots) {
      expect(() =>
        renderToStaticMarkup(React.createElement(React.Fragment, null, slot.render())),
      ).not.toThrow();
    }
  });
});
