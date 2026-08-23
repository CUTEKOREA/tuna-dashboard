/**
 * 단계 탭 내비의 가드.
 *
 * 오징어 10단계에서 «이동이 원활하지 않다»는 지적이 나왔다. 원인이 셋이었다 —
 * 부제까지 실은 긴 라벨, 가로 스크롤, 그리고 바깥 `.tabNav` 와 안쪽 PillTabs 가
 * 각각 스크롤 컨테이너라 드래그·휠이 어디로 갈지 예측되지 않은 것.
 *
 * 여기서 막는 것은 **되돌아가는 것**이다. 라벨에 부제가 다시 붙거나 줄바꿈이 꺼지면
 * 같은 증상이 그대로 재현된다.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import MackerelIndustryDashboard from '@/components/market-understanding/MackerelIndustryDashboard';
import ShrimpIndustryDashboard from '@/components/market-understanding/ShrimpIndustryDashboard';
import SquidIndustryDashboard from '@/components/market-understanding/SquidIndustryDashboard';
import TunaIndustryDashboard from '@/components/market-understanding/TunaIndustryDashboard';
import WhelkIndustryDashboard from '@/components/market-understanding/WhelkIndustryDashboard';

const DASHBOARDS = [
  // 08 선박별(사내 자료) + 보고서 이식 09~15 + 배포본 전용 D 가 붙어 19단계다.
  ['오징어', SquidIndustryDashboard, 19],
  ['참치', TunaIndustryDashboard, 10],
  ['새우', ShrimpIndustryDashboard, 7],
  ['고등어', MackerelIndustryDashboard, 6],
  ['골뱅이', WhelkIndustryDashboard, 6],
] as const;

function tabLabels(html: string): string[] {
  return [
    ...html.matchAll(
      /role="tab"[\s\S]{0,900}?<span style="position:relative;display:flex;align-items:center;gap:6px">([^<]{2,40})</g,
    ),
  ].map((m) => m[1]);
}

describe('단계 탭 내비', () => {
  for (const [name, Dashboard, count] of DASHBOARDS) {
    it(`${name} — 탭 ${count}개가 부제 없이 줄바꿈으로 놓인다`, () => {
      const html = renderToStaticMarkup(React.createElement(Dashboard as never));
      const labels = tabLabels(html);

      expect(labels).toHaveLength(count);

      // 부제가 붙으면 한 줄에 안 들어가고 탭 폭이 들쭉날쭉해진다.
      for (const label of labels) {
        expect(label, `부제가 남아 있다: ${label}`).not.toContain(' — ');
      }

      // 줄바꿈이 꺼지면 가로 스크롤로 되돌아간다.
      expect(html).toContain('flex-wrap:wrap');
    });
  }

  /**
   * 스크롤 컨테이너는 하나여야 한다. 바깥과 안쪽이 둘 다 스크롤되면 넘칠 때
   * 어느 쪽이 움직일지 예측이 안 된다 — 이것이 원래 증상의 절반이었다.
   */
  it('탭을 감싼 nav 에 가로 스크롤을 다시 걸지 않는다', () => {
    const css = readFileSync(
      join(__dirname, '..', 'components/market-understanding/TunaIndustryDashboard.module.css'),
      'utf8',
    );
    const block = css.slice(css.indexOf('.tabNav {'), css.indexOf('.tabNav {') + 200);
    expect(block).not.toMatch(/overflow-x:\s*auto/);
  });

  /** 부제를 뺀 만큼 단계 머리글이 전문을 보여줘야 한다. 아니면 정보가 사라진다. */
  it('단계 머리글은 부제까지 전문을 보여준다', () => {
    const html = renderToStaticMarkup(React.createElement(SquidIndustryDashboard as never));
    expect(html).toContain('한 해살이 생물');
  });
});
