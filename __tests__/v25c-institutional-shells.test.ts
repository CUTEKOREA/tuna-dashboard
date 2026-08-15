import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const readSource = (relativePath: string) => readFileSync(join(root, relativePath), 'utf8');

function cssRule(source: string, selector: string): string {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return source.match(new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? '';
}

function cssRules(source: string, selector: string): string {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return Array.from(source.matchAll(new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`, 'gs')))
    .map((match) => match[1])
    .join('\n');
}

describe('V2.5-c institutional page shells', () => {
  it('tunes only the five neutral bridge colors to zinc and keeps every RGB pair aligned', () => {
    // V3 라이트 스코프([data-v3='light'])가 같은 토큰명을 재정의하므로 :root 정본 구간만 본다
    const globals = readSource('app/globals.css').split('V3 "Answerable BI"')[0];
    const bridgeTokens = Object.fromEntries(
      Array.from(globals.matchAll(/(--w-[a-z0-9-]+)\s*:\s*(#[0-9a-f]{6})\s*;/gi))
        .map((match) => [match[1], match[2].toLowerCase()]),
    );
    const bridgeRgbTokens = Object.fromEntries(
      Array.from(globals.matchAll(/(--w-[a-z0-9-]+)-rgb\s*:\s*(\d+\s*,\s*\d+\s*,\s*\d+)\s*;/gi))
        .map((match) => [match[1], match[2].replaceAll(' ', '')]),
    );

    expect(bridgeTokens).toEqual({
      '--w-slate-400': '#a1a1aa',
      '--w-slate-500': '#71717a',
      '--w-emerald-500': '#10b981',
      '--w-amber-500': '#f59e0b',
      '--w-red-500': '#ef4444',
      '--w-sky-400': '#38bdf8',
      '--w-slate-200': '#e4e4e7',
      '--w-slate-50': '#fafafa',
      '--w-violet-500': '#8b5cf6',
      '--w-slate-300': '#d4d4d8',
      '--w-blue-500': '#3b82f6',
      '--w-amber-400': '#fbbf24',
      '--w-navy-900': '#1a2442',
      '--w-pink-500': '#ec4899',
      '--w-cyan-500': '#06b6d4',
      '--w-emerald-400': '#34d399',
    });
    for (const [token, hex] of Object.entries(bridgeTokens)) {
      const rgb = hex.match(/[0-9a-f]{2}/gi)?.map((value) => parseInt(value, 16)).join(',');
      expect(bridgeRgbTokens[token]).toBe(rgb);
    }
    expect(Object.keys(bridgeTokens).some((token) => /chart|series|palette/.test(token))).toBe(false);
  });

  it('removes ambient decoration and tokenizes the four remaining page shells', () => {
    const appSource = readSource('app/page.tsx');
    const institutionalMenus = appSource.match(
      /const INSTITUTIONAL_MENU_KEYS[\s\S]*?new Set<ActiveMenu>\(\[([\s\S]*?)\]\);/,
    )?.[1] ?? '';
    const porkSource = readSource('components/PorkDashboard.tsx');
    const porkStylesPath = 'components/PorkDashboard.module.css';
    const crossSource = readSource('components/CrossCommodityIntelligenceDashboard.tsx');
    const purseSource = readSource('components/PurseSeinerDashboard.tsx');
    const cosmoSource = readSource('components/cosmo/CosmoDashboard.tsx');
    const cosmoStyles = readSource('components/cosmo/cosmo.css');

    for (const menu of ['pork', 'cross-intelligence', 'purse-seiner-db', 'cosmo']) {
      expect(institutionalMenus).toContain(`'${menu}'`);
    }

    expect(existsSync(join(root, porkStylesPath))).toBe(true);
    if (!existsSync(join(root, porkStylesPath))) return;
    const porkStyles = readSource(porkStylesPath);
    expect(porkSource).toContain("import styles from './PorkDashboard.module.css'");
    expect(porkSource).not.toContain('radial-gradient');
    expect(porkSource).not.toContain('linear-gradient');
    expect(porkSource).not.toMatch(/accent:\s*['"]#/);
    expect(porkSource).toContain('accent={sec.color}');
    for (const selector of ['.dashboard', '.kpiCard']) {
      expect(cssRule(porkStyles, selector)).toContain('var(--dsc-');
    }
    expect(cssRule(porkStyles, '.kpiCard')).toContain('border-radius: var(--dsc-card-radius)');
    expect(cssRule(porkStyles, '.sectionAccent')).toContain('var(--accent-primary)');

    expect(crossSource).not.toMatch(/accent:\s*['"]#/);
    expect(crossSource).toContain("background: 'var(--dsc-bg)'");
    expect(crossSource).toContain("background: 'var(--dsc-surface)'");
    expect(crossSource).toContain("border: '1px solid var(--dsc-surface-border)'");
    expect(crossSource).toContain("borderRadius: 'var(--dsc-card-radius)'");
    for (const scoreColor of ['#ef4444', '#f59e0b', '#38bdf8', '#10b981']) {
      expect(crossSource).toContain(scoreColor);
    }

    expect(purseSource).not.toMatch(/accent:\s*['"]#/);
    expect(purseSource).toContain("background: 'var(--dsc-bg)'");
    expect(purseSource).toContain("background: 'var(--dsc-surface)'");
    expect(purseSource).toContain("border: '1px solid var(--dsc-surface-border)'");
    expect(purseSource).toContain("borderRadius: 'var(--dsc-card-radius)'");
    expect(purseSource).toContain("height: 3, background: 'var(--accent-primary)'");
    expect(purseSource).toContain("const CONTINENT_TREEMAP_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4']");

    expect(cosmoSource).not.toMatch(/accent:\s*['"]#/);
    expect(cosmoSource).toContain('accentFrom="var(--accent-primary)"');
    expect(cssRules(cosmoStyles, '.cosmo-root')).toContain('background: var(--dsc-bg)');
    expect(cssRule(cosmoStyles, '.cosmo-root .cosmo-panel')).toContain('border: 1px solid var(--dsc-surface-border)');
    expect(cssRule(cosmoStyles, '.cosmo-root .cosmo-panel')).toContain('border-radius: var(--dsc-card-radius)');
    expect(cssRule(cosmoStyles, '.cosmo-root .cosmo-panel')).toContain('background: var(--dsc-surface)');
    for (const preservedPalette of [
      '--cosmo-s1: #2199B7',
      '--cosmo-s2: #CA5765',
      '--cosmo-s3: #B6880F',
      '--cosmo-s4: #38996E',
      '--cosmo-s5: #8878C4',
    ]) {
      expect(cosmoStyles).toContain(preservedPalette);
    }
  });

  it('keeps the ticker label and separator neutral while applying mono only to values', () => {
    const tickerStyles = readSource('components/LiveTicker.module.css');
    const labelRule = cssRule(tickerStyles, '.label');
    const valueRule = cssRule(tickerStyles, '.value');
    const separatorRule = cssRule(tickerStyles, '.tickerItem::after');
    const lightSeparatorRule = cssRule(tickerStyles, "[data-theme='light'] .tickerItem::after");

    expect(labelRule).toContain('var(--dsc-ink-muted)');
    expect(labelRule).not.toContain('font-family: var(--dsc-font-mono)');
    expect(valueRule).toContain('font-family: var(--dsc-font-mono)');
    expect(separatorRule).toContain('var(--dsc-ink-muted)');
    expect(separatorRule).not.toContain('rgba(');
    expect(lightSeparatorRule).toContain('var(--dsc-ink-faint)');
    expect(lightSeparatorRule).not.toContain('rgba(');
  });
});
