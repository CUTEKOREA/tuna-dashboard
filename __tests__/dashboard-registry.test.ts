import { existsSync, readFileSync, readdirSync } from 'node:fs';
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
    for (const slug of ['value-chain', 'octopus', 'pollock', 'mackerel', 'flatfish'] as const) {
      const routeSource = readFileSync(join(process.cwd(), `app/${slug}/page.tsx`), 'utf8');
      expect(routeSource).toContain('notFound()');
      expect(isActiveMenu(slug)).toBe(false);
    }
  });

  it('keeps the revived squid route off the sidebar and lazy-loads its heavy dashboard', () => {
    const routeSource = readFileSync(join(process.cwd(), 'app/squid/page.tsx'), 'utf8');

    expect(routeSource).toContain("'use client'");
    expect(routeSource).toContain("dynamic(() => import('@/components/SquidDashboard')");
    expect(routeSource).toContain('ssr: false');
    expect(routeSource).not.toContain('notFound()');
    expect(isActiveMenu('squid')).toBe(false);
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
    // 2026-08-15 사용자 지시: 선박 사진 배경 제거 - 배경 슬롯 자체가 없어야 한다
    expect(commandSource).not.toContain('background={heroBackground}');
    expect(commandSource).toContain('<PillTabs');
    expect(commandSource).toContain('role="tabpanel"');
    expect(commandSource).toContain("import FleetDailyOperations from './FleetDailyOperations'");
    expect(commandSource).toContain('<FleetDailyOperations detailState={detailState} />');
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
    expect(commandSource).toContain('ssr: false'); // leaflet은 window 의존 - SSR 금지
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
    // V3 라이트 오버라이드 구간은 flat 계약 대상이 아니다 (사진 블렌드용 페이드는 장식 그라디언트가 아님) -
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
    // 2026-08-17 디자인 랩 채택: SKJ/YF 스프레드 KPI 2장은 지휘형 카드(HeroMarketCommand)로 대체 - 잔여 2장(MGO·환율)
    expect(marketSource.match(/dsc-card dsc-card--accent/g)).toHaveLength(2);
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
    // 계약의 핵심은 «액센트 hex 하드코딩 금지» - 2026-08-15 히어로 정리로 fleet의
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
    expect(logisticsSource).not.toContain('warning={{');
    expect(logisticsSource).toContain('입항 재확인 2척 후속 확인 완료');
    expect(logisticsStyles).not.toContain('linear-gradient');
    expect(cssRule(logisticsStyles, '.dashboard')).toContain('var(--dsc-bg)');
    for (const selector of ['.priceSummary', '.historyNotice']) {
      const rule = cssRule(logisticsStyles, selector);
      expect(rule).not.toBe('');
      expect(rule).toContain('var(--dsc-surface)');
      expect(rule).toContain('var(--dsc-surface-border)');
      expect(rule).toContain('var(--dsc-card-radius)');
    }

    // 항구 색은 가다랑어·황다랑어가 같고, 선단 DB 정체성 겹에서 온다.
    expect(marketSource).toContain("from '@/lib/chart-palette'");
    expect(marketSource).toContain('const MARKET_HUB = HUB_ID');
    expect(fleetSource).toContain('missionIconWell');
    const heroCommand = readFileSync(join(process.cwd(), 'components/FleetHeroCommand.tsx'), 'utf8');
    expect(heroCommand).toContain('CHART_RANK');
    expect(heroCommand).not.toContain('var(--chart-s1');
    const paletteSource = readFileSync(join(process.cwd(), 'lib/chart-palette.ts'), 'utf8');
    for (const chartColor of ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#e879a8']) {
      expect(paletteSource).toContain(chartColor);
    }
    expect(marketSource).not.toContain('url(#mktGrad');
    expect(unloadingSource).toContain("from '@/lib/chart-palette'");
    expect(unloadingSource).toContain('fill={CHART_RANK}');
    expect(unloadingSource).toContain('stroke={HUB_ID.mnt}');
    const squidChartsSource = readFileSync(
      join(process.cwd(), 'components/market-understanding/SquidCharts.tsx'),
      'utf8',
    );
    expect(squidChartsSource).toContain("from '@/lib/chart-palette'");
    expect(squidChartsSource).toContain('fill={CHART_RANK}');
    expect(squidChartsSource).toContain('colorForSpecies');
    const traderSource = readFileSync(join(process.cwd(), 'components/TraderStatus.tsx'), 'utf8');
    const cannerySource = readFileSync(join(process.cwd(), 'components/CanneryStatusCharts.tsx'), 'utf8');
    const reeferSource = readFileSync(join(process.cwd(), 'components/ReeferMovement.tsx'), 'utf8');
    expect(traderSource).toContain("from '@/lib/chart-palette'");
    expect(traderSource).toContain('HUB_ID.bkk');
    expect(traderSource).not.toContain('--chart-s1');
    expect(cannerySource).toContain('fill={CHART_RANK}');
    expect(cannerySource).toContain('fill={HUB_ID.bkk}');
    expect(reeferSource).toContain('shareColor');
    const panofiTabs = readFileSync(join(process.cwd(), 'components/panofi/PanofiTabs.tsx'), 'utf8');
    expect(panofiTabs).toContain("from '@/lib/chart-palette'");
    expect(panofiTabs).toContain('PANOFI_ID.cosmo');
    expect(panofiTabs).toContain('CHART_RANK');
    expect(panofiTabs).not.toContain('--cosmo-s1');
    const cosmoPalette = readFileSync(join(process.cwd(), 'components/cosmo/palette.ts'), 'utf8');
    const cosmoMarket = readFileSync(join(process.cwd(), 'components/cosmo/tabs/MarketTab.tsx'), 'utf8');
    expect(cosmoPalette).toContain("from '@/lib/chart-palette'");
    expect(cosmoPalette).toContain('PANOFI_ID.cosmo');
    expect(cosmoMarket).toContain('C.cosmo');
    expect(cosmoMarket).not.toContain('--cosmo-s1');
    const bangkokPalette = readFileSync(join(process.cwd(), 'components/bangkok/palette.ts'), 'utf8');
    const bangkokUnload = readFileSync(join(process.cwd(), 'components/bangkok/tabs/UnloadTab.tsx'), 'utf8');
    const bangkokCannery = readFileSync(join(process.cwd(), 'components/bangkok/tabs/CanneryTab.tsx'), 'utf8');
    expect(bangkokPalette).toContain("from '@/lib/chart-palette'");
    expect(bangkokPalette).toContain('TRADER_ID');
    expect(bangkokPalette).toContain('THAI_PORT_ID');
    expect(bangkokUnload).toContain('TRADER_COLOR');
    expect(bangkokUnload).toContain('C.rank');
    expect(bangkokUnload).not.toContain('--cosmo-s1');
    expect(bangkokCannery).toContain('C.bangkok');
    expect(bangkokCannery).toContain('C.songkhla');
    expect(bangkokCannery).not.toContain('--cosmo-s1');
    const gmtsPalette = readFileSync(join(process.cwd(), 'components/gmts/palette.ts'), 'utf8');
    const gmtsDashboard = readFileSync(join(process.cwd(), 'components/gmts/GmtsDashboard.tsx'), 'utf8');
    const gmtsStyles = readFileSync(join(process.cwd(), 'components/gmts/GmtsDashboard.module.css'), 'utf8');
    expect(gmtsPalette).toContain("from '@/lib/chart-palette'");
    expect(gmtsPalette).toContain('HUB_ID');
    expect(gmtsDashboard).toContain('C.completed');
    expect(gmtsDashboard).toContain('C.currentYear');
    expect(gmtsDashboard).toContain('iconColor={C.icon}');
    expect(gmtsDashboard).not.toContain('--chart-s1');
    expect(gmtsDashboard).not.toContain('#509ee3');
    expect(gmtsStyles).not.toContain('#509ee3');
    expect(gmtsStyles).toContain('--gmts-accent: var(--accent-primary, #3b82f6)');
    const tunaColors = readFileSync(join(process.cwd(), 'lib/tuna-chart-colors.ts'), 'utf8');
    const tunaCatch = readFileSync(join(process.cwd(), 'components/market-understanding/TunaCatchCharts.tsx'), 'utf8');
    const tunaDash = readFileSync(join(process.cwd(), 'components/market-understanding/TunaIndustryDashboard.tsx'), 'utf8');
    expect(tunaColors).toContain("from '@/lib/chart-palette'");
    expect(tunaColors).toContain('HUB_ID.bkk');
    expect(tunaColors).toContain('RFMO_ID.WCPFC');
    expect(tunaCatch).not.toContain('#0e7490');
    expect(tunaCatch).not.toContain('#e11d48');
    expect(tunaDash).toContain('TUNA_ACCENT');
    expect(tunaDash).not.toContain('#0e7490');
    const squidDash = readFileSync(join(process.cwd(), 'components/market-understanding/SquidIndustryDashboard.tsx'), 'utf8');
    const squidColors = readFileSync(join(process.cwd(), 'lib/squid-chart-colors.ts'), 'utf8');
    expect(squidDash).toContain('SQUID_ACCENT');
    expect(squidDash).toContain('SQUID_ROLE.volume');
    expect(squidDash).not.toContain('#7c3aed');
    expect(squidColors).not.toContain('#0f766e');
    const mackerelColors = readFileSync(join(process.cwd(), 'lib/mackerel-chart-colors.ts'), 'utf8');
    const mackerelDash = readFileSync(
      join(process.cwd(), 'components/market-understanding/MackerelIndustryDashboard.tsx'),
      'utf8',
    );
    const commodityCharts = readFileSync(
      join(process.cwd(), 'components/market-understanding/CommodityCharts.tsx'),
      'utf8',
    );
    const industryCss = readFileSync(
      join(process.cwd(), 'components/market-understanding/TunaIndustryDashboard.module.css'),
      'utf8',
    );
    expect(mackerelColors).toContain("from '@/lib/chart-palette'");
    expect(mackerelColors).toContain('HUB_ID.sey');
    expect(mackerelDash).toContain('MACKEREL_ACCENT');
    expect(mackerelDash).not.toContain('#0e7490');
    expect(commodityCharts).toContain('MACKEREL_ROLE');
    expect(commodityCharts).not.toMatch(/고등어: \{ base: '#0e7490'/);
    expect(commodityCharts).not.toContain('#e11d48');
    expect(industryCss).toContain('--mu-accent: #0369a1');
    expect(industryCss).not.toMatch(/data-commodity='mackerel'\] \{[^}]*#0e7490/);
    const whelkColors = readFileSync(join(process.cwd(), 'lib/whelk-chart-colors.ts'), 'utf8');
    const whelkDash = readFileSync(
      join(process.cwd(), 'components/market-understanding/WhelkIndustryDashboard.tsx'),
      'utf8',
    );
    expect(whelkColors).toContain("from '@/lib/chart-palette'");
    expect(whelkColors).toContain('HUB_ID.sey');
    expect(whelkDash).toContain('WHELK_ACCENT');
    expect(whelkDash).not.toContain('#b45309');
    expect(commodityCharts).toContain('WHELK_ROLE');
    expect(commodityCharts).toContain('CHART_RANK');
    expect(commodityCharts).not.toMatch(/골뱅이: \{ base: '#92400e'/);
    expect(commodityCharts).not.toContain('#fbbf24');
    expect(industryCss).toContain('--mu-accent: #92400e');
    expect(industryCss).not.toMatch(/data-commodity='whelk'\] \{[^}]*#f59e0b/);
    const shrimpColors = readFileSync(join(process.cwd(), 'lib/shrimp-chart-colors.ts'), 'utf8');
    const shrimpDash = readFileSync(
      join(process.cwd(), 'components/market-understanding/ShrimpIndustryDashboard.tsx'),
      'utf8',
    );
    expect(shrimpColors).toContain("from '@/lib/chart-palette'");
    expect(shrimpColors).toContain('HUB_ID.sey');
    expect(shrimpDash).toContain('SHRIMP_ACCENT');
    expect(shrimpDash).not.toContain('#0d9488');
    expect(commodityCharts).toContain('SHRIMP_ROLE');
    expect(commodityCharts).not.toMatch(/새우: \{ base: '#0d9488'/);
    expect(commodityCharts).not.toContain('#34d399');
    expect(commodityCharts).not.toContain('#f43f5e');
    expect(industryCss).toContain('--mu-accent: #0f766e');
    expect(industryCss).not.toMatch(/data-commodity='shrimp'\] \{[^}]*#2dd4bf/);
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
    ]);
    expect(PROTECTED_OPERATION_MENU_KEYS).toContain('bangkok-office');
    expect(PROTECTED_OPERATION_MENU_KEYS).not.toContain('cosmo');
    // 전 메뉴 세션 잠금(V2 §5-6) 이후 공개 사이트맵 라우트는 없다 - cosmo 포함 전부 잠금 뒤.
    expect(PUBLIC_DASHBOARD_ROUTES).not.toContain('cosmo');
    expect(PUBLIC_DASHBOARD_ROUTES).not.toContain('bangkok-office');
  });

  it('places the protected GMTS route after Bangkok office while keeping mail hidden', () => {
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
    ]);
    expect(operationItems.filter((key) => key === 'gmts')).toHaveLength(1);
    expect(operationItems.slice(gmtsSidebarIndex - 1, gmtsSidebarIndex + 1)).toEqual([
      'bangkok-office',
      'gmts',
    ]);
    expect(operationLabels.slice(gmtsSidebarIndex - 1, gmtsSidebarIndex + 1)).toEqual([
      '방콕사무소',
      'GMTS',
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
    // 2026-08-17: 선단 DB(전 해역 등록부 탐색기)가 실리며 strategy 섹션이 사이드바로 복귀했다
    expect(SIDEBAR_SECTIONS.map((section) => section.section)).not.toContain('agriculture');
    expect(SIDEBAR_SECTIONS.map((section) => section.section)).not.toContain('fishery');
    expect(SIDEBAR_SECTIONS.every((section) => section.items.length > 0)).toBe(true);
  });

  it('defines sidebar sections from visible registry items in render order', () => {
    expect(SIDEBAR_SECTIONS.map((section) => section.title)).toEqual([
      '📡 실시간 운영',
      '📚 시장 이해',
      '🔬 전략 분석',
    ]);

    expect(SIDEBAR_SECTIONS.map((section) => section.items.map((item) => item.key))).toEqual([
      ['market', 'fleet', 'unloading', 'logistics', 'panofi', 'cosmo', 'bangkok-office', 'gmts'],
      ['tuna-industry', 'squid-industry', 'mackerel-industry', 'whelk-industry', 'shrimp-industry', 'pollock-industry', 'tuna-anatomy'],
      // 2026-08-17 사용자 요청: 선단 DB 노출. cross-intelligence 는 종전대로 팔레트 전용
      ['purse-seiner-db', 'company-anatomy'],
    ]);

    const sidebarKeys = SIDEBAR_SECTIONS.flatMap((section) => section.items.map((item) => item.key));
    expect(new Set(sidebarKeys).size).toBe(sidebarKeys.length);
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
      'mackerel-industry',
      'whelk-industry',
      'shrimp-industry',
      'pollock-industry',
      'tuna-anatomy',
      'company-anatomy',
    ]);
    expect(new Set(DASHBOARD_PANEL_ORDER)).toEqual(
      new Set(VALID_MENUS),
    );
    expect(DASHBOARD_PANEL_ORDER).not.toContain('bni-global');
  });
});

