import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { CHART_RANK, HUB_ID } from '../lib/chart-palette';
import { WHELK_ACCENT, WHELK_ROLE } from '../lib/whelk-chart-colors';

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

describe('골뱅이 차트 색', () => {
  it('액센트가 물량색이고 노란 잔여·오징어 보라가 아니다', () => {
    expect(WHELK_ACCENT).toBe(WHELK_ROLE.volume);
    expect(WHELK_ROLE.volume).toBe('#92400e');
    expect(WHELK_ROLE.highlight).toBe('#be123c');
    expect(WHELK_ROLE.second).toBe(HUB_ID.sey);
    expect(WHELK_ROLE.volume).not.toBe('#7c3aed');
    expect(WHELK_ROLE.volume).not.toBe('#0369a1');
    expect(WHELK_ROLE.highlight).not.toBe('#fbbf24');
  });

  it('물량·강조가 흰 지면에서 그래픽 대비 3:1을 넘는다', () => {
    expect(contrastRatio(WHELK_ROLE.volume, WHITE)).toBeGreaterThanOrEqual(3);
    expect(contrastRatio(WHELK_ROLE.highlight, WHITE)).toBeGreaterThanOrEqual(3);
  });

  it('차트 파일이 노란 잔여를 쓰지 않고 단일 막대는 순위색이다', () => {
    const charts = readFileSync(
      join(process.cwd(), 'components/market-understanding/CommodityCharts.tsx'),
      'utf8',
    );
    const dash = readFileSync(
      join(process.cwd(), 'components/market-understanding/WhelkIndustryDashboard.tsx'),
      'utf8',
    );
    expect(charts).toContain('WHELK_ROLE');
    expect(charts).toContain('CHART_RANK');
    expect(dash).toContain('WHELK_ACCENT');
    expect(charts).not.toMatch(/#fbbf24|#d97706|#7c3aed/);
    expect(dash).not.toMatch(/#b45309|#fbbf24|#7c3aed/);
    expect(CHART_RANK).toBe('#e879a8');
  });
});
