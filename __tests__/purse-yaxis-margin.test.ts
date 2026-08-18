import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { yAxisWidthFor } from '@/components/PurseSeinerDashboard';

/**
 * Recharts 3: offset.left = margin.left + YAxis.width.
 * 국가/운영사 가로막대는 라벨 폭만 width에 두고 margin.left를 키우지 않는다.
 */
describe('PurseSeinerDashboard vertical bar left offset', () => {
  const src = readFileSync(join(process.cwd(), 'components/PurseSeinerDashboard.tsx'), 'utf8');

  it('does not stack a 130/180px margin.left on top of YAxis.width', () => {
    expect(src).not.toMatch(/margin=\{\{\s*left:\s*1[38]0/);
    expect(src).toContain('V_BAR_MARGIN');
    expect(src).toContain('yAxisWidthFor');
  });

  it('keeps V_BAR_MARGIN.left small so axis width is the only label gutter', () => {
    expect(src).toMatch(/left:\s*4/);
    expect(src).not.toContain('width={120}');
    expect(src).not.toContain('width={170}');
  });

  it('sizes the country axis to the flag + hangul label, not 120+130', () => {
    const width = yAxisWidthFor(['🇲🇦 모로코', '🇹🇷 튀르키예', '🇮🇩 인도네시아'], 12);
    expect(width).toBeGreaterThanOrEqual(64);
    expect(width).toBeLessThanOrEqual(120);
    expect(4 + width).toBeLessThan(130);
  });

  it('sizes the operator axis to a 16-char tick, not 170+180', () => {
    const width = yAxisWidthFor(['Pesca Azteca, S.…', 'BINTANG HARAPAN …'], 11);
    expect(width).toBeGreaterThanOrEqual(64);
    expect(width).toBeLessThanOrEqual(140);
    expect(4 + width).toBeLessThan(180);
  });
});
