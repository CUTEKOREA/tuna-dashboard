/**
 * 조사보고서 그림 인테이크 회귀 검사.
 *
 * 아홉 편 보고서에 그림이 59장 있었는데 화면에는 한 장도 올라오지 않았다.
 * 표·서술은 추출기가 있었고 그림만 없었다. 여기서 지키는 것은 셋이다 —
 * **그림이 단계에 붙어 있는가**, **이미지 바이트가 번들에 새지 않는가**,
 * **차트가 인쇄와 다크 모드에서 살아남을 형태인가.**
 */
import { describe, expect, it } from 'vitest';

import {
  REPORT_FIGURE_COMPANIES,
  figureStagesUsed,
  figuresForStage,
  reportFigures,
} from '@/lib/data/company-report-figures';
import { REPORT_TABLE_COMPANIES } from '@/lib/data/company-report-tables';

const 그림있는회사 = ['frinsa', 'thaiunion', 'albacora', 'fcf', 'itochu', 'bolton', 'jealsa', 'jais'];

describe('인테이크 구성', () => {
  it('표 인테이크와 같은 아홉 편을 덮는다', () => {
    expect(REPORT_FIGURE_COMPANIES.sort()).toEqual([...REPORT_TABLE_COMPANIES].sort());
  });

  it('그림 59장을 밑돌지 않는다', () => {
    // 커버리지가 조용히 줄어드는 것을 막는 하한선이다. 현재 팩샷 54 · 차트 4 · 문서 1.
    const n = REPORT_FIGURE_COMPANIES.reduce((a, c) => a + reportFigures(c).length, 0);
    expect(n).toBeGreaterThanOrEqual(59);
  });

  it.each(그림있는회사)('%s - 그림이 있다', (c) => {
    expect(reportFigures(c).length, c).toBeGreaterThan(0);
  });
});

describe('이미지 바이트가 번들에 새지 않는다', () => {
  it('base64 를 담은 그림이 하나도 없다', () => {
    // 팩샷 원본이 합쳐 6 MB 다. JSON 에 담으면 번들에 8 MB 가 붙는다.
    for (const c of REPORT_FIGURE_COMPANIES) {
      for (const f of reportFigures(c)) {
        expect(f.src ?? '', `${c} ${f.sid}`).not.toContain('base64');
        expect(f.svg ?? '', `${c} ${f.sid}`).not.toContain('base64');
      }
    }
  });

  it('shot·doc 은 public 아래 정적 URL 을 가리킨다', () => {
    for (const c of REPORT_FIGURE_COMPANIES) {
      for (const f of reportFigures(c)) {
        if (f.kind === 'shot' || f.kind === 'doc') {
          expect(f.src, `${c} ${f.sid}`).toMatch(/^\/data\/companies\/figures\/[a-z]+\/[0-9a-f]{12}\.jpg$/);
        }
      }
    }
  });
});

describe('차트는 인라인 SVG 로 남는다', () => {
  it('svg 를 가진 것은 kind 가 chart 이고 그 반대도 성립한다', () => {
    for (const c of REPORT_FIGURE_COMPANIES) {
      for (const f of reportFigures(c)) {
        expect(!!f.svg, `${c} ${f.sid}`).toBe(f.kind === 'chart');
      }
    }
  });

  it('차트가 제 클래스 규칙을 들고 온다', () => {
    // 차트 클래스는 보고서 자체 style 에만 있다. 규칙을 함께 싣지 않으면
    // 대시보드에서 선이 안 보이고 글자가 기본 크기로 나온다 — FCF 차트가 실제로 그랬다.
    const charts = REPORT_FIGURE_COMPANIES.flatMap((c) =>
      reportFigures(c).filter((f) => f.kind === 'chart'));
    expect(charts.length).toBeGreaterThan(0);
    for (const f of charts) {
      const classes = [...(f.svg ?? '').matchAll(/class="([^"]+)"/g)]
        .flatMap((m) => m[1].split(/\s+/));
      if (!classes.length) continue;
      expect(f.css, `${f.sid} 규칙 없음`).toBeTruthy();
      for (const c of new Set(classes)) {
        expect(f.css, `${f.sid} .${c} 규칙 누락`).toContain(`.${c}`);
      }
    }
  });

  it('차트 규칙이 참조하는 색 변수를 함께 싣는다', () => {
    // var(--x) 를 쓰는데 그 값이 없으면 대시보드에서 투명하게 그려진다.
    for (const c of REPORT_FIGURE_COMPANIES) {
      for (const f of reportFigures(c).filter((x) => x.kind === 'chart')) {
        const vars = new Set([...(f.css ?? '').matchAll(/var\(\s*(--[a-z0-9-]+)/g)].map((m) => m[1]));
        for (const v of vars) expect(f.css, `${c} ${f.sid} ${v} 미정의`).toContain(`${v}:`);
      }
    }
  });
});

describe('단계 배치', () => {
  it.each(그림있는회사)('%s - 모든 그림이 c0N 단계에 붙는다', (c) => {
    for (const f of reportFigures(c)) {
      expect(f.stage, `${c} ${f.sid}`).toMatch(/^c(0[1-9]|1[0-9])$/);
    }
  });

  it.each(그림있는회사)('%s - figuresForStage 가 전량을 되돌려 준다', (c) => {
    const n = figureStagesUsed(c).reduce((a, st) => a + figuresForStage(c, st).length, 0);
    expect(n).toBe(reportFigures(c).length);
  });

  it('표지 팩샷은 첫 단계로 간다', () => {
    for (const c of REPORT_FIGURE_COMPANIES) {
      for (const f of reportFigures(c)) {
        if (f.sid === 'cover') expect(f.stage, c).toBe('c01');
      }
    }
  });
});

describe('설명이 붙어 있다', () => {
  it('alt 나 caption 중 하나는 있다', () => {
    for (const c of REPORT_FIGURE_COMPANIES) {
      for (const f of reportFigures(c)) {
        expect((f.alt || f.caption).length, `${c} ${f.sid} 설명 없음`).toBeGreaterThan(0);
      }
    }
  });
});
