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

describe('밸류체인 기업 — 화면 노출', () => {
  it('참치 차트에 선사 선단과 수출실적이 있다', () => {
    const titles = Object.values(CATCH_CHART_SLOTS)
      .flat()
      .map((slot) => slot.title);
    expect(titles).toContain('선사별 참치 선단 (척)');
    expect(titles).toContain('한국 원양업계 회사별 수출실적 (천달러)');
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
