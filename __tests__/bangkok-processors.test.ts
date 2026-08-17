import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import BangkokDashboard, { BANGKOK_TABS } from '../components/bangkok/BangkokDashboard';
import { ProcessorsTab } from '../components/bangkok/tabs/ProcessorsTab';
import {
  registrySorted, reportFor, seasia, seasiaCountries, shipments, summaryFor, tagCounts,
} from '../lib/data/seasia-processors';

describe('동남아 가공사 조사 인테이크', () => {
  it('두 나라 보고서를 모두 담는다', () => {
    expect(seasiaCountries).toContain('태국');
    expect(seasiaCountries).toContain('베트남');
  });

  it('전수표 합계가 메타와 일치한다 — 표를 조용히 흘리면 여기서 걸린다', () => {
    const sum = seasiaCountries.reduce((s, c) => s + (reportFor(c)?.registry.length ?? 0), 0);
    expect(sum).toBe(seasia.meta.registryTotal);
    expect(sum).toBeGreaterThan(300);
  });

  it('네 종류 표가 나라마다 다 있다', () => {
    for (const c of seasiaCountries) {
      const r = reportFor(c)!;
      expect(r.topPicks.length).toBeGreaterThan(0);
      expect(r.profiles.length).toBeGreaterThan(0);
      expect(r.shortlist.length).toBeGreaterThan(0);
      expect(r.registry.length).toBeGreaterThan(0);
    }
  });

  it('원본이 매긴 신뢰도 태그를 보존한다', () => {
    // 클래스명을 추측해 파싱했다가 태그를 전부 놓친 적이 있다. 0 이면 파서가 깨진 것이다.
    expect(seasia.meta.taggedCells).toBeGreaterThan(0);
    const t = tagCounts('태국');
    expect(Object.keys(t).length).toBeGreaterThan(0);
  });

  it('전수표를 선적 건수 내림차순으로 준다', () => {
    const rows = registrySorted('베트남');
    const nums = rows.map(shipments).filter((n): n is number => n !== null);
    expect([...nums].sort((a, b) => b - a)).toEqual(nums);
  });

  it('요약 수치가 실제 행 수와 맞는다', () => {
    for (const c of seasiaCountries) {
      const s = summaryFor(c)!;
      const r = reportFor(c)!;
      expect(s.registry).toBe(r.registry.length);
      expect(s.profiles).toBe(r.profiles.length);
    }
  });
});

describe('가공사 조사 탭', () => {
  it('방콕 대시보드에 탭으로 등록된다', () => {
    const keys = BANGKOK_TABS.map((t) => t.key);
    expect(keys).toContain('processors');
    expect(BANGKOK_TABS.find((t) => t.key === 'processors')?.label).toBe('가공사 조사');
  });

  it('출처와 신뢰도 표기를 화면에 낸다', () => {
    const markup = renderToStaticMarkup(React.createElement(ProcessorsTab));
    expect(markup).toContain('출처');
    expect(markup).toContain('신뢰도');
    expect(markup).not.toContain('<iframe');
  });

  it('대시보드가 새 탭과 함께 렌더된다', () => {
    const markup = renderToStaticMarkup(React.createElement(BangkokDashboard));
    expect(markup).toContain('가공사 조사');
  });
});
