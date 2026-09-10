/**
 * 2026-09-10 사용자 지시 — 품목 산업 페이지는 단계를 탭으로 넘기지 않고 한 페이지에 전부 출력한다.
 * 기업 해부(/company-anatomy)와 같은 `continuous` 골격이다. 회귀하면 01단계만 그려진다.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import TunaIndustryDashboard from '../components/market-understanding/TunaIndustryDashboard';
import SquidIndustryDashboard from '../components/market-understanding/SquidIndustryDashboard';
import MackerelIndustryDashboard from '../components/market-understanding/MackerelIndustryDashboard';
import WhelkIndustryDashboard from '../components/market-understanding/WhelkIndustryDashboard';
import ShrimpIndustryDashboard from '../components/market-understanding/ShrimpIndustryDashboard';
import PollockIndustryDashboard from '../components/market-understanding/PollockIndustryDashboard';
import TunaAnatomyDashboard from '../components/market-understanding/TunaAnatomyDashboard';

const PAGES: Array<[string, string, React.ComponentType<never>]> = [
  ['참치', 'tuna', TunaIndustryDashboard as never],
  ['오징어', 'squid', SquidIndustryDashboard as never],
  ['고등어', 'mackerel', MackerelIndustryDashboard as never],
  ['골뱅이', 'whelk', WhelkIndustryDashboard as never],
  ['새우', 'shrimp', ShrimpIndustryDashboard as never],
  ['명태', 'pollock', PollockIndustryDashboard as never],
  ['참치 해부', 'tuna-anatomy', TunaAnatomyDashboard as never],
];

describe('품목 산업 페이지 — 한 페이지 연속 출력', () => {
  for (const [name, key, Component] of PAGES) {
    it(`${name}: 탭 수만큼 단계 절이 전부 그려진다`, () => {
      const html = renderToStaticMarkup(React.createElement(Component));
      const tabs = html.match(new RegExp(`id="${key}-industry-tab-[^"]+"`, 'g')) ?? [];
      const stages = html.match(new RegExp(`id="${key}-stage-[^"]+"`, 'g')) ?? [];
      expect(tabs.length, `${name}: 탭이 없다`).toBeGreaterThanOrEqual(2);
      expect(new Set(stages).size, `${name}: 단계 절 수가 탭 수와 다르다`).toBe(new Set(tabs).size);
      // 페이저의 「다음」 손잡이는 연속 모드에서 사라진다.
      expect(html).not.toContain('stageNext');
      // 품목 페이지의 이동 단위는 「단계」다. 「절」은 기업 해부 전용 문구다.
      expect(html).toContain('단계에서 보기');
      expect(html).not.toContain('절로 보기');
    });
  }
});
