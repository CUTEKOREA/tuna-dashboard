import React from 'react';
import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { FleetTab } from '../components/panofi/PanofiTabs';
import { fleetDailyPublicLatest, fleetDailyPublicSeries } from '../lib/data/fleet-daily-public';

describe('파노피 선단·조업 - 대서양 선박별 표', () => {
  const markup = renderToStaticMarkup(React.createElement(FleetTab));

  it('7척이 화면 이름으로 나오고 금일 어획 합이 해역 일간 어획과 같다', () => {
    for (const name of ['마스터', '디스커버러', '포러너', '패스파인더', '커맨더', '퀸', '그레이스']) {
      expect(markup).toContain(`<td>${name}</td>`);
    }
    const vessels = fleetDailyPublicSeries.atlantic.vessels;
    expect(Object.keys(vessels)).toHaveLength(7);
    const today = Object.values(vessels).reduce((a, v) => a + (v[v.length - 1] ?? 0), 0);
    expect(today).toBe(fleetDailyPublicLatest.atlantic.dailyMt);
  });

  it('보호 상세는 서버 렌더에 들어가지 않고(불러오는 중), 위치 필드는 코드에서 아예 읽지 않는다', () => {
    expect(markup).toContain('불러오는 중');
    const src = readFileSync('components/panofi/AtlanticVesselTable.tsx', 'utf8');
    expect(src).not.toMatch(/\.position\b/);
    expect(markup).not.toMatch(/\d+°/);
  });
});
