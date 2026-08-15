import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import CrossCommodityIntelligenceDashboard from '../components/CrossCommodityIntelligenceDashboard';
import FleetCommandCenter from '../components/FleetCommandCenter';
import LogisticsDashboard from '../components/LogisticsDashboard';
import MarketDashboard from '../components/MarketDashboard';
import PorkDashboard from '../components/PorkDashboard';
import PurseSeinerDashboard from '../components/PurseSeinerDashboard';
import UnloadingStatus from '../components/UnloadingStatus';

type HeroOnlyDashboard = React.ComponentType<{ heroOnly?: boolean }>;

const heroOnlyCases: Array<{
  name: string;
  Dashboard: HeroOnlyDashboard;
  heroTitle: string;
  heroMarker: string;
  bodyText: string;
}> = [
  {
    name: '시장 동향',
    Dashboard: MarketDashboard as HeroOnlyDashboard,
    heroTitle: '시장 동향',
    heroMarker: '참치 가격 데이터 수신 대기',
    bodyText: '글로벌 참치 어가 추이',
  },
  {
    name: '선단 운영',
    Dashboard: FleetCommandCenter as HeroOnlyDashboard,
    heroTitle: '선단 운영',
    heroMarker: '주간 어획량',
    bodyText: '업무보고 원문 펼치기',
  },
  {
    name: '하역 관제',
    Dashboard: UnloadingStatus as HeroOnlyDashboard,
    heroTitle: '하역 관제',
    heroMarker: '2026 누적 하역량',
    bodyText: '오늘의 운영 판단',
  },
  {
    name: '물류·가공',
    Dashboard: LogisticsDashboard as HeroOnlyDashboard,
    heroTitle: '물류·가공',
    heroMarker: '주간 하역 합계',
    bodyText: '오늘의 운영',
  },
  {
    name: '돼지고기',
    Dashboard: PorkDashboard as HeroOnlyDashboard,
    heroTitle: '돼지고기',
    heroMarker: '중국 돈육 생산량',
    bodyText: '한국 1인당 소비량',
  },
  {
    name: '통합 인텔리전스',
    Dashboard: CrossCommodityIntelligenceDashboard as HeroOnlyDashboard,
    heroTitle: '통합 인텔리전스',
    heroMarker: '최대 대체 압력',
    bodyText: '대체 회전',
  },
  {
    name: '선망선 DB',
    Dashboard: PurseSeinerDashboard as HeroOnlyDashboard,
    heroTitle: '선망선 DB',
    heroMarker: '검증 선박',
    bodyText: 'RFMO별 분포',
  },
];

describe('잠금 상태 히어로 티저', () => {
  it.each(heroOnlyCases)('$name 진입점은 heroOnly에서 히어로만 렌더한다', ({ Dashboard, heroTitle, heroMarker, bodyText }) => {
    const markup = renderToStaticMarkup(
      React.createElement(Dashboard, { heroOnly: true }),
    );

    expect(markup).toContain(heroTitle);
    expect(markup).toContain(heroMarker);
    expect(markup).not.toContain(bodyText);
  });

  it('잠금 분기에서 지원 메뉴의 heroOnly 티저와 접근 확인 폼을 함께 렌더한다', () => {
    const source = readFileSync(join(process.cwd(), 'app/page.tsx'), 'utf8');
    const supportedDashboards = [
      'MarketDashboard',
      'FleetCommandCenter',
      'UnloadingStatus',
      'LogisticsDashboard',
      'PorkDashboard',
      'CrossCommodityIntelligenceDashboard',
      'PurseSeinerDashboard',
    ];

    for (const dashboard of supportedDashboards) {
      expect(source).toMatch(new RegExp(`<${dashboard}\\s+heroOnly\\s*/>`));
    }

    const lockedBranch = source.indexOf('{isOperationMenuLocked && (');
    const teaserRender = source.indexOf('{heroTeaserPanels[activeMenu]}', lockedBranch);
    const accessForm = source.indexOf('전체 메뉴 접근 확인', teaserRender);
    const dashboardPanelRender = source.indexOf('{DASHBOARD_PANEL_ORDER.map', accessForm);
    const fullPanelGate = source.lastIndexOf('{!isOperationMenuLocked && (', dashboardPanelRender);
    const fullPanelGateSource = source.slice(fullPanelGate, dashboardPanelRender);

    expect(lockedBranch).toBeGreaterThan(-1);
    expect(teaserRender).toBeGreaterThan(lockedBranch);
    expect(accessForm).toBeGreaterThan(teaserRender);
    expect(dashboardPanelRender).toBeGreaterThan(accessForm);
    expect(fullPanelGate).toBeGreaterThan(accessForm);
    expect(fullPanelGateSource).not.toContain('<LiveTicker');
    expect(source).toContain('핵심 지표는 공개되며, 상세 분석은 내부 확인 후 열람할 수 있습니다.');
    // 2026-08-15: 코스모 네이티브 이전으로 히어로 보유 — 티저 지원 목록에 합류
    expect(source).toMatch(/cosmo: <CosmoDashboard heroOnly \/>/);
    // 2026-08-15: 방콕사무소도 네이티브 탭 대시보드로 이전 — 티저 합류
    expect(source).toMatch(/'bangkok-office': <BangkokDashboard heroOnly \/>/);
    expect(source).not.toMatch(/<BangkokOfficeDashboard\s+heroOnly/);
    expect(source).toContain("!isOperationMenuLocked && activeMenu === 'market'");
  });
});
