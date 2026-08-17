import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const readSource = (relativePath: string) => readFileSync(join(root, relativePath), 'utf8');

function cssRule(source: string, selector: string): string {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return source.match(new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? '';
}

function numericCardRadii(source: string): Array<{ selector: string; radius: number }> {
  return Array.from(source.matchAll(/([^{}]+)\{([^{}]*)\}/g))
    .filter((match) => /card/i.test(match[1]))
    .flatMap((match) => Array.from(match[2].matchAll(/border-radius\s*:\s*(\d+(?:\.\d+)?)px/gi))
      .map((radiusMatch) => ({
        selector: match[1].trim(),
        radius: Number(radiusMatch[1]),
      })));
}

describe('V2.5-d card contract', () => {
  it('provides one 12px surface contract and a left-only 3px accent variant', () => {
    const globals = readSource('app/globals.css');
    const card = cssRule(globals, '.dsc-card');
    const accent = cssRule(globals, '.dsc-card--accent');

    expect(card).toContain('background: var(--dsc-surface)');
    expect(card).toContain('border: 1px solid var(--dsc-surface-border)');
    expect(card).toContain('border-radius: var(--dsc-card-radius)');
    expect(accent).toContain(
      'border-left: 3px solid var(--dsc-card-accent, var(--accent-primary))',
    );
    expect(accent).not.toMatch(/border-(?:top|right|bottom)\s*:/);
  });

  it('uses the shared left-accent contract on exactly two market macro cards', () => {
    const source = readSource('components/MarketDashboard.tsx');
    const styles = readSource('components/MarketDashboard.module.css');

    // 2026-08-17 디자인 랩 채택: 스프레드 KPI 2장 제거 — MGO·환율 2장이 좌측 액센트 계약 유지
    expect(source.match(/dsc-card dsc-card--accent/g)).toHaveLength(2);
    expect(source).toContain('className={`dsc-card ${styles.chartPanel}`}');
    expect(cssRule(styles, '.kpiCard::before')).toBe('');
    expect(cssRule(styles, '.kpiCard')).not.toMatch(/border-(?:top|right|bottom|left)\s*:/);
  });

  it('aligns COSMO signal and content cards to the shared radius and border tokens', () => {
    const styles = readSource('components/cosmo/cosmo.css');
    const card = cssRule(styles, '.cosmo-root .card');
    const shareCard = cssRule(styles, '.cosmo-root .sharecard');

    expect(styles).not.toContain('--cosmo-radius:');
    for (const rule of [card, shareCard]) {
      expect(rule).toContain('border: 1px solid var(--dsc-surface-border)');
      expect(rule).toContain('border-radius: var(--dsc-card-radius)');
    }
    const signalCard = cssRule(styles, '.cosmo-root .cosmo-link-card');
    expect(signalCard).toContain('appearance: none');
    expect(signalCard).toContain('border-radius: var(--dsc-card-radius) !important');
    expect(cssRule(styles, '.cosmo-root .pill')).toContain('border-radius: 999px');
  });

  it('rejects hard-coded top accent borders and card radii above 12px in shared shells', () => {
    const guardedPaths = [
      'app/globals.css',
      'components/EmbeddedDashboardFrame.module.css',
      'components/MarketDashboard.module.css',
      'components/cosmo/cosmo.css',
      'components/v2/StatRow.module.css',
    ];

    for (const path of guardedPaths) {
      const source = readSource(path);
      expect(source, path).not.toMatch(/border-top\s*:\s*[^;]*solid\s+#[0-9a-f]{3,8}/i);
      const oversized = numericCardRadii(source).filter(({ radius }) => radius > 12);
      expect(oversized, path).toEqual([]);
    }
  });
});
