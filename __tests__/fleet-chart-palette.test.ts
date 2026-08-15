import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import React from 'react';
import { describe, expect, it } from 'vitest';
import * as FleetCharts from '../components/FleetCharts';

const DARK_BACKGROUND = '#0a0a0b';

function relativeLuminance(hex: string): number {
  const channels = hex.match(/[0-9a-f]{2}/gi)?.map((value) => parseInt(value, 16) / 255) ?? [];
  const linear = channels.map((value) => (
    value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  ));
  return (linear[0] * 0.2126) + (linear[1] * 0.7152) + (linear[2] * 0.0722);
}

function contrastRatio(foreground: string, background: string): number {
  const lighter = Math.max(relativeLuminance(foreground), relativeLuminance(background));
  const darker = Math.min(relativeLuminance(foreground), relativeLuminance(background));
  return (lighter + 0.05) / (darker + 0.05);
}

describe('V2.5 multi-series chart palette', () => {
  it('provides eight distinct series colors with graphical contrast on the institutional background', () => {
    // V3 라이트 스코프가 --chart-s*를 재정의하므로 :root 정본(다크) 구간만 본다
    const globals = readFileSync(join(process.cwd(), 'app/globals.css'), 'utf8').split('V3 "Answerable BI"')[0];
    const palette = Object.fromEntries(
      Array.from(globals.matchAll(/(--chart-s[1-8])\s*:\s*(#[0-9a-f]{6})\s*;/gi))
        .map((match) => [match[1], match[2].toLowerCase()]),
    );

    expect(Object.keys(palette)).toEqual([
      '--chart-s1',
      '--chart-s2',
      '--chart-s3',
      '--chart-s4',
      '--chart-s5',
      '--chart-s6',
      '--chart-s7',
      '--chart-s8',
    ]);
    expect(palette['--chart-s1']).toBe('#38bdf8');
    expect(new Set(Object.values(palette)).size).toBe(8);

    for (const color of Object.values(palette)) {
      expect(contrastRatio(color, DARK_BACKGROUND)).toBeGreaterThanOrEqual(3);
    }
  });

  it('renders the eight-month fleet sample with palette tokens and distinct dashes from series five', () => {
    const MonthlyCatchSeries = (FleetCharts as Record<string, unknown>).MonthlyCatchSeries;

    expect(MonthlyCatchSeries).toBeTypeOf('function');
    if (typeof MonthlyCatchSeries !== 'function') return;

    const fragment = MonthlyCatchSeries() as React.ReactElement<{ children: React.ReactNode }>;
    const bars = React.Children.toArray(fragment.props.children)
      .filter(React.isValidElement) as React.ReactElement<Record<string, unknown>>[];

    expect(bars).toHaveLength(8);
    expect(bars.map((bar) => bar.props.dataKey)).toEqual([
      'month1',
      'month2',
      'month3',
      'month4',
      'month5',
      'month6',
      'month7',
      'month8',
    ]);
    expect(bars.map((bar) => bar.props.fill)).toEqual(
      Array.from({ length: 8 }, (_, index) => `var(--chart-s${index + 1})`),
    );
    expect(bars.map((bar) => bar.props.stroke)).toEqual(
      Array.from({ length: 8 }, (_, index) => `var(--chart-s${index + 1})`),
    );
    expect(bars.slice(0, 4).map((bar) => bar.props.strokeDasharray)).toEqual([
      undefined,
      undefined,
      undefined,
      undefined,
    ]);

    const dashPatterns = bars.slice(4).map((bar) => bar.props.strokeDasharray);
    expect(dashPatterns).toEqual(['6 3', '3 3', '8 3 2 3', '2 3']);
    expect(new Set(dashPatterns).size).toBe(4);
  });
});
