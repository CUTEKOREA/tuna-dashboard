import { describe, expect, it } from 'vitest';
import sitemap from '../app/sitemap';
import {
  DASHBOARD_COMMANDS,
  DASHBOARD_MENU_CONFIGS,
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
    expect(PUBLIC_DASHBOARD_ROUTES).toContain('sashimi-steak');
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

    for (const item of SIDEBAR_SECTIONS.flatMap((section) => section.items)) {
      expect(VALID_MENUS).toContain(item.key);
      expect(item.label).toMatch(/[가-힣A-Z]/);
      expect(item.icon).toMatch(/^[A-Za-z][A-Za-z0-9]*$/);
    }
  });
});
