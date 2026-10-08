import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { getSquidCatchData } from '../lib/data/squid-industry';
import {
  SQUID_FALLBACK_COLORS,
  colorForBasket,
  colorForSeries,
  colorForSpecies,
  colorForSpeciesGroup,
  dashForSeries,
} from '../lib/squid-chart-colors';

const WHITE = '#ffffff';

function relativeLuminance(hex: string): number {
  const channels = hex.match(/[0-9a-f]{2}/gi)?.map((value) => parseInt(value, 16) / 255) ?? [];
  const linear = channels.map((value) =>
    value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
  );
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
}

function contrastRatio(foreground: string, background: string): number {
  const lighter = Math.max(relativeLuminance(foreground), relativeLuminance(background));
  const darker = Math.min(relativeLuminance(foreground), relativeLuminance(background));
  return (lighter + 0.05) / (darker + 0.05);
}

describe('오징어 차트 색', () => {
  it('갈래가 세 색이고 미분류와 그 밖의 종이 같지 않다', () => {
    const basket = colorForBasket('오징어');
    const cuttle = colorForBasket('갑오징어');
    const nei = colorForSpecies('두족류 미분류');
    const rest = colorForSpecies('그 밖의 종');

    expect(new Set([basket, cuttle, nei]).size).toBe(3);
    expect(nei).not.toBe(rest);
    expect(colorForBasket('두족류 미분류')).toBe(nei);
  });

  it('주요 4종이 막대·선에서 같은 색을 쓴다', () => {
    const four = ['살오징어', '아르헨티나오징어', '대왕오징어', '파타고니아오징어'];
    const colors = four.map((name) => colorForSpecies(name));
    expect(new Set(colors).size).toBe(4);
    for (const [index, name] of four.entries()) {
      expect(colorForSeries(name, index)).toBe(colors[index]);
    }
    expect(dashForSeries('파타고니아오징어')).toBe('6 3');
  });

  it('어종을 늘어놓는 막대는 갈래 색(오징어·갑오징어·미분류·그 밖의 종)으로 칠한다', () => {
    // 2026-09-11 사용자 결정: 12종에 12색을 주지 않는다(8색 초과). 종 이름은 축 라벨이 말한다.
    const rows = getSquidCatchData().어종구성;
    const fills = new Set(rows.map((row) => colorForSpeciesGroup(row.어종)));
    expect(fills.size).toBeLessThanOrEqual(4);
    expect(colorForSpeciesGroup('살오징어')).toBe(colorForBasket('오징어'));
    expect(colorForSpeciesGroup('갑오징어류 미분류')).toBe(colorForBasket('갑오징어'));
    expect(colorForSpeciesGroup('두족류 미분류')).toBe(colorForBasket('두족류 미분류'));
    expect(colorForSpeciesGroup('그 밖의 종')).not.toBe(colorForSpeciesGroup('두족류 미분류'));
  });

  it('고정색이 흰 지면에서 그래픽 대비 3:1을 넘는다', () => {
    const names = [
      '살오징어',
      '아르헨티나오징어',
      '대왕오징어',
      '파타고니아오징어',
      '갑오징어류 미분류',
      '두족류 미분류',
      '그 밖의 종',
    ];
    for (const name of names) {
      expect(contrastRatio(colorForSpecies(name), WHITE), name).toBeGreaterThanOrEqual(3);
    }
    expect(new Set(SQUID_FALLBACK_COLORS).size).toBe(SQUID_FALLBACK_COLORS.length);
  });

  it('차트와 위젯이 인덱스 순환 팔레트를 쓰지 않는다', () => {
    const charts = readFileSync(
      join(process.cwd(), 'components/market-understanding/SquidCharts.tsx'),
      'utf8',
    );
    const widgets = readFileSync(
      join(process.cwd(), 'components/market-understanding/SquidWidgetView.tsx'),
      'utf8',
    );
    expect(charts).toContain('colorForSpecies');
    expect(charts).toContain('colorForBasket');
    expect(charts).toContain('colorForSeries');
    expect(charts).toContain("from '@/lib/chart-palette'");
    expect(charts).toContain('CHART_RANK');
    expect(widgets).toContain('colorForSeries');
    expect(widgets).toContain('CHART_RANK');
    expect(charts).not.toMatch(/SQUID_COLORS/);
    expect(widgets).not.toMatch(/SERIES_COLORS/);
    expect(widgets).not.toMatch(/#0ea5e9/);
    expect(charts).not.toMatch(/#7c3aed|#0ea5e9|#ec4899|#9f1239|#0f766e/);
  });
});