describe('조종석 모드 제거 (2026-08-20 사용자 지시)', () => {
  it('토글·토큰·전용 위젯이 어디에도 남아 있지 않다', () => {
    // 2026-08-17 스펙 cockpit-mode-design 으로 들어왔던 전역 밀도 토글을 걷어냈다.
    // 빈자리로 두면 다음에 조용히 되살아나므로 부재를 고정한다.
    const pageSource = readFileSync(join(process.cwd(), 'app/page.tsx'), 'utf8');
    const globalsSource = readFileSync(join(process.cwd(), 'app/globals.css'), 'utf8');
    const skeletonSource = readFileSync(
      join(process.cwd(), 'components/market-understanding/CommodityIndustryDashboard.tsx'),
      'utf8',
    );

    expect(pageSource).not.toContain('조종석');
    expect(pageSource).not.toContain('cockpit');
    expect(globalsSource).not.toContain('cockpit');
    expect(globalsSource).not.toContain("data-density");
    // 슬롯 계약에서도 빠졌다 — 남아 있으면 대시보드가 다시 붙일 수 있다.
    expect(skeletonSource).not.toContain('cockpitExtra');
  });

  it('전용 모듈과 위젯 파일이 삭제됐다', () => {
    expect(existsSync(join(process.cwd(), 'lib/cockpit-density.ts'))).toBe(false);
    expect(existsSync(join(process.cwd(), 'components/market-understanding/CockpitExtra.tsx'))).toBe(false);
  });

  it('어느 대시보드도 조종석 슬롯을 넘기지 않는다', () => {
    const dir = join(process.cwd(), 'components/market-understanding');
    for (const file of readdirSync(dir).filter((f) => f.endsWith('.tsx'))) {
      const source = readFileSync(join(dir, file), 'utf8');
      expect(source, file).not.toContain('cockpitExtra');
      expect(source, file).not.toContain('CockpitOnly');
    }
  });
});

describe('dark mode toggle (2026-08-17, 결정 ① «다크는 토글 보존»)', () => {
  it("토글이 data-v3='light' 스코프 탈부착으로 구현된다 (별도 다크 팔레트 신설 금지)", () => {
    const pageSource = readFileSync(join(process.cwd(), 'app/page.tsx'), 'utf8');

    expect(pageSource).toContain("localStorage.getItem('theme-mode')");
    expect(pageSource).toContain('다크 모드');
    // 다크 = light 스코프 제거 → :root 기존 다크 토큰 복귀. 무조건 light 고정으로 회귀하면 실패.
    expect(pageSource).toContain("data-v3={darkMode ? undefined : 'light'}");
    expect(pageSource).not.toContain('data-v3="light"');
  });
});
