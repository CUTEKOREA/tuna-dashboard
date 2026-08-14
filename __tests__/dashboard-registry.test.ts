import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import sitemap from '../app/sitemap';
import {
  DASHBOARD_COMMANDS,
  DASHBOARD_MENU_CONFIGS,
  DASHBOARD_PANEL_ORDER,
  DASHBOARD_TITLES,
  getDashboardAccent,
  getDashboardTitle,
  isActiveMenu,
  KEYBOARD_SHORTCUT_MENUS,
  PUBLIC_DASHBOARD_ROUTES,
  PROTECTED_OPERATION_MENU_KEYS,
  SIDEBAR_SECTIONS,
  VALID_MENUS,
} from '../lib/dashboard-registry';

describe('dashboard registry', () => {
  it('retires the beef dashboard route with an explicit 404 boundary', () => {
    const routeSource = readFileSync(join(process.cwd(), 'app/beef/page.tsx'), 'utf8');

    expect(routeSource).toContain('notFound()');
    expect(isActiveMenu('beef')).toBe(false);
  });

  it('retires the korea-market dashboard route with an explicit 404 boundary', () => {
    const routeSource = readFileSync(join(process.cwd(), 'app/korea-market/page.tsx'), 'utf8');

    expect(routeSource).toContain('notFound()');
    expect(isActiveMenu('korea-market')).toBe(false);
  });

  it('retires the cassava dashboard route with an explicit 404 boundary', () => {
    const routeSource = readFileSync(join(process.cwd(), 'app/cassava/page.tsx'), 'utf8');

    expect(routeSource).toContain('notFound()');
    expect(isActiveMenu('cassava')).toBe(false);
  });

  it('retires the kim dashboard route with an explicit 404 boundary', () => {
    const routeSource = readFileSync(join(process.cwd(), 'app/kim/page.tsx'), 'utf8');

    expect(routeSource).toContain('notFound()');
    expect(isActiveMenu('kim')).toBe(false);
  });

  it('retires the used-car dashboard route with an explicit 404 boundary', () => {
    const routeSource = readFileSync(join(process.cwd(), 'app/used-car/page.tsx'), 'utf8');

    expect(routeSource).toContain('notFound()');
    expect(isActiveMenu('used-car')).toBe(false);
  });

  it('retires the whelk dashboard route with an explicit 404 boundary', () => {
    const routeSource = readFileSync(join(process.cwd(), 'app/whelk/page.tsx'), 'utf8');

    expect(routeSource).toContain('notFound()');
    expect(isActiveMenu('whelk')).toBe(false);
  });

  it('retires the salmon dashboard route with an explicit 404 boundary', () => {
    const routeSource = readFileSync(join(process.cwd(), 'app/salmon/page.tsx'), 'utf8');

    expect(routeSource).toContain('notFound()');
    expect(isActiveMenu('salmon')).toBe(false);
  });

  it('retires the fleet-strategy dashboard route with an explicit 404 boundary', () => {
    const routeSource = readFileSync(join(process.cwd(), 'app/fleet-strategy/page.tsx'), 'utf8');

    expect(routeSource).toContain('notFound()');
    expect(isActiveMenu('fleet-strategy')).toBe(false);
  });

  it('retires the research-lab dashboard route with an explicit 404 boundary', () => {
    const routeSource = readFileSync(join(process.cwd(), 'app/research-lab/page.tsx'), 'utf8');

    expect(routeSource).toContain('notFound()');
    expect(isActiveMenu('research-lab')).toBe(false);
  });

  it('retires the shrimp dashboard route with an explicit 404 boundary', () => {
    const routeSource = readFileSync(join(process.cwd(), 'app/shrimp/page.tsx'), 'utf8');

    expect(routeSource).toContain('notFound()');
    expect(isActiveMenu('shrimp')).toBe(false);
  });

  it('retires the galchi dashboard route with an explicit 404 boundary', () => {
    const routeSource = readFileSync(join(process.cwd(), 'app/galchi/page.tsx'), 'utf8');

    expect(routeSource).toContain('notFound()');
    expect(isActiveMenu('galchi')).toBe(false);
  });

  it('retires archived seafood dashboards with explicit 404 boundaries', () => {
    for (const slug of ['value-chain', 'octopus', 'squid', 'pollock', 'mackerel', 'flatfish'] as const) {
      const routeSource = readFileSync(join(process.cwd(), `app/${slug}/page.tsx`), 'utf8');
      expect(routeSource).toContain('notFound()');
      expect(isActiveMenu(slug)).toBe(false);
    }
  });

  it('routes hydration-sensitive dashboards through the client-only category page', () => {
    const configSource = readFileSync(join(process.cwd(), 'next.config.mjs'), 'utf8');
    const categorySource = readFileSync(join(process.cwd(), 'app/[category]/page.tsx'), 'utf8');
    const rewriteSource = configSource.match(/source:\s*'([^']+)'/)?.[1];

    expect(rewriteSource).toBeDefined();
    expect(rewriteSource).not.toContain('unloading');
    expect(rewriteSource).not.toContain('korea-market');
    expect(rewriteSource).not.toContain('used-car');
    expect(rewriteSource).not.toContain('kim');
    expect(rewriteSource).not.toContain('whelk');
    expect(rewriteSource).not.toContain('salmon');
    expect(rewriteSource).not.toContain('research-lab');
    expect(rewriteSource).not.toContain('shrimp');
    expect(rewriteSource).not.toContain('galchi');
    expect(rewriteSource).not.toContain('value-chain');
    expect(rewriteSource).not.toContain('squid');
    expect(rewriteSource).not.toContain('octopus');
    expect(rewriteSource).not.toContain('pollock');
    expect(rewriteSource).not.toContain('mackerel');
    expect(rewriteSource).not.toContain('flatfish');
    expect(rewriteSource).not.toContain('fleet-strategy');
    expect(rewriteSource).not.toContain('logistics');
    expect(rewriteSource).not.toContain('fleet-strategy');
    expect(rewriteSource?.match(/\(([^)]+)\)/)?.[1].split('|')).not.toContain('fleet');
    expect(categorySource).toContain('ssr: false');
  });

  it('keeps the fleet command center task-focused and deterministic', () => {
    const commandSource = readFileSync(join(process.cwd(), 'components/FleetCommandCenter.tsx'), 'utf8');
    const mapSource = readFileSync(join(process.cwd(), 'components/FleetPixelMap.tsx'), 'utf8');
    const heroSource = readFileSync(join(process.cwd(), 'components/FleetHeroKPI.tsx'), 'utf8');
    const pillTabsSource = readFileSync(join(process.cwd(), 'components/v2/PillTabs.tsx'), 'utf8');
    const rosterSource = readFileSync(join(process.cwd(), 'components/FleetRosterGrid.tsx'), 'utf8');
    const vdsStrategySource = readFileSync(join(process.cwd(), 'components/VdsStrategyMatrix.tsx'), 'utf8');

    for (const label of ['오늘의 운영', '선박·수역', '실적 분석', 'VDS·입어료']) {
      expect(commandSource).toContain(label);
    }
    expect(commandSource).toContain('<HeroZone');
    expect(commandSource).toContain('variant="vessel"');
    expect(commandSource).toContain('background={heroBackground}');
    expect(commandSource).toContain('<PillTabs');
    expect(commandSource).toContain('role="tabpanel"');
    expect(commandSource).toContain('업무보고 원문 펼치기');
    expect(commandSource).toContain('nationalOverrunCount');
    expect(commandSource).not.toContain('음수 잔여 11건');
    expect(commandSource).toContain("hidden={activeTab !== 'operations'}");
    expect(commandSource).toContain("hidden={activeTab !== 'vessels'}");
    expect(commandSource).toContain("hidden={activeTab !== 'performance'}");
    expect(commandSource).toContain("hidden={activeTab !== 'access'}");
    expect(pillTabsSource).toContain('role="tablist"');
    expect(pillTabsSource).toContain('onKeyDown');
    expect(pillTabsSource).toContain('tabIndex={active ? 0 : -1}');
    expect(pillTabsSource).toContain('aria-controls={panelId}');
    expect(mapSource).not.toContain('Math.random');
    expect(mapSource).toContain('aria-expanded');
    expect(mapSource).toContain('aria-controls');
    expect(mapSource).toContain('hidden={!selected}');
    expect(mapSource).toContain("event.key === 'Escape'");
    expect(mapSource).toContain('aria-label={`${ship.name} 상세 보기`');
    const mapStyles = readFileSync(join(process.cwd(), 'components/FleetPixelMap.module.css'), 'utf8');
    expect(mapStyles).toContain('width: 44px');
    expect(mapStyles).toContain('height: 44px');
    expect(rosterSource).toContain("port: '⚓ 하역·정박'");
    expect(rosterSource).not.toContain('statusLabels[status] || status');
    expect(rosterSource).not.toContain('weeklyRanking.find');
    expect(rosterSource).toContain('summary={`일간 ${pacificDailyReport.dailyCatchMt.toLocaleString()');
    expect(rosterSource).toContain('longlineDailyReport.vessels.map');
    expect(rosterSource).not.toContain("filter((vessel) => !vessel.name.includes('컨테이너'))");
    expect(rosterSource).toContain('countLabel={`${carrierFleet.length}건`}');
    expect(vdsStrategySource).toContain('nationalVds');
    expect(vdsStrategySource).not.toContain('remaining: 315.03');
    expect(commandSource).toContain('title="선단 운영"');
    expect(heroSource).toContain('val1: summary.weeklyTotal');
    expect(heroSource).not.toContain('val1: 917');
  });
  it('keeps menu keys unique and title-addressable', () => {
    expect(DASHBOARD_MENU_CONFIGS.length).toBeGreaterThanOrEqual(7);
    expect(new Set(VALID_MENUS).size).toBe(VALID_MENUS.length);

    for (const menu of DASHBOARD_MENU_CONFIGS) {
      expect(menu.title).toMatch(/[가-힣]/);
      expect(DASHBOARD_TITLES[menu.key]).toBe(menu.title);
      expect(getDashboardTitle(menu.key)).toBe(menu.title);
      expect(getDashboardAccent(menu.key)).toBe(menu.accent);
      expect(isActiveMenu(menu.key)).toBe(true);
    }

    expect(isActiveMenu('ai-forecast')).toBe(false);
    expect(isActiveMenu('beef')).toBe(false);
    expect(isActiveMenu('korea-market')).toBe(false);
    expect(isActiveMenu('cassava')).toBe(false);
    expect(isActiveMenu('garlic')).toBe(false);
    expect(isActiveMenu('carrot')).toBe(false);
    expect(isActiveMenu('cocoa')).toBe(false);
    expect(isActiveMenu('seasia-oem')).toBe(false);
    expect(isActiveMenu('cold-storage')).toBe(false);
    expect(isActiveMenu('msc')).toBe(false);
    expect(isActiveMenu('sashimi-steak')).toBe(false);
    expect(isActiveMenu('kim')).toBe(false);
    expect(isActiveMenu('used-car')).toBe(false);
    expect(isActiveMenu('whelk')).toBe(false);
    expect(isActiveMenu('salmon')).toBe(false);
    expect(isActiveMenu('fleet-strategy')).toBe(false);
    expect(isActiveMenu('research-lab')).toBe(false);
    expect(isActiveMenu('cashew')).toBe(false);
    expect(isActiveMenu('shrimp')).toBe(false);
    expect(isActiveMenu('jukkumi')).toBe(false);
    expect(isActiveMenu('galchi')).toBe(false);
    expect(isActiveMenu('value-chain')).toBe(false);
    expect(isActiveMenu('octopus')).toBe(false);
    expect(isActiveMenu('squid')).toBe(false);
    expect(isActiveMenu('pollock')).toBe(false);
    expect(isActiveMenu('mackerel')).toBe(false);
    expect(isActiveMenu('flatfish')).toBe(false);
    expect(isActiveMenu('retail')).toBe(false);
  });

  it('keeps operation locks and keyboard shortcuts inside valid menus', () => {
    expect(PROTECTED_OPERATION_MENU_KEYS).toEqual(['fleet', 'unloading', 'logistics']);
    expect(KEYBOARD_SHORTCUT_MENUS).toEqual([
      'market',
      'fleet',
      'unloading',
      'logistics',
    ]);

    for (const key of [...PROTECTED_OPERATION_MENU_KEYS, ...KEYBOARD_SHORTCUT_MENUS]) {
      expect(VALID_MENUS).toContain(key);
    }
  });

  it('drives command search from the same valid menu registry', () => {
    expect(DASHBOARD_COMMANDS.map((command) => command.key)).toEqual(
      VALID_MENUS.filter((menu) => menu !== 'pork'),
    );

    for (const command of DASHBOARD_COMMANDS) {
      expect(command.label).toBe(DASHBOARD_TITLES[command.key]);
      expect(command.category).toMatch(/[가-힣]/);
    }

    expect(DASHBOARD_COMMANDS.map((command) => command.key)).not.toEqual(
      expect.arrayContaining(['ai-forecast', 'strategy', 'retail', 'ranching']),
    );
  });

  it('retires pork from navigation while preserving the direct dashboard route', () => {
    const livestockItems = SIDEBAR_SECTIONS
      .find((section) => section.section === 'livestock')
      ?.items.map((item) => item.key) ?? [];

    expect(livestockItems).not.toContain('pork');
    expect(DASHBOARD_COMMANDS.map((command) => command.key)).not.toContain('pork');
    expect(PUBLIC_DASHBOARD_ROUTES).not.toContain('pork');
    expect(VALID_MENUS).toContain('pork');
    expect(DASHBOARD_PANEL_ORDER).toContain('pork');
  });

  it('derives public sitemap dashboard routes from non-protected menus', () => {
    expect(PUBLIC_DASHBOARD_ROUTES).toEqual(
      VALID_MENUS.filter((menu) => !['market', 'fleet', 'unloading', 'logistics', 'pork'].includes(menu)),
    );
    expect(PUBLIC_DASHBOARD_ROUTES).not.toContain('value-chain');
    expect(PUBLIC_DASHBOARD_ROUTES).not.toContain('octopus');
    expect(PUBLIC_DASHBOARD_ROUTES).not.toContain('squid');
    expect(PUBLIC_DASHBOARD_ROUTES).not.toContain('pollock');
    expect(PUBLIC_DASHBOARD_ROUTES).not.toContain('mackerel');
    expect(PUBLIC_DASHBOARD_ROUTES).not.toContain('flatfish');
    expect(PUBLIC_DASHBOARD_ROUTES).toContain('cross-intelligence');
    expect(PUBLIC_DASHBOARD_ROUTES).not.toContain('sashimi-steak');
    expect(PUBLIC_DASHBOARD_ROUTES).not.toContain('bni-global');
    expect(PUBLIC_DASHBOARD_ROUTES).not.toContain('beef');
    expect(PUBLIC_DASHBOARD_ROUTES).not.toContain('korea-market');
    expect(PUBLIC_DASHBOARD_ROUTES).not.toContain('cassava');
    expect(PUBLIC_DASHBOARD_ROUTES).not.toContain('garlic');
    expect(PUBLIC_DASHBOARD_ROUTES).not.toContain('carrot');
    expect(PUBLIC_DASHBOARD_ROUTES).not.toContain('cocoa');
    expect(PUBLIC_DASHBOARD_ROUTES).not.toContain('seasia-oem');
    expect(PUBLIC_DASHBOARD_ROUTES).not.toContain('cold-storage');
    expect(PUBLIC_DASHBOARD_ROUTES).not.toContain('msc');
    expect(PUBLIC_DASHBOARD_ROUTES).not.toContain('kim');
    expect(PUBLIC_DASHBOARD_ROUTES).not.toContain('used-car');
    expect(PUBLIC_DASHBOARD_ROUTES).not.toContain('whelk');
    expect(PUBLIC_DASHBOARD_ROUTES).not.toContain('salmon');
    expect(PUBLIC_DASHBOARD_ROUTES).not.toContain('fleet-strategy');
    expect(PUBLIC_DASHBOARD_ROUTES).not.toContain('research-lab');
    expect(PUBLIC_DASHBOARD_ROUTES).not.toContain('cashew');
    expect(PUBLIC_DASHBOARD_ROUTES).not.toContain('shrimp');
    expect(PUBLIC_DASHBOARD_ROUTES).not.toContain('jukkumi');
    expect(PUBLIC_DASHBOARD_ROUTES).not.toContain('galchi');
    expect(PUBLIC_DASHBOARD_ROUTES).not.toContain('market');
    expect(PUBLIC_DASHBOARD_ROUTES).not.toContain('fleet');
  });

  it('publishes public dashboard routes to sitemap in registry order', () => {
    const publicRouteSet = new Set<string>(PUBLIC_DASHBOARD_ROUTES);
    const routes = sitemap().map((entry) => new URL(entry.url).pathname.replace(/^\//, ''));
    const dashboardRoutes = routes.filter((route) => publicRouteSet.has(route));

    expect(routes[0]).toBe('');
    expect(dashboardRoutes).toEqual(PUBLIC_DASHBOARD_ROUTES);
  });

  it('omits sidebar sections after every item in the section is retired', () => {
    expect(SIDEBAR_SECTIONS.map((section) => section.section)).not.toContain('livestock');
    expect(SIDEBAR_SECTIONS.map((section) => section.section)).not.toContain('strategy');
    expect(SIDEBAR_SECTIONS.map((section) => section.section)).not.toContain('agriculture');
    expect(SIDEBAR_SECTIONS.map((section) => section.section)).not.toContain('fishery');
    expect(SIDEBAR_SECTIONS.every((section) => section.items.length > 0)).toBe(true);
  });

  it('defines sidebar sections from visible registry items in render order', () => {
    expect(SIDEBAR_SECTIONS.map((section) => section.title)).toEqual([
      '📡 실시간 운영',
    ]);

    expect(SIDEBAR_SECTIONS.map((section) => section.items.map((item) => item.key))).toEqual([
      ['market', 'fleet', 'unloading', 'logistics'],
    ]);

    const sidebarKeys = SIDEBAR_SECTIONS.flatMap((section) => section.items.map((item) => item.key));
    expect(new Set(sidebarKeys).size).toBe(sidebarKeys.length);
    expect(sidebarKeys).not.toContain('purse-seiner-db');
    expect(sidebarKeys).not.toContain('bni-global');
    expect(sidebarKeys).not.toContain('cross-intelligence');

    for (const item of SIDEBAR_SECTIONS.flatMap((section) => section.items)) {
      expect(VALID_MENUS).toContain(item.key);
      expect(item.label).toMatch(/[가-힣A-Z]/);
      expect(item.icon).toMatch(/^[A-Za-z][A-Za-z0-9]*$/);
    }
  });

  it('defines dashboard panel render order for every active menu', () => {
    expect(DASHBOARD_PANEL_ORDER).toEqual([
      'market',
      'fleet',
      'logistics',
      'pork',
      'unloading',
      'purse-seiner-db',
    ]);
    expect(new Set(DASHBOARD_PANEL_ORDER)).toEqual(
      new Set(VALID_MENUS.filter((menu) => menu !== 'cross-intelligence')),
    );
    expect(DASHBOARD_PANEL_ORDER).not.toContain('bni-global');
    expect(DASHBOARD_PANEL_ORDER).not.toContain('cross-intelligence');
  });
});
