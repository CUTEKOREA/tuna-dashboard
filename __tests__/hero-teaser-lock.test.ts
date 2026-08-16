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
    heroMarker: '일간 합계',
    bodyText: '일일 선단 운영 보고',
  },
  {
    name: '하역 현황',
    Dashboard: UnloadingStatus as HeroOnlyDashboard,
    heroTitle: '하역 현황',
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

  it('전역 서버 인증 전에는 heroOnly 티저나 비밀번호 폼도 렌더하지 않는다', () => {
    const source = readFileSync(join(process.cwd(), 'app/page.tsx'), 'utf8');
    const proxySource = readFileSync(join(process.cwd(), 'proxy.ts'), 'utf8');
    const loginSource = readFileSync(join(process.cwd(), 'lib/auth/login-response.ts'), 'utf8');
    const oauthStartSource = readFileSync(join(process.cwd(), 'app/auth/start/route.ts'), 'utf8');
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
      expect(source).not.toMatch(new RegExp(`<${dashboard}\\s+heroOnly\\s*/>`));
    }

    expect(source).toContain('{DASHBOARD_PANEL_ORDER.map');
    expect(source).not.toContain('isOperationMenuLocked');
    expect(source).not.toContain('heroTeaserPanels');
    expect(source).not.toContain('전체 메뉴 접근 확인');
    expect(proxySource).toContain('updateDashboardOwnerSession');
    expect(loginSource).toContain('href="${escapeHtml(loginHref)}"');
    expect(loginSource).not.toContain('<form');
    expect(oauthStartSource).toContain("provider: 'google'");
  });
});
