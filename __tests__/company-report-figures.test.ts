/**
 * 조사보고서 그림 인테이크 회귀 검사.
 *
 * 아홉 편 보고서에 그림이 59장 있었는데 화면에는 한 장도 올라오지 않았다.
 * 표·서술은 추출기가 있었고 그림만 없었다. 여기서 지키는 것은 셋이다 —
 * **그림이 단계에 붙어 있는가**, **이미지 바이트가 번들에 새지 않는가**,
 * **차트가 인쇄와 다크 모드에서 살아남을 형태인가.**
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  REPORT_FIGURE_COMPANIES,
  figureStagesUsed,
  figuresForStage,
  reportFigures,
} from '@/lib/data/company-report-figures';
import { REPORT_TABLE_COMPANIES } from '@/lib/data/company-report-tables';

const 그림있는회사 = ['frinsa', 'thaiunion', 'albacora', 'fcf', 'itochu', 'bolton', 'jealsa', 'jais'];
// 품목 해부보고서. 그림 틀이 회사 편과 달라 원문 마크업 조각(kind=html)으로 싣는다.
const 품목 = ['pollock', 'octopus', 'shrimp', 'squid', 'tuna'];

describe('인테이크 구성', () => {
  it('표 인테이크를 전부 덮는다(품목 다섯 편 포함)', () => {
    expect([...REPORT_FIGURE_COMPANIES].sort()).toEqual([...REPORT_TABLE_COMPANIES].sort());
  });

  it('그림 88장을 밑돌지 않는다', () => {
    // 커버리지가 조용히 줄어드는 것을 막는 하한선이다. 현재 팩샷 70 · 차트 17 · 문서 1.
    const n = REPORT_FIGURE_COMPANIES.reduce((a, c) => a + reportFigures(c).length, 0);
    expect(n).toBeGreaterThanOrEqual(88);
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

  it('편마다 차트가 하나는 있다', () => {
    // 넷은 차트가 아예 없었다 — 표만 있는 편은 읽는 사람이 규모를 눈으로 못 잡는다.
    // 품목 해부보고서는 원문에 그림이 없으면 0개가 맞다(아래 「품목 해부보고서 그림」).
    for (const c of REPORT_FIGURE_COMPANIES.filter((key) => !품목.includes(key))) {
      const n = reportFigures(c).filter((x) => x.kind === 'chart').length;
      expect(n, `${c} 차트 0`).toBeGreaterThan(0);
    }
  });

  it('차트 규칙이 참조하는 색 변수를 함께 싣는다', () => {
    // var(--x) 를 쓰는데 그 값이 없으면 대시보드에서 투명하게 그려진다.
    // 편마다 다른 강조색은 :scope 가 아니라 <svg style="--rc-b:…"> 로 실려 오므로
    // 규칙에 없으면 그림 자체에 있는지까지 본다 — 둘 다 없으면 투명해진다.
    for (const c of REPORT_FIGURE_COMPANIES) {
      for (const f of reportFigures(c).filter((x) => x.kind === 'chart')) {
        const vars = new Set([...(f.css ?? '').matchAll(/var\(\s*(--[a-z0-9-]+)/g)].map((m) => m[1]));
        for (const v of vars) {
          const where = `${v}:`;
          expect(
            (f.css ?? '').includes(where) || (f.svg ?? '').includes(where),
            `${c} ${f.sid} ${v} 미정의`,
          ).toBe(true);
        }
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

describe('품목 해부보고서 그림', () => {
  const html = (key: string) => readFileSync(
    join(process.cwd(), `docs/evidence/industry-${key}-2026-10/보고서.html`), 'utf8');

  it('오징어 원문의 지표 묶음 2 · 막대 묶음 4 · figure 8 이 전부 올라온다', () => {
    const doc = html('squid');
    const figs = reportFigures('squid');
    const count = (re: RegExp) => (doc.match(re) ?? []).length;
    expect(count(/class="metrics"/g)).toBe(2);
    expect(count(/class="bars"/g)).toBe(4);
    expect(count(/<figure[\s>]/g)).toBe(8);
    expect(figs).toHaveLength(14);
    expect(figs.every((f) => f.kind === 'html')).toBe(true);
    // 원문 안의 요소가 조각 안에 그대로 있다 — 타일 6 · 막대 16 · 종 도판 7 · SVG 11
    const inFigs = (re: RegExp) => figs.reduce((a, f) => a + ((f.html ?? '').match(re) ?? []).length, 0);
    expect(inFigs(/class="metric"/g)).toBe(count(/class="metric"/g));
    expect(inFigs(/class="bar"/g)).toBe(count(/class="bar"/g));
    expect(inFigs(/class="spc"/g)).toBe(count(/class="spc"/g));
    expect(inFigs(/<svg[\s>]/g)).toBe(count(/<svg[\s>]/g));
    expect(inFigs(/<img /g)).toBe(count(/<img /g));
  });

  it.each(['pollock', 'octopus', 'shrimp', 'tuna'])('%s - 원문에 그림이 없어 0개다', (key) => {
    const doc = html(key);
    expect(doc).not.toMatch(/<figure[\s>]|class="(metrics|bars)"/);
    expect(reportFigures(key)).toEqual([]);
  });

  it('조각에 base64 가 없고 이미지는 public 아래 정적 URL 이다', () => {
    for (const key of 품목) {
      for (const f of reportFigures(key)) {
        expect(f.html ?? '', `${key} ${f.sid}`).not.toContain('base64');
        for (const m of (f.html ?? '').matchAll(/<img[^>]*src="([^"]+)"/g)) {
          expect(m[1]).toMatch(/^\/data\/companies\/figures\/squid\/[0-9a-f]{12}\.jpg$/);
        }
      }
    }
  });

  it('조각이 쓰는 클래스마다 범위 규칙이 있고 변수가 정의돼 있다', () => {
    for (const f of reportFigures('squid')) {
      const css = f.css ?? '';
      expect(css.startsWith(':scope{'), f.sid).toBe(true);
      // 원문 규칙이 있는 클래스만 본다(.fl 처럼 규칙 없는 이름이 섞일 수 있다)
      for (const cls of ['metrics', 'metric', 'bars', 'bar', 'spg', 'spc', 'gg', 'gc2', 'fi']) {
        if ((f.html ?? '').includes(`class="${cls}"`)) expect(css, `${f.sid} .${cls}`).toContain(`.${cls}{`);
      }
      // 표지(.cf)·목차(.toc) 규칙이 섞이지 않는다
      expect(css).not.toMatch(/\.(cf|toc)\b/);
      for (const m of css.matchAll(/var\(\s*(--[a-z0-9-]+)/g)) {
        expect(css, `${f.sid} ${m[1]}`).toContain(`${m[1]}:`);
      }
    }
  });

  it('그림은 그 절이 붙은 단계에 붙는다', () => {
    const doc = html('squid');
    for (const f of reportFigures('squid')) {
      expect(figuresForStage('squid', f.stage)).toContain(f);
      // ord 는 절 본문 안의 자리다 — 그 자리에 조각의 첫머리가 있다
      const sec = new RegExp(`<section id="${f.sid}"[^>]*>`).exec(doc);
      expect(sec, f.sid).not.toBeNull();
      const at = doc.slice(sec!.index + sec![0].length + f.ord, sec!.index + sec![0].length + f.ord + 30);
      expect(at).toMatch(/^<(figure|div class="(metrics|bars)")/);
    }
  });
});
