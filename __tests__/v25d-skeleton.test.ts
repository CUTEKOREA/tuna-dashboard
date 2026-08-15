import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import SeafoodStockWidget from '../components/SeafoodStockWidget';

describe('V2.5-d shared Skeleton', () => {
  it('renders a Korean status label and the requested number of loading items', async () => {
    const skeletonModule = await import('../components/v2/Skeleton').catch(() => null);

    expect(skeletonModule).not.toBeNull();
    if (!skeletonModule) return;
    const markup = renderToStaticMarkup(
      React.createElement(skeletonModule.default, {
        label: '주가 불러오는 중…',
        count: 3,
        variant: 'card-row',
      }),
    );

    expect(markup).toContain('role="status"');
    expect(markup).toContain('aria-live="polite"');
    expect(markup).toContain('주가 불러오는 중…');
    expect(markup.match(/data-skeleton-item="true"/g)).toHaveLength(3);
  });

  it('stops the pulse animation when reduced motion is requested', () => {
    const stylesheetPath = join(process.cwd(), 'components/v2/Skeleton.module.css');

    expect(existsSync(stylesheetPath)).toBe(true);
    if (!existsSync(stylesheetPath)) return;
    const styles = readFileSync(stylesheetPath, 'utf8');

    expect(styles).toContain('@keyframes skeletonPulse');
    expect(styles).toContain('@media (prefers-reduced-motion: reduce)');
    expect(styles).toMatch(/@media \(prefers-reduced-motion: reduce\)[\s\S]*animation:\s*none/);
  });

  it('uses the shared six-card skeleton for the market stock loading state', () => {
    const markup = renderToStaticMarkup(React.createElement(SeafoodStockWidget));

    expect(markup).toContain('주가 불러오는 중…');
    expect(markup.match(/data-skeleton-item="true"/g)).toHaveLength(6);
    expect(markup).not.toContain('animation:pulse');
  });
});
