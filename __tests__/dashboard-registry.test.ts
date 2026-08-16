import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import sitemap from '../app/sitemap';
import * as dashboardRegistry from '../lib/dashboard-registry';
import { parseFleetPosition, toPacificLng } from '../lib/fleet-map-coords';
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
  SESSION_ACCESS_MENUS,
  SIDEBAR_SECTIONS,
  VALID_MENUS,
} from '../lib/dashboard-registry';

function cssRule(source: string, selector: string): string {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return source.match(new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? '';
}

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
    expect(rewriteSource).not.toContain('market');
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
    const mapSource = readFileSync(join(process.cwd(), 'components/FleetRealMap.tsx'), 'utf8');
    const heroSource = readFileSync(join(process.cwd(), 'components/FleetHeroKPI.tsx'), 'utf8');
    const pillTabsSource = readFileSync(join(process.cwd(), 'components/v2/PillTabs.tsx'), 'utf8');
    const rosterSource = readFileSync(join(process.cwd(), 'components/FleetRosterGrid.tsx'), 'utf8');
    const vdsStrategySource = readFileSync(join(process.cwd(), 'components/VdsStrategyMatrix.tsx'), 'utf8');

    for (const label of ['오늘의 운영', '선박·수역', '실적 분석', 'VDS·입어료']) {
      expect(commandSource).toContain(label);
    }
    expect(commandSource).toContain('<HeroZone');
    expect(commandSource).toContain('variant="vessel"');
    // 2026-08-15 사용자 지시: 선박 사진 배경 제거 — 배경 슬롯 자체가 없어야 한다
    expect(commandSource).not.toContain('background={heroBackground}');
    expect(commandSource).toContain('<PillTabs');
    expect(commandSource).toContain('role="tabpanel"');
    expect(commandSource).toContain("import FleetDailyOperations from './FleetDailyOperations'");
    expect(commandSource).toContain('<FleetDailyOperations detailState={detailState} onRetry=');
    expect(commandSource).toContain("from '@/lib/data/fleet-daily-public'");
    expect(commandSource).toContain("from '@/lib/fleet-daily-presentation'");
    expect(commandSource).toContain("fetch('/api/fleet/daily'");
    expect(commandSource).toContain("cache: 'no-store'");
    expect(commandSource).toContain("hidden={activeTab !== 'operations'}");
    expect(commandSource).toContain("hidden={activeTab !== 'vessels'}");
    expect(commandSource).toContain("hidden={activeTab !== 'performance'}");
    expect(commandSource).toContain("hidden={activeTab !== 'access'}");
    expect(pillTabsSource).toContain('role="tablist"');
    expect(pillTabsSource).toContain('onKeyDown');
    expect(pillTabsSource).toContain('tabIndex={active ? 0 : -1}');
    expect(pillTabsSource).toContain('aria-controls={panelId}');
    // 2026-08-15 사용자 지시(«실제 지도 사용»): 픽셀 아트 지도(FleetPixelMap) → leaflet 실지도(FleetRealMap).
    // 자체 button 마커의 aria-expanded/Escape 계약은 leaflet 마커·툴팁 계약으로 대체됐다.
    // 마커 44px 터치 목표와 결정적 좌표(무작위 금지)는 새 컴포넌트에서도 그대로 유지한다.
    expect(mapSource).not.toContain('Math.random');
    expect(mapSource).toContain("import 'leaflet/dist/leaflet.css'");
    expect(mapSource).toContain('<TileLayer');
    expect(mapSource).toContain('attribution='); // 타일 라이선스 표기 유지
    expect(mapSource).toContain('width:44px;height:44px');
    expect(mapSource).toContain('alt={`${ship.name} 선박 위치`}');
    expect(commandSource).toContain("import('./FleetRealMap')");
    expect(commandSource).toContain('ssr: false'); // leaflet은 window 의존 — SSR 금지
    // 보고 원문의 도·분 표기가 위경도로 정확히 환산되는지 (S/PIO 8/9 위치)
    expect(parseFleetPosition('N0351 W16734 (H)')).toEqual([3.85, -167 - 34 / 60]);
    expect(parseFleetPosition('S0112 W01020 (H)')).toEqual([-1.2, -10 - 20 / 60]);
    expect(parseFleetPosition('X-MAS')).toEqual([1.87, -157.43]);
    expect(toPacificLng(-157.43)).toBeCloseTo(202.57, 5);
    expect(rosterSource).toContain("from '@/lib/fleet-daily-presentation'");
    expect(rosterSource).toContain('buildFleetRoster(detail)');
    expect(rosterSource).toContain('formatFleetDailyNote');
    expect(rosterSource).toContain('roster.pacific.map');
    expect(rosterSource).toContain('roster.atlantic.map');
    expect(rosterSource).toContain('roster.carrier.map');
    expect(mapSource).toContain('roster.carrierPhysical');
    expect(mapSource).toContain('{formatFleetDailyNote(ship.note)}');
    expect(vdsStrategySource).toContain('nationalVds');
    expect(vdsStrategySource).not.toContain('remaining: 315.03');
    expect(commandSource).toContain('title="선단 운영"');
    expect(heroSource).toContain('val1: summary.weeklyTotal');
    expect(heroSource).not.toContain('val1: 917');
  });

  it('keeps the Phase 2 operation dashboards on their assigned V2 hero shells', () => {
    const unloadingSource = readFileSync(join(process.cwd(), 'components/UnloadingStatus.tsx'), 'utf8');
    const logisticsSource = readFileSync(join(process.cwd(), 'components/LogisticsDashboard.tsx'), 'utf8');
    const marketSource = readFileSync(join(process.cwd(), 'components/MarketDashboard.tsx'), 'utf8');

    expect(unloadingSource).toContain('<HeroZone');
    expect(unloadingSource).toContain('variant="vessel"');
    // 2026-08-15 사용자 지시: 히어로 선박 이미지 제거 (발광 계약은 VesselTopSVG 단위 테스트 소관)
    expect(unloadingSource).not.toContain('kind="carrier"');
    expect(unloadingSource).toContain('<PillTabs');

    expect(logisticsSource).toContain('<HeroZone');
    expect(logisticsSource).toContain('variant="map"');
    expect(logisticsSource).toContain("getMiscData('reeferWeek31')");
    expect(logisticsSource).toContain('<PillTabs');

    expect(marketSource).toContain('<HeroZone');
    expect(marketSource).toContain('variant="kpi"');
    expect(marketSource).toContain('<MarketHero rows={priceData} />');
  });

  it('keeps the four V2.5-b operation shells flat, tokenized, and separate from chart palettes', () => {
    const root = process.cwd();
    const appSource = readFileSync(join(root, 'app/page.tsx'), 'utf8');
    const marketSource = readFileSync(join(root, 'components/MarketDashboard.tsx'), 'utf8');
    const fleetSource = readFileSync(join(root, 'components/FleetCommandCenter.tsx'), 'utf8');
    const fleetHeroSource = readFileSync(join(root, 'components/FleetHeroKPI.tsx'), 'utf8');
    const fleetStyles = readFileSync(join(root, 'components/FleetCommandCenter.module.css'), 'utf8');
    const unloadingSource = readFileSync(join(root, 'components/UnloadingStatus.tsx'), 'utf8');
    // V3 라이트 오버라이드 구간은 flat 계약 대상이 아니다 (사진 블렌드용 페이드는 장식 그라디언트가 아님) —
    // 다크 정본 구간만 검사한다.
    const unloadingStyles = readFileSync(join(root, 'components/UnloadingStatus.module.css'), 'utf8')
      .split("[data-v3='light']")[0];
    const logisticsSource = readFileSync(join(root, 'components/LogisticsDashboard.tsx'), 'utf8');
    const logisticsStyles = readFileSync(join(root, 'components/LogisticsCommandCenter.module.css'), 'utf8');
    const globalsSource = readFileSync(join(root, 'app/globals.css'), 'utf8');
    const marketStylesPath = join(root, 'components/MarketDashboard.module.css');

    expect(appSource).toContain('INSTITUTIONAL_MENU_KEYS');
    expect(appSource).toContain('!INSTITUTIONAL_MENU_KEYS.has(activeMenu)');

    expect(existsSync(marketStylesPath)).toBe(true);
    if (!existsSync(marketStylesPath)) return;
    const marketStyles = readFileSync(marketStylesPath, 'utf8');
    expect(marketSource).toContain("import styles from './MarketDashboard.module.css'");
    expect(marketSource).not.toContain('--kpi-grad');
    expect(marketSource).not.toMatch(/accent:\s*['"]#/);
    expect(marketStyles).not.toContain('gradient');
    for (const selector of ['.kpiCard', '.chartPanel']) {
      const rule = cssRule(marketStyles, selector);
      expect(rule).not.toBe('');
    }
    expect(cssRule(marketStyles, '.dashboard')).toContain('var(--dsc-bg)');
    expect(marketSource.match(/dsc-card dsc-card--accent/g)).toHaveLength(4);
    expect(cssRule(marketStyles, '.kpiCard::before')).toBe('');
    expect(cssRule(globalsSource, '.dsc-card')).toContain('background: var(--dsc-surface)');
    expect(cssRule(globalsSource, '.dsc-card')).toContain('border-radius: var(--dsc-card-radius)');

    for (const selector of [
      '.commandIntro',
      '.heroStrip::before',
      '.kpiCardHighlight',
      '.decisionPanel',
      '.missionCard',
      '.accessAlert',
    ]) {
      const rule = cssRule(fleetStyles, selector);
      expect(rule).not.toBe('');
      expect(rule).not.toContain('gradient');
    }
    for (const selector of ['.missionCard', '.commandIntro', '.heroStrip', '.kpiCard', '.decisionPanel', '.accessAlert']) {
      expect(cssRule(fleetStyles, selector)).toContain('var(--dsc-');
    }
    expect(fleetSource).not.toContain("tone: 'warning'");
    // 계약의 핵심은 «액센트 hex 하드코딩 금지» — 2026-08-15 히어로 정리로 fleet의
    // 인라인 액센트 사용처 자체가 사라져 사용 강제는 제거한다.
    expect(fleetSource).not.toMatch(/accent:\s*['"]#/);
    expect(fleetHeroSource).not.toContain('linear-gradient');
    expect(fleetHeroSource).toContain("background: 'var(--accent-primary)'");
    expect(fleetHeroSource).toContain("background: 'var(--dsc-ink-faint)'");

    expect(unloadingStyles).not.toContain('linear-gradient');
    expect(unloadingStyles.indexOf('.heroMissionCardNow')).toBeGreaterThan(unloadingStyles.indexOf('.heroMissionCardActive'));
    expect(unloadingStyles.lastIndexOf('.heroMissionCardNow strong')).toBeGreaterThan(unloadingStyles.indexOf('.heroMissionCard strong'));
    expect(unloadingStyles).toContain('.heroMissionCardNow.heroMissionCardActive');
    expect(unloadingSource).not.toMatch(/accent:\s*['"]#/);
    expect(unloadingSource).toContain("color: 'var(--accent-primary)'");
    for (const selector of [
      '.decisionPanel',
      '.execCard',
      '.vesselCard',
      '.deepDiveCard',
      '.cargoBasisPanel',
      '.chartContainer',
      '.schematicContainer',
      '.shipSchematic',
      '.holdDetailsCard',
    ]) {
      const rule = cssRule(unloadingStyles, selector);
      expect(rule).not.toBe('');
      expect(rule).toContain('var(--dsc-surface)');
      expect(rule).toContain('var(--dsc-surface-border)');
      expect(rule).toContain('var(--dsc-card-radius)');
    }
    expect(cssRule(unloadingStyles, '.progressFill')).toContain('var(--accent-primary)');
    expect(cssRule(unloadingStyles, '.vesselCard')).toContain('border-radius: var(--dsc-card-radius) !important');

    expect(logisticsSource).not.toContain('<linearGradient');
    expect(logisticsSource).not.toContain('route-marker-glow');
    expect(logisticsSource).toContain('warning={{');
    expect(logisticsStyles).not.toContain('linear-gradient');
    expect(cssRule(logisticsStyles, '.dashboard')).toContain('var(--dsc-bg)');
    for (const selector of ['.priceSummary', '.historyNotice']) {
      const rule = cssRule(logisticsStyles, selector);
      expect(rule).not.toBe('');
      expect(rule).toContain('var(--dsc-surface)');
      expect(rule).toContain('var(--dsc-surface-border)');
      expect(rule).toContain('var(--dsc-card-radius)');
    }

    // V3 (2026-08-15): market 어가 차트는 Metabase accent 팔레트로 전환 —
    // 시리즈 간 색상 분리 + gradient stroke 제거(범례 흑색·시리즈 소실 원인) 계약.
    for (const chartColor of ['#509ee3', '#88bf4d', '#ef8c8c', '#e8b921', '#f2a86f', '#7172ad', '#a989c5']) {
      expect(marketSource).toContain(chartColor);
    }
    expect(marketSource).not.toContain('url(#mktGrad');
    expect(unloadingSource).toContain('fill="var(--w-sky-400)"');
    expect(unloadingSource).toContain('stroke="var(--w-emerald-500)"');
    expect(globalsSource).toContain('--w-sky-400: #38bdf8;');
    expect(globalsSource).toContain('--w-emerald-500: #10b981;');
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

  it('registers the native COSMO and embedded Bangkok operation pages with the required access boundaries', () => {
    const cosmo = DASHBOARD_MENU_CONFIGS.find((menu) => menu.key === 'cosmo');
    const bangkokOffice = DASHBOARD_MENU_CONFIGS.find((menu) => menu.key === 'bangkok-office');
    const operationItems = SIDEBAR_SECTIONS
      .find((section) => section.section === 'operation')
      ?.items.map((item) => item.key) ?? [];

    expect(cosmo).toMatchObject({
      title: '코스모',
      section: 'operation',
      sidebar: { icon: 'Hexagon' },
    });
    expect(bangkokOffice).toMatchObject({
      title: '방콕사무소',
      section: 'operation',
      requiresOperationAccess: true,
      sidebar: { icon: 'Factory' },
    });
    expect(operationItems).toEqual([
      'market',
      'fleet',
      'unloading',
      'logistics',
      'panofi',
      'cosmo',
      'bangkok-office',
      'gmts',
      'mail',
    ]);
    expect(PROTECTED_OPERATION_MENU_KEYS).toContain('bangkok-office');
    expect(PROTECTED_OPERATION_MENU_KEYS).not.toContain('cosmo');
    // 전 메뉴 세션 잠금(V2 §5-6) 이후 공개 사이트맵 라우트는 없다 — cosmo 포함 전부 잠금 뒤.
    expect(PUBLIC_DASHBOARD_ROUTES).not.toContain('cosmo');
    expect(PUBLIC_DASHBOARD_ROUTES).not.toContain('bangkok-office');
  });

  it('places the protected GMTS route between Bangkok office and mail without changing shortcuts', () => {
    const gmts = DASHBOARD_MENU_CONFIGS.find((menu) => menu.key === 'gmts');
    const operationSection = SIDEBAR_SECTIONS.find((section) => section.section === 'operation');
    const operationItems = operationSection?.items.map((item) => item.key) ?? [];
    const operationLabels = operationSection?.items.map((item) => item.label) ?? [];
    const gmtsSidebarIndex = operationItems.indexOf('gmts' as (typeof operationItems)[number]);
    const gmtsPanelIndex = DASHBOARD_PANEL_ORDER.indexOf('gmts' as (typeof DASHBOARD_PANEL_ORDER)[number]);
    const gmtsCommand = DASHBOARD_COMMANDS.find((command) => command.key === 'gmts');
    const sitemapRoutes = sitemap().map((entry) => new URL(entry.url).pathname);
    const appSource = readFileSync(join(process.cwd(), 'app/page.tsx'), 'utf8');
    const configSource = readFileSync(join(process.cwd(), 'next.config.mjs'), 'utf8');
    const rewriteSource = configSource.match(/source:\s*'([^']+)'/)?.[1];

    expect(gmts).toMatchObject({
      key: 'gmts',
      title: 'GMTS 주간보고',
      section: 'operation',
      accent: 'cyan',
      requiresOperationAccess: true,
      sidebar: { icon: 'Factory', label: 'GMTS' },
    });
    expect(gmts).not.toHaveProperty('shortcutOrder');
    expect(operationItems).toEqual([
      'market',
      'fleet',
      'unloading',
      'logistics',
      'panofi',
      'cosmo',
      'bangkok-office',
      'gmts',
      'mail',
    ]);
    expect(operationItems.filter((key) => key === 'gmts')).toHaveLength(1);
    expect(operationItems.slice(gmtsSidebarIndex - 1, gmtsSidebarIndex + 2)).toEqual([
      'bangkok-office',
      'gmts',
      'mail',
    ]);
    expect(operationLabels.slice(gmtsSidebarIndex - 1, gmtsSidebarIndex + 2)).toEqual([
      '방콕사무소',
      'GMTS',
      '메일',
    ]);
    expect(PROTECTED_OPERATION_MENU_KEYS).toEqual([
      'fleet',
      'unloading',
      'logistics',
      'bangkok-office',
      'gmts',
    ]);
    expect(KEYBOARD_SHORTCUT_MENUS).toEqual(['market', 'fleet', 'unloading', 'logistics']);
    expect(SESSION_ACCESS_MENUS.has('gmts' as (typeof VALID_MENUS)[number])).toBe(true);
    expect(gmtsCommand).toMatchObject({
      key: 'gmts',
      label: 'GMTS 주간보고',
      category: '실시간 운영',
      section: 'operation',
    });
    expect(PUBLIC_DASHBOARD_ROUTES).not.toContain('gmts' as (typeof PUBLIC_DASHBOARD_ROUTES)[number]);
    expect(sitemapRoutes).not.toContain('/gmts');
    expect(DASHBOARD_PANEL_ORDER.filter((key) => key === 'gmts')).toHaveLength(1);
    expect(DASHBOARD_PANEL_ORDER.slice(gmtsPanelIndex - 1, gmtsPanelIndex + 2)).toEqual([
      'bangkok-office',
      'gmts',
      'mail',
    ]);
    expect(
      appSource.match(
        /const GmtsDashboard = dynamic\(\(\) => import\('\.\.\/components\/gmts\/GmtsDashboard'\)\);/g,
      ) ?? [],
    ).toHaveLength(1);
    expect(appSource.match(/^\s+gmts: <GmtsDashboard \/>,$/gm) ?? []).toHaveLength(1);
    expect(appSource.match(/^\s+gmts: <GmtsDashboard heroOnly \/>,$/gm) ?? []).toHaveLength(0);
    expect(existsSync(join(process.cwd(), 'app/gmts/page.tsx'))).toBe(false);
    expect(rewriteSource).not.toContain('gmts');
  });

  it('keeps operation locks and keyboard shortcuts inside valid menus', () => {
    expect(PROTECTED_OPERATION_MENU_KEYS).toEqual(['fleet', 'unloading', 'logistics', 'bangkok-office', 'gmts']);
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

  it('keeps legacy menu sensitivity metadata out of the new global server boundary', () => {
    const sessionAccessKeys = (dashboardRegistry as Record<string, unknown>).SESSION_ACCESS_MENU_KEYS;
    const appSource = readFileSync(join(process.cwd(), 'app/page.tsx'), 'utf8');
    const proxySource = readFileSync(join(process.cwd(), 'proxy.ts'), 'utf8');

    expect(sessionAccessKeys).toEqual(VALID_MENUS.filter((menu) => menu !== 'mail'));
    expect(PROTECTED_OPERATION_MENU_KEYS).toEqual(['fleet', 'unloading', 'logistics', 'bangkok-office', 'gmts']);
    expect(PROTECTED_OPERATION_MENU_KEYS).not.toContain('mail');
    expect(KEYBOARD_SHORTCUT_MENUS).not.toContain('mail');
    expect(PUBLIC_DASHBOARD_ROUTES).not.toContain('mail');
    expect(DASHBOARD_COMMANDS.map((command) => command.key)).not.toContain('mail');
    expect(appSource).not.toContain('SESSION_ACCESS_MENUS');
    expect(proxySource).toContain('updateDashboardOwnerSession');
  });

  it('drives command search from the same valid menu registry', () => {
    expect(DASHBOARD_COMMANDS.map((command) => command.key)).toEqual(
      VALID_MENUS.filter((menu) => menu !== 'pork' && menu !== 'mail'),
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

  it('omits session-locked dashboards from public sitemap routes', () => {
    expect(PUBLIC_DASHBOARD_ROUTES).toEqual([]);
    expect(PUBLIC_DASHBOARD_ROUTES).not.toContain('value-chain');
    expect(PUBLIC_DASHBOARD_ROUTES).not.toContain('octopus');
    expect(PUBLIC_DASHBOARD_ROUTES).not.toContain('squid');
    expect(PUBLIC_DASHBOARD_ROUTES).not.toContain('pollock');
    expect(PUBLIC_DASHBOARD_ROUTES).not.toContain('mackerel');
    expect(PUBLIC_DASHBOARD_ROUTES).not.toContain('flatfish');
    expect(PUBLIC_DASHBOARD_ROUTES).not.toContain('cross-intelligence');
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
    expect(PUBLIC_DASHBOARD_ROUTES).not.toContain('gmts' as (typeof PUBLIC_DASHBOARD_ROUTES)[number]);
  });

  it('keeps every session-locked dashboard path out of the sitemap', () => {
    const routes = sitemap().map((entry) => new URL(entry.url).pathname.replace(/^\//, ''));
    const dashboardRoutes = routes.filter((route) => VALID_MENUS.includes(route as (typeof VALID_MENUS)[number]));

    expect(routes[0]).toBe('');
    expect(dashboardRoutes).toEqual([]);
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
      '📚 시장 이해',
    ]);

    expect(SIDEBAR_SECTIONS.map((section) => section.items.map((item) => item.key))).toEqual([
      ['market', 'fleet', 'unloading', 'logistics', 'panofi', 'cosmo', 'bangkok-office', 'gmts', 'mail'],
      ['tuna-industry', 'squid-industry'],
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
      'cross-intelligence',
      'pork',
      'unloading',
      'panofi',
      'cosmo',
      'bangkok-office',
      'gmts',
      'mail',
      'purse-seiner-db',
      'tuna-industry',
      'squid-industry',
    ]);
    expect(new Set(DASHBOARD_PANEL_ORDER)).toEqual(
      new Set(VALID_MENUS),
    );
    expect(DASHBOARD_PANEL_ORDER).not.toContain('bni-global');
  });
});
