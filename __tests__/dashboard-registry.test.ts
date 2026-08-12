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
  it('routes unloading through the client-only category page to keep hydration stable', () => {
    const configSource = readFileSync(join(process.cwd(), 'next.config.mjs'), 'utf8');
    const categorySource = readFileSync(join(process.cwd(), 'app/[category]/page.tsx'), 'utf8');
    const rewriteSource = configSource.match(/source:\s*'([^']+)'/)?.[1];

    expect(rewriteSource).toBeDefined();
    expect(rewriteSource).not.toContain('unloading');
    expect(categorySource).toContain('ssr: false');
  });

  it('keeps menu keys unique and title-addressable', () => {
    expect(DASHBOARD_MENU_CONFIGS.length).toBeGreaterThanOrEqual(30);
    expect(new Set(VALID_MENUS).size).toBe(VALID_MENUS.length);

    for (const menu of DASHBOARD_MENU_CONFIGS) {
      expect(menu.title).toMatch(/[가-힣]/);
      expect(DASHBOARD_TITLES[menu.key]).toBe(menu.title);
      expect(getDashboardTitle(menu.key)).toBe(menu.title);
      expect(getDashboardAccent(menu.key)).toBe(menu.accent);
      expect(isActiveMenu(menu.key)).toBe(true);
    }

    expect(isActiveMenu('ai-forecast')).toBe(false);
    expect(isActiveMenu('retail')).toBe(false);
  });

  it('keeps operation locks and keyboard shortcuts inside valid menus', () => {
    expect(PROTECTED_OPERATION_MENU_KEYS).toEqual(['fleet', 'unloading', 'logistics']);
    expect(KEYBOARD_SHORTCUT_MENUS).toEqual([
      'market',
      'fleet',
      'unloading',
      'logistics',
      'value-chain',
      'mackerel',
      'galchi',
      'squid',
      'jukkumi',
      'octopus',
      'pollock',
      'flatfish',
      'shrimp',
      'salmon',
    ]);

    for (const key of [...PROTECTED_OPERATION_MENU_KEYS, ...KEYBOARD_SHORTCUT_MENUS]) {
      expect(VALID_MENUS).toContain(key);
    }
  });

  it('drives command search from the same valid menu registry', () => {
    expect(DASHBOARD_COMMANDS.map((command) => command.key)).toEqual(VALID_MENUS);

    for (const command of DASHBOARD_COMMANDS) {
      expect(command.label).toBe(DASHBOARD_TITLES[command.key]);
      expect(command.category).toMatch(/[가-힣]/);
    }

    expect(DASHBOARD_COMMANDS.map((command) => command.key)).not.toEqual(
      expect.arrayContaining(['ai-forecast', 'strategy', 'retail', 'ranching']),
    );
  });

  it('derives public sitemap dashboard routes from non-protected menus', () => {
    expect(PUBLIC_DASHBOARD_ROUTES).toEqual(
      VALID_MENUS.filter((menu) => !['market', 'fleet', 'unloading', 'logistics'].includes(menu)),
    );
    expect(PUBLIC_DASHBOARD_ROUTES).toContain('value-chain');
    expect(PUBLIC_DASHBOARD_ROUTES).toContain('cross-intelligence');
    expect(PUBLIC_DASHBOARD_ROUTES).toContain('sashimi-steak');
    expect(PUBLIC_DASHBOARD_ROUTES).not.toContain('bni-global');
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

  it('defines sidebar sections from visible registry items in render order', () => {
    expect(SIDEBAR_SECTIONS.map((section) => section.title)).toEqual([
      '📡 실시간 운영',
      '🐟 어종별 인텔리전스',
      '🔬 전략 분석',
      '🌾 농산물 인텔리전스',
      '🥩 축산물 인텔리전스',
    ]);

    expect(SIDEBAR_SECTIONS.map((section) => section.items.map((item) => item.key))).toEqual([
      ['market', 'fleet', 'unloading', 'logistics'],
      ['value-chain', 'mackerel', 'galchi', 'squid', 'jukkumi', 'octopus', 'pollock', 'flatfish', 'shrimp', 'whelk', 'kim', 'salmon'],
      ['cold-storage', 'fleet-strategy', 'korea-market', 'seasia-oem', 'used-car', 'msc', 'sashimi-steak', 'research-lab'],
      ['cashew', 'cassava', 'garlic', 'carrot', 'cocoa', 'mangosteen'],
      ['chicken', 'pork', 'beef'],
    ]);

    const sidebarKeys = SIDEBAR_SECTIONS.flatMap((section) => section.items.map((item) => item.key));
    expect(new Set(sidebarKeys).size).toBe(sidebarKeys.length);
    expect(sidebarKeys).not.toContain('purse-seiner-db');
    expect(sidebarKeys).not.toContain('bni-global');
    expect(sidebarKeys).not.toContain('cross-intelligence');

    const fisheryItems = SIDEBAR_SECTIONS.find((section) => section.section === 'fishery')?.items ?? [];
    const jukkumi = fisheryItems.find((item) => item.key === 'jukkumi');
    const octopus = fisheryItems.find((item) => item.key === 'octopus');

    expect(jukkumi?.icon).toBe('WebfootOctopus');
    expect(octopus?.icon).toBe('LongArmOctopus');
    expect(jukkumi?.icon).not.toBe(octopus?.icon);

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
      'cold-storage',
      'mackerel',
      'galchi',
      'squid',
      'jukkumi',
      'octopus',
      'pollock',
      'flatfish',
      'shrimp',
      'whelk',
      'kim',
      'salmon',
      'cashew',
      'cassava',
      'garlic',
      'carrot',
      'cocoa',
      'mangosteen',
      'chicken',
      'pork',
      'beef',
      'used-car',
      'unloading',
      'value-chain',
      'seasia-oem',
      'fleet-strategy',
      'korea-market',
      'research-lab',
      'purse-seiner-db',
      'msc',
      'sashimi-steak',
    ]);
    expect(new Set(DASHBOARD_PANEL_ORDER)).toEqual(
      new Set(VALID_MENUS.filter((menu) => menu !== 'cross-intelligence')),
    );
    expect(DASHBOARD_PANEL_ORDER).not.toContain('bni-global');
    expect(DASHBOARD_PANEL_ORDER).not.toContain('cross-intelligence');
  });
});
